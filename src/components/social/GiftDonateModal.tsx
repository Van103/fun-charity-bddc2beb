import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Gift,
  Heart,
  Wallet,
  CreditCard,
  Loader2,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FeedPost } from "@/hooks/useFeedPosts";

interface GiftDonateModalProps {
  post: FeedPost;
  trigger?: React.ReactNode;
}

const PRESET_AMOUNTS = [
  { value: 50000, label: "50K" },
  { value: 100000, label: "100K" },
  { value: 200000, label: "200K" },
  { value: 500000, label: "500K" },
  { value: 1000000, label: "1M" },
  { value: 2000000, label: "2M" },
];

const PAYMENT_METHODS = [
  {
    id: "crypto_eth",
    label: "Ví Crypto",
    icon: Wallet,
    description: "ETH, USDT, BTC",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "fiat_card",
    label: "Thẻ tín dụng",
    icon: CreditCard,
    description: "Visa, Mastercard",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
];

export function GiftDonateModal({ post, trigger }: GiftDonateModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100000);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("crypto_eth");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const amount = customAmount ? parseInt(customAmount) : selectedAmount || 0;

  const handleAmountSelect = (value: number) => {
    setSelectedAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(null);
    }
  };

  const handleDonate = async () => {
    if (amount < 10000) {
      toast({
        title: "Số tiền quá nhỏ",
        description: "Số tiền tối thiểu là 10,000₫",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Create a donation record (simulated - in real app, integrate with payment gateway)
      // For now, we'll just show success animation
      
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setShowSuccess(true);
      
      toast({
        title: "Cảm ơn bạn! 🎉",
        description: `Bạn đã tặng ${amount.toLocaleString()}₫ cho ${post.profiles?.full_name || "người dùng này"}`,
      });

      // Reset after showing success
      setTimeout(() => {
        setShowSuccess(false);
        setOpen(false);
        setSelectedAmount(100000);
        setCustomAmount("");
        setMessage("");
        setIsAnonymous(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện giao dịch. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className="flex-1 gap-2 text-muted-foreground hover:text-secondary"
          >
            <Gift className="w-5 h-5" />
            Tặng
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-bold mb-2">Tặng quà thành công!</h3>
                <p className="text-muted-foreground">
                  Cảm ơn bạn đã lan tỏa yêu thương 💖
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(20)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{
                      opacity: 1,
                      x: "50%",
                      y: "50%",
                    }}
                    animate={{
                      opacity: 0,
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                    }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    className="absolute text-2xl"
                  >
                    {["💖", "✨", "🎁", "💝", "⭐"][i % 5]}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-secondary" />
                  Tặng quà cho {post.profiles?.full_name || "người dùng"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {/* Recipient Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Avatar className="w-12 h-12 border-2 border-secondary/30">
                    <AvatarImage src={post.profiles?.avatar_url || ""} />
                    <AvatarFallback className="bg-secondary/20">
                      {post.profiles?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {post.profiles?.full_name || "Người dùng"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {post.title || post.content?.slice(0, 50)}...
                    </p>
                  </div>
                  <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                </div>

                {/* Amount Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Chọn số tiền</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((preset) => (
                      <motion.button
                        key={preset.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAmountSelect(preset.value)}
                        className={`py-3 px-2 rounded-lg border-2 transition-all font-medium ${
                          selectedAmount === preset.value
                            ? "border-secondary bg-secondary/10 text-secondary"
                            : "border-border hover:border-secondary/50"
                        }`}
                      >
                        {preset.label}
                      </motion.button>
                    ))}
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Hoặc nhập số tiền khác..."
                      value={customAmount ? parseInt(customAmount).toLocaleString() : ""}
                      onChange={handleCustomAmountChange}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ₫
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Phương thức thanh toán</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <motion.button
                        key={method.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          paymentMethod === method.id
                            ? "border-secondary bg-secondary/10"
                            : "border-border hover:border-secondary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-8 h-8 rounded-full ${method.bgColor} flex items-center justify-center`}>
                            <method.icon className={`w-4 h-4 ${method.color}`} />
                          </div>
                          <span className="font-medium text-sm">{method.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-10">
                          {method.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Lời nhắn (tùy chọn)</Label>
                  <Textarea
                    placeholder="Gửi lời chúc của bạn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="resize-none h-20"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {message.length}/200
                  </p>
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Tặng ẩn danh</Label>
                    <p className="text-xs text-muted-foreground">
                      Tên của bạn sẽ không được hiển thị
                    </p>
                  </div>
                  <Switch
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleDonate}
                  disabled={amount < 10000 || isLoading}
                  className="w-full gap-2 h-12 text-base"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Tặng {amount > 0 ? amount.toLocaleString() + "₫" : ""}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Giao dịch được bảo mật và minh bạch trên blockchain 🔒
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
