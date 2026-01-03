import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Link2, Check, AlertCircle, ExternalLink, Copy, Edit2, Smartphone, QrCode, RefreshCw, ArrowDownToLine, Coins } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { WithdrawModal } from "./WithdrawModal";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWalletConnected?: (address: string) => void;
}

export function WalletConnectModal({ open, onOpenChange, onWalletConnected }: WalletConnectModalProps) {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isBitgetInstalled, setIsBitgetInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWalletConnectInfo, setShowWalletConnectInfo] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const { toast } = useToast();
  
  const { eth, matic, ethUsd, maticUsd, loading: balanceLoading, refetch: refetchBalance } = useWalletBalance(connectedAddress);

  useEffect(() => {
    checkWalletsInstalled();
    loadSavedWallet();
    if (open) {
      setIsEditMode(false);
      setShowManualInput(false);
      setManualAddress("");
      setShowWalletConnectInfo(false);
    }
  }, [open]);

  const checkWalletsInstalled = () => {
    setIsMetaMaskInstalled(typeof window.ethereum !== "undefined" && window.ethereum?.isMetaMask === true);
    const bitgetProvider = (window as any).bitkeep?.ethereum || (window as any).bitget?.ethereum;
    setIsBitgetInstalled(!!bitgetProvider);
  };

  const connectWalletConnect = () => {
    setShowWalletConnectInfo(true);
    toast({
      title: "WalletConnect",
      description: "Chọn ví di động hoặc nhập địa chỉ ví thủ công để tiếp tục.",
    });
  };

  const loadSavedWallet = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("wallet_address")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.wallet_address) {
        setConnectedAddress(data.wallet_address);
      }
    }
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      toast({ title: "MetaMask không được cài đặt", description: "Vui lòng cài đặt MetaMask extension.", variant: "destructive" });
      return;
    }
    setIsConnecting("metamask");
    try {
      const accounts = await new Promise<string[]>((resolve, reject) => {
        window.ethereum!.request({ method: "eth_requestAccounts" })
          .then((result: string[]) => resolve(result))
          .catch((err: unknown) => reject(err));
      });
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        await saveWalletAddress(address);
        setConnectedAddress(address);
        setIsEditMode(false);
        onWalletConnected?.(address);
        toast({ title: "Kết nối thành công!", description: `Ví ${shortenAddress(address)} đã được kết nối.` });
      }
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err.code === 4001) {
        toast({ title: "Bị từ chối", description: "Bạn đã từ chối yêu cầu kết nối.", variant: "destructive" });
      } else {
        toast({ title: "Lỗi kết nối", description: err.message || "Không thể kết nối.", variant: "destructive" });
      }
    } finally {
      setIsConnecting(null);
    }
  };

  const connectBitget = async () => {
    const bitgetProvider = (window as any).bitkeep?.ethereum || (window as any).bitget?.ethereum;
    if (!bitgetProvider) {
      toast({ title: "Bitget Wallet không được cài đặt", description: "Vui lòng cài đặt Bitget Wallet.", variant: "destructive" });
      return;
    }
    setIsConnecting("bitget");
    try {
      const accounts = await bitgetProvider.request({ method: "eth_requestAccounts" }) as string[];
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        await saveWalletAddress(address);
        setConnectedAddress(address);
        setIsEditMode(false);
        onWalletConnected?.(address);
        toast({ title: "Kết nối thành công!", description: `Ví ${shortenAddress(address)} đã được kết nối.` });
      }
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 4001) {
        toast({ title: "Bị từ chối", description: "Bạn đã từ chối yêu cầu kết nối.", variant: "destructive" });
      } else {
        toast({ title: "Lỗi kết nối", description: "Không thể kết nối với Bitget Wallet.", variant: "destructive" });
      }
    } finally {
      setIsConnecting(null);
    }
  };

  const saveWalletAddress = async (address: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ wallet_address: address }).eq("user_id", user.id);
  };

  const handleManualSubmit = async () => {
    const trimmedAddress = manualAddress.trim();
    if (!trimmedAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast({ title: "Địa chỉ không hợp lệ", description: "Vui lòng nhập địa chỉ ví Ethereum hợp lệ (0x...)", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await saveWalletAddress(trimmedAddress);
      setConnectedAddress(trimmedAddress);
      setManualAddress("");
      setShowManualInput(false);
      setIsEditMode(false);
      onWalletConnected?.(trimmedAddress);
      toast({ title: "Lưu thành công!", description: `Địa chỉ ví ${shortenAddress(trimmedAddress)} đã được lưu.` });
    } finally {
      setIsSaving(false);
    }
  };

  const disconnectWallet = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ wallet_address: null }).eq("user_id", user.id);
    }
    setConnectedAddress(null);
    toast({ title: "Đã ngắt kết nối", description: "Ví của bạn đã được ngắt kết nối." });
  };

  const copyAddress = () => {
    if (connectedAddress) {
      navigator.clipboard.writeText(connectedAddress);
      toast({ title: "Đã sao chép!", description: "Địa chỉ ví đã được sao chép." });
    }
  };

  const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Wallet className="w-5 h-5 text-secondary" />
            Kết Nối Ví Web3
          </DialogTitle>
          <DialogDescription>
            Kết nối MetaMask, Bitget, WalletConnect hoặc nhập địa chỉ ví thủ công
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {connectedAddress && !isEditMode ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-success/10 border border-success/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-success" />
                  <span className="font-medium text-success">Đã kết nối</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setIsEditMode(true)} className="h-8 px-2">
                  <Edit2 className="w-4 h-4 mr-1" />Đổi ví
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-background/50">
                <code className="text-sm font-mono">{shortenAddress(connectedAddress)}</code>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={copyAddress} className="h-8 w-8"><Copy className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => window.open(`https://etherscan.io/address/${connectedAddress}`, "_blank")} className="h-8 w-8"><ExternalLink className="w-4 h-4" /></Button>
                </div>
              </div>
              
              {/* Real-time Balance Display */}
              <div className="mt-3 p-3 rounded-lg bg-background/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Số dư ví</span>
                  <Button size="icon" variant="ghost" onClick={refetchBalance} disabled={balanceLoading} className="h-6 w-6">
                    <RefreshCw className={`w-3 h-3 ${balanceLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-secondary/10 border border-secondary/20">
                    <div className="text-xs text-muted-foreground">Ethereum</div>
                    <div className="font-semibold text-sm">{balanceLoading ? '...' : `${eth} ETH`}</div>
                    <div className="text-xs text-muted-foreground">${ethUsd}</div>
                  </div>
                  <div className="p-2 rounded bg-[#8247E5]/10 border border-[#8247E5]/20">
                    <div className="text-xs text-muted-foreground">Polygon</div>
                    <div className="font-semibold text-sm">{balanceLoading ? '...' : `${matic} MATIC`}</div>
                    <div className="text-xs text-muted-foreground">${maticUsd}</div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setWithdrawModalOpen(true)}
                  className="flex-1 gap-2"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Rút tiền
                </Button>
                <Button variant="outline" size="sm" onClick={disconnectWallet} className="flex-1">
                  Ngắt kết nối
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              {connectedAddress && isEditMode && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border mb-2">
                  <p className="text-sm text-muted-foreground">Ví hiện tại: <code className="font-mono">{shortenAddress(connectedAddress)}</code></p>
                  <Button variant="link" size="sm" onClick={() => setIsEditMode(false)} className="p-0 h-auto text-xs">← Quay lại</Button>
                </div>
              )}

              {/* MetaMask */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={connectMetaMask} disabled={isConnecting !== null} className="w-full p-4 rounded-xl border-2 border-secondary/30 hover:border-secondary/60 bg-secondary/5 hover:bg-secondary/10 transition-all flex items-center gap-4 disabled:opacity-50">
                <div className="w-12 h-12 rounded-xl bg-[#F6851B]/10 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-8 h-8" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold flex items-center gap-2">MetaMask {isMetaMaskInstalled && <Badge variant="gold" className="text-xs">Đã cài đặt</Badge>}</div>
                  <p className="text-sm text-muted-foreground">{isConnecting === "metamask" ? "Đang kết nối..." : "Kết nối ví MetaMask"}</p>
                </div>
              </motion.button>

              {/* Bitget */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={connectBitget} disabled={isConnecting !== null} className="w-full p-4 rounded-xl border-2 border-[#00D4AA]/30 hover:border-[#00D4AA]/60 bg-[#00D4AA]/5 hover:bg-[#00D4AA]/10 transition-all flex items-center gap-4 disabled:opacity-50">
                <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center">
                  <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none"><rect width="32" height="32" rx="8" fill="#00D4AA"/><path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" strokeWidth="2" fill="none"/></svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold flex items-center gap-2">Bitget Wallet {isBitgetInstalled && <Badge className="text-xs bg-[#00D4AA] text-white">Đã cài đặt</Badge>}</div>
                  <p className="text-sm text-muted-foreground">{isConnecting === "bitget" ? "Đang kết nối..." : "Kết nối ví Bitget"}</p>
                </div>
              </motion.button>

              {/* WalletConnect */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={connectWalletConnect} disabled={isConnecting !== null} className="w-full p-4 rounded-xl border-2 border-[#3B99FC]/30 hover:border-[#3B99FC]/60 bg-[#3B99FC]/5 hover:bg-[#3B99FC]/10 transition-all flex items-center gap-4 disabled:opacity-50">
                <div className="w-12 h-12 rounded-xl bg-[#3B99FC]/10 flex items-center justify-center">
                  <svg viewBox="0 0 300 185" className="w-8 h-5" fill="#3B99FC"><path d="M61.439 36.256c48.91-47.888 128.212-47.888 177.123 0l5.886 5.764a6.041 6.041 0 0 1 0 8.67l-20.136 19.716a3.179 3.179 0 0 1-4.428 0l-8.101-7.931c-34.121-33.407-89.444-33.407-123.565 0l-8.675 8.494a3.179 3.179 0 0 1-4.428 0L54.978 51.253a6.041 6.041 0 0 1 0-8.67l6.461-6.327ZM280.206 77.03l17.922 17.547a6.041 6.041 0 0 1 0 8.67l-80.81 79.122c-2.446 2.394-6.41 2.394-8.856 0l-57.354-56.155a1.59 1.59 0 0 0-2.214 0L91.54 182.37c-2.446 2.394-6.411 2.394-8.857 0L1.872 103.247a6.041 6.041 0 0 1 0-8.671l17.922-17.547c2.445-2.394 6.41-2.394 8.856 0l57.354 56.155a1.59 1.59 0 0 0 2.214 0l57.354-56.155c2.446-2.394 6.41-2.394 8.856 0l57.354 56.155a1.59 1.59 0 0 0 2.214 0l57.354-56.155c2.446-2.394 6.411-2.394 8.857 0Z"/></svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold flex items-center gap-2">WalletConnect <Badge variant="outline" className="text-xs border-[#3B99FC]/50 text-[#3B99FC]"><Smartphone className="w-3 h-3 mr-1" />Di động</Badge></div>
                  <p className="text-sm text-muted-foreground">Trust Wallet, Rainbow & 300+ ví</p>
                </div>
              </motion.button>

              {/* WalletConnect Info */}
              <AnimatePresence>
                {showWalletConnectInfo && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-4 rounded-xl bg-[#3B99FC]/10 border border-[#3B99FC]/30">
                    <div className="flex items-center gap-2 mb-3"><QrCode className="w-5 h-5 text-[#3B99FC]" /><span className="font-medium text-[#3B99FC]">Kết nối ví di động</span></div>
                    <p className="text-sm text-muted-foreground mb-3">Nhập địa chỉ ví hoặc tải ví di động bên dưới.</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <a href="https://trustwallet.com/download" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-background/50 hover:bg-background/80 text-center text-xs transition-colors">Trust Wallet</a>
                      <a href="https://rainbow.me/download" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-background/50 hover:bg-background/80 text-center text-xs transition-colors">Rainbow</a>
                      <a href="https://www.argent.xyz/download" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-background/50 hover:bg-background/80 text-center text-xs transition-colors">Argent</a>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => { setShowWalletConnectInfo(false); setShowManualInput(true); }}>Nhập địa chỉ ví thủ công</Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">hoặc</span></div>
              </div>

              {/* Manual Input */}
              <AnimatePresence>
                {showManualInput ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                    <Label htmlFor="wallet-address">Địa chỉ ví Ethereum</Label>
                    <Input id="wallet-address" placeholder="0x..." value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} className="font-mono text-sm" />
                    <div className="flex gap-2">
                      <Button onClick={handleManualSubmit} disabled={isSaving || !manualAddress.trim()} className="flex-1" variant="hero">{isSaving ? "Đang lưu..." : "Lưu địa chỉ"}</Button>
                      <Button variant="outline" onClick={() => { setShowManualInput(false); setManualAddress(""); }}>Hủy</Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowManualInput(true)} className="w-full p-4 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-all flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center"><Link2 className="w-6 h-6 text-muted-foreground" /></div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Nhập thủ công</div>
                      <p className="text-sm text-muted-foreground">Dán địa chỉ ví của bạn (0x...)</p>
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </DialogContent>
      
      {/* Withdraw Modal */}
      <WithdrawModal
        open={withdrawModalOpen}
        onOpenChange={setWithdrawModalOpen}
        walletAddress={connectedAddress}
        onWithdrawSuccess={() => {
          // Optionally refresh data
        }}
      />
    </Dialog>
  );
}
