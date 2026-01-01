import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCursor } from '@/contexts/CursorContext';
import { motion } from 'framer-motion';

const FAIRY_IMAGES = [
  '/cursors/fairy-pink.png',
  '/cursors/fairy-yellow.png',
  '/cursors/fairy-purple.png',
];

interface Position {
  x: number;
  y: number;
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

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastMouseMoveRef = useRef(Date.now());
  const idleCheckRef = useRef<number | null>(null);
  const sittingTimeoutRef = useRef<number | null>(null);

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

  if (!isAngelCursor) return null;

  const wingFlap = Math.sin(wingPhase) * (isSitting ? 5 : 12);

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999]"
      style={{ left: position.x - 40, top: position.y - 25 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        style={{
          width: 70,
          height: 70,
          transform: `scaleX(${direction === 'left' ? -1 : 1})`,
        }}
        animate={{
          rotate: isSitting ? [0, 2, 0, -2, 0] : [wingFlap * 0.12, -wingFlap * 0.12],
          y: isSitting ? [0, -1, 0] : [0, -3, 0, 3, 0],
        }}
        transition={{
          rotate: { duration: isSitting ? 1 : 0.1, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: isSitting ? 1.5 : 0.2, repeat: Infinity, ease: 'easeInOut' },
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
  );
};

export default FlyingAngel;
