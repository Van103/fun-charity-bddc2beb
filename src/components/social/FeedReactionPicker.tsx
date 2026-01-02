import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export interface Reaction {
  type: string;
  emoji: string;
  label: string;
  color: string;
}

export const REACTIONS: Reaction[] = [
  { type: "like", emoji: "👍", label: "Thích", color: "text-blue-500" },
  { type: "love", emoji: "❤️", label: "Yêu thích", color: "text-red-500" },
  { type: "haha", emoji: "😆", label: "Haha", color: "text-yellow-500" },
  { type: "wow", emoji: "😮", label: "Wow", color: "text-yellow-500" },
  { type: "sad", emoji: "😢", label: "Buồn", color: "text-yellow-500" },
  { type: "angry", emoji: "😠", label: "Phẫn nộ", color: "text-orange-500" },
];

interface FeedReactionPickerProps {
  currentReaction?: string | null;
  onReact: (reactionType: string) => void;
  onRemoveReaction: () => void;
  isLoading?: boolean;
}

export function FeedReactionPicker({
  currentReaction,
  onReact,
  onRemoveReaction,
  isLoading,
}: FeedReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeReaction = REACTIONS.find((r) => r.type === currentReaction);

  const handleReactionClick = (reactionType: string) => {
    if (currentReaction === reactionType) {
      onRemoveReaction();
    } else {
      onReact(reactionType);
    }
    setShowPicker(false);
  };

  const handleButtonClick = () => {
    if (currentReaction) {
      onRemoveReaction();
    } else {
      onReact("like");
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowPicker(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowPicker(false);
      setHoveredReaction(null);
    }, 300);
  };

  return (
    <div 
      className="relative flex-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction Picker Popup */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card/98 backdrop-blur-xl rounded-full shadow-xl border border-border/50 px-2 py-1.5 flex items-center gap-0.5 z-50"
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            {REACTIONS.map((reaction, index) => (
              <motion.button
                key={reaction.type}
                initial={{ opacity: 0, y: 20, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: hoveredReaction === reaction.type ? 1.4 : 1,
                  translateY: hoveredReaction === reaction.type ? -8 : 0,
                }}
                transition={{ 
                  delay: index * 0.04,
                  scale: { type: "spring", stiffness: 500, damping: 15 },
                  translateY: { type: "spring", stiffness: 500, damping: 15 }
                }}
                onClick={() => handleReactionClick(reaction.type)}
                onMouseEnter={() => setHoveredReaction(reaction.type)}
                onMouseLeave={() => setHoveredReaction(null)}
                className={`relative text-2xl sm:text-3xl transition-all duration-150 p-1.5 rounded-full hover:bg-muted/50 ${
                  currentReaction === reaction.type ? "bg-primary/10" : ""
                }`}
                disabled={isLoading}
              >
                <motion.span 
                  className="block transform-gpu"
                  animate={{
                    rotate: hoveredReaction === reaction.type ? [0, -10, 10, -5, 5, 0] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {reaction.emoji}
                </motion.span>
                
                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredReaction === reaction.type && (
                    <motion.span
                      initial={{ opacity: 0, y: 8, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.8 }}
                      className="absolute -top-9 left-1/2 -translate-x-1/2 bg-foreground text-background text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap shadow-lg"
                    >
                      {reaction.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <Button
        variant="ghost"
        className={`w-full gap-2 transition-all duration-200 ${
          activeReaction 
            ? `${activeReaction.color} hover:${activeReaction.color} font-medium` 
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        {activeReaction ? (
          <motion.span
            key={activeReaction.type}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="text-xl"
          >
            {activeReaction.emoji}
          </motion.span>
        ) : (
          <Heart className="w-5 h-5" />
        )}
        <span className={activeReaction ? activeReaction.color : ""}>
          {activeReaction ? activeReaction.label : "Thích"}
        </span>
      </Button>
    </div>
  );
}
