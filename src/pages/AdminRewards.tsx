import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, Settings, Users, Gift, History, 
  Link as LinkIcon, Loader2, Search, Plus, Edit, Trash2,
  TrendingUp, Coins, Award, RefreshCw, Check, X, BarChart3, Wallet
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  useRewardAnalytics, 
  useAllTransactions, 
  useAllUsers, 
  useGrantReward,
  useManualRewards 
} from "@/hooks/useAdminRewards";
import { 
  useRewardConfig, 
  useUpdateRewardConfig, 
  useCreateRewardConfig,
  useDeleteRewardConfig,
  type RewardConfig 
} from "@/hooks/useRewardConfig";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { BlockchainMonitor } from "@/components/admin/BlockchainMonitor";
import { ReportsTab } from "@/components/admin/ReportsTab";

export default function AdminRewards() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [grantAmount, setGrantAmount] = useState("");
  const [grantReason, setGrantReason] = useState("");
  const [editingConfig, setEditingConfig] = useState<RewardConfig | null>(null);
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  // Data hooks
  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useRewardAnalytics();
  const { data: configs, isLoading: configsLoading } = useRewardConfig();
  const { data: transactions, isLoading: transactionsLoading } = useAllTransactions(100);
  const { data: users, isLoading: usersLoading } = useAllUsers(searchQuery);
  const { data: manualRewards } = useManualRewards();
  
  // Mutation hooks
  const grantReward = useGrantReward();
  const updateConfig = useUpdateRewardConfig();
  const createConfig = useCreateRewardConfig();
  const deleteConfig = useDeleteRewardConfig();

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase.rpc("is_admin", { _user_id: user.id });
      if (!data) {
        toast.error("Bạn không có quyền truy cập trang này");
        navigate("/");
        return;
      }
      setIsAdmin(true);
    };
    checkAdmin();
  }, [navigate]);

  const handleGrantReward = async () => {
    if (!selectedUserId || !grantAmount || !grantReason) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    await grantReward.mutateAsync({
      userId: selectedUserId,
      amount: Number(grantAmount),
      reason: grantReason,
    });

    setIsGrantDialogOpen(false);
    setGrantAmount("");
    setGrantReason("");
    setSelectedUserId(null);
    refetchAnalytics();
  };

  const handleUpdateConfig = async () => {
    if (!editingConfig) return;

    await updateConfig.mutateAsync({
      id: editingConfig.id,
      reward_amount: editingConfig.reward_amount,
      max_per_day: editingConfig.max_per_day,
      is_active: editingConfig.is_active,
      display_name: editingConfig.display_name,
      display_name_vi: editingConfig.display_name_vi,
    });

    setIsConfigDialogOpen(false);
    setEditingConfig(null);
    toast.success("Đã cập nhật cấu hình phần thưởng");
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Quản lý phần thưởng | Admin</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950">
        <Navbar />

        <div className="container mx-auto px-4 pt-24 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Quản Lý Phần Thưởng
            </h1>
            <p className="text-purple-300/70">
              Quản lý cấu hình phần thưởng, người dùng và giao dịch
            </p>
          </motion.div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="glass-card-divine p-1.5">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="config" className="data-[state=active]:bg-purple-600">
                <Settings className="w-4 h-4 mr-2" />
                Cấu hình
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
                <Users className="w-4 h-4 mr-2" />
                Người dùng
              </TabsTrigger>
              <TabsTrigger value="manual" className="data-[state=active]:bg-purple-600">
                <Gift className="w-4 h-4 mr-2" />
                Tặng thưởng
              </TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-600">
                <History className="w-4 h-4 mr-2" />
                Giao dịch
              </TabsTrigger>
              <TabsTrigger value="blockchain" className="data-[state=active]:bg-purple-600">
                <Wallet className="w-4 h-4 mr-2" />
                Blockchain
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-purple-600">
                <BarChart3 className="w-4 h-4 mr-2" />
                Báo cáo
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card-divine border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300/70">
                      Tổng người dùng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span className="text-2xl font-bold text-white">
                        {analyticsLoading ? "..." : new Intl.NumberFormat("vi-VN").format(analytics?.totalUsers || 0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card-divine border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300/70">
                      Tổng phần thưởng phát
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-400" />
                      <span className="text-2xl font-bold text-amber-400">
                        {analyticsLoading ? "..." : new Intl.NumberFormat("vi-VN").format(analytics?.totalRewardsDistributed || 0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card-divine border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300/70">
                      Cấu hình hoạt động
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-green-400" />
                      <span className="text-2xl font-bold text-green-400">
                        {analyticsLoading ? "..." : analytics?.activeConfigs || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card-divine border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-300/70">
                      Thưởng hôm nay
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <span className="text-2xl font-bold text-blue-400">
                        {analyticsLoading ? "..." : new Intl.NumberFormat("vi-VN").format(analytics?.todayRewards || 0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card className="glass-card-divine border-purple-500/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Giao dịch gần đây</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => refetchAnalytics()}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {transactionsLoading ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-12 bg-purple-500/10 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transactions?.slice(0, 10).map((tx) => (
                          <div 
                            key={tx.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-purple-900/30"
                          >
                            <div>
                              <p className="text-sm text-white">{tx.action_type}</p>
                              <p className="text-xs text-purple-300/60">
                                {formatDistanceToNow(new Date(tx.created_at!), { addSuffix: true, locale: vi })}
                              </p>
                            </div>
                            <span className="font-bold text-amber-400">
                              +{new Intl.NumberFormat("vi-VN").format(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Config Tab */}
            <TabsContent value="config" className="space-y-6">
              <Card className="glass-card-divine border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Cấu hình phần thưởng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {configsLoading ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 bg-purple-500/10 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {configs?.map((config) => (
                        <div
                          key={config.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-purple-900/30 border border-purple-500/20"
                        >
                          <div className="flex items-center gap-4">
                            <Switch
                              checked={config.is_active || false}
                              onCheckedChange={(checked) => {
                                updateConfig.mutate({ id: config.id, is_active: checked });
                              }}
                            />
                            <div>
                              <p className="font-medium text-white">
                                {config.display_name_vi || config.action_type}
                              </p>
                              <p className="text-sm text-purple-300/60">
                                {config.action_type} • {new Intl.NumberFormat("vi-VN").format(config.reward_amount)} {config.reward_currency}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingConfig(config);
                                setIsConfigDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="glass-card-divine border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Quản lý người dùng</CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                      <Input
                        placeholder="Tìm kiếm người dùng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-purple-900/30 border-purple-500/30"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {usersLoading ? (
                      <div className="space-y-3">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="h-16 bg-purple-500/10 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {users?.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-purple-900/30 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback className="bg-purple-700">
                                  {user.full_name?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-white flex items-center gap-2">
                                  {user.full_name || "Không tên"}
                                  {user.is_verified && (
                                    <Check className="w-4 h-4 text-green-400" />
                                  )}
                                </p>
                                <p className="text-xs text-purple-300/60">
                                  {user.role} • Điểm uy tín: {user.reputation_score || 0}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUserId(user.user_id);
                                setIsGrantDialogOpen(true);
                              }}
                              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            >
                              <Gift className="w-4 h-4 mr-2" />
                              Tặng thưởng
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manual Rewards Tab */}
            <TabsContent value="manual" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Grant Form */}
                <Card className="glass-card-divine border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gift className="w-5 h-5 text-amber-400" />
                      Tặng phần thưởng thủ công
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-purple-200">ID người dùng</Label>
                      <Input
                        placeholder="UUID của người dùng"
                        value={selectedUserId || ""}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="bg-purple-900/30 border-purple-500/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Số lượng Camly</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={grantAmount}
                        onChange={(e) => setGrantAmount(e.target.value)}
                        className="bg-purple-900/30 border-purple-500/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200">Lý do</Label>
                      <Textarea
                        placeholder="Lý do tặng thưởng..."
                        value={grantReason}
                        onChange={(e) => setGrantReason(e.target.value)}
                        className="bg-purple-900/30 border-purple-500/30"
                      />
                    </div>
                    <Button
                      onClick={handleGrantReward}
                      disabled={grantReward.isPending}
                      className="w-full metal-gold-border-button"
                    >
                      {grantReward.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Gift className="w-4 h-4 mr-2" />
                      )}
                      Tặng phần thưởng
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Manual Rewards */}
                <Card className="glass-card-divine border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-white">Lịch sử tặng thủ công</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {manualRewards?.length ? (
                        <div className="space-y-2">
                          {manualRewards.map((reward) => (
                            <div
                              key={reward.id}
                              className="p-3 rounded-lg bg-purple-900/30"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm text-white">{reward.reason}</p>
                                  <p className="text-xs text-purple-300/60">
                                    {formatDistanceToNow(new Date(reward.created_at), { addSuffix: true, locale: vi })}
                                  </p>
                                </div>
                                <span className="font-bold text-amber-400">
                                  +{new Intl.NumberFormat("vi-VN").format(reward.amount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-purple-300/60">
                          Chưa có phần thưởng thủ công nào
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <Card className="glass-card-divine border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Lịch sử giao dịch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    {transactionsLoading ? (
                      <div className="space-y-2">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="h-16 bg-purple-500/10 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transactions?.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-purple-900/30 border border-purple-500/20"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                tx.status === "completed" ? "bg-green-500/20" : "bg-yellow-500/20"
                              }`}>
                                {tx.status === "completed" ? (
                                  <Check className="w-5 h-5 text-green-400" />
                                ) : (
                                  <Loader2 className="w-5 h-5 text-yellow-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-white">{tx.action_type}</p>
                                <p className="text-xs text-purple-300/60">
                                  {tx.description || tx.user_id.slice(0, 8)}... • {formatDistanceToNow(new Date(tx.created_at!), { addSuffix: true, locale: vi })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-amber-400">
                                +{new Intl.NumberFormat("vi-VN").format(tx.amount)}
                              </p>
                              <p className="text-xs text-purple-300/50">{tx.currency}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Grant Reward Dialog */}
        <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
          <DialogContent className="glass-card-divine border-purple-500/20">
            <DialogHeader>
              <DialogTitle className="text-white">Tặng phần thưởng</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-purple-200">Số lượng Camly</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  className="bg-purple-900/30 border-purple-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-purple-200">Lý do</Label>
                <Textarea
                  placeholder="Lý do tặng thưởng..."
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  className="bg-purple-900/30 border-purple-500/30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGrantDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleGrantReward}
                disabled={grantReward.isPending}
                className="metal-gold-border-button"
              >
                {grantReward.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Tặng thưởng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Config Dialog */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent className="glass-card-divine border-purple-500/20">
            <DialogHeader>
              <DialogTitle className="text-white">Chỉnh sửa cấu hình</DialogTitle>
            </DialogHeader>
            {editingConfig && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-purple-200">Tên hiển thị (VI)</Label>
                  <Input
                    value={editingConfig.display_name_vi || ""}
                    onChange={(e) => setEditingConfig({ ...editingConfig, display_name_vi: e.target.value })}
                    className="bg-purple-900/30 border-purple-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-purple-200">Tên hiển thị (EN)</Label>
                  <Input
                    value={editingConfig.display_name || ""}
                    onChange={(e) => setEditingConfig({ ...editingConfig, display_name: e.target.value })}
                    className="bg-purple-900/30 border-purple-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-purple-200">Số tiền thưởng</Label>
                  <Input
                    type="number"
                    value={editingConfig.reward_amount}
                    onChange={(e) => setEditingConfig({ ...editingConfig, reward_amount: Number(e.target.value) })}
                    className="bg-purple-900/30 border-purple-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-purple-200">Giới hạn mỗi ngày</Label>
                  <Input
                    type="number"
                    value={editingConfig.max_per_day || ""}
                    onChange={(e) => setEditingConfig({ ...editingConfig, max_per_day: e.target.value ? Number(e.target.value) : null })}
                    className="bg-purple-900/30 border-purple-500/30"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingConfig.is_active || false}
                    onCheckedChange={(checked) => setEditingConfig({ ...editingConfig, is_active: checked })}
                  />
                  <Label className="text-purple-200">Kích hoạt</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleUpdateConfig}
                disabled={updateConfig.isPending}
                className="metal-gold-border-button"
              >
                {updateConfig.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <MobileBottomNav />
      </div>
    </>
  );
}
