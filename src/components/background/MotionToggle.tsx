import { useMotion } from "@/contexts/MotionContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Eye, EyeOff } from "lucide-react";

export function MotionToggle() {
  const { reduceMotion, setReduceMotion, backgroundEnabled, setBackgroundEnabled } = useMotion();

  return (
    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-secondary" />
          <Label htmlFor="bg-toggle" className="text-sm font-medium">
            Hiệu ứng nền
          </Label>
        </div>
        <Switch
          id="bg-toggle"
          checked={backgroundEnabled}
          onCheckedChange={setBackgroundEnabled}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {reduceMotion ? (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Eye className="w-4 h-4 text-secondary" />
          )}
          <Label htmlFor="motion-toggle" className="text-sm font-medium">
            Giảm chuyển động
          </Label>
        </div>
        <Switch
          id="motion-toggle"
          checked={reduceMotion}
          onCheckedChange={setReduceMotion}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        Tắt hiệu ứng động để cải thiện hiệu suất hoặc nếu bạn thích giao diện tĩnh.
      </p>
    </div>
  );
}
