import { Settings2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCursor, CURSOR_OPTIONS, CursorType, FAIRY_COLOR_OPTIONS, AngelStyle } from '@/contexts/CursorContext';
import { cn } from '@/lib/utils';

const CursorSettings = () => {
  const { cursorType, setCursorType, particlesEnabled, setParticlesEnabled, fairyColor, setFairyColor } = useCursor();

  const isAngelCursor = cursorType.startsWith('angel');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-muted/50"
          title="Cài đặt con trỏ"
        >
          <Sparkles className="h-4 w-4 text-secondary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="bottom" 
        align="end" 
        className="w-80 max-h-[70vh] overflow-y-auto p-4 bg-card/95 backdrop-blur-xl border-border/50"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Settings2 className="h-4 w-4 text-secondary" />
            <h3 className="font-semibold text-sm">Tùy chỉnh con trỏ</h3>
          </div>

          {/* Cursor Options Grid */}
          <div className="grid grid-cols-3 gap-2">
            {CURSOR_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setCursorType(option.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                  "hover:bg-muted/50 border-2",
                  cursorType === option.id 
                    ? "border-secondary bg-secondary/10" 
                    : "border-transparent"
                )}
                title={option.nameVi}
              >
                {option.id === 'default' ? (
                  <div className="w-9 h-9 flex items-center justify-center text-muted-foreground">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                      <path d="M4 4l7 19 2-7 7-2z"/>
                    </svg>
                  </div>
                ) : option.id.startsWith('angel') ? (
                  <div 
                    className="w-9 h-9 flex items-center justify-center rounded-full"
                    style={{
                      background: option.id === 'angel' ? 'linear-gradient(135deg, #9333EA, #A855F7)' :
                                 option.id === 'angel-gold' ? 'linear-gradient(135deg, #F59E0B, #FCD34D)' :
                                 option.id === 'angel-pink' ? 'linear-gradient(135deg, #EC4899, #F472B6)' :
                                 'linear-gradient(135deg, #3B82F6, #60A5FA)'
                    }}
                  >
                    <span className="text-lg">👼</span>
                  </div>
                ) : option.id.startsWith('arrow') ? (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <img 
                      src={option.cursor} 
                      alt={option.nameVi} 
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 flex items-center justify-center">
                    <img 
                      src={option.cursor} 
                      alt={option.nameVi} 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                )}
                <span className="text-[10px] mt-1 text-muted-foreground text-center leading-tight">
                  {option.nameVi}
                </span>
                {cursorType === option.id && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Fairy Color Selection - Only show when angel cursor is selected */}
          {isAngelCursor && (
            <div className="pt-2 border-t border-border/50">
              <Label className="text-sm mb-2 block">Chọn màu thiên thần</Label>
              <div className="flex gap-2 flex-wrap">
                {FAIRY_COLOR_OPTIONS.map((colorOption) => (
                  <button
                    key={colorOption.id}
                    onClick={() => setFairyColor(colorOption.id)}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                      "hover:bg-muted/50 border-2",
                      fairyColor === colorOption.id 
                        ? "border-secondary bg-secondary/10" 
                        : "border-transparent"
                    )}
                    title={colorOption.name}
                  >
                    {colorOption.id === 'random' ? (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: colorOption.color }}
                      >
                        🎲
                      </div>
                    ) : (
                      <img 
                        src={colorOption.image}
                        alt={colorOption.name}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    <span className="text-[9px] mt-1 text-muted-foreground">
                      {colorOption.name}
                    </span>
                    {fairyColor === colorOption.id && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Particles Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              <Label htmlFor="particles" className="text-sm">
                Hiệu ứng lấp lánh
              </Label>
            </div>
            <Switch
              id="particles"
              checked={particlesEnabled}
              onCheckedChange={setParticlesEnabled}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Chọn kiểu con trỏ và bật/tắt hiệu ứng hạt khi di chuyển chuột.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CursorSettings;
