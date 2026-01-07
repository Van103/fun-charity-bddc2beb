import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Gift, Sparkles, Crown, Coins, Trophy, Heart, ArrowRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GiftCard } from "@/components/gifts/GiftCard";
import { BlessingsHistory } from "@/components/gifts/BlessingsHistory";
import { CosmicMilestone } from "@/components/gifts/CosmicMilestone";
import { useRewardConfig } from "@/hooks/useRewardConfig";
import { useUserBalances, useRewardTransactions, useReferralCode } from "@/hooks/useRewards";
import { useTopRankers } from "@/hooks/useHonorStats";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface ClaimResult {
  success: boolean;
  message: string;
  claimed_amount: number;
}

export default function GiftsFromCosmicFather() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const { data: configs, isLoading: configsLoading } = useRewardConfig();
  const { data: balances, isLoading: balancesLoading, refetch: refetchBalances } = useUserBalances();
  const { data: transactions, isLoading: transactionsLoading } = useRewardTransactions(20);
  const { data: referralCode } = useReferralCode();
  const { data: topRankers, isLoading: rankersLoading } = useTopRankers();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const camlyBalance = balances?.find((b) => b.currency === "CAMLY");
  const totalEarned = camlyBalance?.total_earned || 0;
  const claimableBalance = camlyBalance?.balance || 0;

  const handleClaim = async () => {
    if (!user || claimableBalance <= 0) return;
    
    setIsClaiming(true);
    try {
      const { data, error } = await supabase.rpc("claim_rewards", {
        p_user_id: user.id,
      });

      if (error) throw error;
      
      const result = data as unknown as ClaimResult;
      
      if (result?.success) {
        toast.success(`🎉 ${result.message}`, {
          description: `Đã nhận ${new Intl.NumberFormat("vi-VN").format(result.claimed_amount)} Camly`,
        });
        refetchBalances();
      } else {
        toast.info(result?.message || "Không có xu nào để nhận");
      }
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Có lỗi xảy ra khi nhận thưởng");
    } finally {
      setIsClaiming(false);
    }
  };

  const activeConfigs = configs?.filter((c) => c.is_active) || [];

  return (
    <>
      <Helmet>
        <title>Quà Tặng Từ Cha Vũ Trụ | Camly Angel</title>
        <meta name="description" content="Khám phá những phước lành và phần thưởng đặc biệt từ Cha Vũ Trụ dành cho bạn." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950">
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          {/* Video background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-30"
            >
              <source src="/videos/sidebar-bg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-purple-950/80 via-purple-900/60 to-purple-950" />
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 mb-6">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-300">Phước Lành Thiêng Liêng</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Quà Tặng Từ Cha Vũ Trụ
                </span>
              </h1>
              <p className="text-purple-200/80 text-lg max-w-2xl mx-auto mb-8">
                Nhận những phước lành đặc biệt khi bạn góp phần lan tỏa yêu thương và ánh sáng đến cộng đồng
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="glass-card-divine px-6 py-4 rounded-2xl flex items-center gap-3">
                  <Coins className="w-8 h-8 text-amber-400" />
                  <div className="text-left">
                    <p className="text-sm text-purple-300/70">Tổng phần thưởng</p>
                    <p className="text-2xl font-bold text-amber-400">
                      {new Intl.NumberFormat("vi-VN").format(totalEarned)}
                    </p>
                  </div>
                </div>

                {user && claimableBalance > 0 && (
                  <Button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="metal-gold-border-button h-auto py-4 px-8"
                  >
                    {isClaiming ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Gift className="w-5 h-5 mr-2" />
                    )}
                    Nhận {new Intl.NumberFormat("vi-VN").format(claimableBalance)} Camly
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 pb-32">
          <Tabs defaultValue="blessings" className="space-y-8">
            <TabsList className="glass-card-divine p-1.5 mx-auto w-fit">
              <TabsTrigger value="blessings" className="data-[state=active]:bg-purple-600">
                <Gift className="w-4 h-4 mr-2" />
                Phước Lành
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
                <Sparkles className="w-4 h-4 mr-2" />
                Lịch Sử
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="data-[state=active]:bg-purple-600">
                <Trophy className="w-4 h-4 mr-2" />
                Bảng Vinh Danh
              </TabsTrigger>
            </TabsList>

            {/* Blessings Tab */}
            <TabsContent value="blessings" className="space-y-8">
              {/* Active Rewards Grid */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-amber-400" />
                  Các Phước Lành Hiện Có
                </h2>

                {configsLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-48 bg-purple-500/10 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {activeConfigs.map((config, index) => (
                      <GiftCard key={config.id} config={config} index={index} />
                    ))}
                  </div>
                )}
              </div>

              {/* Milestone Progress (only for logged in users) */}
              {user && (
                <CosmicMilestone totalEarned={totalEarned} />
              )}

              {/* Referral Section */}
              {user && referralCode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card-divine p-6 rounded-2xl"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                        <Heart className="w-7 h-7 text-pink-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Mã Giới Thiệu Của Bạn</h3>
                        <p className="text-purple-300/70">Chia sẻ để nhận thêm phước lành</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="px-4 py-2 rounded-lg bg-purple-800/50 text-amber-400 font-mono text-lg">
                        {referralCode.code}
                      </code>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(referralCode.code);
                          toast.success("Đã sao chép mã giới thiệu!");
                        }}
                        className="border-purple-500/30"
                      >
                        Sao chép
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-4 pt-4 border-t border-purple-500/20">
                    <div>
                      <p className="text-2xl font-bold text-amber-400">{referralCode.uses_count}</p>
                      <p className="text-sm text-purple-300/70">Lượt sử dụng</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-400">
                        {new Intl.NumberFormat("vi-VN").format(referralCode.total_earned)}
                      </p>
                      <p className="text-sm text-purple-300/70">Đã nhận</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <div className="glass-card-divine p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Lịch Sử Phước Lành
                </h2>
                {user ? (
                  <BlessingsHistory
                    transactions={transactions || []}
                    isLoading={transactionsLoading}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-purple-300/70 mb-4">Đăng nhập để xem lịch sử phước lành của bạn</p>
                    <Link to="/auth">
                      <Button className="purple-diamond-button">
                        Đăng nhập ngay
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
              <div className="glass-card-divine p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Top Thiên Sứ Được Phước Lành
                  </h2>
                  <Link to="/honor-board">
                    <Button variant="ghost" className="text-purple-300 hover:text-white">
                      Xem tất cả
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {rankersLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-purple-500/10 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topRankers?.slice(0, 10).map((ranker, index) => (
                      <motion.div
                        key={ranker.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-purple-900/30 border border-purple-500/20"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? "bg-amber-500 text-white" :
                          index === 1 ? "bg-gray-300 text-gray-800" :
                          index === 2 ? "bg-amber-700 text-white" :
                          "bg-purple-700 text-purple-200"
                        }`}>
                          {ranker.rank}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{ranker.name}</p>
                          {ranker.verified && (
                            <span className="text-xs text-amber-400">✓ Đã xác thực</span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-400">
                            {new Intl.NumberFormat("vi-VN").format(ranker.amount)}
                          </p>
                          <p className="text-xs text-purple-300/50">Camly</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <MobileBottomNav />
      </div>
    </>
  );
}
