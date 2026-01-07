import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, Gift, Coins, ArrowRight, CheckCircle2, 
  ExternalLink, Loader2, AlertCircle, Sparkles,
  History, TrendingUp, Shield
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useUserBalances, useRewardTransactions } from "@/hooks/useRewards";
import { useBlockchainClaims, useClaimTokens } from "@/hooks/useBlockchainClaims";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ethers } from "ethers";
import Confetti from "@/components/claim/ClaimSuccessAnimation";

// Token conversion rate: 100 CAMLY = 1 FUN Token
const TOKEN_CONVERSION_RATE = 100;

export default function ClaimRewards() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [claimAmount, setClaimAmount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Data hooks
  const { data: balances, isLoading: balancesLoading } = useUserBalances();
  const { data: transactions } = useRewardTransactions(50);
  const { data: blockchainClaims, isLoading: claimsLoading } = useBlockchainClaims();
  const claimTokens = useClaimTokens();

  // Get CAMLY balance
  const camlyBalance = balances?.find(b => b.currency === "CAMLY")?.balance || 0;
  const maxTokens = Math.floor(camlyBalance / TOKEN_CONVERSION_RATE);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      
      // Check for connected wallet in profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_address")
        .eq("user_id", user.id)
        .single();
      
      if (profile?.wallet_address) {
        setConnectedWallet(profile.wallet_address);
      }
    };
    checkAuth();
  }, [navigate]);

  // Connect MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("Vui lòng cài đặt MetaMask!");
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      
      // Update profile with wallet
      if (user) {
        await supabase
          .from("profiles")
          .update({ wallet_address: address, wallet_verified_at: new Date().toISOString() })
          .eq("user_id", user.id);
      }
      
      setConnectedWallet(address);
      toast.success("Đã kết nối ví thành công!");
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Không thể kết nối ví");
    } finally {
      setIsConnecting(false);
    }
  };

  // Claim tokens
  const handleClaim = async () => {
    if (!connectedWallet) {
      toast.error("Vui lòng kết nối ví trước!");
      return;
    }

    if (claimAmount <= 0 || claimAmount > maxTokens) {
      toast.error("Số lượng token không hợp lệ!");
      return;
    }

    const pointsToDeduct = claimAmount * TOKEN_CONVERSION_RATE;

    try {
      await claimTokens.mutateAsync({
        walletAddress: connectedWallet,
        pointsClaimed: pointsToDeduct,
        tokensMinted: claimAmount,
      });

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setClaimAmount(0);
    } catch (error) {
      console.error("Claim error:", error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <Helmet>
        <title>Claim FUN Tokens | Fun Charity</title>
        <meta name="description" content="Đổi điểm Camly thành FUN Token và nhận vào ví của bạn" />
      </Helmet>

      {showConfetti && <Confetti />}

      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950">
        <Navbar />

        <div className="container mx-auto px-4 pt-24 pb-32">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Blockchain Rewards</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
              Claim FUN Tokens
            </h1>
            <p className="text-purple-300/70">
              Đổi điểm Camly thành FUN Token (ERC-20) và nhận vào ví của bạn
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="claim" className="space-y-6">
              <TabsList className="glass-card-divine p-1.5 w-full justify-start">
                <TabsTrigger value="claim" className="data-[state=active]:bg-purple-600">
                  <Gift className="w-4 h-4 mr-2" />
                  Claim Tokens
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
                  <History className="w-4 h-4 mr-2" />
                  Lịch sử Claim
                </TabsTrigger>
              </TabsList>

              {/* Claim Tab */}
              <TabsContent value="claim" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Balance Card */}
                  <Card className="glass-card-divine border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Coins className="w-5 h-5 text-amber-400" />
                        Số dư hiện tại
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {balancesLoading ? (
                        <div className="h-20 bg-purple-500/10 rounded-lg animate-pulse" />
                      ) : (
                        <>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                            <p className="text-sm text-amber-300/70 mb-1">Camly Coins</p>
                            <p className="text-3xl font-bold text-amber-400">
                              {new Intl.NumberFormat("vi-VN").format(camlyBalance)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-purple-300/70">
                            <ArrowRight className="w-4 h-4" />
                            <span>{TOKEN_CONVERSION_RATE} CAMLY = 1 FUN Token</span>
                          </div>

                          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                            <p className="text-sm text-purple-300/70 mb-1">FUN Token có thể claim</p>
                            <p className="text-3xl font-bold text-purple-400">
                              {new Intl.NumberFormat("vi-VN").format(maxTokens)}
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Wallet & Claim Card */}
                  <Card className="glass-card-divine border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-purple-400" />
                        Ví nhận Token
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Wallet Connection */}
                      {connectedWallet ? (
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                              <span className="text-green-300">Đã kết nối</span>
                            </div>
                            <Badge variant="outline" className="border-green-500/50 text-green-300">
                              {formatAddress(connectedWallet)}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={connectWallet}
                          disabled={isConnecting}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          {isConnecting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Wallet className="w-4 h-4 mr-2" />
                          )}
                          Kết nối MetaMask
                        </Button>
                      )}

                      {/* Claim Amount Selector */}
                      {connectedWallet && maxTokens > 0 && (
                        <div className="space-y-4 pt-4">
                          <div>
                            <label className="text-sm text-purple-300/70 mb-2 block">
                              Số lượng FUN Token muốn claim
                            </label>
                            <div className="flex items-center gap-4">
                              <Slider
                                value={[claimAmount]}
                                onValueChange={(value) => setClaimAmount(value[0])}
                                max={maxTokens}
                                step={1}
                                className="flex-1"
                              />
                              <Input
                                type="number"
                                value={claimAmount}
                                onChange={(e) => setClaimAmount(Math.min(Number(e.target.value), maxTokens))}
                                className="w-24 bg-purple-900/30 border-purple-500/30 text-center"
                              />
                            </div>
                            <p className="text-xs text-purple-300/50 mt-2">
                              = {new Intl.NumberFormat("vi-VN").format(claimAmount * TOKEN_CONVERSION_RATE)} CAMLY
                            </p>
                          </div>

                          <Button
                            onClick={handleClaim}
                            disabled={claimAmount <= 0 || claimTokens.isPending}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6"
                          >
                            {claimTokens.isPending ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <Gift className="w-5 h-5 mr-2" />
                                Claim {claimAmount} FUN Token
                              </>
                            )}
                          </Button>

                          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-300/80">
                              Token sẽ được mint và gửi đến ví của bạn trên Polygon network. 
                              Giao dịch có thể mất vài phút để hoàn thành.
                            </p>
                          </div>
                        </div>
                      )}

                      {connectedWallet && maxTokens === 0 && (
                        <div className="flex items-center gap-2 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <AlertCircle className="w-5 h-5 text-amber-400" />
                          <p className="text-sm text-amber-300">
                            Bạn cần tối thiểu {TOKEN_CONVERSION_RATE} CAMLY để claim 1 FUN Token
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Points Transactions */}
                <Card className="glass-card-divine border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Điểm đã nhận gần đây
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {transactions?.slice(0, 10).map((tx) => (
                          <div 
                            key={tx.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-purple-900/30"
                          >
                            <div>
                              <p className="text-sm text-white capitalize">{tx.action_type}</p>
                              <p className="text-xs text-purple-300/60">
                                {formatDistanceToNow(new Date(tx.created_at!), { addSuffix: true, locale: vi })}
                              </p>
                            </div>
                            <span className="font-bold text-green-400">
                              +{new Intl.NumberFormat("vi-VN").format(tx.amount)} {tx.currency}
                            </span>
                          </div>
                        ))}
                        {(!transactions || transactions.length === 0) && (
                          <p className="text-center text-purple-300/50 py-8">
                            Chưa có giao dịch nào
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6">
                <Card className="glass-card-divine border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-purple-400" />
                      Lịch sử Claim Token
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {claimsLoading ? (
                        <div className="space-y-3">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-purple-500/10 rounded-lg animate-pulse" />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {blockchainClaims?.map((claim) => (
                            <motion.div
                              key={claim.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 rounded-xl bg-purple-900/30 border border-purple-500/20"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={claim.status === "completed" ? "default" : "secondary"}
                                    className={
                                      claim.status === "completed" 
                                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                                        : claim.status === "failed"
                                        ? "bg-red-500/20 text-red-300 border-red-500/30"
                                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    }
                                  >
                                    {claim.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                    {claim.status}
                                  </Badge>
                                  <span className="text-xs text-purple-300/60">
                                    {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true, locale: vi })}
                                  </span>
                                </div>
                                <span className="font-bold text-amber-400">
                                  {new Intl.NumberFormat("vi-VN").format(claim.tokens_minted)} FUN
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-purple-300/50 text-xs">Points Used</p>
                                  <p className="text-white">{new Intl.NumberFormat("vi-VN").format(claim.points_claimed)} CAMLY</p>
                                </div>
                                <div>
                                  <p className="text-purple-300/50 text-xs">Wallet</p>
                                  <p className="text-white font-mono text-xs">{formatAddress(claim.wallet_address)}</p>
                                </div>
                              </div>

                              {claim.tx_hash && (
                                <a
                                  href={`https://polygonscan.com/tx/${claim.tx_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-2"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View on PolygonScan
                                </a>
                              )}
                            </motion.div>
                          ))}
                          {(!blockchainClaims || blockchainClaims.length === 0) && (
                            <div className="text-center py-12">
                              <Gift className="w-12 h-12 text-purple-500/30 mx-auto mb-3" />
                              <p className="text-purple-300/50">Chưa có claim nào</p>
                            </div>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <MobileBottomNav />
      </div>
    </>
  );
}
