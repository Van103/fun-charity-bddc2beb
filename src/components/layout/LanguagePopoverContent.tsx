import { useLanguage, LANGUAGE_OPTIONS } from "@/contexts/LanguageContext";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LanguagePopoverContent() {
  const { language, setLanguage } = useLanguage();

  return (
    <ScrollArea className="h-[320px]">
      <div className="space-y-0.5">
        {LANGUAGE_OPTIONS.map((option) => (
          <button
            key={option.code}
            onClick={() => setLanguage(option.code)}
            className={cn(
              "w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-md transition-all",
              "hover:bg-primary/20 hover:text-primary focus:bg-primary/20 focus:text-primary",
              language === option.code && "bg-primary/15 text-primary font-medium"
            )}
          >
            <img src={option.flag} alt={option.name} className="w-6 h-4 rounded-sm object-cover" />
            <div className="flex-1 flex flex-col text-left">
              <span className="text-sm font-medium">{option.nativeName}</span>
              <span className="text-xs text-muted-foreground">{option.name}</span>
            </div>
            {language === option.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}