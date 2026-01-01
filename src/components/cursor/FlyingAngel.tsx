import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCursor } from '@/contexts/CursorContext';
import { motion } from 'framer-motion';

interface Position {
  x: number;
  y: number;
}

// Map angel styles to their SVG paths
const ANGEL_SVG_MAP: Record<string, string> = {
  purple: '/cursors/angel-purple.svg',
  gold: '/cursors/angel-gold.svg',
  pink: '/cursors/angel-pink.svg',
  blue: '/cursors/angel-blue.svg',
};

const FlyingAngel = () => {
  const { cursorType, currentCursor } = useCursor();

  const isAngelCursor = cursorType.startsWith('angel');
  const angelStyle = currentCursor.angelStyle || 'purple';
  const angelSvgSrc = ANGEL_SVG_MAP[angelStyle] || ANGEL_SVG_MAP.purple;

  const [position, setPosition] = useState<Position>({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState<Position>({ x: -100, y: -100 });
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [wingPhase, setWingPhase] = useState(0);

  const [isIdle, setIsIdle] = useState(false);
  const [idleTarget, setIdleTarget] = useState<Position | null>(null);
  const [isSitting, setIsSitting] = useState(false);

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastMouseMoveRef = useRef(Date.now());
  const idleCheckRef = useRef<number | null>(null);
  const sittingTimeoutRef = useRef<number | null>(null);

  const getRandomIdleTarget = useCallback((): Position => {
    const targets = document.querySelectorAll('button, [role="button"], a, .cursor-pointer');
    const valid: Position[] = [];

    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 20 && rect.height > 20 && rect.top >= 0 && rect.left >= 0) {
        valid.push({ x: rect.left + rect.width / 2, y: Math.max(20, rect.top - 18) });
      }
    });

    // Prefer sitting on buttons
    if (valid.length && Math.random() > 0.3) {
      return valid[Math.floor(Math.random() * valid.length)];
    }

    const corners = [
      { x: 100, y: 100 },
      { x: window.innerWidth - 100, y: 100 },
      { x: 100, y: window.innerHeight - 100 },
      { x: window.innerWidth - 100, y: window.innerHeight - 100 },
      { x: window.innerWidth / 2, y: 80 },
    ];

    return corners[Math.floor(Math.random() * corners.length)];
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setDirection(e.clientX > position.x ? 'right' : 'left');
      setTargetPos({ x: e.clientX, y: e.clientY });
      lastMouseMoveRef.current = Date.now();
      setIsIdle(false);
      setIsSitting(false);
      setIdleTarget(null);

      if (sittingTimeoutRef.current) {
        window.clearTimeout(sittingTimeoutRef.current);
        sittingTimeoutRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [position.x]);

  // Idle after 5s
  useEffect(() => {
    if (!isAngelCursor) return;

    if (idleCheckRef.current) window.clearInterval(idleCheckRef.current);

    idleCheckRef.current = window.setInterval(() => {
      const timeSinceLastMove = Date.now() - lastMouseMoveRef.current;
      if (timeSinceLastMove > 5000 && !isIdle) {
        setIsIdle(true);
        const t = getRandomIdleTarget();
        setIdleTarget(t);
        setDirection(t.x > position.x ? 'right' : 'left');
      }
    }, 500);

    return () => {
      if (idleCheckRef.current) window.clearInterval(idleCheckRef.current);
      idleCheckRef.current = null;
    };
  }, [getRandomIdleTarget, isAngelCursor, isIdle, position.x]);

  // When idle: if reached target -> sit then pick another
  useEffect(() => {
    if (!isAngelCursor || !isIdle || !idleTarget) return;

    const dist = Math.hypot(idleTarget.x - position.x, idleTarget.y - position.y);
    if (dist > 28) return;

    setIsSitting(true);
    if (sittingTimeoutRef.current) window.clearTimeout(sittingTimeoutRef.current);

    sittingTimeoutRef.current = window.setTimeout(() => {
      setIsSitting(false);
      const t = getRandomIdleTarget();
      setIdleTarget(t);
      setDirection(t.x > position.x ? 'right' : 'left');
    }, 2000 + Math.random() * 2000);

    return () => {
      if (sittingTimeoutRef.current) window.clearTimeout(sittingTimeoutRef.current);
      sittingTimeoutRef.current = null;
    };
  }, [getRandomIdleTarget, idleTarget, isAngelCursor, isIdle, position.x, position.y]);

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Wing flap speed - faster when flying
      const flapSpeed = isSitting ? 0.008 : 0.02;
      setWingPhase((prev) => (prev + delta * flapSpeed) % (Math.PI * 2));

      setPosition((prev) => {
        const target = isIdle && idleTarget ? idleTarget : targetPos;
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;

        // Cursor should feel like "real cursor"; idle should drift.
        const speed = isIdle ? 0.03 : 0.6;
        return { x: prev.x + dx * speed, y: prev.y + dy * speed };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [idleTarget, isIdle, isSitting, targetPos]);

  if (!isAngelCursor) return null;

  // Wing flap amplitude
  const wingFlap = Math.sin(wingPhase);
  const leftWingRotate = isSitting ? wingFlap * 8 : wingFlap * 25;
  const rightWingRotate = isSitting ? -wingFlap * 8 : -wingFlap * 25;

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999]"
      style={{ left: position.x - 48, top: position.y - 32 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        style={{
          width: 96,
          height: 96,
          position: 'relative',
        }}
        animate={{
          scaleX: direction === 'left' ? -1 : 1,
          y: isSitting ? [0, -2, 0] : [0, -4, 0, 4, 0],
        }}
        transition={{
          scaleX: { duration: 0.1 },
          y: { duration: isSitting ? 1.5 : 0.3, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        {/* SVG with animated wings */}
        <svg 
          width="96" 
          height="96" 
          viewBox="0 0 32 32" 
          className="absolute inset-0"
        >
          <defs>
            {/* Purple gradients */}
            <linearGradient id="wingGradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#E9D5FF' }} />
              <stop offset="50%" style={{ stopColor: '#A855F7' }} />
              <stop offset="100%" style={{ stopColor: '#7C3AED' }} />
            </linearGradient>
            <linearGradient id="dressGradPurple" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#7C3AED' }} />
              <stop offset="100%" style={{ stopColor: '#4C1D95' }} />
            </linearGradient>
            
            {/* Gold gradients */}
            <linearGradient id="wingGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FEF3C7' }} />
              <stop offset="50%" style={{ stopColor: '#FBBF24' }} />
              <stop offset="100%" style={{ stopColor: '#D97706' }} />
            </linearGradient>
            <linearGradient id="dressGradGold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#F59E0B' }} />
              <stop offset="100%" style={{ stopColor: '#B45309' }} />
            </linearGradient>
            
            {/* Pink gradients */}
            <linearGradient id="wingGradPink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FBCFE8' }} />
              <stop offset="50%" style={{ stopColor: '#EC4899' }} />
              <stop offset="100%" style={{ stopColor: '#DB2777' }} />
            </linearGradient>
            <linearGradient id="dressGradPink" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#DB2777' }} />
              <stop offset="100%" style={{ stopColor: '#9D174D' }} />
            </linearGradient>
            
            {/* Blue gradients */}
            <linearGradient id="wingGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#BFDBFE' }} />
              <stop offset="50%" style={{ stopColor: '#3B82F6' }} />
              <stop offset="100%" style={{ stopColor: '#1D4ED8' }} />
            </linearGradient>
            <linearGradient id="dressGradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1D4ED8' }} />
              <stop offset="100%" style={{ stopColor: '#1E3A8A' }} />
            </linearGradient>

            {/* Crown gradient */}
            <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FFD700' }} />
              <stop offset="100%" style={{ stopColor: '#FFA500' }} />
            </linearGradient>
          </defs>

          {/* Left wing group - animated */}
          <motion.g
            style={{ transformOrigin: '10px 11px' }}
            animate={{ rotate: leftWingRotate }}
            transition={{ duration: 0.05, ease: 'linear' }}
          >
            <path d="M6 10 Q2 6 4 2 Q8 4 10 8 Q8 10 6 10" fill={`url(#wingGrad${angelStyle.charAt(0).toUpperCase() + angelStyle.slice(1)})`} opacity="0.9"/>
            <path d="M6 12 Q1 14 2 18 Q6 16 8 13 Q7 12 6 12" fill={`url(#wingGrad${angelStyle.charAt(0).toUpperCase() + angelStyle.slice(1)})`} opacity="0.8"/>
            <circle cx="5" cy="5" r="0.5" fill="#FFD700"/>
            <circle cx="4" cy="15" r="0.4" fill="#FFD700"/>
          </motion.g>

          {/* Right wing group - animated */}
          <motion.g
            style={{ transformOrigin: '22px 11px' }}
            animate={{ rotate: rightWingRotate }}
            transition={{ duration: 0.05, ease: 'linear' }}
          >
            <path d="M26 10 Q30 6 28 2 Q24 4 22 8 Q24 10 26 10" fill={`url(#wingGrad${angelStyle.charAt(0).toUpperCase() + angelStyle.slice(1)})`} opacity="0.9"/>
            <path d="M26 12 Q31 14 30 18 Q26 16 24 13 Q25 12 26 12" fill={`url(#wingGrad${angelStyle.charAt(0).toUpperCase() + angelStyle.slice(1)})`} opacity="0.8"/>
            <circle cx="27" cy="5" r="0.5" fill="#FFD700"/>
            <circle cx="28" cy="15" r="0.4" fill="#FFD700"/>
          </motion.g>

          {/* Dress with style-specific color */}
          <path d="M12 16 Q9 22 6 32 Q11 34 16 34 Q21 34 26 32 Q23 22 20 16 Q18 17 16 17 Q14 17 12 16" fill={`url(#dressGrad${angelStyle.charAt(0).toUpperCase() + angelStyle.slice(1)})`}/>
          <path d="M6 32 Q9 30 12 32 Q14 30 16 32 Q18 30 20 32 Q23 30 26 32" 
            stroke={angelStyle === 'purple' ? '#5B21B6' : angelStyle === 'gold' ? '#D97706' : angelStyle === 'pink' ? '#BE185D' : '#2563EB'} 
            strokeWidth="0.8" fill="none" opacity="0.7"/>

          {/* Body */}
          <ellipse cx="16" cy="14" rx="4" ry="3" fill="#FDE7F3"/>

          {/* Head */}
          <circle cx="16" cy="8" r="4" fill="#FDE7F3"/>

          {/* Crown */}
          <path d="M11 5 L12 2 L14 4 L16 1 L18 4 L20 2 L21 5 L20 6 L12 6 Z" fill="url(#crownGrad)"/>
          <circle cx="16" cy="3" r="0.8" fill={angelStyle === 'purple' ? '#EC4899' : angelStyle === 'gold' ? '#DC2626' : angelStyle === 'pink' ? '#EC4899' : '#3B82F6'}/>
          <circle cx="13" cy="4" r="0.5" fill={angelStyle === 'purple' ? '#9333EA' : angelStyle === 'gold' ? '#9333EA' : angelStyle === 'pink' ? '#F472B6' : '#60A5FA'}/>
          <circle cx="19" cy="4" r="0.5" fill={angelStyle === 'purple' ? '#9333EA' : angelStyle === 'gold' ? '#9333EA' : angelStyle === 'pink' ? '#F472B6' : '#60A5FA'}/>

          {/* Face */}
          <circle cx="14.5" cy="7.5" r="0.6" fill={angelStyle === 'purple' ? '#7C3AED' : angelStyle === 'gold' ? '#92400E' : angelStyle === 'pink' ? '#DB2777' : '#1D4ED8'}/>
          <circle cx="17.5" cy="7.5" r="0.6" fill={angelStyle === 'purple' ? '#7C3AED' : angelStyle === 'gold' ? '#92400E' : angelStyle === 'pink' ? '#DB2777' : '#1D4ED8'}/>
          <path d="M15 9.5 Q16 10.5 17 9.5" stroke={angelStyle === 'purple' ? '#EC4899' : angelStyle === 'gold' ? '#F59E0B' : angelStyle === 'pink' ? '#EC4899' : '#3B82F6'} strokeWidth="0.5" fill="none"/>

          {/* Halo */}
          <ellipse cx="16" cy="0" rx="3" ry="0.8" fill="none" stroke="#FFD700" strokeWidth="0.8" opacity="0.8"/>
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default FlyingAngel;