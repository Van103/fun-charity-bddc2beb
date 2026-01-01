import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface LiveStreamCountdownProps {
  isActive: boolean;
  onComplete: () => void;
}

export function LiveStreamCountdown({ isActive, onComplete }: LiveStreamCountdownProps) {
  const [count, setCount] = useState(3);
  const hasCompletedRef = useRef(false);
  const completeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      setCount(3);
      hasCompletedRef.current = false;
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
        completeTimerRef.current = null;
      }
      return;
    }

    // Prevent double execution
    if (hasCompletedRef.current) return;

    if (count === 0) {
      hasCompletedRef.current = true;
      // Small delay to show "GO!" before completing
      completeTimerRef.current = setTimeout(() => {
        onComplete();
      }, 600);
      return;
    }

    const timer = setTimeout(() => {
      setCount(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isActive, count, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current);
      }
    };
  }, []);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        {count > 0 ? (
          <motion.div
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-40 h-40 rounded-full bg-primary/50"
              />
            </div>
            
            {/* Number */}
            <motion.span
              className="relative text-9xl font-black text-white drop-shadow-2xl"
              style={{ 
                textShadow: '0 0 40px rgba(147, 51, 234, 0.8), 0 0 80px rgba(147, 51, 234, 0.5)' 
              }}
            >
              {count}
            </motion.span>
          </motion.div>
        ) : (
          <motion.div
            key="go"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative"
          >
            {/* Burst effect */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-60 h-60 rounded-full bg-gradient-to-r from-red-500 via-primary to-pink-500 opacity-30 blur-3xl" />
            </motion.div>
            
            {/* GO! text */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -2, 2, 0]
              }}
              transition={{ duration: 0.3 }}
              className="relative flex flex-col items-center"
            >
              <span 
                className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-primary to-pink-500"
                style={{ 
                  textShadow: '0 0 40px rgba(239, 68, 68, 0.8)' 
                }}
              >
                GO!
              </span>
              <span className="text-white text-xl font-medium mt-2 opacity-80">
                🔴 Đang phát trực tiếp
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
