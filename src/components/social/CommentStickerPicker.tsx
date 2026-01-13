import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const STICKER_PACKS = {
  popular: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶"],
  love: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💖", "💗", "💓", "💝", "💘", "💕", "💞", "💟", "❣️", "💌", "🥰", "😍", "😘", "💋", "👩‍❤️‍👨", "💑", "💏", "🌹", "🌷", "💐"],
  reactions: ["👍", "👎", "👏", "🙌", "🤝", "💪", "✊", "👊", "🤜", "🤛", "🎉", "🎊", "🔥", "⭐", "✨", "🌟", "💯", "🏆", "🥇", "🥈", "🥉", "🎯", "💎", "🚀", "💥", "💫", "⚡", "🌈", "☀️", "🌙", "⭕", "✅"],
  faces: ["😶‍🌫️", "🥵", "🥶", "😱", "😨", "😰", "😥", "😢", "😭", "😤", "😡", "🤬", "🤯", "😳", "🥺", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤧", "😷", "🤒", "🤕", "🤢", "🤮", "😈", "👿"],
  gestures: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "✍️", "🙏", "💅", "🤳", "👀", "👁️", "👅", "👄", "🧠", "🦷", "🦴", "👂", "👃", "🦵"],
  cute: ["🐱", "🐶", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧", "🐦", "🦋", "🐌", "🐞", "🐝", "🦄", "🌸", "🌺", "🌻", "🌼", "🌷", "🌹"],
  food: ["🍕", "🍔", "🍟", "🌭", "🍿", "🥓", "🍳", "🧀", "🥗", "🍦", "🍧", "🍨", "🧁", "🍰", "🎂", "🍩", "🍪", "🍫", "🍬", "🍭", "☕", "🍵", "🧋", "🥤", "🍺", "🍷", "🥂", "🍹", "🧃", "🍎", "🍇", "🍓"],
};

const TAB_LABELS: Record<string, string> = {
  popular: "😀",
  love: "❤️",
  reactions: "👍",
  faces: "😢",
  gestures: "👋",
  cute: "🐱",
  food: "🍕",
};

interface CommentStickerPickerProps {
  onSelect: (sticker: string) => void;
  trigger?: React.ReactNode;
  /** If true, clicking an emoji appends it to text rather than auto-sending */
  appendMode?: boolean;
}

export function CommentStickerPicker({ onSelect, trigger, appendMode = false }: CommentStickerPickerProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");

  const handleSelect = (sticker: string) => {
    onSelect(sticker);
    // Only close if NOT in append mode
    if (!appendMode) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-secondary/20"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Smile className="w-5 h-5 text-muted-foreground" />
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
              className="absolute bottom-full left-0 mb-2 w-72 bg-background/95 backdrop-blur-sm rounded-xl shadow-xl border border-border z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-sm font-medium">Stickers & Emoji</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start px-2 py-1 bg-transparent border-b border-border rounded-none h-auto">
                  {Object.keys(STICKER_PACKS).map((pack) => (
                    <TabsTrigger
                      key={pack}
                      value={pack}
                      className={cn(
                        "text-xs px-2 py-1 rounded-md data-[state=active]:bg-secondary/20",
                        "data-[state=active]:shadow-none"
                      )}
                    >
                      {TAB_LABELS[pack]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(STICKER_PACKS).map(([pack, stickers]) => (
                  <TabsContent 
                    key={pack} 
                    value={pack} 
                    className="p-2 m-0 max-h-48 overflow-y-auto"
                  >
                    <div className="grid grid-cols-6 gap-1">
                      {stickers.map((sticker, idx) => (
                        <motion.button
                          key={idx}
                          type="button"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSelect(sticker)}
                          className="p-2 text-2xl rounded-lg hover:bg-secondary/20 transition-colors"
                        >
                          {sticker}
                        </motion.button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
