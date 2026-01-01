import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCursor } from '@/contexts/CursorContext';
import { motion, AnimatePresence } from 'framer-motion';

const FAIRY_IMAGES = [
  '/cursors/fairy-pink.png',
  '/cursors/fairy-yellow.png',
  '/cursors/fairy-purple.png',
];

const SPARKLE_COLORS = ['#FFD700', '#FF69B4', '#87CEEB', '#DDA0DD', '#FFFACD', '#E6E6FA'];

interface Position {
  x: number;
  y: number;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
}

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

const BG_LUMA_MIN = 225;
const BG_MAX_CHROMA = 18;

function isLikelyBackground(r: number, g: number, b: number, a: number) {
  if (a === 0) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  return max >= BG_LUMA_MIN && chroma <= BG_MAX_CHROMA;
}

async function removeBackgroundByEdgeFloodFill(src: string): Promise<Blob> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load fairy image'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const w = canvas.width;
  const h = canvas.height;
  const visited = new Uint8Array(w * h);

  const stack: number[] = [];
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const idx = y * w + x;
    if (visited[idx]) return;
    visited[idx] = 1;

    const o = idx * 4;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const a = data[o + 3];

    if (isLikelyBackground(r, g, b, a)) {
      // Make it transparent
      data[o + 3] = 0;
      stack.push(idx);
    }
  };

  // Seed edges
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  // Flood fill background connected to edges
  while (stack.length) {
    const idx = stack.pop()!;
    const x = idx % w;
    const y = Math.floor(idx / w);

    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }

  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to export PNG'))),
      'image/png',
      1,
    );
  });

  return blob;
}

const FlyingAngel = () => {
  const { cursorType } = useCursor();

  const isAngelCursor = cursorType.startsWith('angel');

  const selectedFairy = useMemo(() => {
    return FAIRY_IMAGES[Math.floor(Math.random() * FAIRY_IMAGES.length)];
  }, []);

  const [processedFairySrc, setProcessedFairySrc] = useState<string | null>(null);

  const [position, setPosition] = useState<Position>({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState<Position>({ x: -100, y: -100 });
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [wingPhase, setWingPhase] = useState(0);

  const [isIdle, setIsIdle] = useState(false);
  const [idleTarget, setIdleTarget] = useState<Position | null>(null);
  const [isSitting, setIsSitting] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [hidePosition, setHidePosition] = useState<'left' | 'right' | 'top' | 'bottom'>('right');
  const [peekPhase, setPeekPhase] = useState(0);

  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isMovingFast, setIsMovingFast] = useState(false);
  const sparkleIdRef = useRef(0);
  const trailIdRef = useRef(0);
  const lastPosRef = useRef<Position>({ x: 0, y: 0 });

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastMouseMoveRef = useRef(Date.now());
  const idleCheckRef = useRef<number | null>(null);
  const sittingTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const sparkleIntervalRef = useRef<number | null>(null);
  const trailIntervalRef = useRef<number | null>(null);

  // Create sparkle
  const createSparkle = useCallback((centerX: number, centerY: number) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 30;
    const sparkle: Sparkle = {
      id: sparkleIdRef.current++,
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      size: 6 + Math.random() * 10,
      color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
      rotation: Math.random() * 360,
    };
    setSparkles((prev) => [...prev.slice(-15), sparkle]);
    
    // Remove after animation
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
    }, 1000);
  }, []);

  // Create trail point
  const createTrailPoint = useCallback((x: number, y: number) => {
    const trailPoint: TrailPoint = {
      id: trailIdRef.current++,
      x,
      y,
      opacity: 0.8,
    };
    setTrail((prev) => [...prev.slice(-12), trailPoint]);
    
    // Remove after animation
    setTimeout(() => {
      setTrail((prev) => prev.filter((t) => t.id !== trailPoint.id));
    }, 400);
  }, []);

  // Make sure we always display a transparent sprite even if the source image has a baked checkerboard.
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const blob = await removeBackgroundByEdgeFloodFill(selectedFairy);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setProcessedFairySrc(objectUrl);
      } catch {
        // fallback to raw image
        setProcessedFairySrc(null);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFairy]);

  const getRandomHidePosition = useCallback((): { pos: 'left' | 'right' | 'top' | 'bottom'; target: Position } => {
    const positions: Array<{ pos: 'left' | 'right' | 'top' | 'bottom'; target: Position }> = [
      { pos: 'right', target: { x: window.innerWidth + 30, y: window.innerHeight / 2 } },
      { pos: 'left', target: { x: -30, y: window.innerHeight / 2 } },
      { pos: 'top', target: { x: window.innerWidth / 2, y: -30 } },
      { pos: 'bottom', target: { x: window.innerWidth / 2, y: window.innerHeight + 30 } },
    ];
    return positions[Math.floor(Math.random() * positions.length)];
  }, []);

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
      setIsHiding(false);
      setIdleTarget(null);

      if (sittingTimeoutRef.current) {
        window.clearTimeout(sittingTimeoutRef.current);
        sittingTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
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

  // When idle: if reached target -> sit then maybe hide
  useEffect(() => {
    if (!isAngelCursor || !isIdle || !idleTarget || isHiding) return;

    const dist = Math.hypot(idleTarget.x - position.x, idleTarget.y - position.y);
    if (dist > 28) return;

    setIsSitting(true);
    if (sittingTimeoutRef.current) window.clearTimeout(sittingTimeoutRef.current);

    sittingTimeoutRef.current = window.setTimeout(() => {
      setIsSitting(false);
      
      // 30% chance to go hide and peek
      if (Math.random() < 0.3) {
        const { pos, target } = getRandomHidePosition();
        setHidePosition(pos);
        setIdleTarget(target);
        
        hideTimeoutRef.current = window.setTimeout(() => {
          setIsHiding(true);
          setPeekPhase(0);
        }, 1000);
      } else {
        const t = getRandomIdleTarget();
        setIdleTarget(t);
        setDirection(t.x > position.x ? 'right' : 'left');
      }
    }, 2000 + Math.random() * 2000);

    return () => {
      if (sittingTimeoutRef.current) window.clearTimeout(sittingTimeoutRef.current);
      sittingTimeoutRef.current = null;
    };
  }, [getRandomHidePosition, getRandomIdleTarget, idleTarget, isAngelCursor, isHiding, isIdle, position.x, position.y]);

  // Peek animation when hiding
  useEffect(() => {
    if (!isHiding) return;

    const peekInterval = window.setInterval(() => {
      setPeekPhase((prev) => {
        const next = prev + 1;
        // After 3 peeks, come back out
        if (next > 6) {
          setIsHiding(false);
          const t = getRandomIdleTarget();
          setIdleTarget(t);
          setDirection(t.x > position.x ? 'right' : 'left');
          return 0;
        }
        return next;
      });
    }, 800);

    return () => window.clearInterval(peekInterval);
  }, [getRandomIdleTarget, isHiding, position.x]);

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const flapSpeed = isSitting ? 0.005 : 0.015;
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

  // Trail generation when moving fast
  useEffect(() => {
    if (!isAngelCursor || isHiding || isSitting || isIdle) {
      if (trailIntervalRef.current) {
        window.clearInterval(trailIntervalRef.current);
        trailIntervalRef.current = null;
      }
      setIsMovingFast(false);
      return;
    }

    trailIntervalRef.current = window.setInterval(() => {
      const dx = position.x - lastPosRef.current.x;
      const dy = position.y - lastPosRef.current.y;
      const speed = Math.hypot(dx, dy);
      
      lastPosRef.current = { x: position.x, y: position.y };
      
      // Only create trail when moving fast enough
      if (speed > 8) {
        setIsMovingFast(true);
        createTrailPoint(position.x, position.y);
      } else {
        setIsMovingFast(false);
      }
    }, 30);

    return () => {
      if (trailIntervalRef.current) {
        window.clearInterval(trailIntervalRef.current);
        trailIntervalRef.current = null;
      }
    };
  }, [createTrailPoint, isAngelCursor, isHiding, isIdle, isSitting, position.x, position.y]);

  // Sparkle generation
  useEffect(() => {
    if (!isAngelCursor || isHiding) {
      if (sparkleIntervalRef.current) {
        window.clearInterval(sparkleIntervalRef.current);
        sparkleIntervalRef.current = null;
      }
      return;
    }

    // More sparkles when sitting, less when moving fast
    const interval = isSitting ? 300 : 150;
    
    sparkleIntervalRef.current = window.setInterval(() => {
      createSparkle(position.x, position.y);
    }, interval);

    return () => {
      if (sparkleIntervalRef.current) {
        window.clearInterval(sparkleIntervalRef.current);
        sparkleIntervalRef.current = null;
      }
    };
  }, [createSparkle, isAngelCursor, isHiding, isSitting, position.x, position.y]);

  if (!isAngelCursor) return null;

  const wingFlap = Math.sin(wingPhase) * (isSitting ? 5 : 12);

  // Calculate peek offset for hiding animation
  const getPeekOffset = () => {
    if (!isHiding) return { x: 0, y: 0 };
    const peekAmount = peekPhase % 2 === 1 ? 25 : 0; // Peek in/out
    switch (hidePosition) {
      case 'right': return { x: -peekAmount, y: 0 };
      case 'left': return { x: peekAmount, y: 0 };
      case 'top': return { x: 0, y: peekAmount };
      case 'bottom': return { x: 0, y: -peekAmount };
      default: return { x: 0, y: 0 };
    }
  };

  const peekOffset = getPeekOffset();

  return (
    <>
      {/* Trail effect */}
      <AnimatePresence>
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="fixed pointer-events-none z-[9996]"
            style={{
              left: point.x - 15,
              top: point.y - 10,
              width: 30 - index * 1.5,
              height: 30 - index * 1.5,
            }}
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{ 
              opacity: [0.6, 0.3, 0],
              scale: [1, 0.6, 0.2],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(255,182,193,0.8) 0%, rgba(255,105,180,0.4) 40%, rgba(147,112,219,0.2) 70%, transparent 100%)`,
                filter: 'blur(3px)',
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Glow effect when moving fast */}
      {isMovingFast && (
        <motion.div
          className="fixed pointer-events-none z-[9997]"
          style={{
            left: position.x - 50,
            top: position.y - 35,
            width: 100,
            height: 80,
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(ellipse, rgba(255,215,0,0.4) 0%, rgba(255,182,193,0.3) 30%, transparent 70%)`,
              filter: 'blur(8px)',
            }}
          />
        </motion.div>
      )}

      {/* Sparkles */}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="fixed pointer-events-none z-[9998]"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              width: sparkle.size,
              height: sparkle.size,
            }}
            initial={{ opacity: 1, scale: 0, rotate: sparkle.rotation }}
            animate={{ 
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.5],
              rotate: sparkle.rotation + 180,
              y: [0, -20, -30],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <svg viewBox="0 0 24 24" fill={sparkle.color} className="w-full h-full drop-shadow-lg">
              <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Fairy */}
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        style={{ left: position.x - 40 + peekOffset.x, top: position.y - 25 + peekOffset.y }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: isHiding && peekPhase % 2 === 0 ? 0.3 : 1, 
          scale: isHiding ? 0.8 : 1,
          rotate: isHiding ? (hidePosition === 'left' ? -20 : hidePosition === 'right' ? 20 : 0) : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          style={{
            width: 70,
            height: 70,
            transform: `scaleX(${direction === 'left' ? -1 : 1})`,
          }}
          animate={{
            rotate: isHiding 
              ? [0, 5, 0, -5, 0] 
              : isSitting 
                ? [0, 2, 0, -2, 0] 
                : [wingFlap * 0.12, -wingFlap * 0.12],
            y: isHiding
              ? [0, -2, 0, 2, 0]
              : isSitting 
                ? [0, -1, 0] 
                : [0, -3, 0, 3, 0],
          }}
          transition={{
            rotate: { duration: isHiding ? 0.5 : isSitting ? 1 : 0.1, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: isHiding ? 0.6 : isSitting ? 1.5 : 0.2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <motion.img
            src={processedFairySrc ?? selectedFairy}
            alt="Fairy cursor"
            className="w-full h-full object-contain"
            animate={{
              scaleY: isSitting ? [1, 1.02, 1] : [1, 1.01, 1, 0.99, 1],
              scaleX: isSitting ? 1 : [1, 1 + Math.abs(wingFlap) * 0.002, 1],
            }}
            transition={{
              scaleY: { duration: isSitting ? 1 : 0.12, repeat: Infinity, ease: 'easeInOut' },
              scaleX: { duration: 0.1, repeat: Infinity, ease: 'easeInOut' },
            }}
            draggable={false}
          />
        </motion.div>
      </motion.div>
    </>
  );
};

export default FlyingAngel;
