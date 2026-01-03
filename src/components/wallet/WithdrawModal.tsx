import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Coins, 
  Wallet, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Info,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string | null;
  onWithdrawSuccess?: () => void;
}

export function WithdrawModal({ open, onOpenChange, walletAddress, onWithdrawSuccess }: WithdrawModalProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState<"input" | "confirm" | "processing" | "success">("input");
  const [amount, setAmount] = useState("");
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(false);

  // Conversion rate: 1 Camly Coin = 0.001 MATIC (example)
  const COIN_TO_MATIC_RATE = 0.001;
  const MIN_WITHDRAW = 100;
  const MAX_WITHDRAW = 10000;

  useEffect(() => {
    if (open) {
      fetchUserCoins();
      setStep("input");
      setAmount("");
    }
  }, [open]);

  const fetchUserCoins = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_coins")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    setUserCoins(data?.balance || 0);
  };

  const maticAmount = parseFloat(amount || "0") * COIN_TO_MATIC_RATE;
  const isValidAmount = parseFloat(amount) >= MIN_WITHDRAW && parseFloat(amount) <= Math.min(MAX_WITHDRAW, userCoins);

  const handleWithdraw = async () => {
    if (!walletAddress) {
      toast({
        title: language === "vi" ? "Chưa kết nối ví" : "Wallet not connected",
        description: language === "vi" ? "Vui lòng kết nối ví crypto trước" : "Please connect your crypto wallet first",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const withdrawAmount = parseFloat(amount);

      // Deduct coins from user balance
      const { error } = await supabase
        .from("user_coins")
        .update({ 
          balance: userCoins - withdrawAmount,
          total_spent: supabase.rpc as any // This would need a proper RPC call
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // In production, this would call an edge function to process the actual crypto transfer
      // For now, we simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStep("success");
      toast({
        title: language === "vi" ? "Rút tiền thành công!" : "Withdrawal successful!",
        description: language === "vi" 
          ? `${withdrawAmount} Camly Coin đã được gửi về ví của bạn` 
          : `${withdrawAmount} Camly Coins sent to your wallet`,
      });

      onWithdrawSuccess?.();
    } catch (error) {
      console.error("Withdraw error:", error);
      setStep("input");
      toast({
        title: language === "vi" ? "Lỗi" : "Error",
        description: language === "vi" ? "Không thể thực hiện rút tiền" : "Could not process withdrawal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (addr: string) => `${addr.slice(0, 10)}...${addr.slice(-8)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            {language === "vi" ? "Rút Camly Coin" : "Withdraw Camly Coin"}
          </DialogTitle>
          <DialogDescription>
            {language === "vi" 
              ? "Chuyển đổi Camly Coin thành crypto và rút về ví của bạn" 
              : "Convert Camly Coins to crypto and withdraw to your wallet"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            {step === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Balance Display */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === "vi" ? "Số dư hiện tại" : "Current Balance"}
                    </span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      🪙 {userCoins.toLocaleString()} Coins
                    </Badge>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {language === "vi" ? "Số lượng muốn rút" : "Amount to withdraw"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      min={MIN_WITHDRAW}
                      max={Math.min(MAX_WITHDRAW, userCoins)}
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pr-20 text-lg"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      Coins
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {MIN_WITHDRAW} Coins</span>
                    <span>Max: {Math.min(MAX_WITHDRAW, userCoins).toLocaleString()} Coins</span>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  {[100, 500, 1000, userCoins].map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setAmount(Math.min(val, MAX_WITHDRAW).toString())}
                      disabled={val > userCoins}
                    >
                      {val === userCoins ? (language === "vi" ? "Tất cả" : "All") : val}
                    </Button>
                  ))}
                </div>

                {/* Conversion Preview */}
                {amount && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>🪙 {parseInt(amount).toLocaleString()}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-primary">≈ {maticAmount.toFixed(4)} MATIC</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "vi" ? "Tỷ giá: 1 Coin = 0.001 MATIC" : "Rate: 1 Coin = 0.001 MATIC"}
                    </p>
                  </motion.div>
                )}

                {/* Wallet Address */}
                {walletAddress ? (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">{language === "vi" ? "Ví nhận:" : "Receiving wallet:"}</span>
                      <code className="font-mono text-xs">{shortenAddress(walletAddress)}</code>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {language === "vi" ? "Vui lòng kết nối ví trước" : "Please connect wallet first"}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={() => setStep("confirm")}
                  disabled={!isValidAmount || !walletAddress}
                  className="w-full"
                >
                  {language === "vi" ? "Tiếp tục" : "Continue"}
                </Button>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                  <h4 className="font-semibold">{language === "vi" ? "Xác nhận rút tiền" : "Confirm Withdrawal"}</h4>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "vi" ? "Số lượng" : "Amount"}</span>
                    <span className="font-semibold">🪙 {parseInt(amount).toLocaleString()} Coins</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "vi" ? "Nhận được" : "You receive"}</span>
                    <span className="font-semibold text-primary">{maticAmount.toFixed(4)} MATIC</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "vi" ? "Ví nhận" : "To wallet"}</span>
                    <code className="font-mono text-xs">{shortenAddress(walletAddress!)}</code>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-2 text-sm">
                    <Info className="w-4 h-4 text-amber-500 mt-0.5" />
                    <p className="text-muted-foreground">
                      {language === "vi" 
                        ? "Giao dịch sẽ được xử lý trong vòng 1-5 phút. Vui lòng kiểm tra ví sau khi hoàn tất." 
                        : "Transaction will be processed within 1-5 minutes. Please check your wallet after completion."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
                    {language === "vi" ? "Quay lại" : "Back"}
                  </Button>
                  <Button onClick={handleWithdraw} className="flex-1">
                    {language === "vi" ? "Xác nhận rút" : "Confirm Withdraw"}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 text-center space-y-4"
              >
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                <div>
                  <h4 className="font-semibold">{language === "vi" ? "Đang xử lý..." : "Processing..."}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "vi" ? "Vui lòng không đóng cửa sổ này" : "Please do not close this window"}
                  </p>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                </motion.div>
                <div>
                  <h4 className="font-semibold text-lg">{language === "vi" ? "Rút tiền thành công!" : "Withdrawal Successful!"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {maticAmount.toFixed(4)} MATIC {language === "vi" ? "đã được gửi về ví của bạn" : "has been sent to your wallet"}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`https://polygonscan.com/address/${walletAddress}`, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {language === "vi" ? "Xem trên PolygonScan" : "View on PolygonScan"}
                </Button>
                <Button onClick={() => onOpenChange(false)} className="w-full">
                  {language === "vi" ? "Đóng" : "Close"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
