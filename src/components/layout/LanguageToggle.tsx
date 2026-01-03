import { Button } from "@/components/ui/button";
import { useLanguage, LANGUAGE_OPTIONS, Language } from "@/contexts/LanguageContext";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = LANGUAGE_OPTIONS.find(opt => opt.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
          <span className="text-lg">{currentLanguage?.flag || "🌐"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1 bg-card/95 backdrop-blur-xl border-border/50">
        <ScrollArea className="h-[320px]">
          <div className="space-y-0.5">
            {LANGUAGE_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.code}
                onClick={() => setLanguage(option.code)}
                className={cn(
                  "cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-md transition-all",
                  "hover:bg-primary/20 hover:text-primary focus:bg-primary/20 focus:text-primary",
                  language === option.code && "bg-primary/15 text-primary font-medium"
                )}
              >
                <span className="text-xl">{option.flag}</span>
                <div className="flex-1 flex flex-col">
                  <span className="text-sm font-medium">{option.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{option.name}</span>
                </div>
                {language === option.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
