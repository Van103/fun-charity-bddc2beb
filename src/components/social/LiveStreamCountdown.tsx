import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface LiveStreamCountdownProps {
  onComplete: () => void;
}

export function LiveStreamCountdown({ onComplete }: LiveStreamCountdownProps) {
  const [count, setCount] = useState(3);
  const hasCompletedRef = useRef(false);
  const hasStartedRef = useRef(false);
  
  // Use ref to store callback to prevent re-triggering on callback identity change
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Single effect that runs once on mount to handle the entire countdown
  useEffect(() => {
    // Prevent running more than once
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let currentCount = 3;
    
    const countdown = () => {
      if (hasCompletedRef.current) return;
      
      if (currentCount > 0) {
        currentCount--;
        setCount(currentCount);
        setTimeout(countdown, 1000);
      } else {
        // Show "GO!" for 600ms then complete
        hasCompletedRef.current = true;
        setTimeout(() => {
          onCompleteRef.current();
        }, 600);
      }
    };

    // Start countdown after 1 second (showing "3" first)
    const startTimer = setTimeout(countdown, 1000);

    return () => {
      clearTimeout(startTimer);
    };
  }, []); // Empty deps - only run once on mount

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
