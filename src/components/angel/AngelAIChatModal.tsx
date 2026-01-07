import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Trash2, Loader2, Maximize2, Minimize2, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAngelAI } from '@/hooks/useAngelAI';
import { useAngelTheme } from './AngelThemeContext';
import { AngelThemePicker } from './AngelThemePicker';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import angelQueenBg from '@/assets/angel-queen-bg.png';
import angelAvatar from '@/assets/angel-avatar.png';

interface AngelAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickActions = [
  { label: '🎯 Gợi ý chiến dịch cho tôi', prompt: 'Gợi ý những chiến dịch từ thiện phù hợp với tôi' },
  { label: '💎 Hướng dẫn crypto', prompt: 'Làm sao để quyên góp bằng crypto?' },
  { label: '🏆 Giải thích NFT từ thiện', prompt: 'Giải thích về NFT từ thiện và huy hiệu' },
  { label: '🤝 Làm tình nguyện viên', prompt: 'Tôi muốn đăng ký làm tình nguyện viên' },
  { label: '💰 Rút tiền từ ví', prompt: 'Hướng dẫn rút tiền từ ví' },
];

export function AngelAIChatModal({ isOpen, onClose }: AngelAIChatModalProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, isLoading, sendMessage, clearConversation } = useAngelAI();
  const { theme } = useAngelTheme();

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

  const isDarkTheme = theme.id === 'violet';

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
              "rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden relative"
            )}
            style={{
              background: 'linear-gradient(135deg, #b8860b 0%, #daa520 15%, #ffd700 30%, #f0c420 50%, #ffd700 70%, #daa520 85%, #b8860b 100%)',
              padding: '4px',
              boxShadow: '0 0 20px rgba(218, 165, 32, 0.5), 0 0 40px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Sparkle overlay for border */}
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 3s ease-in-out infinite',
              }}
            />
            {/* Inner container with rounded corners */}
            <div 
              className="flex-1 flex flex-col overflow-hidden rounded-[20px] relative"
              style={{
                backgroundImage: `url(${angelQueenBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
              }}
            >
            {/* Overlay for readability - Lighter gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-purple-50/40 to-white/60 rounded-[20px]" />
            {/* Content container */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div 
                className="flex items-center justify-between px-4 py-3 rounded-t-[20px]"
                style={{
                  background: 'linear-gradient(135deg, #b8860b 0%, #daa520 25%, #ffd700 50%, #daa520 75%, #b8860b 100%)',
                  boxShadow: '0 2px 10px rgba(218, 165, 32, 0.3)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg border-2 border-white/50">
                      <img src={angelAvatar} alt="Angel AI" className="w-full h-full object-cover" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                    />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">
                    Angel AI
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {}}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-400/80 hover:bg-amber-400 text-gray-700 transition-colors"
                    title="Cài đặt"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSaveHistory}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-400/80 hover:bg-amber-400 text-gray-700 transition-colors"
                    title="Lưu lịch sử chat"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleExpand}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-400/80 hover:bg-amber-400 text-gray-700 transition-colors"
                    title={isExpanded ? "Thu nhỏ" : "Phóng to"}
                  >
                    {isExpanded ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={clearConversation}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-400/80 hover:bg-amber-400 text-gray-700 transition-colors"
                    title="Xóa hội thoại"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-400/80 hover:bg-amber-400 text-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {messages.length === 0 ? (
                  <div className="flex-1 min-h-0 flex flex-col justify-end p-4 text-center">
                    <div className="w-full pb-4">
                      <h4 className="text-xl font-bold mb-2 text-gray-900">
                        Xin chào, bạn thân yêu! ✨
                      </h4>
                      <p className="text-sm mb-6 max-w-xs mx-auto text-gray-700">
                        Mình là Angel - Thiên thần AI của FUN Charity. Mình có thể giúp gì cho cho hôm nay?
                      </p>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-2 justify-center max-w-sm mx-auto">
                        {quickActions.map((action, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleQuickAction(action.prompt)}
                            className="px-4 py-2.5 text-sm rounded-full transition-colors bg-purple-100/80 hover:bg-purple-200/80 text-purple-700 border-2 border-purple-400 font-medium"
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
              <div 
                className="p-4 rounded-b-[20px]"
                style={{
                  background: 'linear-gradient(135deg, #b8860b 0%, #daa520 25%, #ffd700 50%, #daa520 75%, #b8860b 100%)',
                }}
              >
                <div className="flex items-center gap-3 bg-white/90 rounded-full px-4 py-2 shadow-inner">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhắn tin cho Angel..."
                    className="flex-1 bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg disabled:opacity-50 transition-transform hover:scale-105"
                    style={{
                      background: 'conic-gradient(from 180deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd, #ff6b6b)',
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-center mt-3 text-amber-900 font-medium">
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
