import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface UseAngelAIOptions {
  onError?: (error: string) => void;
}

export function useAngelAI(options?: UseAngelAIOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  const createConversation = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('angel_conversations')
      .insert({ user_id: user.id })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    setConversationId(data.id);
    return data.id;
  }, []);

  const loadConversation = useCallback(async (convId: string) => {
    const { data, error } = await supabase
      .from('angel_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading conversation:', error);
      return;
    }

    setMessages(data.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      createdAt: new Date(m.created_at),
    })));
    setConversationId(convId);
  }, []);

  const sendMessage = useCallback(async (message: string, context?: Record<string, unknown>) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    
    // Add user message immediately
    const userMsgId = crypto.randomUUID();
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: message,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Ensure we have a conversation
    let currentConvId = conversationId;
    if (!currentConvId) {
      currentConvId = await createConversation();
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/angel-ai`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'chat',
            message,
            conversationId: currentConvId,
            context,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Có lỗi xảy ra khi kết nối với Angel');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Create assistant message placeholder
      const assistantMsgId = crypto.randomUUID();
      let assistantContent = '';
      
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      }]);

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process line by line
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantMsgId 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            // Re-buffer incomplete JSON
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantMsgId 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            // Ignore
          }
        }
      }

    } catch (error) {
      console.error('Angel AI error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      
      if (options?.onError) {
        options.onError(errorMessage);
      } else {
        toast({
          title: 'Lỗi',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      // Remove the user message if we failed
      setMessages(prev => prev.filter(m => m.id !== userMsgId));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, createConversation, isLoading, options, toast]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    clearConversation,
    loadConversation,
    createConversation,
  };
}
