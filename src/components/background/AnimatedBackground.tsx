import { useMotion } from "@/contexts/MotionContext";
import { memo, useMemo } from "react";
import "./animated-background.css";

interface AnimatedBackgroundProps {
  variant?: "default" | "home" | "profile" | "editor";
  intensity?: "low" | "medium" | "high";
}

// Diamond SVG component
const Diamond = memo(({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    className={className} 
    style={style}
    width="24" 
    height="32" 
    viewBox="0 0 24 32" 
    fill="none"
  >
    <path 
      d="M12 0L24 12L12 32L0 12L12 0Z" 
      fill="currentColor"
      fillOpacity="0.15"
    />
    <path 
      d="M12 4L20 12L12 28L4 12L12 4Z" 
      fill="currentColor"
      fillOpacity="0.1"
    />
  </svg>
));

// Crown SVG component
const Crown = memo(({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    className={className} 
    style={style}
    width="32" 
    height="24" 
    viewBox="0 0 32 24" 
    fill="none"
  >
    <path 
      d="M2 20L6 8L12 14L16 4L20 14L26 8L30 20H2Z" 
      fill="currentColor"
      fillOpacity="0.12"
    />
    <path 
      d="M4 18L7 10L12 15L16 7L20 15L25 10L28 18H4Z" 
      fill="currentColor"
      fillOpacity="0.08"
    />
    <circle cx="6" cy="6" r="2" fill="currentColor" fillOpacity="0.15"/>
    <circle cx="16" cy="2" r="2" fill="currentColor" fillOpacity="0.2"/>
    <circle cx="26" cy="6" r="2" fill="currentColor" fillOpacity="0.15"/>
  </svg>
));

// Angel SVG component
const Angel = memo(({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    className={className} 
    style={style}
    width="28" 
    height="36" 
    viewBox="0 0 28 36" 
    fill="none"
  >
    {/* Halo */}
    <ellipse cx="14" cy="4" rx="5" ry="2" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" fill="none"/>
    {/* Head */}
    <circle cx="14" cy="10" r="4" fill="currentColor" fillOpacity="0.15"/>
    {/* Body */}
    <path d="M10 14C10 14 8 24 14 24C20 24 18 14 18 14" fill="currentColor" fillOpacity="0.1"/>
    {/* Wings */}
    <path d="M10 16C6 14 2 16 2 20C2 22 6 22 10 20" fill="currentColor" fillOpacity="0.08"/>
    <path d="M18 16C22 14 26 16 26 20C26 22 22 22 18 20" fill="currentColor" fillOpacity="0.08"/>
    {/* Dress/Gown */}
    <path d="M8 24L14 36L20 24" fill="currentColor" fillOpacity="0.12"/>
  </svg>
));

// Heart decorative element
const Heart = memo(({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    className={className} 
    style={style}
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    fill="none"
  >
    <path 
      d="M8 14L2 8C0 6 0 3 2 2C4 1 6 2 8 4C10 2 12 1 14 2C16 3 16 6 14 8L8 14Z" 
      fill="currentColor"
      fillOpacity="0.1"
    />
  </svg>
));

export const AnimatedBackground = memo(({ 
  variant = "default",
  intensity = "medium" 
}: AnimatedBackgroundProps) => {
  const { reduceMotion, backgroundEnabled } = useMotion();

  // Generate random positions for elements
  const elements = useMemo(() => {
    const counts = {
      low: { diamonds: 8, crowns: 4, angels: 2, hearts: 6 },
      medium: { diamonds: 15, crowns: 8, angels: 4, hearts: 10 },
      high: { diamonds: 25, crowns: 12, angels: 6, hearts: 15 },
    };

    const count = counts[intensity];
    const items: Array<{
      type: "diamond" | "crown" | "angel" | "heart";
      x: number;
      y: number;
      delay: number;
      duration: number;
      scale: number;
      layer: number;
    }> = [];

    // Diamonds
    for (let i = 0; i < count.diamonds; i++) {
      items.push({
        type: "diamond",
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 20,
        duration: 15 + Math.random() * 10,
        scale: 0.5 + Math.random() * 0.8,
        layer: Math.floor(Math.random() * 3),
      });
    }

    // Crowns
    for (let i = 0; i < count.crowns; i++) {
      items.push({
        type: "crown",
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 20,
        duration: 18 + Math.random() * 12,
        scale: 0.6 + Math.random() * 0.6,
        layer: Math.floor(Math.random() * 3),
      });
    }

    // Angels
    for (let i = 0; i < count.angels; i++) {
      items.push({
        type: "angel",
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 15,
        duration: 25 + Math.random() * 15,
        scale: 0.7 + Math.random() * 0.5,
        layer: Math.floor(Math.random() * 3),
      });
    }

    // Hearts
    for (let i = 0; i < count.hearts; i++) {
      items.push({
        type: "heart",
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 25,
        duration: 12 + Math.random() * 8,
        scale: 0.4 + Math.random() * 0.6,
        layer: Math.floor(Math.random() * 3),
      });
    }

    return items;
  }, [intensity]);

  if (!backgroundEnabled) {
    return (
      <div className="animated-bg-container static-bg">
        <div className="static-gradient" />
      </div>
    );
  }

  const variantClass = `bg-variant-${variant}`;
  const motionClass = reduceMotion ? "reduced-motion" : "";

  return (
    <div className={`animated-bg-container ${variantClass} ${motionClass}`}>
      {/* Base gradient layer */}
      <div className="bg-gradient-layer" />
      
      {/* Parallax layers */}
      {[0, 1, 2].map((layer) => (
        <div 
          key={layer} 
          className={`parallax-layer layer-${layer}`}
          style={{ 
            '--layer-depth': layer,
          } as React.CSSProperties}
        >
          {elements
            .filter((el) => el.layer === layer)
            .map((el, index) => {
              const Component = {
                diamond: Diamond,
                crown: Crown,
                angel: Angel,
                heart: Heart,
              }[el.type];

              return (
                <Component
                  key={`${el.type}-${index}`}
                  className={`floating-element ${el.type} ${reduceMotion ? 'static' : 'animate'}`}
                  style={{
                    '--x': `${el.x}%`,
                    '--y': `${el.y}%`,
                    '--delay': `${el.delay}s`,
                    '--duration': `${el.duration}s`,
                    '--scale': el.scale,
                  } as React.CSSProperties}
                />
              );
            })}
        </div>
      ))}

      {/* Shimmer overlay */}
      <div className="shimmer-overlay" />
    </div>
  );
});

AnimatedBackground.displayName = "AnimatedBackground";
