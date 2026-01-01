import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useCursor } from '@/contexts/CursorContext';
import { motion } from 'framer-motion';

// Danh sách các tiên nữ
const FAIRY_IMAGES = [
  '/cursors/fairy-pink.png',
  '/cursors/fairy-yellow.png', 
  '/cursors/fairy-purple.png',
];

interface Position {
  x: number;
  y: number;
}

interface ButtonTarget {
  x: number;
  y: number;
  element: Element;
}

const FlyingAngel = () => {
  const { cursorType } = useCursor();
  
  // Random chọn 1 tiên nữ khi component mount
  const selectedFairy = useMemo(() => {
    return FAIRY_IMAGES[Math.floor(Math.random() * FAIRY_IMAGES.length)];
  }, []);
  
  const [position, setPosition] = useState<Position>({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState<Position>({ x: -100, y: -100 });
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [wingPhase, setWingPhase] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const [idleTarget, setIdleTarget] = useState<Position | null>(null);
  const [isSitting, setIsSitting] = useState(false);
  
  const animationRef = useRef<number>();
  const lastTimeRef = useRef(0);
  const lastMouseMoveRef = useRef(Date.now());
  const idleCheckRef = useRef<NodeJS.Timeout>();

  // Check if this is an angel cursor type
  const isAngelCursor = cursorType.startsWith('angel');

  // Get random button or corner position for idle flying
  const getRandomIdleTarget = useCallback((): Position => {
    const buttons = document.querySelectorAll('button, [role="button"], a, .cursor-pointer');
    const validButtons: ButtonTarget[] = [];
    
    buttons.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 20 && rect.height > 20 && rect.top > 0 && rect.left > 0) {
        validButtons.push({
          x: rect.left + rect.width / 2,
          y: rect.top - 20, // Sit on top of button
          element: btn
        });
      }
    });

    // 70% chance to go to a button, 30% to a corner
    if (validButtons.length > 0 && Math.random() > 0.3) {
      const randomBtn = validButtons[Math.floor(Math.random() * validButtons.length)];
      return { x: randomBtn.x, y: randomBtn.y };
    }

    // Random corner positions
    const corners = [
      { x: 100, y: 100 },
      { x: window.innerWidth - 100, y: 100 },
      { x: 100, y: window.innerHeight - 100 },
      { x: window.innerWidth - 100, y: window.innerHeight - 100 },
      { x: window.innerWidth / 2, y: 80 },
    ];
    return corners[Math.floor(Math.random() * corners.length)];
  }, []);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setDirection(e.clientX > position.x ? 'right' : 'left');
      setTargetPos({ x: e.clientX, y: e.clientY });
      lastMouseMoveRef.current = Date.now();
      setIsIdle(false);
      setIsSitting(false);
      setIdleTarget(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [position.x]);

  // Check for idle state every second
  useEffect(() => {
    if (!isAngelCursor) return;

    idleCheckRef.current = setInterval(() => {
      const timeSinceLastMove = Date.now() - lastMouseMoveRef.current;
      
      if (timeSinceLastMove > 5000 && !isIdle) {
        setIsIdle(true);
        const newTarget = getRandomIdleTarget();
        setIdleTarget(newTarget);
        setDirection(newTarget.x > position.x ? 'right' : 'left');
      }
    }, 1000);

    return () => {
      if (idleCheckRef.current) {
        clearInterval(idleCheckRef.current);
      }
    };
  }, [isAngelCursor, isIdle, getRandomIdleTarget, position.x]);

  // Pick new idle target periodically when idle
  useEffect(() => {
    if (!isIdle || !isAngelCursor) return;

    const interval = setInterval(() => {
      // Check if we've reached current target
      const dist = Math.sqrt(
        Math.pow((idleTarget?.x || 0) - position.x, 2) + 
        Math.pow((idleTarget?.y || 0) - position.y, 2)
      );
      
      if (dist < 30) {
        setIsSitting(true);
        // Stay sitting for 2-4 seconds then fly again
        setTimeout(() => {
          if (isIdle) {
            setIsSitting(false);
            const newTarget = getRandomIdleTarget();
            setIdleTarget(newTarget);
            setDirection(newTarget.x > position.x ? 'right' : 'left');
          }
        }, 2000 + Math.random() * 2000);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isIdle, isAngelCursor, idleTarget, position, getRandomIdleTarget]);

  // Smooth animation loop
  useEffect(() => {
    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      // Wing flapping animation (slower when sitting)
      const flapSpeed = isSitting ? 0.005 : 0.015;
      setWingPhase(prev => (prev + delta * flapSpeed) % (Math.PI * 2));
      
      // Smooth follow cursor or idle target
      setPosition(prev => {
        const target = isIdle && idleTarget ? idleTarget : targetPos;
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        
        // Slower speed when idle flying, faster when following cursor
        const speed = isIdle ? 0.03 : 0.6;
        
        const newX = prev.x + dx * speed;
        const newY = prev.y + dy * speed;
        
        return { x: newX, y: newY };
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPos, isIdle, idleTarget, isSitting]);

  // Only show for angel cursor types
  if (!isAngelCursor) return null;

  const wingFlap = Math.sin(wingPhase) * (isSitting ? 5 : 12);

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: position.x - 40,
        top: position.y - 25,
      }}
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
          rotate: { 
            duration: isSitting ? 1 : 0.1, 
            repeat: Infinity,
            ease: "easeInOut"
          },
          y: { duration: isSitting ? 1.5 : 0.2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <motion.img 
          src={selectedFairy}
          alt="Fairy Cursor"
          className="w-full h-full object-contain drop-shadow-lg"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }}
          animate={{
            scaleY: isSitting ? [1, 1.02, 1] : [1, 1.01, 1, 0.99, 1],
            scaleX: isSitting ? 1 : [1, 1 + Math.abs(wingFlap) * 0.002, 1],
          }}
          transition={{
            scaleY: { 
              duration: isSitting ? 1 : 0.12, 
              repeat: Infinity, 
              ease: "easeInOut" 
            },
            scaleX: {
              duration: 0.1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
};

export default FlyingAngel;
