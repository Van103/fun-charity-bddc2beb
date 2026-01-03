import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CursorType = 'angel' | 'diamond' | 'heart' | 'baby' | 'star' | 'crown' | 'wand' | 'butterfly' | 'moon' | 'arrow-blue' | 'arrow-purple' | 'default';

export type AngelStyle = 'pink' | 'purple' | 'yellow' | 'blue' | 'green' | 'orange' | 'red' | 'random';

export type AuraColor = 'gold' | 'rainbow' | 'pink' | 'purple' | 'blue' | 'white' | 'none';

export const FAIRY_COLOR_OPTIONS = [
  { id: 'pink' as const, name: 'Hồng', image: '/cursors/fairy-angel.png', color: '#FF69B4' },
  { id: 'purple' as const, name: 'Tím', image: '/cursors/fairy-angel-purple.png', color: '#9333EA' },
  { id: 'yellow' as const, name: 'Vàng', image: '/cursors/fairy-angel-yellow.png', color: '#F59E0B' },
  { id: 'blue' as const, name: 'Xanh dương', image: '/cursors/fairy-angel-blue.png', color: '#3B82F6' },
  { id: 'green' as const, name: 'Xanh lá', image: '/cursors/fairy-angel-green.png', color: '#22C55E' },
  { id: 'orange' as const, name: 'Cam', image: '/cursors/fairy-angel-orange.png', color: '#F97316' },
  { id: 'red' as const, name: 'Đỏ', image: '/cursors/fairy-angel-red.png', color: '#EF4444' },
  { id: 'random' as const, name: 'Ngẫu nhiên', image: '', color: 'linear-gradient(135deg, #FF69B4, #9333EA, #F59E0B, #3B82F6, #22C55E, #F97316, #EF4444)' },
];

export const AURA_COLOR_OPTIONS = [
  { id: 'gold' as const, name: 'Vàng kim', emoji: '✨', colors: ['rgba(255,215,0,0.6)', 'rgba(255,193,7,0.4)', 'rgba(255,165,0,0.2)'] },
  { id: 'rainbow' as const, name: 'Cầu vồng', emoji: '🌈', colors: ['rgba(255,0,0,0.4)', 'rgba(255,165,0,0.4)', 'rgba(255,255,0,0.4)', 'rgba(0,255,0,0.4)', 'rgba(0,0,255,0.4)', 'rgba(75,0,130,0.4)'] },
  { id: 'pink' as const, name: 'Hồng', emoji: '💗', colors: ['rgba(255,105,180,0.6)', 'rgba(255,182,193,0.4)', 'rgba(255,20,147,0.2)'] },
  { id: 'purple' as const, name: 'Tím', emoji: '💜', colors: ['rgba(147,51,234,0.6)', 'rgba(168,85,247,0.4)', 'rgba(139,92,246,0.2)'] },
  { id: 'blue' as const, name: 'Xanh', emoji: '💙', colors: ['rgba(59,130,246,0.6)', 'rgba(96,165,250,0.4)', 'rgba(37,99,235,0.2)'] },
  { id: 'white' as const, name: 'Trắng', emoji: '🤍', colors: ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)'] },
  { id: 'none' as const, name: 'Tắt', emoji: '⭕', colors: [] },
];

interface CursorOption {
  id: CursorType;
  name: string;
  nameVi: string;
  cursor: string;
  cursorHover: string;
  particleColor: string;
  particleColorAlt: string;
  angelStyle?: AngelStyle;
}

export const CURSOR_OPTIONS: CursorOption[] = [
  {
    id: 'angel',
    name: 'Fairy Angel',
    nameVi: 'Thiên thần',
    cursor: '/cursors/angel-purple.svg',
    cursorHover: '/cursors/angel-gold.svg',
    particleColor: 'rgba(147, 51, 234, 1)',
    particleColorAlt: 'rgba(168, 85, 247, 1)',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    nameVi: 'Kim cương',
    cursor: '/cursors/diamond-gold.svg',
    cursorHover: '/cursors/diamond-gold.svg',
    particleColor: 'rgba(147, 51, 234, 1)',
    particleColorAlt: 'rgba(168, 85, 247, 1)',
  },
  {
    id: 'heart',
    name: 'Heart',
    nameVi: 'Trái tim',
    cursor: '/cursors/heart-pink.svg',
    cursorHover: '/cursors/heart-pink.svg',
    particleColor: 'rgba(236, 72, 153, 1)',
    particleColorAlt: 'rgba(244, 114, 182, 1)',
  },
  {
    id: 'star',
    name: 'Star',
    nameVi: 'Ngôi sao',
    cursor: '/cursors/star.svg',
    cursorHover: '/cursors/star.svg',
    particleColor: 'rgba(255, 215, 0, 1)',
    particleColorAlt: 'rgba(255, 165, 0, 1)',
  },
  {
    id: 'wand',
    name: 'Magic Wand',
    nameVi: 'Đũa phép',
    cursor: '/cursors/wand.svg',
    cursorHover: '/cursors/wand.svg',
    particleColor: 'rgba(168, 85, 247, 1)',
    particleColorAlt: 'rgba(236, 72, 153, 1)',
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    nameVi: 'Bướm',
    cursor: '/cursors/butterfly.svg',
    cursorHover: '/cursors/butterfly.svg',
    particleColor: 'rgba(236, 72, 153, 1)',
    particleColorAlt: 'rgba(168, 85, 247, 1)',
  },
  {
    id: 'moon',
    name: 'Moon',
    nameVi: 'Mặt trăng',
    cursor: '/cursors/moon.svg',
    cursorHover: '/cursors/moon.svg',
    particleColor: 'rgba(96, 165, 250, 1)',
    particleColorAlt: 'rgba(191, 219, 254, 1)',
  },
  {
    id: 'arrow-blue',
    name: 'Blue Arrow',
    nameVi: 'Mũi tên xanh',
    cursor: '/cursors/arrow-blue.svg',
    cursorHover: '/cursors/arrow-blue.svg',
    particleColor: 'rgba(59, 130, 246, 1)',
    particleColorAlt: 'rgba(96, 165, 250, 1)',
  },
  {
    id: 'arrow-purple',
    name: 'Purple Arrow',
    nameVi: 'Mũi tên tím',
    cursor: '/cursors/arrow-purple.svg',
    cursorHover: '/cursors/arrow-purple.svg',
    particleColor: 'rgba(147, 51, 234, 1)',
    particleColorAlt: 'rgba(168, 85, 247, 1)',
  },
  {
    id: 'crown',
    name: 'Crown',
    nameVi: 'Vương miện',
    cursor: '/cursors/crown.svg',
    cursorHover: '/cursors/crown.svg',
    particleColor: 'rgba(201, 162, 61, 1)',
    particleColorAlt: 'rgba(147, 51, 234, 1)',
  },
  {
    id: 'baby',
    name: 'Baby',
    nameVi: 'Em bé',
    cursor: '/cursors/baby.svg',
    cursorHover: '/cursors/baby.svg',
    particleColor: 'rgba(255, 182, 193, 1)',
    particleColorAlt: 'rgba(135, 206, 235, 1)',
  },
  {
    id: 'default',
    name: 'Default',
    nameVi: 'Mặc định',
    cursor: 'auto',
    cursorHover: 'pointer',
    particleColor: 'rgba(201, 162, 61, 1)',
    particleColorAlt: 'rgba(255, 215, 100, 1)',
  },
];

interface CursorContextType {
  cursorType: CursorType;
  setCursorType: (type: CursorType) => void;
  particlesEnabled: boolean;
  setParticlesEnabled: (enabled: boolean) => void;
  currentCursor: CursorOption;
  fairyColor: AngelStyle;
  setFairyColor: (color: AngelStyle) => void;
  auraColor: AuraColor;
  setAuraColor: (color: AuraColor) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const [cursorType, setCursorTypeState] = useState<CursorType>(() => {
    const saved = localStorage.getItem('cursorType');
    return (saved as CursorType) || 'angel';
  });

  const [particlesEnabled, setParticlesEnabledState] = useState(() => {
    const saved = localStorage.getItem('cursorParticles');
    return saved !== 'false';
  });

  const [fairyColor, setFairyColorState] = useState<AngelStyle>(() => {
    const saved = localStorage.getItem('fairyColor');
    return (saved as AngelStyle) || 'random';
  });

  const [auraColor, setAuraColorState] = useState<AuraColor>(() => {
    const saved = localStorage.getItem('auraColor');
    return (saved as AuraColor) || 'gold';
  });

  const currentCursor = CURSOR_OPTIONS.find(c => c.id === cursorType) || CURSOR_OPTIONS[0];

  const setCursorType = (type: CursorType) => {
    setCursorTypeState(type);
    localStorage.setItem('cursorType', type);
  };

  const setParticlesEnabled = (enabled: boolean) => {
    setParticlesEnabledState(enabled);
    localStorage.setItem('cursorParticles', String(enabled));
  };

  const setFairyColor = (color: AngelStyle) => {
    setFairyColorState(color);
    localStorage.setItem('fairyColor', color);
  };

  const setAuraColor = (color: AuraColor) => {
    setAuraColorState(color);
    localStorage.setItem('auraColor', color);
  };

  // Apply cursor styles dynamically
  useEffect(() => {
    const styleId = 'custom-cursor-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const isAngelType = cursorType.startsWith('angel');

    if (cursorType === 'default') {
      styleEl.textContent = '';
    } else if (isAngelType) {
      // Tắt hoàn toàn cursor mặc định khi dùng tiên nữ animated
      styleEl.textContent = `
        *, *::before, *::after {
          cursor: none !important;
        }
      `;
    } else {
      // For static cursors (diamond, heart, star, etc.)
      const cursorUrl = currentCursor.cursor;
      styleEl.textContent = `
        *, *::before, *::after {
          cursor: url('${cursorUrl}') 16 16, auto !important;
        }
        a, button, [role="button"], input, textarea, select, 
        [tabindex]:not([tabindex="-1"]), .cursor-pointer,
        a *, button *, [role="button"] * {
          cursor: url('${currentCursor.cursorHover}') 16 16, pointer !important;
        }
      `;
    }

    return () => {
      if (styleEl && cursorType === 'default') {
        styleEl.textContent = '';
      }
    };
  }, [cursorType, currentCursor]);

  return (
    <CursorContext.Provider value={{
      cursorType,
      setCursorType,
      particlesEnabled,
      setParticlesEnabled,
      currentCursor,
      fairyColor,
      setFairyColor,
      auraColor,
      setAuraColor,
    }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
