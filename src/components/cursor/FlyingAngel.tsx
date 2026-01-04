import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCursor, FAIRY_COLOR_OPTIONS, AngelStyle, AURA_COLOR_OPTIONS, AuraColor } from '@/contexts/CursorContext';
import { motion, AnimatePresence } from 'framer-motion';

const FAIRY_IMAGES: Record<Exclude<AngelStyle, 'random'>, string> = {
  pink: '/cursors/fairy-angel.png',
  purple: '/cursors/fairy-angel-purple.png',
  yellow: '/cursors/fairy-angel-yellow.png',
  blue: '/cursors/fairy-angel-blue.png',
  green: '/cursors/fairy-angel-green.png',
  orange: '/cursors/fairy-angel-orange.png',
  red: '/cursors/fairy-angel-red.png',
};

const ALL_FAIRY_IMAGES = Object.values(FAIRY_IMAGES);

// Sparkle colors for each fairy color - unique magical effects
const SPARKLE_COLORS_BY_FAIRY: Record<Exclude<AngelStyle, 'random'>, string[]> = {
  pink: ['#FF69B4', '#FFB6C1', '#FF1493', '#FFC0CB', '#FF85A2', '#FFFACD'], // Pink fairy - romantic hearts
  purple: ['#9333EA', '#A855F7', '#C084FC', '#E879F9', '#DDA0DD', '#E6E6FA'], // Purple fairy - mystical magic
  yellow: ['#FFD700', '#FFA500', '#FFEC8B', '#F0E68C', '#FFE4B5', '#FFFACD'], // Yellow fairy - golden sunshine
  blue: ['#3B82F6', '#60A5FA', '#87CEEB', '#00BFFF', '#ADD8E6', '#E0FFFF'], // Blue fairy - ocean dreams
  green: ['#22C55E', '#4ADE80', '#86EFAC', '#10B981', '#A7F3D0', '#D1FAE5'], // Green fairy - nature magic
  orange: ['#F97316', '#FB923C', '#FDBA74', '#FF6B35', '#FFA07A', '#FFE4C4'], // Orange fairy - sunset fire
  red: ['#EF4444', '#F87171', '#FCA5A5', '#DC2626', '#FF6B6B', '#FFB3B3'], // Red fairy - passionate flames
};

// Trail glow colors - Always golden yellow for visibility
const TRAIL_COLORS_GOLDEN = {
  primary: 'rgba(255,215,0,0.9)',
  secondary: 'rgba(255,193,7,0.5)',
  tertiary: 'rgba(255,165,0,0.3)'
};

// Trail glow colors for each fairy (fallback, but we prefer golden)
const TRAIL_COLORS_BY_FAIRY: Record<Exclude<AngelStyle, 'random'>, { primary: string; secondary: string; tertiary: string }> = {
  pink: { primary: 'rgba(255,182,193,0.8)', secondary: 'rgba(255,105,180,0.4)', tertiary: 'rgba(255,20,147,0.2)' },
  purple: { primary: 'rgba(168,85,247,0.8)', secondary: 'rgba(147,51,234,0.4)', tertiary: 'rgba(139,92,246,0.2)' },
  yellow: { primary: 'rgba(255,215,0,0.9)', secondary: 'rgba(255,165,0,0.5)', tertiary: 'rgba(255,193,7,0.3)' },
  blue: { primary: 'rgba(96,165,250,0.8)', secondary: 'rgba(59,130,246,0.4)', tertiary: 'rgba(37,99,235,0.2)' },
  green: { primary: 'rgba(74,222,128,0.8)', secondary: 'rgba(34,197,94,0.4)', tertiary: 'rgba(22,163,74,0.2)' },
  orange: { primary: 'rgba(251,146,60,0.8)', secondary: 'rgba(249,115,22,0.4)', tertiary: 'rgba(234,88,12,0.2)' },
  red: { primary: 'rgba(248,113,113,0.8)', secondary: 'rgba(239,68,68,0.4)', tertiary: 'rgba(220,38,38,0.2)' },
};

// Glow colors when moving fast
const GLOW_COLORS_BY_FAIRY: Record<Exclude<AngelStyle, 'random'>, { inner: string; outer: string }> = {
  pink: { inner: 'rgba(255,105,180,0.5)', outer: 'rgba(255,182,193,0.3)' },
  purple: { inner: 'rgba(147,51,234,0.5)', outer: 'rgba(168,85,247,0.3)' },
  yellow: { inner: 'rgba(255,215,0,0.5)', outer: 'rgba(255,193,7,0.3)' },
  blue: { inner: 'rgba(59,130,246,0.5)', outer: 'rgba(96,165,250,0.3)' },
  green: { inner: 'rgba(34,197,94,0.5)', outer: 'rgba(74,222,128,0.3)' },
  orange: { inner: 'rgba(249,115,22,0.5)', outer: 'rgba(251,146,60,0.3)' },
  red: { inner: 'rgba(239,68,68,0.5)', outer: 'rgba(248,113,113,0.3)' },
};

// Default sparkle colors for random mode
const DEFAULT_SPARKLE_COLORS = ['#FFD700', '#FF69B4', '#87CEEB', '#DDA0DD', '#22C55E', '#E6E6FA'];

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

interface LightRay {
  id: number;
  x: number;
  y: number;
  angle: number;
  length: number;
  color: string;
  delay: number;
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
  const { cursorType, fairyColor, auraColor } = useCursor();

  const isAngelCursor = cursorType.startsWith('angel');

  const selectedFairy = useMemo(() => {
    if (fairyColor === 'random') {
      return ALL_FAIRY_IMAGES[Math.floor(Math.random() * ALL_FAIRY_IMAGES.length)];
    }
    return FAIRY_IMAGES[fairyColor];
  }, [fairyColor]);

  // Get current fairy color for effects (use pink as fallback for random)
  const currentFairyColorKey = useMemo((): Exclude<AngelStyle, 'random'> => {
    if (fairyColor === 'random') {
      const keys = Object.keys(FAIRY_IMAGES) as Exclude<AngelStyle, 'random'>[];
      return keys[Math.floor(Math.random() * keys.length)];
    }
    return fairyColor;
  }, [fairyColor]);

  // Get sparkle colors based on current fairy
  const currentSparkleColors = useMemo(() => {
    return SPARKLE_COLORS_BY_FAIRY[currentFairyColorKey] || DEFAULT_SPARKLE_COLORS;
  }, [currentFairyColorKey]);

  // Get trail colors - Use golden for better visibility
  const currentTrailColors = useMemo(() => {
    return TRAIL_COLORS_GOLDEN;
  }, []);

  // Get glow colors based on current fairy
  const currentGlowColors = useMemo(() => {
    return GLOW_COLORS_BY_FAIRY[currentFairyColorKey] || GLOW_COLORS_BY_FAIRY.pink;
  }, [currentFairyColorKey]);

  // Get aura colors based on selection
  const currentAuraColors = useMemo(() => {
    const auraOption = AURA_COLOR_OPTIONS.find(a => a.id === auraColor);
    return auraOption?.colors || [];
  }, [auraColor]);

  const [processedFairySrc, setProcessedFairySrc] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedFairy, setDisplayedFairy] = useState(selectedFairy);
  const prevFairyRef = useRef(selectedFairy);

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
  const [lightRays, setLightRays] = useState<LightRay[]>([]);
  const [isMovingFast, setIsMovingFast] = useState(false);
  const sparkleIdRef = useRef(0);
  const trailIdRef = useRef(0);
  const lightRayIdRef = useRef(0);
  const lastPosRef = useRef<Position>({ x: 0, y: 0 });
  const lastAngleRef = useRef(0);

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastMouseMoveRef = useRef(Date.now());
  const idleCheckRef = useRef<number | null>(null);
  const sittingTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const sparkleIntervalRef = useRef<number | null>(null);
  const trailIntervalRef = useRef<number | null>(null);

  // Create sparkle with fairy-specific colors
  const createSparkle = useCallback((centerX: number, centerY: number) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 30;
    const colors = currentSparkleColors;
    const sparkle: Sparkle = {
      id: sparkleIdRef.current++,
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      size: 6 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
    };
    setSparkles((prev) => [...prev.slice(-15), sparkle]);
    
    // Remove after animation
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
    }, 1000);
  }, [currentSparkleColors]);

  // Create trail point with more vibrant effect
  const createTrailPoint = useCallback((x: number, y: number) => {
    const trailPoint: TrailPoint = {
      id: trailIdRef.current++,
      x,
      y,
      opacity: 1,
    };
    setTrail((prev) => [...prev.slice(-18), trailPoint]);
    
    // Remove after animation
    setTimeout(() => {
      setTrail((prev) => prev.filter((t) => t.id !== trailPoint.id));
    }, 600);
  }, []);

  // Create light rays - comet tail effect
  const createLightRays = useCallback((x: number, y: number, movementAngle: number) => {
    const rayColors = [
      'rgba(255,255,255,0.9)',
      'rgba(255,223,0,0.8)',
      'rgba(255,200,50,0.7)',
      'rgba(255,180,100,0.6)',
      'rgba(255,215,0,0.85)',
    ];
    
    // Create 5-8 rays emanating from behind the angel
    const numRays = 5 + Math.floor(Math.random() * 4);
    const newRays: LightRay[] = [];
    
    for (let i = 0; i < numRays; i++) {
      // Rays spread out behind the angel (opposite to movement direction)
      const baseAngle = movementAngle + Math.PI; // Opposite direction
      const spreadAngle = baseAngle + (Math.random() - 0.5) * 1.2; // Spread ±35 degrees
      
      const ray: LightRay = {
        id: lightRayIdRef.current++,
        x: x - Math.cos(movementAngle) * 15, // Start slightly behind
        y: y - Math.sin(movementAngle) * 15,
        angle: spreadAngle,
        length: 30 + Math.random() * 50, // Random length 30-80px
        color: rayColors[Math.floor(Math.random() * rayColors.length)],
        delay: Math.random() * 0.1,
      };
      newRays.push(ray);
    }
    
    setLightRays((prev) => [...prev.slice(-25), ...newRays]);
    
    // Remove after animation
    setTimeout(() => {
      setLightRays((prev) => prev.filter((r) => !newRays.find(nr => nr.id === r.id)));
    }, 400);
  }, []);

  // Handle fairy color transition
  useEffect(() => {
    if (prevFairyRef.current !== selectedFairy) {
      setIsTransitioning(true);
      
      // After fade out, change the fairy
      const timer = setTimeout(() => {
        setDisplayedFairy(selectedFairy);
        prevFairyRef.current = selectedFairy;
        
        // Then fade back in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedFairy]);

  // Make sure we always display a transparent sprite even if the source image has a baked checkerboard.
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const blob = await removeBackgroundByEdgeFloodFill(displayedFairy);
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
  }, [displayedFairy]);

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
    // Tìm các chữ (headings, paragraphs, spans, labels) và cả buttons/links
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, label, .text-lg, .text-xl, .text-2xl, .text-3xl, .font-bold, .font-semibold');
    const interactiveElements = document.querySelectorAll('button, [role="button"], a, .cursor-pointer');
    
    const textTargets: Position[] = [];
    const interactiveTargets: Position[] = [];

    // Thu thập các vị trí chữ - đậu trên đầu chữ
    textElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const text = el.textContent?.trim() || '';
      // Chỉ chọn các element có text thực sự và kích thước hợp lý
      if (text.length > 2 && rect.width > 30 && rect.height > 10 && 
          rect.top >= 50 && rect.left >= 0 && 
          rect.top < window.innerHeight - 50 && rect.right < window.innerWidth) {
        textTargets.push({ 
          x: rect.left + rect.width / 2, 
          y: Math.max(30, rect.top - 15) // Đậu ngay trên đầu chữ
        });
      }
    });

    // Thu thập các vị trí interactive
    interactiveElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 20 && rect.height > 20 && rect.top >= 0 && rect.left >= 0) {
        interactiveTargets.push({ x: rect.left + rect.width / 2, y: Math.max(20, rect.top - 18) });
      }
    });

    // 70% chọn chữ, 30% chọn buttons/links
    const allTargets = [...textTargets, ...interactiveTargets];
    
    if (textTargets.length > 0 && Math.random() > 0.3) {
      return textTargets[Math.floor(Math.random() * textTargets.length)];
    }
    
    if (allTargets.length > 0) {
      return allTargets[Math.floor(Math.random() * allTargets.length)];
    }

    // Fallback nếu không tìm thấy gì
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
      
      // Calculate movement angle for light rays
      if (speed > 2) {
        lastAngleRef.current = Math.atan2(dy, dx);
      }
      
      lastPosRef.current = { x: position.x, y: position.y };
      
      // Create trail when moving (lower threshold for more visible effect)
      if (speed > 4) {
        setIsMovingFast(true);
        createTrailPoint(position.x, position.y);
        
        // Create light rays when moving faster (comet effect)
        if (speed > 8) {
          createLightRays(position.x, position.y, lastAngleRef.current);
        }
      } else {
        setIsMovingFast(false);
      }
    }, 25);

    return () => {
      if (trailIntervalRef.current) {
        window.clearInterval(trailIntervalRef.current);
        trailIntervalRef.current = null;
      }
    };
  }, [createTrailPoint, createLightRays, isAngelCursor, isHiding, isIdle, isSitting, position.x, position.y]);

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
      {/* Light rays - Comet tail emanating from wings */}
      <AnimatePresence>
        {lightRays.map((ray) => (
          <motion.div
            key={ray.id}
            className="fixed pointer-events-none z-[9995]"
            style={{
              left: ray.x,
              top: ray.y,
              width: ray.length,
              height: 3,
              transformOrigin: '0 50%',
              transform: `rotate(${ray.angle}rad)`,
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ 
              opacity: [0, 0.9, 0],
              scaleX: [0, 1, 0.3],
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.35, 
              ease: 'easeOut',
              delay: ray.delay,
            }}
          >
            {/* Ray core - bright line */}
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, ${ray.color} 0%, rgba(255,255,255,0.9) 20%, ${ray.color} 60%, transparent 100%)`,
                borderRadius: '2px',
              }}
            />
            {/* Ray glow */}
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, rgba(255,215,0,0.6) 0%, rgba(255,255,255,0.4) 30%, transparent 100%)`,
                filter: 'blur(4px)',
                transform: 'scaleY(3)',
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Trail effect - Comet tail style */}
      <AnimatePresence>
        {trail.map((point, index) => {
          const trailSize = Math.max(8, 35 - index * 1.8);
          const trailOpacity = Math.max(0.1, 0.9 - index * 0.05);
          
          return (
            <motion.div
              key={point.id}
              className="fixed pointer-events-none z-[9996]"
              style={{
                left: point.x - trailSize / 2,
                top: point.y - trailSize / 2,
                width: trailSize,
                height: trailSize,
              }}
              initial={{ opacity: trailOpacity, scale: 1.2 }}
              animate={{ 
                opacity: [trailOpacity, trailOpacity * 0.5, 0],
                scale: [1.2, 0.8, 0.3],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {/* Outer glow */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${currentTrailColors.primary} 0%, ${currentTrailColors.secondary} 50%, transparent 100%)`,
                  filter: 'blur(6px)',
                  transform: 'scale(1.5)',
                }}
              />
              {/* Inner bright core */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, white 0%, ${currentTrailColors.primary} 30%, ${currentTrailColors.secondary} 60%, transparent 100%)`,
                  filter: 'blur(2px)',
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Enhanced glow effect when moving fast */}
      {isMovingFast && (
        <motion.div
          className="fixed pointer-events-none z-[9997]"
          style={{
            left: position.x - 60,
            top: position.y - 40,
            width: 120,
            height: 90,
          }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 0.25, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Outer aura */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(ellipse, ${currentGlowColors.outer} 0%, transparent 70%)`,
              filter: 'blur(15px)',
              transform: 'scale(1.3)',
            }}
          />
          {/* Inner glow */}
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(ellipse, ${currentGlowColors.inner} 0%, ${currentGlowColors.outer} 40%, transparent 80%)`,
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

      {/* Aura glow behind angel */}
      {auraColor !== 'none' && currentAuraColors.length > 0 && (
        <motion.div
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: position.x - 55 + peekOffset.x,
            top: position.y - 40 + peekOffset.y,
            width: 100,
            height: 90,
          }}
          animate={{
            opacity: isHiding ? 0 : [0.7, 1, 0.7],
            scale: [1, 1.1, 1],
          }}
          transition={{
            opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {/* Main aura glow */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: auraColor === 'rainbow'
                ? `conic-gradient(from 0deg, ${currentAuraColors.join(', ')}, ${currentAuraColors[0]})`
                : `radial-gradient(circle, ${currentAuraColors[0]} 0%, ${currentAuraColors[1] || 'transparent'} 50%, transparent 80%)`,
              filter: 'blur(12px)',
              animation: auraColor === 'rainbow' ? 'spin 4s linear infinite' : undefined,
            }}
          />
          {/* Inner bright core */}
          <div 
            className="absolute inset-4 rounded-full"
            style={{
              background: `radial-gradient(circle, ${currentAuraColors[0]} 0%, transparent 70%)`,
              filter: 'blur(6px)',
            }}
          />
        </motion.div>
      )}

      {/* Fairy */}
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        style={{ left: position.x - 40 + peekOffset.x, top: position.y - 25 + peekOffset.y }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: isTransitioning ? 0 : (isHiding && peekPhase % 2 === 0 ? 0.3 : 1), 
          scale: isTransitioning ? 0.5 : (isHiding ? 0.8 : 1),
          rotate: isTransitioning ? 360 : (isHiding ? (hidePosition === 'left' ? -20 : hidePosition === 'right' ? 20 : 0) : 0)
        }}
        transition={{ 
          duration: isTransitioning ? 0.3 : 0.3,
          ease: isTransitioning ? 'easeInOut' : 'easeOut'
        }}
      >
        {/* Magic sparkle burst during transition */}
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div 
              className="w-20 h-20 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,105,180,0.6) 30%, rgba(147,112,219,0.4) 60%, transparent 80%)',
                filter: 'blur(4px)',
              }}
            />
          </motion.div>
        )}
        
        <motion.div
          style={{
            width: 70,
            height: 70,
            transform: `scaleX(${direction === 'left' ? -1 : 1})`,
          }}
          animate={{
            rotate: isTransitioning 
              ? [0, 15, -15, 0]
              : isHiding 
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
            rotate: { duration: isTransitioning ? 0.3 : (isHiding ? 0.5 : isSitting ? 1 : 0.1), repeat: isTransitioning ? 0 : Infinity, ease: 'easeInOut' },
            y: { duration: isHiding ? 0.6 : isSitting ? 1.5 : 0.2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {/* Crown on top of fairy head */}
          <svg 
            viewBox="0 0 24 12" 
            className="absolute w-7 h-4 z-10"
            style={{
              left: '50%',
              top: '-2px',
              transform: 'translateX(-50%)',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
            }}
          >
            <defs>
              <linearGradient id="crownGradFairy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FFD700' }} />
                <stop offset="50%" style={{ stopColor: '#FFA500' }} />
                <stop offset="100%" style={{ stopColor: '#FFD700' }} />
              </linearGradient>
            </defs>
            {/* Crown base shape - centered */}
            <path 
              d="M4 10 L5 4 L7.5 7 L12 2 L16.5 7 L19 4 L20 10 L19 11 L5 11 Z" 
              fill="url(#crownGradFairy)"
              stroke="#B8860B"
              strokeWidth="0.3"
            />
            {/* Center jewel - pink */}
            <circle cx="12" cy="4.5" r="1.2" fill="#EC4899" />
            {/* Side jewels - purple */}
            <circle cx="7" cy="6.5" r="0.8" fill="#9333EA" />
            <circle cx="17" cy="6.5" r="0.8" fill="#9333EA" />
            {/* Sparkle dots on crown */}
            <circle cx="5.5" cy="8" r="0.4" fill="#FFFACD" />
            <circle cx="18.5" cy="8" r="0.4" fill="#FFFACD" />
            <circle cx="12" cy="7" r="0.3" fill="#FFFACD" />
          </svg>
          
          <motion.img
            src={processedFairySrc ?? displayedFairy}
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
