import { useRef, useEffect, useCallback, useMemo } from "react";
import { useMotion } from "@/contexts/MotionContext";

const GOLD_COLORS = ['#F5C77A', '#FFD700', '#FFEAA7', '#FFC857', '#FFB347'];
const PURPLE_COLORS = ['#7A5AF8', '#8B7CF6', '#A78BFA', '#B9A6FF', '#C4B5FD'];

interface BokehParticle {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  color: string;
  type: 'gold' | 'purple';
  driftX: number;
  driftY: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

function createParticle(width: number, height: number, fromBottom = false): BokehParticle {
  const isGold = Math.random() < 0.6;
  const colors = isGold ? GOLD_COLORS : PURPLE_COLORS;
  const baseOpacity = 0.3 + Math.random() * 0.4;
  
  return {
    x: Math.random() * width,
    y: fromBottom ? height + 20 : Math.random() * height,
    size: 2 + Math.random() * 4,
    baseOpacity,
    opacity: baseOpacity,
    color: colors[Math.floor(Math.random() * colors.length)],
    type: isGold ? 'gold' : 'purple',
    driftX: (Math.random() - 0.5) * 0.3,
    driftY: 0.2 + Math.random() * 0.4,
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.02 + Math.random() * 0.03,
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: BokehParticle) {
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
  gradient.addColorStop(0, p.color);
  gradient.addColorStop(0.4, p.color + Math.round(p.opacity * 180).toString(16).padStart(2, '0'));
  gradient.addColorStop(1, 'transparent');
  
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.globalAlpha = p.opacity;
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function EnergyBokeh() {
  const { reduceMotion, bokehEnabled, bokehParticleCount, bokehSpeed } = useMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<BokehParticle[]>([]);
  const animationRef = useRef<number>();
  
  // Check if mobile
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  const initParticles = useCallback((width: number, height: number, count: number) => {
    // Reduce particles by 60% on mobile
    const actualCount = isMobile ? Math.round(count * 0.4) : count;
    
    particlesRef.current = Array.from({ length: actualCount }, () => 
      createParticle(width, height, false)
    );
  }, [isMobile]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach((p, i) => {
      // Update position
      p.y -= p.driftY * bokehSpeed;
      p.x += p.driftX * bokehSpeed;
      
      // Twinkle effect
      p.twinklePhase += p.twinkleSpeed * bokehSpeed;
      p.opacity = p.baseOpacity * (0.5 + 0.5 * Math.sin(p.twinklePhase));
      
      // Respawn if out of bounds
      if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) {
        particlesRef.current[i] = createParticle(canvas.width, canvas.height, true);
      }
      
      drawParticle(ctx, p);
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [bokehSpeed]);

  useEffect(() => {
    if (reduceMotion || !bokehEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height, bokehParticleCount);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleVisibility = () => {
      if (document.hidden) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        animate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [reduceMotion, bokehEnabled, bokehParticleCount, animate, initParticles]);

  // Update particle count when it changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion || !bokehEnabled) return;
    
    const currentCount = particlesRef.current.length;
    // Reduce by 60% on mobile
    const targetCount = isMobile ? Math.round(bokehParticleCount * 0.4) : bokehParticleCount;
    
    if (targetCount > currentCount) {
      // Add more particles
      for (let i = currentCount; i < targetCount; i++) {
        particlesRef.current.push(createParticle(canvas.width, canvas.height, false));
      }
    } else if (targetCount < currentCount) {
      // Remove particles
      particlesRef.current = particlesRef.current.slice(0, targetCount);
    }
  }, [bokehParticleCount, reduceMotion, bokehEnabled, isMobile]);

  if (reduceMotion || !bokehEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
