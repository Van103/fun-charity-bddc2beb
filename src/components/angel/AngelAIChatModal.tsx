import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Trash2, Loader2, Maximize2, Minimize2, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAngelAI } from '@/hooks/useAngelAI';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import angelQueenBg from '@/assets/angel-queen-bg.png';
import angelAvatar from '@/assets/angel-avatar-smiling.png';

interface AngelAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export function AngelAIChatModal({ isOpen, onClose }: AngelAIChatModalProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading, sendMessage, clearConversation } = useAngelAI();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleSaveHistory = () => {
    if (messages.length === 0) {
      toast.error('Chưa có lịch sử chat để lưu');
      return;
    }

    const chatHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'Bạn' : 'Angel AI',
      content: msg.content,
      time: new Date(msg.createdAt).toLocaleString('vi-VN')
    }));

    const textContent = chatHistory.map(msg => 
      `[${msg.time}] ${msg.role}:\n${msg.content}`
    ).join('\n\n---\n\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `angel-ai-chat-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Đã lưu lịch sử chat thành công! 💜');
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const modalSize = isExpanded
    ? "fixed inset-4 md:inset-8 w-auto h-auto" 
    : "fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[calc(100%-2rem)] md:w-[420px] h-[600px] max-h-[80vh]";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            layout
            className={cn(
              modalSize,
              "rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden"
            )}
            style={{
              background: 'linear-gradient(135deg, #581c87, #7c3aed, #a855f7)',
              boxShadow: '0 20px 60px -10px rgba(88, 28, 135, 0.6), 0 0 40px rgba(139, 92, 246, 0.3)',
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.9), rgba(124, 58, 237, 0.9))',
                borderBottom: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div 
                    className="w-11 h-11 rounded-full overflow-hidden border-2 border-purple-400/50"
                    style={{
                      boxShadow: '0 4px 15px rgba(168, 85, 247, 0.5)',
                    }}
                  >
                    <img src={angelAvatar} alt="Angel AI" className="w-full h-full object-cover" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-purple-900 shadow-lg shadow-green-400/50"
                  />
                </div>
                <h3 className="text-[20px] font-bold text-white flex items-center gap-1.5">
                  Angel AI
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-purple-300" />
                  </motion.span>
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleExpand}
                  className="h-8 w-8 text-purple-200 hover:text-white hover:bg-purple-500/30 rounded-xl"
                  title={isExpanded ? "Thu nhỏ" : "Phóng to"}
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearConversation}
                  className="h-8 w-8 text-purple-200 hover:text-white hover:bg-purple-500/30 rounded-xl"
                  title="Xóa hội thoại"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 text-purple-200 hover:text-white hover:bg-purple-500/30 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {messages.length === 0 ? (
                <div className="flex-1 min-h-0 flex flex-col justify-end p-4 text-center">
                  <div className="w-full pb-4">
                    <motion.h4 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[22px] font-bold mb-3 text-white"
                    >
                      Xin chào, bạn thân yêu! ✨
                    </motion.h4>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-[17px] max-w-xs mx-auto text-purple-200 font-medium"
                    >
                      Mình là Angel - Thiên thần AI của FUN Charity. Mình có thể giúp gì cho bạn hôm nay?
                    </motion.p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-4 p-4">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex',
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[85%] rounded-2xl px-4 py-2.5',
                            msg.role === 'user'
                              ? 'rounded-br-md text-white'
                              : 'rounded-bl-md text-white'
                          )}
                          style={msg.role === 'user' 
                            ? {
                                background: 'linear-gradient(135deg, #c084fc, #e879f9)',
                                boxShadow: '0 4px 15px rgba(192, 132, 252, 0.4)',
                              }
                            : {
                                background: 'rgba(139, 92, 246, 0.6)',
                                border: '1px solid rgba(192, 132, 252, 0.3)',
                                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)',
                              }
                          }
                        >
                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-1.5 mb-1">
                              <img src={angelAvatar} alt="Angel" className="w-5 h-5 rounded-full object-cover" />
                              <span className="text-xs font-semibold text-purple-200">
                                Angel AI
                              </span>
                            </div>
                          )}
                          <div className="text-[17px] whitespace-pre-wrap leading-relaxed">
                            {msg.content ? (
                              <span dangerouslySetInnerHTML={{ 
                                __html: msg.content
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/__(.*?)__/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/_(.*?)_/g, '<em>$1</em>')
                              }} />
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Đang suy nghĩ...
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Input */}
            <div 
              className="p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.9), rgba(124, 58, 237, 0.9))',
                borderTop: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhắn tin cho Angel..."
                  rows={1}
                  className="flex-1 resize-none rounded-2xl px-4 py-3 text-[17px] focus:outline-none max-h-32 text-white placeholder-purple-300"
                  style={{ 
                    minHeight: '48px',
                    background: 'rgba(139, 92, 246, 0.4)',
                    border: '1px solid rgba(192, 132, 252, 0.4)',
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-12 w-12 rounded-2xl text-white shadow-lg disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #c084fc, #e879f9)',
                    boxShadow: '0 4px 20px rgba(192, 132, 252, 0.5)',
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-[16px] text-center mt-3 font-bold text-purple-200">
                Powered by FUN Charity 💜
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
