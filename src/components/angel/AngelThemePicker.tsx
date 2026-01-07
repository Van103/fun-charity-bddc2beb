import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ANGEL_THEMES, useAngelTheme } from './AngelThemeContext';
import { cn } from '@/lib/utils';

const THEME_COLORS: Record<string, string> = {
  lavender: 'bg-gradient-to-br from-purple-200 to-violet-300',
  purple: 'bg-gradient-to-br from-purple-400 to-violet-500',
  violet: 'bg-gradient-to-br from-purple-700 to-violet-800',
  white: 'bg-gradient-to-br from-pink-100 to-purple-200',
  rose: 'bg-gradient-to-br from-rose-300 to-pink-400',
  sky: 'bg-gradient-to-br from-sky-300 to-blue-400',
  mint: 'bg-gradient-to-br from-emerald-300 to-teal-400',
  peach: 'bg-gradient-to-br from-orange-300 to-amber-400',
};

export function AngelThemePicker() {
  const { theme, setThemeById } = useAngelTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center transition-colors",
            theme.id === 'violet' 
              ? "text-purple-300 hover:text-white hover:bg-purple-800/50" 
              : "text-purple-600 hover:text-purple-900 hover:bg-purple-200/50"
          )}
          title="Chọn màu sắc"
        >
          <Palette className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-56 p-3 bg-white/95 backdrop-blur-lg border border-purple-200 z-[200]" 
        align="end"
        sideOffset={8}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-purple-200/50">
            <Palette className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Chọn màu sắc</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {ANGEL_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setThemeById(t.id)}
                className={cn(
                  "relative w-10 h-10 rounded-lg transition-all duration-200",
                  "hover:scale-110 hover:shadow-lg",
                  THEME_COLORS[t.id],
                  theme.id === t.id && "ring-2 ring-purple-600 ring-offset-2"
                )}
                title={t.name}
              >
                {theme.id === t.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full shadow-md" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <p className="text-xs text-center text-purple-500 pt-1">
            {theme.name}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
