import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AngelAIChatModal } from './AngelAIChatModal';
import { supabase } from '@/integrations/supabase/client';
import angelAvatar from '@/assets/angel-ai-avatar.png';

export function AngelAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show tooltip after 3 seconds for first-time users
  useEffect(() => {
    if (isAuthenticated) {
      const hasSeenTooltip = localStorage.getItem('angel-ai-tooltip-seen');
      if (!hasSeenTooltip) {
        const timer = setTimeout(() => {
          setShowTooltip(true);
          setTimeout(() => {
            setShowTooltip(false);
            localStorage.setItem('angel-ai-tooltip-seen', 'true');
          }, 5000);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 group"
      >
        {/* Golden glow effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 blur-xl"
          style={{
            boxShadow: '0 0 40px rgba(251, 191, 36, 0.8), 0 0 80px rgba(251, 191, 36, 0.5)'
          }}
        />
        
        {/* Button */}
        <div 
          className="relative w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 overflow-hidden"
          style={{
            border: '3px solid rgba(251, 191, 36, 0.9)',
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.7), 0 0 40px rgba(251, 191, 36, 0.5), inset 0 0 10px rgba(251, 191, 36, 0.3)'
          }}
        >
          <motion.img
            src={angelAvatar}
            alt="Angel AI"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full h-full object-cover"
          />
          
          {/* Rotating sparkles */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 pointer-events-none"
          >
            <Sparkles className="absolute -top-1 left-1/2 w-3 h-3 text-yellow-300 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
            <Sparkles className="absolute -bottom-1 right-0 w-2.5 h-2.5 text-amber-300 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
            <Sparkles className="absolute top-1/2 -left-1 w-2 h-2 text-yellow-200 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
          </motion.div>
          
          {/* Extra sparkle particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
              <div className="bg-purple-900/95 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg border border-purple-500/30 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Chat với Angel AI!</span>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-purple-900/95 border-r border-t border-purple-500/30" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Modal */}
      <AngelAIChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
