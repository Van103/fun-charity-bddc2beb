import { useEffect, useRef, useState, useCallback } from 'react';
import { useMotion } from '@/contexts/MotionContext';
import { useCursor, CursorType } from '@/contexts/CursorContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: 'fourPointStar';
  color: string;
  twinklePhase: number;
}

const CustomCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const { reduceMotion } = useMotion();
  const { cursorType, particlesEnabled, currentCursor } = useCursor();
  const [isVisible, setIsVisible] = useState(false);

  const createParticle = useCallback((x: number, y: number): Particle => {
    // Gold/yellow sparkle color palette
    const sparkleColors = [
      'rgba(255, 215, 0, 1)',    // Gold
      'rgba(255, 236, 130, 1)',  // Light gold
      'rgba(255, 255, 200, 1)',  // Pale yellow
      'rgba(255, 200, 87, 1)',   // Warm gold
      'rgba(255, 255, 255, 1)',  // White sparkle
    ];
    const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
    
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 2 + 1,
      life: 1,
      maxLife: 40 + Math.random() * 30,
      size: 3 + Math.random() * 5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      type: 'fourPointStar',
      color,
      twinklePhase: Math.random() * Math.PI * 2,
    };
  }, []);

  const drawFourPointStar = useCallback((
    ctx: CanvasRenderingContext2D,
    particle: Particle
  ) => {
    const { x, y, size, rotation, life, color, twinklePhase } = particle;
    
    // Twinkling effect - varies opacity over time
    const twinkle = Math.sin(twinklePhase + Date.now() * 0.01) * 0.3 + 0.7;
    const alpha = life * twinkle;
    const colorWithAlpha = color.replace(/[\d.]+\)$/, `${alpha})`);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Draw 4-point star sparkle
    const outerRadius = size;
    const innerRadius = size * 0.3;

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();

    // Gradient fill for sparkle effect
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, ' + alpha + ')');
    gradient.addColorStop(0.5, colorWithAlpha);
    gradient.addColorStop(1, colorWithAlpha.replace(/[\d.]+\)$/, '0)'));

    ctx.fillStyle = gradient;
    ctx.fill();

    // Add a small bright center
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();

    ctx.restore();
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dx = mouseRef.current.x - lastMouseRef.current.x;
    const dy = mouseRef.current.y - lastMouseRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Spawn sparkles based on movement
    if (distance > 2 && particlesEnabled && cursorType !== 'default') {
      const particleCount = Math.min(Math.floor(distance / 8), 4);
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(
          createParticle(
            mouseRef.current.x + (Math.random() - 0.5) * 30,
            mouseRef.current.y + (Math.random() - 0.5) * 25
          )
        );
      }
    }

    // Spawn some sparkles even when moving slowly
    if (particlesEnabled && cursorType !== 'default' && Math.random() < 0.12) {
      particlesRef.current.push(
        createParticle(
          mouseRef.current.x + (Math.random() - 0.5) * 40,
          mouseRef.current.y - 5 + Math.random() * 15
        )
      );
    }

    lastMouseRef.current = { ...mouseRef.current };

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.04; // Slower falling
      particle.vx *= 0.98;
      particle.rotation += particle.rotationSpeed;
      particle.life -= 1 / particle.maxLife;

      if (particle.life > 0) {
        drawFourPointStar(ctx, particle);
        return true;
      }
      return false;
    });

    // Limit particles for performance
    if (particlesRef.current.length > 60) {
      particlesRef.current = particlesRef.current.slice(-60);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [createParticle, drawFourPointStar, particlesEnabled, cursorType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Only hide if particles are disabled or using default cursor
  // Angel cursors can also have particles/fairy dust
  if (!particlesEnabled || cursorType === 'default') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ opacity: isVisible ? 1 : 0 }}
    />
  );
};

export default CustomCursor;
