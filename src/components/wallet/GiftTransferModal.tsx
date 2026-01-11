import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { 
  Gift, 
  ArrowRight,
  CheckCircle, 
  Loader2,
  Search,
  User,
  Sparkles,
  Heart,
  Star,
  PartyPopper,
  Coins
} from "lucide-react";

interface GiftTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

interface UserSearchResult {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface GiftPackage {
  id: string;
  name: string;
  amount: number;
  emoji: string;
  color: string;
  description: string;
}

const GIFT_PACKAGES: GiftPackage[] = [
  { id: "love", name: "Trái Tim Yêu Thương", amount: 500, emoji: "💖", color: "from-pink-500 to-rose-500", description: "Gửi lời yêu thương" },
  { id: "star", name: "Ngôi Sao May Mắn", amount: 1000, emoji: "⭐", color: "from-yellow-500 to-amber-500", description: "Chúc may mắn" },
  { id: "diamond", name: "Kim Cương Quý Giá", amount: 5000, emoji: "💎", color: "from-cyan-400 to-blue-500", description: "Thể hiện sự quý mến" },
  { id: "crown", name: "Vương Miện Hoàng Gia", amount: 10000, emoji: "👑", color: "from-amber-400 to-yellow-500", description: "Dành cho người đặc biệt" },
  { id: "rocket", name: "Tên Lửa Chinh Phục", amount: 20000, emoji: "🚀", color: "from-purple-500 to-indigo-600", description: "Cùng bay cao" },
  { id: "rainbow", name: "Cầu Vồng Hạnh Phúc", amount: 50000, emoji: "🌈", color: "from-red-500 via-yellow-500 to-green-500", description: "Món quà tối thượng" },
];

// Floating animation particles
const FloatingParticle = ({ delay, emoji }: { delay: number; emoji: string }) => (
  <motion.div
    className="absolute text-2xl pointer-events-none"
    initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [-20, -100, -150],
      x: [0, Math.random() * 60 - 30, Math.random() * 80 - 40],
      scale: [0, 1.2, 1, 0.5],
      rotate: [0, 15, -15, 0]
    }}
    transition={{
      duration: 2,
      delay,
      ease: "easeOut"
    }}
  >
    {emoji}
  </motion.div>
);

// Success celebration animation
const CelebrationAnimation = ({ emoji }: { emoji: string }) => {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    emoji: ["✨", "🎉", "💫", "🌟", emoji][Math.floor(Math.random() * 5)],
    delay: i * 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 text-3xl"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            x: Math.cos((p.id / 12) * Math.PI * 2) * 150,
            y: Math.sin((p.id / 12) * Math.PI * 2) * 150,
          }}
          transition={{
            duration: 1.5,
            delay: p.delay,
            ease: "easeOut"
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export function GiftTransferModal({ open, onOpenChange, currentBalance }: GiftTransferModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"search" | "select" | "confirm" | "processing" | "success">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [selectedGift, setSelectedGift] = useState<GiftPackage | null>(null);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("search");
      setSearchQuery("");
      setMessage("");
      setSelectedUser(null);
      setSelectedGift(null);
      setSearchResults([]);
      setShowParticles(false);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers(searchQuery.trim());
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    setSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .neq("user_id", user.id)
        .or(`full_name.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const transferMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !selectedGift) throw new Error("Missing data");
      
      const { data, error } = await supabase.rpc("transfer_camly", {
        p_to_user_id: selectedUser.user_id,
        p_amount: selectedGift.amount,
        p_message: message ? `${selectedGift.emoji} ${message}` : `${selectedGift.emoji} ${selectedGift.name}`,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; message: string };
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result;
    },
    onSuccess: () => {
      setStep("success");
      setShowParticles(true);
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      queryClient.invalidateQueries({ queryKey: ["reward-transactions"] });
      toast.success("Tặng quà thành công! 🎉");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể tặng quà");
      setStep("select");
    },
  });

  const handleTransfer = () => {
    setStep("processing");
    transferMutation.mutate();
  };

  const selectUserAndContinue = useCallback((user: UserSearchResult) => {
    setSelectedUser(user);
    setStep("select");
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
            >
              <Gift className="w-6 h-6 text-pink-500" />
            </motion.div>
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-bold">
              Tặng Quà CAMLY
            </span>
          </DialogTitle>
          <DialogDescription>
            Gửi món quà yêu thương đến bạn bè trong cộng đồng
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 relative">
          <AnimatePresence mode="wait">
            {/* Step 1: Search User */}
            {step === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Balance Display */}
                <motion.div 
                  className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-400" />
                      <span className="text-sm text-muted-foreground">Số dư</span>
                    </div>
                    <Badge variant="secondary" className="text-lg font-bold bg-amber-500/20 text-amber-400 border-amber-500/30">
                      🪙 {currentBalance.toLocaleString()}
                    </Badge>
                  </div>
                </motion.div>

                {/* User Search */}
                <div className="space-y-2">
                  <Label htmlFor="search" className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Tìm người bạn muốn tặng quà
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nhập tên người dùng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {searching && (
                  <div className="flex items-center justify-center py-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6 text-purple-500" />
                    </motion.div>
                  </div>
                )}

                {!searching && searchResults.length > 0 && (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {searchResults.map((user, index) => (
                      <motion.button
                        key={user.user_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => selectUserAndContinue(user)}
                        className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group"
                      >
                        <Avatar className="w-12 h-12 ring-2 ring-transparent group-hover:ring-pink-500/30 transition-all">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{user.full_name || "Người dùng"}</p>
                          <p className="text-xs text-muted-foreground">Nhấn để tặng quà</p>
                        </div>
                        <Gift className="w-5 h-5 text-muted-foreground group-hover:text-pink-500 transition-colors" />
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Không tìm thấy người dùng</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Select Gift */}
            {step === "select" && selectedUser && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Recipient */}
                <motion.div 
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  <Avatar className="w-12 h-12 ring-2 ring-pink-500/30">
                    <AvatarImage src={selectedUser.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.full_name || "Người dùng"}</p>
                    <p className="text-xs text-pink-500">Người nhận quà</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setStep("search")}
                    className="ml-auto text-xs"
                  >
                    Đổi
                  </Button>
                </motion.div>

                {/* Gift Packages Grid */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Chọn món quà
                  </Label>
                  <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
                    {GIFT_PACKAGES.map((gift, index) => (
                      <motion.button
                        key={gift.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedGift(gift)}
                        disabled={gift.amount > currentBalance}
                        className={`relative p-4 rounded-xl border transition-all overflow-hidden ${
                          selectedGift?.id === gift.id
                            ? "border-pink-500 ring-2 ring-pink-500/30 bg-pink-500/10"
                            : gift.amount > currentBalance
                            ? "border-border opacity-50 cursor-not-allowed"
                            : "border-border hover:border-pink-500/50 hover:bg-muted/50"
                        }`}
                      >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gift.color} opacity-10`} />
                        
                        <div className="relative z-10">
                          <motion.span 
                            className="text-3xl block mb-2"
                            animate={selectedGift?.id === gift.id ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            {gift.emoji}
                          </motion.span>
                          <p className="font-medium text-sm mb-1">{gift.name}</p>
                          <div className="flex items-center justify-center gap-1 text-amber-500 font-bold">
                            <Coins className="w-3 h-3" />
                            <span>{gift.amount.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {selectedGift?.id === gift.id && (
                          <motion.div
                            className="absolute top-2 right-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <CheckCircle className="w-5 h-5 text-pink-500" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Lời nhắn (tùy chọn)</Label>
                  <Input
                    id="message"
                    placeholder="Gửi kèm lời yêu thương..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <Button
                  onClick={() => setStep("confirm")}
                  disabled={!selectedGift}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Tiếp tục
                </Button>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === "confirm" && selectedUser && selectedGift && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-500/20 text-center relative overflow-hidden">
                  {/* Animated particles */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(5)].map((_, i) => (
                      <FloatingParticle key={i} delay={i * 0.2} emoji={selectedGift.emoji} />
                    ))}
                  </div>

                  <motion.div
                    className="text-6xl mb-4"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {selectedGift.emoji}
                  </motion.div>
                  
                  <h3 className="text-xl font-bold mb-2">{selectedGift.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{selectedGift.description}</p>
                  
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-amber-500">
                        🪙 {selectedGift.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">CAMLY</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-pink-500" />
                    <Avatar className="w-14 h-14 ring-4 ring-pink-500/30">
                      <AvatarImage src={selectedUser.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <p className="mt-4 font-medium">{selectedUser.full_name || "Người dùng"}</p>
                  {message && (
                    <p className="text-sm text-muted-foreground italic mt-2">"{message}"</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
                    Quay lại
                  </Button>
                  <Button 
                    onClick={handleTransfer} 
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
                  >
                    <PartyPopper className="w-4 h-4 mr-2" />
                    Tặng ngay!
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Processing */}
            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center space-y-4"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block"
                >
                  <Gift className="w-16 h-16 text-pink-500" />
                </motion.div>
                <div>
                  <h4 className="font-semibold text-lg">Đang gửi quà...</h4>
                  <p className="text-sm text-muted-foreground">
                    Món quà yêu thương đang trên đường đến ✨
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 5: Success */}
            {step === "success" && selectedGift && selectedUser && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center relative"
              >
                {showParticles && <CelebrationAnimation emoji={selectedGift.emoji} />}
                
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Tặng quà thành công! 🎉
                  </h4>
                  <p className="text-muted-foreground">
                    Đã gửi <span className="font-bold text-pink-500">{selectedGift.emoji} {selectedGift.name}</span>
                  </p>
                  <p className="text-muted-foreground">
                    cho <span className="font-medium">{selectedUser.full_name}</span>
                  </p>
                  <div className="pt-4">
                    <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-lg px-4 py-2">
                      🪙 {selectedGift.amount.toLocaleString()} CAMLY
                    </Badge>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8"
                >
                  <Button 
                    onClick={() => onOpenChange(false)} 
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                  >
                    Tuyệt vời! ✨
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
