import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { X, Coins, Crown } from "lucide-react";
import { useState } from "react";

interface LiveStreamGiftPanelProps {
  open: boolean;
  onClose: () => void;
  onGiftSent: (gift: Gift) => void;
  senderName: string;
  senderAvatar?: string;
  userCoins?: number;
}

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  price: number;
  animation?: 'float' | 'burst' | 'rain' | 'spin';
}

interface GiftAnimation {
  id: string;
  gift: Gift;
  senderName: string;
  senderAvatar?: string;
}

const GIFTS: Gift[] = [
  { id: 'heart', name: 'Tim', emoji: '❤️', price: 1, animation: 'float' },
  { id: 'rose', name: 'Hoa hồng', emoji: '🌹', price: 5, animation: 'float' },
  { id: 'star', name: 'Ngôi sao', emoji: '⭐', price: 10, animation: 'burst' },
  { id: 'fire', name: 'Lửa', emoji: '🔥', price: 20, animation: 'burst' },
  { id: 'diamond', name: 'Kim cương', emoji: '💎', price: 50, animation: 'spin' },
  { id: 'crown', name: 'Vương miện', emoji: '👑', price: 100, animation: 'rain' },
  { id: 'rocket', name: 'Tên lửa', emoji: '🚀', price: 200, animation: 'burst' },
  { id: 'unicorn', name: 'Kỳ lân', emoji: '🦄', price: 500, animation: 'rain' },
  { id: 'rainbow', name: 'Cầu vồng', emoji: '🌈', price: 1000, animation: 'rain' },
];

// Floating gift animation component
export function FloatingGiftAnimation({ gift, onComplete }: { gift: GiftAnimation; onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 100 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.8],
        y: [100, 0, -50, -150],
      }}
      transition={{ duration: 3, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className="absolute bottom-40 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="flex flex-col items-center gap-2">
        {/* Sender info */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5"
        >
          <Avatar className="w-6 h-6">
            <AvatarImage src={gift.senderAvatar} />
            <AvatarFallback className="text-xs bg-primary/50">
              {gift.senderName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-white text-sm font-medium">{gift.senderName}</span>
          <span className="text-white/70 text-xs">gửi</span>
        </motion.div>
        
        {/* Gift emoji with glow */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: gift.gift.animation === 'spin' ? [0, 360] : 0
          }}
          transition={{ 
            duration: 0.5, 
            repeat: gift.gift.animation === 'spin' ? Infinity : 0,
            repeatType: 'loop'
          }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 blur-xl">
            <span className="text-7xl opacity-50">{gift.gift.emoji}</span>
          </div>
          <span className="text-7xl relative">{gift.gift.emoji}</span>
        </motion.div>
        
        {/* Gift name */}
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-lg font-bold drop-shadow-lg"
        >
          {gift.gift.name}
        </motion.span>
      </div>

      {/* Particle effects for burst/rain animations */}
      {(gift.gift.animation === 'burst' || gift.gift.animation === 'rain') && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ 
                opacity: 1, 
                scale: 0.5,
                x: 0, 
                y: 0 
              }}
              animate={{ 
                opacity: 0, 
                scale: 0,
                x: Math.cos(i * 30 * Math.PI / 180) * 100,
                y: gift.gift.animation === 'rain' 
                  ? Math.random() * 200 
                  : Math.sin(i * 30 * Math.PI / 180) * 100
              }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="absolute top-1/2 left-1/2 text-3xl"
              style={{ marginLeft: -16, marginTop: -16 }}
            >
              {gift.gift.emoji}
            </motion.span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function LiveStreamGiftPanel({ 
  open, 
  onClose, 
  onGiftSent, 
  senderName, 
  senderAvatar,
  userCoins = 1000 
}: LiveStreamGiftPanelProps) {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [coins, setCoins] = useState(userCoins);
  const [sendingGift, setSendingGift] = useState(false);

  const handleSendGift = (gift: Gift) => {
    if (coins < gift.price) {
      toast.error('Không đủ xu! Vui lòng nạp thêm.');
      return;
    }

    setSendingGift(true);
    setCoins(prev => prev - gift.price);
    
    // Simulate sending
    setTimeout(() => {
      onGiftSent(gift);
      toast.success(`Đã gửi ${gift.emoji} ${gift.name}!`);
      setSendingGift(false);
      setSelectedGift(null);
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="absolute bottom-0 left-0 right-0 z-40 bg-card border-t border-border rounded-t-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Gửi quà tặng</h3>
              <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full text-sm">
                <Coins className="w-3.5 h-3.5" />
                <span className="font-medium">{coins.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => toast.info('Tính năng nạp xu đang được phát triển')}
              >
                <Coins className="w-3.5 h-3.5" />
                Nạp xu
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Gift grid */}
          <div className="p-4">
            <div className="grid grid-cols-5 gap-3">
              {GIFTS.map((gift) => (
                <motion.button
                  key={gift.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedGift(gift)}
                  disabled={sendingGift}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                    selectedGift?.id === gift.id 
                      ? 'bg-primary/20 ring-2 ring-primary' 
                      : 'bg-muted/50 hover:bg-muted'
                  } ${coins < gift.price ? 'opacity-50' : ''}`}
                >
                  <span className="text-3xl">{gift.emoji}</span>
                  <span className="text-xs font-medium text-foreground truncate w-full text-center">
                    {gift.name}
                  </span>
                  <div className="flex items-center gap-0.5 text-yellow-600">
                    <Coins className="w-3 h-3" />
                    <span className="text-xs font-medium">{gift.price}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Top supporters - demo */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-foreground">Người hỗ trợ hàng đầu</span>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { name: 'Nguyễn A', avatar: null, coins: 5000 },
                  { name: 'Trần B', avatar: null, coins: 3200 },
                  { name: 'Lê C', avatar: null, coins: 1800 },
                ].map((supporter, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-full pl-1 pr-3 py-1">
                    <div className="relative">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={supporter.avatar || ''} />
                        <AvatarFallback className="text-xs bg-primary/50">
                          {supporter.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <span className="absolute -top-1 -right-1 text-xs">👑</span>
                      )}
                    </div>
                    <div className="text-xs">
                      <span className="text-foreground">{supporter.name}</span>
                      <span className="text-yellow-600 ml-1">{supporter.coins.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Send button */}
          <div className="p-4 pt-0">
            <Button
              onClick={() => selectedGift && handleSendGift(selectedGift)}
              disabled={!selectedGift || sendingGift || coins < (selectedGift?.price || 0)}
              className="w-full gap-2"
            >
              {sendingGift ? (
                'Đang gửi...'
              ) : selectedGift ? (
                <>
                  Gửi {selectedGift.emoji} {selectedGift.name}
                  <span className="text-xs opacity-75">({selectedGift.price} xu)</span>
                </>
              ) : (
                'Chọn quà để gửi'
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
