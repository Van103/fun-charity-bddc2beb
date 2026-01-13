import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Static GIF collection (can be replaced with Giphy API)
const TRENDING_GIFS = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDNqOHB5dHk5Y3J0N2R5aGR0N2E5ZnB3ZGV6N2F3OXB1MnJ3ZHVybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aD2saalBwwftBIY/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTVjbzEyZ2QxcXo2cGYzcm9kYXJvcHBkOHVxY3RqMHltNGptNDc4aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2K5jinAlChoCLS/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWMwdnE4eXJxN2J5cGt2cGpmNGR6MG5wb3h6ZGd2bjdkczRnOXNkMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JIX9t2j0ZTN9S/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHRmZnV0bGxnZWc0cGU5OXEwZ3oyMmNhajU0NHNuaWd4dG1nNnFiayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzE5cWpwcW9zeXVmZGd2ZHZuNHQ5Y2RzZ3drcXI5OWNqcHptcmRkNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YTbZzCkRQCEJa/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjI3anE3c3Bwb3R2MTJ1NGNtdnMxcnNpaDVsZTIzcjk0N2I2ZHkycCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjHGr1Fhz0kyv8Ig/giphy.gif",
];

const REACTION_GIFS = [
  "https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif",
  "https://media.giphy.com/media/QMHoU66sBXqqLqYvGO/giphy.gif",
  "https://media.giphy.com/media/dSetNZo2AJfptAk9hp/giphy.gif",
  "https://media.giphy.com/media/xT0GqssRweIhlz209i/giphy.gif",
];

interface ChatGifPickerProps {
  onSelect: (gifUrl: string) => void;
}

export function ChatGifPicker({ onSelect }: ChatGifPickerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"trending" | "reactions">("trending");

  const handleSelect = (gifUrl: string) => {
    onSelect(gifUrl);
    setOpen(false);
    setSearchQuery("");
  };

  const displayedGifs = activeTab === "trending" ? TRENDING_GIFS : REACTION_GIFS;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-2 text-xs font-bold text-muted-foreground hover:text-primary"
        >
          GIF
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="top">
        {/* Header */}
        <div className="flex items-center gap-2 p-2 border-b border-border">
          <button
            onClick={() => setActiveTab("trending")}
            className={cn(
              "text-sm font-medium px-3 py-1.5 rounded-full transition-colors",
              activeTab === "trending" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            🔥 Thịnh hành
          </button>
          <button
            onClick={() => setActiveTab("reactions")}
            className={cn(
              "text-sm font-medium px-3 py-1.5 rounded-full transition-colors",
              activeTab === "reactions" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            😂 Phản hồi
          </button>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm GIF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm bg-muted/50"
            />
          </div>
        </div>

        {/* GIFs grid */}
        <div className="p-2 max-h-72 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {displayedGifs.map((gif, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(gif)}
                className="relative aspect-video rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
              >
                <img
                  src={gif}
                  alt="GIF"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-border bg-muted/30 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Powered by GIPHY</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
