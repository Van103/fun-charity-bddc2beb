import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageReactionPickerProps {
  onSelect: (reaction: string) => void;
  currentReaction?: string | null;
}

const REACTIONS = [
  { emoji: "❤️", label: "yêu thích" },
  { emoji: "😆", label: "haha" },
  { emoji: "😮", label: "wow" },
  { emoji: "😢", label: "buồn" },
  { emoji: "😡", label: "phẫn nộ" },
  { emoji: "👍", label: "thích" },
];

export function MessageReactionPicker({ onSelect, currentReaction }: MessageReactionPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <SmilePlus className="w-4 h-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="center" 
        className="w-auto p-2 bg-card border-border shadow-lg"
      >
        <div className="flex items-center gap-1">
          {REACTIONS.map((reaction) => (
            <motion.button
              key={reaction.emoji}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSelect(reaction.emoji)}
              className={`text-2xl p-1 rounded-full hover:bg-muted transition-colors ${
                currentReaction === reaction.emoji ? "bg-primary/20" : ""
              }`}
              title={reaction.label}
            >
              {reaction.emoji}
            </motion.button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface MessageReactionsDisplayProps {
  reactions: { reaction_type: string; count: number; hasReacted: boolean }[];
  onReactionClick: (reaction: string) => void;
}

export function MessageReactionsDisplay({ reactions, onReactionClick }: MessageReactionsDisplayProps) {
  if (reactions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex items-center gap-0.5 -mt-2 ml-2"
      >
        <div className="flex items-center bg-card border border-border rounded-full px-1.5 py-0.5 shadow-sm">
          {reactions.map((reaction) => (
            <button
              key={reaction.reaction_type}
              onClick={() => onReactionClick(reaction.reaction_type)}
              className={`text-sm hover:scale-110 transition-transform ${
                reaction.hasReacted ? "opacity-100" : "opacity-70"
              }`}
              title={`${reaction.count} người`}
            >
              {reaction.reaction_type}
            </button>
          ))}
          {reactions.reduce((sum, r) => sum + r.count, 0) > 1 && (
            <span className="text-xs text-muted-foreground ml-1">
              {reactions.reduce((sum, r) => sum + r.count, 0)}
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
