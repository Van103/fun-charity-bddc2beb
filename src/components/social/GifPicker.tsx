import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Use Giphy API free tier or fallback to static GIFs
const TRENDING_GIFS = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDNqOHB5dHk5Y3J0N2R5aGR0N2E5ZnB3ZGV6N2F3OXB1MnJ3ZHVybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7aD2saalBwwftBIY/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTVjbzEyZ2QxcXo2cGYzcm9kYXJvcHBkOHVxY3RqMHltNGptNDc4aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2K5jinAlChoCLS/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWMwdnE4eXJxN2J5cGt2cGpmNGR6MG5wb3h6ZGd2bjdkczRnOXNkMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JIX9t2j0ZTN9S/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHRmZnV0bGxnZWc0cGU5OXEwZ3oyMmNhajU0NHNuaWd4dG1nNnFiayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzE5cWpwcW9zeXVmZGd2ZHZuNHQ5Y2RzZ3drcXI5OWNqcHptcmRkNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YTbZzCkRQCEJa/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjI3anE3c3Bwb3R2MTJ1NGNtdnMxcnNpaDVsZTIzcjk0N2I2ZHkycCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjHGr1Fhz0kyv8Ig/giphy.gif",
];

const STICKER_GIFS = [
  // Cute stickers
  { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2JoNHprdDJ4N3ZpY2FocG1hN3N1eDN3Y2J1eGZxbWl0dWQycW9sbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/tHIRLHtNwxpjIFqPdV/giphy.gif", category: "cute" },
  { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExemtlOWZoYnN6dXRhbTdzZXpxeGhkb2p5NXVjMWs0MHUxdGIzNm5zaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/LZElUsjl1Bu6c/giphy.gif", category: "cute" },
  { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3BxYnZocmtvZnF3OGxjYTAwN3R0NWlsNWJndTVobjZjdDUxcDd4ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l0K4mbH4lKBhAPFU4/giphy.gif", category: "cute" },
  // Reactions
  { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWdsMm14ZnZ5Nnhwb3Q0bWNlMTNkaXNhNWpqdDR0NHViaXU5cHl6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7abKhOpu0NwenH3O/giphy.gif", category: "reaction" },
  { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHR3eWIyYzFoOThmc2JjY2prYzJmMGZuaHV3bjU0dWplYmhtbGhsNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/kdQuvu0LtCEjxYgTcS/giphy.gif", category: "reaction" },
];

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  trigger?: React.ReactNode;
}

export function GifPicker({ onSelect, trigger }: GifPickerProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"trending" | "stickers">("trending");

  const handleSelect = (gifUrl: string) => {
    onSelect(gifUrl);
    setIsOpen(false);
    setSearchQuery("");
  };

  const displayedGifs = activeTab === "trending" 
    ? TRENDING_GIFS 
    : STICKER_GIFS.map(s => s.url);

  return (
    <div className="relative">
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full hover:bg-secondary/20"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm font-bold text-muted-foreground">GIF</span>
        </Button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Picker */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 w-80 bg-background/95 backdrop-blur-sm rounded-xl shadow-xl border border-border z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("trending")}
                    className={cn(
                      "text-sm font-medium px-2 py-1 rounded-md transition-colors",
                      activeTab === "trending" 
                        ? "bg-secondary/20 text-secondary" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Thịnh hành
                  </button>
                  <button
                    onClick={() => setActiveTab("stickers")}
                    className={cn(
                      "text-sm font-medium px-2 py-1 rounded-md transition-colors",
                      activeTab === "stickers" 
                        ? "bg-secondary/20 text-secondary" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Stickers
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm GIF..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </div>

              {/* GIFs grid */}
              <div className="p-2 max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {displayedGifs.map((gif, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(gif)}
                        className="relative aspect-square rounded-lg overflow-hidden bg-muted"
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
                )}
              </div>

              {/* Footer */}
              <div className="px-3 py-2 border-t border-border bg-muted/30">
                <span className="text-[10px] text-muted-foreground">
                  Powered by GIPHY
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
