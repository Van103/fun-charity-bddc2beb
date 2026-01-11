import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactionSummary } from "@/hooks/useCommentReactions";

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Thích", color: "text-blue-500" },
  { type: "love", emoji: "❤️", label: "Yêu thích", color: "text-red-500" },
  { type: "haha", emoji: "😂", label: "Haha", color: "text-yellow-500" },
  { type: "wow", emoji: "😮", label: "Wow", color: "text-yellow-500" },
  { type: "sad", emoji: "😢", label: "Buồn", color: "text-yellow-500" },
  { type: "angry", emoji: "😠", label: "Phẫn nộ", color: "text-orange-500" },
];

interface CommentReactionButtonProps {
  commentId: string;
  reactions: ReactionSummary[];
  userReaction: string | null;
  totalCount: number;
  onReact: (reactionType: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function CommentReactionButton({
  commentId,
  reactions,
  userReaction,
  totalCount,
  onReact,
  isLoading,
  disabled,
}: CommentReactionButtonProps): React.ReactElement {
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowPicker(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPicker(false);
      setHoveredReaction(null);
    }, 300);
  };

  const handleReactionClick = (type: string) => {
    onReact(type);
    setShowPicker(false);
  };

  const currentReaction = REACTIONS.find(r => r.type === userReaction);

  // Get top 3 reactions to display
  const topReactions = reactions
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div 
      className="relative inline-flex items-center gap-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction display */}
      {totalCount > 0 && (
        <div className="flex items-center gap-0.5 mr-1">
          <div className="flex -space-x-1">
            {topReactions.map((reaction, idx) => {
              const reactionInfo = REACTIONS.find(r => r.type === reaction.type);
              return (
                <motion.span
                  key={reaction.type}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs bg-background rounded-full p-0.5 border border-border"
                  style={{ zIndex: 3 - idx }}
                >
                  {reactionInfo?.emoji}
                </motion.span>
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground">{totalCount}</span>
        </div>
      )}

      {/* React button */}
      <button
        className={cn(
          "text-xs font-medium transition-colors",
          userReaction ? currentReaction?.color : "text-muted-foreground hover:text-secondary",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => handleReactionClick(userReaction || "like")}
        disabled={disabled || isLoading}
      >
        {currentReaction ? (
          <span className="flex items-center gap-1">
            <span>{currentReaction.emoji}</span>
            <span>{currentReaction.label}</span>
          </span>
        ) : (
          "Thích"
        )}
      </button>

      {/* Reaction picker popup */}
      <AnimatePresence>
        {showPicker && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute bottom-full left-0 mb-2 bg-background/95 backdrop-blur-sm rounded-full shadow-lg border border-border px-2 py-1.5 flex items-center gap-1 z-50"
          >
            {REACTIONS.map((reaction) => (
              <motion.button
                key={reaction.type}
                whileHover={{ scale: 1.3, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoveredReaction(reaction.type)}
                onMouseLeave={() => setHoveredReaction(null)}
                onClick={() => handleReactionClick(reaction.type)}
                className="relative p-1 text-lg transition-transform"
              >
                {reaction.emoji}
                
                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredReaction === reaction.type && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-0.5 rounded whitespace-nowrap"
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
    </div>
  );
}
