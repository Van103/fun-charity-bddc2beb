import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";

const STICKER_PACKS = {
  cute: [
    "🥰", "😘", "🤗", "😊", "😍", "🥳", "😇", "🤩",
    "💕", "💖", "💗", "💓", "💝", "💘", "❤️", "🧡",
    "💛", "💚", "💙", "💜", "🤍", "🖤", "💔", "❣️",
  ],
  fun: [
    "😂", "🤣", "😆", "😅", "😄", "😁", "😀", "🙂",
    "😜", "😝", "😛", "🤪", "😎", "🤓", "🥸", "🤠",
  ],
  reactions: [
    "👍", "👎", "👏", "🙌", "🤝", "💪", "✌️", "🤞",
    "🎉", "🎊", "🎈", "🎁", "🏆", "⭐", "🌟", "✨",
  ],
  animals: [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
    "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🦄",
  ],
  nature: [
    "🌸", "🌺", "🌻", "🌼", "🌷", "🌹", "🥀", "💐",
    "🌴", "🌳", "🌲", "🎄", "🌿", "☘️", "🍀", "🌱",
  ],
};

interface ChatStickerPickerProps {
  onSelect: (sticker: string) => void;
}

export function ChatStickerPicker({ onSelect }: ChatStickerPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof typeof STICKER_PACKS>("cute");

  const handleSelect = (sticker: string) => {
    onSelect(sticker);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Smile className="w-5 h-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start" side="top">
        {/* Tab buttons */}
        <div className="flex gap-1 mb-2 border-b border-border pb-2">
          {(Object.keys(STICKER_PACKS) as Array<keyof typeof STICKER_PACKS>).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "secondary" : "ghost"}
              size="sm"
              className="text-xs px-2 py-1 h-7"
              onClick={() => setActiveTab(tab)}
            >
              {tab === "cute" && "🥰"}
              {tab === "fun" && "😂"}
              {tab === "reactions" && "👍"}
              {tab === "animals" && "🐶"}
              {tab === "nature" && "🌸"}
            </Button>
          ))}
        </div>

        {/* Stickers grid */}
        <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
          {STICKER_PACKS[activeTab].map((sticker, i) => (
            <button
              key={i}
              onClick={() => handleSelect(sticker)}
              className="text-xl p-1.5 hover:bg-muted rounded-md transition-colors"
            >
              {sticker}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}