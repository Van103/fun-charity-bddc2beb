import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Trash2, Loader2 } from 'lucide-react';
import angelAvatar from '@/assets/angel-ai-avatar.png';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAngelAI } from '@/hooks/useAngelAI';
import { cn } from '@/lib/utils';

interface AngelAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickActions = [
  { label: '🎯 Gợi ý chiến dịch cho tôi', prompt: 'Gợi ý những chiến dịch từ thiện phù hợp với tôi', color: 'from-purple-500 to-pink-500' },
  { label: '💎 Hướng dẫn crypto', prompt: 'Làm sao để quyên góp bằng crypto?', color: 'from-cyan-500 to-blue-500' },
  { label: '🏆 Giải thích NFT từ thiện', prompt: 'Giải thích về NFT từ thiện và huy hiệu', color: 'from-amber-500 to-orange-500' },
  { label: '🤝 Làm tình nguyện viên', prompt: 'Tôi muốn đăng ký làm tình nguyện viên', color: 'from-emerald-500 to-teal-500' },
  { label: '💰 Rút tiền từ ví', prompt: 'Hướng dẫn rút tiền từ ví', color: 'from-rose-500 to-pink-500' },
];

export function AngelAIChatModal({ isOpen, onClose }: AngelAIChatModalProps) {
  const [input, setInput] = useState('');
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[calc(100%-2rem)] md:w-[420px] h-[600px] max-h-[80vh] bg-purple-100/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-300/50 z-[100] flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-300/40 bg-purple-200/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={angelAvatar} 
                    alt="Angel AI" 
                    className="w-10 h-10 rounded-full object-cover shadow-lg shadow-purple-500/30 border-2 border-purple-400/50"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-purple-900 flex items-center gap-1">
                    Angel AI
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h3>
                  <p className="text-xs text-purple-700">Thiên thần trợ lý của bạn</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearConversation}
                  className="h-8 w-8 text-purple-700 hover:text-purple-900 hover:bg-purple-200/50"
                  title="Xóa hội thoại"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 text-purple-700 hover:text-purple-900 hover:bg-purple-200/50"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-purple-50/20">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mb-4"
                  >
                    <img 
                      src={angelAvatar} 
                      alt="Angel AI" 
                      className="w-20 h-20 rounded-full object-cover shadow-lg shadow-purple-500/40 border-2 border-purple-400/50"
                    />
                  </motion.div>
                  <h4 className="text-lg font-semibold text-purple-900 mb-2">
                    Xin chào, bạn thân yêu! ✨
                  </h4>
                  <p className="text-purple-700 text-sm mb-6 max-w-xs">
                    Mình là Angel - Thiên thần AI của FUN Charity. Mình có thể giúp gì cho bạn hôm nay?
                  </p>
                  
                  {/* Quick Actions - Multi-colored glossy buttons */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickActions.map((action, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickAction(action.prompt)}
                        className={cn(
                          "relative px-3 py-1.5 text-xs text-white rounded-full transition-all overflow-hidden",
                          "bg-gradient-to-r shadow-lg",
                          action.color
                        )}
                        style={{
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}
                      >
                        {/* Glossy overlay */}
                        <span className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-1/2 rounded-t-full" />
                        <span className="relative">{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
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
                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-md shadow-lg shadow-purple-500/30'
                            : 'bg-white/60 backdrop-blur-sm text-purple-900 rounded-bl-md border border-purple-200/50 shadow-sm'
                        )}
                      >
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <img src={angelAvatar} alt="Angel" className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-xs text-purple-700 font-medium">Angel</span>
                          </div>
                        )}
                        <p className={cn(
                          "text-sm whitespace-pre-wrap leading-relaxed",
                          msg.role === 'assistant' ? 'text-purple-800' : 'text-white'
                        )}>
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
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-purple-300/40 bg-purple-200/40 backdrop-blur-md">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhắn tin cho Angel..."
                  rows={1}
                  className="flex-1 resize-none bg-white/60 backdrop-blur-sm border border-purple-300/50 rounded-xl px-4 py-2.5 text-sm text-purple-900 placeholder-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 max-h-32"
                  style={{ minHeight: '44px' }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-11 w-11 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg shadow-amber-500/30 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-purple-700 text-center mt-2">
                Powered by FUN Charity 💜
              </p>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
