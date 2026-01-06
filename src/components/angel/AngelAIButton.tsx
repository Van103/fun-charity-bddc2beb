import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AngelAIChatModal } from './AngelAIChatModal';
import { supabase } from '@/integrations/supabase/client';

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
        {/* Glow effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 blur-xl"
        />
        
        {/* Button */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 shadow-lg shadow-amber-500/40 flex items-center justify-center text-2xl hover:scale-110 transition-transform duration-200 border-2 border-white/30">
          <motion.span
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            👼
          </motion.span>
          
          {/* Sparkles */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <Sparkles className="absolute -top-1 left-1/2 w-3 h-3 text-yellow-200" />
            <Sparkles className="absolute -bottom-1 right-0 w-2.5 h-2.5 text-amber-200" />
            <Sparkles className="absolute top-1/2 -left-1 w-2 h-2 text-yellow-100" />
          </motion.div>
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
