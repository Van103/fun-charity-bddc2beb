import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Trash2, Loader2, Maximize2, Minimize2, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAngelAI } from '@/hooks/useAngelAI';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import angelQueenBg from '@/assets/angel-queen-bg.png';
import angelAvatar from '@/assets/angel-avatar.png';

interface AngelAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickActions = [
  { label: '🎯 Gợi ý chiến dịch', prompt: 'Gợi ý những chiến dịch từ thiện phù hợp với tôi' },
  { label: '💝 Cách quyên góp', prompt: 'Hướng dẫn cách quyên góp từ thiện trên nền tảng' },
  { label: '🤝 Đăng ký tình nguyện', prompt: 'Tôi muốn đăng ký làm tình nguyện viên' },
  { label: '🌟 Nhận phần thưởng', prompt: 'Làm sao để nhận phần thưởng khi làm từ thiện?' },
];

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
              "rounded-2xl shadow-2xl z-[100] flex flex-col p-[3px]"
            )}
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #fde047, #f59e0b, #fbbf24)',
            }}
          >
            <div 
              className="w-full h-full rounded-[13px] overflow-hidden flex flex-col relative"
              style={{
                backgroundImage: `url(${angelQueenBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
              }}
            >
            {/* Overlay for readability - Golden tint */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-900/40 via-purple-900/50 to-purple-950/70" />
            
            {/* Content container */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-purple-200/50 bg-[#DDD6FE] backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-purple-500/30 border-2 border-purple-400/50">
                      <img src={angelAvatar} alt="Angel AI" className="w-full h-full object-cover" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                    />
                  </div>
                  <h3 className="font-bold flex items-center gap-1 text-amber-500">
                    Angel AI
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveHistory}
                    className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-200/50"
                    title="Lưu lịch sử chat"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleExpand}
                    className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-200/50"
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
                    className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-200/50"
                    title="Xóa hội thoại"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-200/50"
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
                      <h4 className="text-lg font-semibold mb-2 text-white">
                        Xin chào, bạn thân yêu! ✨
                      </h4>
                      <p className="text-sm mb-6 max-w-xs mx-auto text-amber-200">
                        Mình là Angel - Thiên thần AI của FUN Charity. Mình có thể giúp gì cho bạn hôm nay?
                      </p>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickActions.map((action, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuickAction(action.prompt)}
                            className="px-3 py-1.5 text-xs rounded-full transition-colors bg-purple-500/50 hover:bg-purple-400/60 text-white border border-purple-400/50 shadow-sm backdrop-blur-sm"
                          >
                            {action.label}
                          </motion.button>
                        ))}
                      </div>
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
                                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white rounded-br-md shadow-lg shadow-amber-500/20'
                                : 'bg-white/90 text-purple-900 rounded-bl-md border border-amber-300/50 shadow-lg'
                            )}
                          >
                            {msg.role === 'assistant' && (
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-sm">👼</span>
                                <span className="text-xs text-amber-500 font-medium">Angel</span>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.content || (
                                <span className="inline-flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Đang suy nghĩ...
                                </span>
                              )}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-purple-200/50 bg-[#DDD6FE] backdrop-blur-md">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhắn tin cho Angel..."
                    rows={1}
                    className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 max-h-32 border bg-white/90 border-purple-300/50 text-purple-900 placeholder-purple-400"
                    style={{ minHeight: '44px' }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="h-11 w-11 rounded-xl text-white shadow-lg disabled:opacity-50 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-center mt-2 text-purple-500">
                  Powered by FUN Charity 💜
                </p>
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
