import { useEffect, useRef, useState, useCallback } from 'react';
import { useCursor } from '@/contexts/CursorContext';
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
  opacity: number;
  delay: number;
}

interface GoldDust {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
}

const FlyingAngel = () => {
  const { cursorType, particlesEnabled } = useCursor();
  const [position, setPosition] = useState<Position>({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState<Position>({ x: -100, y: -100 });
  const [isIdle, setIsIdle] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [wingPhase, setWingPhase] = useState(0);
  const [trail, setTrail] = useState<Position[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [goldDust, setGoldDust] = useState<GoldDust[]>([]);
  const [restingOnElement, setRestingOnElement] = useState<string>('');
  
  const mouseRef = useRef<Position>({ x: 0, y: 0 });
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const flyIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef(0);
  const sparkleIdRef = useRef(0);
  const dustIdRef = useRef(0);

  // Get random interactive element to fly to
  const getRandomTarget = useCallback((): { pos: Position; label: string } | null => {
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      '[role="button"]',
      '.cursor-pointer',
      'nav a',
      '.card',
      '[data-angel-target]',
      'h1', 'h2', 'h3',
      '.avatar',
      'img'
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    const visibleElements: { el: Element; rect: DOMRect }[] = [];
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (
        rect.width > 20 &&
        rect.height > 20 &&
        rect.top > 80 &&
        rect.bottom < window.innerHeight - 80 &&
        rect.left > 50 &&
        rect.right < window.innerWidth - 50
      ) {
        visibleElements.push({ el, rect });
      }
    });
    
    if (visibleElements.length === 0) return null;
    
    const { el, rect } = visibleElements[Math.floor(Math.random() * visibleElements.length)];
    const label = el.textContent?.slice(0, 20) || el.tagName.toLowerCase();
    
    return {
      pos: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      },
      label
    };
  }, []);

  // Create sparkle
  const createSparkle = useCallback((x: number, y: number) => {
    const id = sparkleIdRef.current++;
    return {
      id,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 30,
      size: 4 + Math.random() * 8,
      opacity: 0.6 + Math.random() * 0.4,
      delay: Math.random() * 0.3
    };
  }, []);

  // Create gold dust particle
  const createGoldDust = useCallback((x: number, y: number, wingOffset: number) => {
    const id = dustIdRef.current++;
    return {
      id,
      x: x + wingOffset + (Math.random() - 0.5) * 20,
      y: y + 10 + Math.random() * 10,
      size: 2 + Math.random() * 4,
      speed: 1 + Math.random() * 2,
      drift: (Math.random() - 0.5) * 1
    };
  }, []);

  // Start idle flying behavior
  const startIdleMode = useCallback(() => {
    setIsIdle(true);
    setIsResting(false);
    
    const flyToRandomTarget = () => {
      const target = getRandomTarget();
      if (target) {
        setDirection(target.pos.x > position.x ? 'right' : 'left');
        setTargetPos(target.pos);
        setRestingOnElement(target.label);
        
        // After reaching target, rest for a while
        if (restTimerRef.current) clearTimeout(restTimerRef.current);
        restTimerRef.current = setTimeout(() => {
          setIsResting(true);
          
          // After resting, fly to next target
          setTimeout(() => {
            setIsResting(false);
            flyToRandomTarget();
          }, 2000 + Math.random() * 2000);
        }, 1500);
      }
    };
    
    flyToRandomTarget();
  }, [getRandomTarget, position.x]);

  // Stop idle mode
  const stopIdleMode = useCallback(() => {
    setIsIdle(false);
    setIsResting(false);
    setRestingOnElement('');
    if (flyIntervalRef.current) {
      clearInterval(flyIntervalRef.current);
      flyIntervalRef.current = null;
    }
    if (restTimerRef.current) {
      clearTimeout(restTimerRef.current);
      restTimerRef.current = null;
    }
  }, []);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      
      if (isIdle) {
        stopIdleMode();
      }
      
      setDirection(e.clientX > position.x ? 'right' : 'left');
      setTargetPos({ x: e.clientX, y: e.clientY });
      
      // Start idle mode after 4 seconds of no movement
      idleTimerRef.current = setTimeout(() => {
        startIdleMode();
      }, 4000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (flyIntervalRef.current) clearInterval(flyIntervalRef.current);
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [isIdle, position.x, startIdleMode, stopIdleMode]);

  // Smooth animation loop
  useEffect(() => {
    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      // Wing flapping - slower when resting
      const wingSpeed = isResting ? 0.003 : 0.012;
      setWingPhase(prev => (prev + delta * wingSpeed) % (Math.PI * 2));
      
      // Smooth follow with easing
      setPosition(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Very slow when resting, slower when idle
        const speed = isResting ? 0.005 : isIdle ? 0.025 : 0.08;
        
        // Bobbing effect - gentler when resting
        const bobAmount = isResting ? 1 : isIdle ? 2.5 : 1;
        const bobSpeed = isResting ? 0.001 : 0.003;
        
        const newX = prev.x + dx * speed;
        const newY = prev.y + dy * speed + Math.sin(time * bobSpeed) * bobAmount;
        
        // Add to trail when moving
        if (distance > 2 && !isResting) {
          setTrail(prevTrail => {
            const newTrail = [...prevTrail, { x: newX, y: newY }];
            return newTrail.slice(-20); // Keep last 20 positions
          });
          
          // Add sparkles occasionally
          if (Math.random() < 0.15) {
            setSparkles(prev => [...prev.slice(-15), createSparkle(newX, newY)]);
          }
          
          // Add gold dust from wings
          if (Math.random() < 0.2) {
            const wingOffset = direction === 'right' ? -15 : 15;
            setGoldDust(prev => [...prev.slice(-25), createGoldDust(newX, newY, wingOffset)]);
          }
        }
        
        return { x: newX, y: newY };
      });
      
      // Clean up old sparkles
      setSparkles(prev => prev.filter((_, i) => i > prev.length - 12));
      
      // Update gold dust (falling effect)
      setGoldDust(prev => 
        prev
          .map(dust => ({
            ...dust,
            y: dust.y + dust.speed,
            x: dust.x + dust.drift,
            size: dust.size * 0.98
          }))
          .filter(dust => dust.size > 0.5 && dust.y < window.innerHeight)
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPos, isIdle, isResting, direction, createSparkle, createGoldDust]);

  // Only show for 'angel' cursor type and when particles are enabled
  if (cursorType !== 'angel' || !particlesEnabled) return null;

  const wingFlap = isResting ? Math.sin(wingPhase) * 3 : Math.sin(wingPhase) * 18;

  return (
    <AnimatePresence>
      {/* Trail effect */}
      {trail.map((pos, i) => (
        <motion.div
          key={`trail-${i}`}
          className="fixed pointer-events-none z-[9996]"
          style={{
            left: pos.x,
            top: pos.y,
            width: 4 + (i / trail.length) * 8,
            height: 4 + (i / trail.length) * 8,
            background: `radial-gradient(circle, rgba(255,215,0,${0.1 + (i / trail.length) * 0.3}) 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      ))}
      
      {/* Sparkles */}
      {sparkles.map(sparkle => (
        <motion.div
          key={`sparkle-${sparkle.id}`}
          className="fixed pointer-events-none z-[9997]"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ 
            opacity: [0, sparkle.opacity, 0],
            scale: [0, 1.2, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 1.2,
            delay: sparkle.delay,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path
              d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
              fill="#FFD700"
              filter="url(#sparkle-glow)"
            />
            <defs>
              <filter id="sparkle-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>
        </motion.div>
      ))}
      
      {/* Gold dust particles */}
      {goldDust.map(dust => (
        <motion.div
          key={`dust-${dust.id}`}
          className="fixed pointer-events-none z-[9996] rounded-full"
          style={{
            left: dust.x,
            top: dust.y,
            width: dust.size,
            height: dust.size,
            background: `radial-gradient(circle, #FFD700 0%, #FFA500 50%, transparent 100%)`,
            boxShadow: '0 0 4px #FFD700',
          }}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2 }}
        />
      ))}
      
      {/* Main angel */}
      <motion.div
        className="fixed pointer-events-none z-[9998]"
        style={{
          left: position.x - 28,
          top: position.y - 28,
          transform: `scaleX(${direction === 'left' ? -1 : 1})`,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotate: isResting ? 0 : isIdle ? [0, -3, 3, 0] : 0,
          y: isResting ? [0, -2, 0] : 0
        }}
        transition={{ 
          duration: 0.3,
          rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Large glow effect */}
        <div 
          className="absolute rounded-full blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.35) 0%, rgba(255,180,0,0.2) 30%, rgba(147,51,234,0.15) 60%, transparent 80%)',
            width: 100,
            height: 100,
            left: -22,
            top: -22,
          }}
        />
        
        {/* Secondary glow */}
        <motion.div 
          className="absolute rounded-full blur-xl"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,215,0,0.3) 40%, transparent 70%)',
            width: 70,
            height: 70,
            left: -7,
            top: -7,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Flying Angel SVG */}
        <svg 
          width="56" 
          height="56" 
          viewBox="0 0 64 64" 
          className="drop-shadow-lg relative z-10"
          style={{
            filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.6)) drop-shadow(0 0 20px rgba(255,180,0,0.3))'
          }}
        >
          <defs>
            <linearGradient id="wingGradFly" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="30%" stopColor="rgba(255,240,200,0.9)" />
              <stop offset="60%" stopColor="rgba(200,180,255,0.8)" />
              <stop offset="100%" stopColor="rgba(147,51,234,0.6)" />
            </linearGradient>
            <linearGradient id="wingInnerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="100%" stopColor="rgba(255,215,0,0.4)" />
            </linearGradient>
            <linearGradient id="dressGradFly" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="hairGradFly" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#FFA500" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
            </radialGradient>
            <filter id="angelGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="glow"/>
              <feMerge>
                <feMergeNode in="glow"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Left Wing */}
          <g style={{ transform: `rotate(${-wingFlap}deg)`, transformOrigin: '32px 28px', transition: 'transform 0.05s ease-out' }}>
            <ellipse
              cx="14"
              cy="25"
              rx="13"
              ry="20"
              fill="url(#wingGradFly)"
              opacity="0.92"
              filter="url(#angelGlow)"
            />
            <ellipse
              cx="11"
              cy="23"
              rx="7"
              ry="14"
              fill="url(#wingInnerGlow)"
              opacity="0.7"
            />
            {/* Wing feather details */}
            <ellipse cx="8" cy="18" rx="3" ry="8" fill="rgba(255,255,255,0.4)" />
            {/* Wing sparkles */}
            <circle cx="8" cy="16" r="2" fill="#FFD700" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="16" cy="28" r="1.5" fill="#FFD700" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="12" cy="14" r="1.2" fill="#FFF" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="6" cy="24" r="1" fill="#FFE4B5" opacity="0.6" />
            <circle cx="18" cy="20" r="0.8" fill="#FFD700" opacity="0.5" />
          </g>
          
          {/* Right Wing */}
          <g style={{ transform: `rotate(${wingFlap}deg)`, transformOrigin: '32px 28px', transition: 'transform 0.05s ease-out' }}>
            <ellipse
              cx="50"
              cy="25"
              rx="13"
              ry="20"
              fill="url(#wingGradFly)"
              opacity="0.92"
              filter="url(#angelGlow)"
            />
            <ellipse
              cx="53"
              cy="23"
              rx="7"
              ry="14"
              fill="url(#wingInnerGlow)"
              opacity="0.7"
            />
            {/* Wing feather details */}
            <ellipse cx="56" cy="18" rx="3" ry="8" fill="rgba(255,255,255,0.4)" />
            {/* Wing sparkles */}
            <circle cx="56" cy="16" r="2" fill="#FFD700" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="48" cy="28" r="1.5" fill="#FFD700" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="52" cy="14" r="1.2" fill="#FFF" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.1s" repeatCount="indefinite" />
            </circle>
            <circle cx="58" cy="24" r="1" fill="#FFE4B5" opacity="0.6" />
            <circle cx="46" cy="20" r="0.8" fill="#FFD700" opacity="0.5" />
          </g>
          
          {/* Halo glow background */}
          <ellipse cx="32" cy="11" rx="10" ry="4" fill="url(#haloGlow)" />
          
          {/* Halo */}
          <ellipse 
            cx="32" 
            cy="11" 
            rx="7" 
            ry="2.5" 
            fill="none" 
            stroke="#FFD700" 
            strokeWidth="2.5"
            opacity="0.95"
            filter="url(#angelGlow)"
          />
          
          {/* Hair back */}
          <ellipse cx="32" cy="21" rx="9" ry="7" fill="url(#hairGradFly)" />
          
          {/* Head */}
          <circle cx="32" cy="21" r="7" fill="#FFDAB9" />
          
          {/* Hair front strands */}
          <path d="M25 18 Q28 14 32 16 Q36 14 39 18" fill="url(#hairGradFly)" />
          
          {/* Face */}
          <ellipse cx="29" cy="20" rx="1.2" ry="1.5" fill="#4A3728" /> {/* Left eye */}
          <ellipse cx="35" cy="20" rx="1.2" ry="1.5" fill="#4A3728" /> {/* Right eye */}
          <circle cx="29.5" cy="19.5" r="0.4" fill="#FFF" /> {/* Eye shine */}
          <circle cx="35.5" cy="19.5" r="0.4" fill="#FFF" /> {/* Eye shine */}
          <path d="M29.5 24 Q32 26.5 34.5 24" stroke="#E8A0A0" strokeWidth="1" fill="none" strokeLinecap="round" /> {/* Smile */}
          <circle cx="26" cy="22" r="1.5" fill="#FFB6C1" opacity="0.5" /> {/* Blush */}
          <circle cx="38" cy="22" r="1.5" fill="#FFB6C1" opacity="0.5" /> {/* Blush */}
          
          {/* Body */}
          <ellipse cx="32" cy="33" rx="5" ry="4" fill="#FFDAB9" />
          
          {/* Dress */}
          <path
            d="M25 35 Q32 32 39 35 L42 52 Q32 55 22 52 Z"
            fill="url(#dressGradFly)"
          />
          {/* Dress details */}
          <path d="M28 40 Q32 42 36 40" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none" />
          <path d="M26 46 Q32 48 38 46" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none" />
          
          {/* Arms */}
          <ellipse cx="22" cy="38" rx="3" ry="5" fill="#FFDAB9" transform="rotate(-25 22 38)" />
          <ellipse cx="42" cy="38" rx="3" ry="5" fill="#FFDAB9" transform="rotate(25 42 38)" />
          
          {/* Hands */}
          <circle cx="19" cy="42" r="2" fill="#FFDAB9" />
          <circle cx="45" cy="42" r="2" fill="#FFDAB9" />
          
          {/* Legs - adjusted for resting pose */}
          {isResting ? (
            <>
              <ellipse cx="28" cy="54" rx="3" ry="4" fill="#FFDAB9" transform="rotate(-15 28 54)" />
              <ellipse cx="36" cy="54" rx="3" ry="4" fill="#FFDAB9" transform="rotate(15 36 54)" />
            </>
          ) : (
            <>
              <ellipse cx="29" cy="55" rx="2.5" ry="5" fill="#FFDAB9" />
              <ellipse cx="35" cy="55" rx="2.5" ry="5" fill="#FFDAB9" />
            </>
          )}
          
          {/* Feet */}
          <ellipse cx="29" cy="59" rx="3" ry="2" fill="#F8B4D9" />
          <ellipse cx="35" cy="59" rx="3" ry="2" fill="#F8B4D9" />
        </svg>
        
        {/* Resting indicator */}
        {isResting && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gold-shimmer whitespace-nowrap"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textShadow: '0 0 10px rgba(255,215,0,0.8)',
              color: '#FFD700'
            }}
          >
            ✨ đang nghỉ ✨
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default FlyingAngel;
