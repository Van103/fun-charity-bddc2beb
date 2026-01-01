import { useEffect, useRef, useState, useCallback } from 'react';
import { useCursor, AngelStyle } from '@/contexts/CursorContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Position {
  x: number;
  y: number;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
}

// Angel color themes for glow effects
const ANGEL_THEMES: Record<AngelStyle, {
  glow: string;
  dust: string;
  halo: string;
}> = {
  purple: {
    glow: 'rgba(147,51,234,0.4)',
    dust: '#9333EA',
    halo: '#FFD700',
  },
  gold: {
    glow: 'rgba(255,215,0,0.5)',
    dust: '#FFD700',
    halo: '#FFD700',
  },
  pink: {
    glow: 'rgba(236,72,153,0.4)',
    dust: '#F472B6',
    halo: '#FFD700',
  },
  blue: {
    glow: 'rgba(59,130,246,0.4)',
    dust: '#60A5FA',
    halo: '#FFD700',
  },
};

// Get CSS filter for color variation
const getColorFilter = (style: AngelStyle): string => {
  switch (style) {
    case 'gold':
      return 'hue-rotate(-30deg) saturate(1.3) brightness(1.1)';
    case 'pink':
      return 'hue-rotate(30deg) saturate(1.2)';
    case 'blue':
      return 'hue-rotate(-120deg) saturate(1.1)';
    case 'purple':
    default:
      return '';
  }
};

// Sound utilities
const playSound = (frequency: number, duration: number, volume: number) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), duration * 1000 + 100);
  } catch (e) {}
};

const FlyingAngel = () => {
  const { cursorType, particlesEnabled, currentCursor } = useCursor();
  const [position, setPosition] = useState<Position>({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState<Position>({ x: -100, y: -100 });
  const [isIdle, setIsIdle] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [wingFrame, setWingFrame] = useState(0);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [soundEnabled] = useState(true);
  const [restingElement, setRestingElement] = useState<DOMRect | null>(null);
  
  const mouseRef = useRef<Position>({ x: 0, y: 0 });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number>();
  const sparkleIdRef = useRef(0);

  const angelStyle: AngelStyle = currentCursor.angelStyle || 'purple';
  const theme = ANGEL_THEMES[angelStyle];
  const isAngelCursor = cursorType.startsWith('angel');

  // Get random element to fly to
  const getRandomTarget = useCallback(() => {
    const selectors = ['button', 'a[href]', '.card', 'h1', 'h2', 'h3', 'img', '.avatar'];
    const elements = document.querySelectorAll(selectors.join(', '));
    const visible: { rect: DOMRect }[] = [];
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 30 && rect.height > 30 && 
          rect.top > 100 && rect.bottom < window.innerHeight - 50 &&
          rect.left > 50 && rect.right < window.innerWidth - 50) {
        visible.push({ rect });
      }
    });
    
    if (visible.length === 0) return null;
    return visible[Math.floor(Math.random() * visible.length)];
  }, []);

  // Start idle mode - fly to random elements
  const startIdleMode = useCallback(() => {
    setIsIdle(true);
    setIsResting(false);
    setRestingElement(null);
    
    const flyToTarget = () => {
      const target = getRandomTarget();
      if (target) {
        const newTarget = {
          x: target.rect.left + target.rect.width / 2,
          y: target.rect.top - 20
        };
        setDirection(newTarget.x > position.x ? 'right' : 'left');
        setTargetPos(newTarget);
        
        if (soundEnabled) {
          playSound(600, 0.15, 0.03);
        }
        
        // Rest after reaching target
        if (restTimerRef.current) clearTimeout(restTimerRef.current);
        restTimerRef.current = setTimeout(() => {
          setIsResting(true);
          setRestingElement(target.rect);
          
          if (soundEnabled) {
            playSound(1000, 0.2, 0.04);
          }
          
          // Fly to next target after resting
          setTimeout(() => {
            setIsResting(false);
            setRestingElement(null);
            flyToTarget();
          }, 3000 + Math.random() * 2000);
        }, 1500);
      }
    };
    
    flyToTarget();
  }, [getRandomTarget, position.x, soundEnabled]);

  // Stop idle mode
  const stopIdleMode = useCallback(() => {
    setIsIdle(false);
    setIsResting(false);
    setRestingElement(null);
    if (restTimerRef.current) {
      clearTimeout(restTimerRef.current);
    }
  }, []);

  // Mouse movement handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (isIdle) stopIdleMode();
      
      setDirection(e.clientX > position.x ? 'right' : 'left');
      setTargetPos({ x: e.clientX, y: e.clientY });
      
      // Start idle after 4 seconds of no movement
      idleTimerRef.current = setTimeout(() => {
        startIdleMode();
      }, 4000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [isIdle, position.x, startIdleMode, stopIdleMode]);

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      // Wing flapping - faster when flying, slower when resting
      const wingSpeed = isResting ? 0.002 : 0.008;
      setWingFrame(prev => (prev + wingSpeed * 16) % (Math.PI * 2));
      
      // Smooth follow
      setPosition(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = isResting ? 0.01 : isIdle ? 0.03 : 0.08;
        
        // Bobbing when flying
        const bob = isResting ? Math.sin(time * 0.002) * 2 : Math.sin(time * 0.004) * 4;
        
        const newX = prev.x + dx * speed;
        const newY = prev.y + dy * speed + (distance > 5 ? 0 : bob * 0.1);
        
        // Add sparkles when moving
        if (distance > 3 && !isResting && Math.random() < 0.1) {
          const id = sparkleIdRef.current++;
          setSparkles(prev => [...prev.slice(-10), {
            id,
            x: newX + (Math.random() - 0.5) * 40,
            y: newY + Math.random() * 20,
            size: 4 + Math.random() * 6
          }]);
        }
        
        return { x: newX, y: newY };
      });
      
      // Clean old sparkles
      setSparkles(prev => prev.slice(-8));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetPos, isIdle, isResting]);

  if (!isAngelCursor || !particlesEnabled) return null;

  // Wing scale for flapping effect
  const wingScale = 1 + Math.sin(wingFrame) * 0.08;
  const angelImage = isResting ? '/cursors/angel-sit.png' : '/cursors/angel-fly.png';

  return (
    <AnimatePresence>
      {/* Highlight effect when resting on element */}
      {restingElement && isResting && (
        <motion.div
          className="fixed pointer-events-none z-[9990]"
          style={{
            left: restingElement.left - 6,
            top: restingElement.top - 6,
            width: restingElement.width + 12,
            height: restingElement.height + 12,
            borderRadius: 12,
            border: `2px solid ${theme.dust}`,
            boxShadow: `0 0 20px ${theme.glow}, 0 0 40px ${theme.glow}`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            boxShadow: [
              `0 0 15px ${theme.glow}`,
              `0 0 30px ${theme.glow}`,
              `0 0 15px ${theme.glow}`
            ]
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.3,
            boxShadow: { duration: 1.5, repeat: Infinity }
          }}
        />
      )}
      
      {/* Sparkle trail */}
      {sparkles.map(s => (
        <motion.div
          key={s.id}
          className="fixed pointer-events-none z-[9996]"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
          }}
          initial={{ opacity: 1, scale: 0 }}
          animate={{ opacity: 0, scale: 1.5, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <svg viewBox="0 0 24 24" fill={theme.halo} className="w-full h-full">
            <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
          </svg>
        </motion.div>
      ))}
      
      {/* Main angel */}
      <motion.div
        className="fixed pointer-events-none z-[9998]"
        style={{
          left: position.x - 32,
          top: position.y - 32,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Glow effect */}
        <div 
          className="absolute rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
            width: 100,
            height: 100,
            left: -18,
            top: -18,
          }}
        />
        
        {/* Angel image with wing flapping effect */}
        <motion.div
          style={{
            transform: `scaleX(${direction === 'left' ? -1 : 1})`,
          }}
          animate={{
            scaleY: wingScale,
            y: isResting ? [0, -3, 0] : [0, -2, 0],
            rotate: isResting ? 0 : [0, -2, 2, 0],
          }}
          transition={{
            y: { duration: isResting ? 2 : 1, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            scaleY: { duration: 0.1 }
          }}
        >
          <img 
            src={angelImage}
            alt="Angel"
            className="w-16 h-16 object-contain"
            style={{
              filter: `drop-shadow(0 0 10px ${theme.glow}) ${getColorFilter(angelStyle)}`,
            }}
            draggable={false}
          />
        </motion.div>
        
        {/* Sitting indicator */}
        {isResting && (
          <motion.div
            className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: theme.halo, textShadow: `0 0 8px ${theme.glow}` }}
          >
            ✨ nghỉ ngơi ✨
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FlyingAngel;
