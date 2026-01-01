import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CursorType = 'angel' | 'angel-gold' | 'angel-pink' | 'angel-blue' | 'diamond' | 'heart' | 'baby' | 'star' | 'crown' | 'wand' | 'butterfly' | 'moon' | 'arrow-blue' | 'arrow-purple' | 'default';

export type AngelStyle = 'pink' | 'purple' | 'yellow' | 'blue' | 'random';

export const FAIRY_COLOR_OPTIONS = [
  { id: 'pink' as const, name: 'Hồng', image: '/cursors/fairy-angel.png', color: '#FF69B4' },
  { id: 'purple' as const, name: 'Tím', image: '/cursors/fairy-angel-purple.png', color: '#9333EA' },
  { id: 'yellow' as const, name: 'Vàng', image: '/cursors/fairy-angel-yellow.png', color: '#F59E0B' },
  { id: 'blue' as const, name: 'Xanh', image: '/cursors/fairy-angel-blue.png', color: '#3B82F6' },
  { id: 'random' as const, name: 'Ngẫu nhiên', image: '', color: 'linear-gradient(135deg, #FF69B4, #9333EA, #F59E0B, #3B82F6)' },
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
    name: 'Purple Angel',
    nameVi: 'Thiên thần tím',
    cursor: '/cursors/angel-purple.svg',
    cursorHover: '/cursors/angel-gold.svg',
    particleColor: 'rgba(147, 51, 234, 1)',
    particleColorAlt: 'rgba(168, 85, 247, 1)',
    angelStyle: 'purple',
  },
  {
    id: 'angel-gold',
    name: 'Golden Angel',
    nameVi: 'Thiên thần vàng',
    cursor: '/cursors/angel-gold.svg',
    cursorHover: '/cursors/angel-gold.svg',
    particleColor: 'rgba(255, 215, 0, 1)',
    particleColorAlt: 'rgba(255, 180, 0, 1)',
    angelStyle: 'yellow',
  },
  {
    id: 'angel-pink',
    name: 'Pink Angel',
    nameVi: 'Thiên thần hồng',
    cursor: '/cursors/angel-purple.svg',
    cursorHover: '/cursors/angel-gold.svg',
    particleColor: 'rgba(236, 72, 153, 1)',
    particleColorAlt: 'rgba(244, 114, 182, 1)',
    angelStyle: 'pink',
  },
  {
    id: 'angel-blue',
    name: 'Blue Angel',
    nameVi: 'Thiên thần xanh',
    cursor: '/cursors/angel-purple.svg',
    cursorHover: '/cursors/angel-gold.svg',
    particleColor: 'rgba(59, 130, 246, 1)',
    particleColorAlt: 'rgba(96, 165, 250, 1)',
    angelStyle: 'blue',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    nameVi: 'Kim cương',
    cursor: '/cursors/diamond-cursor.png',
    cursorHover: '/cursors/diamond-cursor.png',
    particleColor: 'rgba(147, 51, 234, 1)',
    particleColorAlt: 'rgba(168, 85, 247, 1)',
  },
  {
    id: 'heart',
    name: 'Heart',
    nameVi: 'Trái tim',
    cursor: '/cursors/heart-cursor.png',
    cursorHover: '/cursors/heart-cursor.png',
    particleColor: 'rgba(236, 72, 153, 1)',
    particleColorAlt: 'rgba(244, 114, 182, 1)',
  },
  {
    id: 'star',
    name: 'Star',
    nameVi: 'Ngôi sao',
    cursor: '/cursors/star-cursor.png',
    cursorHover: '/cursors/star-cursor.png',
    particleColor: 'rgba(255, 215, 0, 1)',
    particleColorAlt: 'rgba(255, 165, 0, 1)',
  },
  {
    id: 'wand',
    name: 'Magic Wand',
    nameVi: 'Đũa phép',
    cursor: '/cursors/wand-cursor.png',
    cursorHover: '/cursors/wand-cursor.png',
    particleColor: 'rgba(168, 85, 247, 1)',
    particleColorAlt: 'rgba(236, 72, 153, 1)',
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    nameVi: 'Bướm',
    cursor: '/cursors/butterfly-cursor.png',
    cursorHover: '/cursors/butterfly-cursor.png',
    particleColor: 'rgba(236, 72, 153, 1)',
    particleColorAlt: 'rgba(168, 85, 247, 1)',
  },
  {
    id: 'moon',
    name: 'Moon',
    nameVi: 'Mặt trăng',
    cursor: '/cursors/moon-cursor.png',
    cursorHover: '/cursors/moon-cursor.png',
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
      const timestamp = Date.now();
      styleEl.textContent = `
        *, *::before, *::after {
          cursor: url('${currentCursor.cursor}?v=${timestamp}') 16 16, auto !important;
        }
        a, button, [role="button"], input, textarea, select, 
        [tabindex]:not([tabindex="-1"]), .cursor-pointer,
        a *, button *, [role="button"] * {
          cursor: url('${currentCursor.cursorHover}?v=${timestamp}') 16 16, pointer !important;
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
