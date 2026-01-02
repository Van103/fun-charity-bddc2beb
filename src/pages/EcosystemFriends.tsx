import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useEcosystemFriends, useFunIdStatus } from "@/hooks/useEcosystemFriends";
import { FunIdLoginDialog } from "@/components/social/FunIdLoginDialog";
import {
  Search,
  UserPlus,
  Users,
  Loader2,
  MessageCircle,
  RefreshCw,
  Crown,
  Heart,
  Sprout,
  Globe,
  Gamepad2,
  Sparkles,
  Filter,
  SortAsc,
  Gift,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import funProfileLogo from "@/assets/fun-profile-logo.webp";
import funFarmLogo from "@/assets/fun-farm-logo.png";
import funPlanetLogo from "@/assets/fun-planet-logo.png";
import funPlayLogo from "@/assets/fun-play-logo.png";

// Platform configuration
const PLATFORMS = [
  { id: "all", name: "Tất cả", icon: Sparkles, logo: null, color: "from-purple-500 to-pink-500" },
  { id: "charity", name: "Charity", icon: Heart, logo: null, color: "from-pink-500 to-rose-500" },
  { id: "farm", name: "Farm", icon: Sprout, logo: funFarmLogo, color: "from-emerald-500 to-green-500" },
  { id: "planet", name: "Planet", icon: Globe, logo: funPlanetLogo, color: "from-blue-500 to-cyan-500" },
  { id: "play", name: "Play", icon: Gamepad2, logo: funPlayLogo, color: "from-purple-500 to-violet-500" },
  { id: "profile", name: "Profile", icon: Crown, logo: funProfileLogo, color: "from-amber-500 to-yellow-500" },
];

// Avatar emojis for mock users
const PLATFORM_AVATARS: Record<string, string> = {
  farm: "🧑‍🌾",
  planet: "🧑‍🚀",
  play: "🎮",
  charity: "💝",
  profile: "👑",
};

type SortOption = "online" | "name" | "mutual" | "recent";

export default function EcosystemFriends() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("online");
  const [showFunIdDialog, setShowFunIdDialog] = useState(false);
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const { 
    friends, 
    suggestions, 
    loading, 
    syncing, 
    syncFromFunId, 
    linkFunId,
    mockFriends 
  } = useEcosystemFriends(currentUserId);
  
  const { funId, isLinked } = useFunIdStatus(currentUserId);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(user.id);
    };
    checkAuth();
  }, [navigate]);

  // Combine real friends with mock ecosystem friends for display
  const allFriends = useMemo(() => {
    // Show mock friends as suggestions if not already friends
    const realFriendIds = friends.map(f => f.user_id);
    const mockSuggestions = mockFriends.filter(m => !realFriendIds.includes(m.user_id));
    
    return {
      realFriends: friends,
      ecosystemSuggestions: mockSuggestions,
    };
  }, [friends, mockFriends]);

  // Filter and sort friends
  const filteredFriends = useMemo(() => {
    let result = [...allFriends.realFriends];

    // Filter by platform
    if (selectedPlatform !== "all") {
      result = result.filter(f => 
        f.ecosystem_platforms?.includes(selectedPlatform) || 
        f.source_platform === selectedPlatform
      );
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.full_name?.toLowerCase().includes(query) ||
        f.fun_id?.toLowerCase().includes(query) ||
        f.bio?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "online":
        result.sort((a, b) => (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0));
        break;
      case "name":
        result.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
        break;
      case "mutual":
        result.sort((a, b) => (b.mutual_friends_count || 0) - (a.mutual_friends_count || 0));
        break;
      case "recent":
        result.sort((a, b) => 
          new Date(b.last_active_at || 0).getTime() - new Date(a.last_active_at || 0).getTime()
        );
        break;
    }

    return result;
  }, [allFriends.realFriends, selectedPlatform, searchQuery, sortBy]);

  // Filter suggestions
  const filteredSuggestions = useMemo(() => {
    let result = [...allFriends.ecosystemSuggestions];

    if (selectedPlatform !== "all") {
      result = result.filter(f => 
        f.ecosystem_platforms?.includes(selectedPlatform) || 
        f.source_platform === selectedPlatform
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.full_name?.toLowerCase().includes(query) ||
        f.fun_id?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allFriends.ecosystemSuggestions, selectedPlatform, searchQuery]);

  const handleAddFriend = async (userId: string, name: string) => {
    if (!currentUserId) return;

    // For mock users, just add to local state
    if (userId.startsWith("mock-") || userId.includes("-user-")) {
      setAddedFriends(prev => new Set([...prev, userId]));
      toast({
        title: "🎉 Đã gửi lời mời!",
        description: `Lời mời kết bạn đã được gửi đến ${name}`,
      });
      return;
    }

    // For real users, create friendship
    try {
      const { error } = await supabase.from("friendships").insert({
        user_id: currentUserId,
        friend_id: userId,
        status: "pending",
        source_platform: "charity",
      });

      if (error) throw error;

      setAddedFriends(prev => new Set([...prev, userId]));
      toast({
        title: "🎉 Đã gửi lời mời!",
        description: `Lời mời kết bạn đã được gửi đến ${name}`,
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPlatformInfo = (platformId: string) => {
    return PLATFORMS.find(p => p.id === platformId) || PLATFORMS[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>FUN Ecosystem Friends - Kết nối cộng đồng</title>
        <meta name="description" content="Kết nối với bạn bè từ tất cả dự án FUN Ecosystem: Fun Farm, Fun Planet, Fun Play và hơn thế nữa" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-16 sm:pt-20 pb-20 sm:pb-12">
          <div className="max-w-5xl mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  FUN Ecosystem Friends
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">
                  Kết nối bạn bè từ Fun Farm, Planet, Play & Charity
                </p>
              </div>

              <div className="flex gap-2">
                {isLinked ? (
                  <Button variant="outline" onClick={syncFromFunId} disabled={syncing}>
                    {syncing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Đồng bộ
                  </Button>
                ) : (
                  <Button onClick={() => setShowFunIdDialog(true)}>
                    <Crown className="w-4 h-4 mr-2" />
                    Kết nối FUN ID
                  </Button>
                )}
              </div>
            </div>

            {/* FUN ID Status Card */}
            <div className={cn(
              "rounded-xl p-4 mb-6 border",
              isLinked 
                ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800"
                : "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800"
            )}>
              <div className="flex items-center gap-4">
                <img src={funProfileLogo} alt="FUN Profile" className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  {isLinked ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500 text-white">
                          <Check className="w-3 h-3 mr-1" />
                          Đã kết nối
                        </Badge>
                        <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-300">
                          {funId}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Bạn bè từ tất cả FUN Ecosystem sẽ hiển thị ở đây
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-foreground">
                        🔐 Kết nối FUN ID để xem bạn bè từ toàn bộ Ecosystem
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Một tài khoản, truy cập Fun Farm, Planet, Play & hơn thế nữa!
                      </p>
                    </>
                  )}
                </div>
                {!isLinked && (
                  <Button size="sm" onClick={() => setShowFunIdDialog(true)}>
                    Kết nối ngay
                  </Button>
                )}
              </div>
            </div>

            {/* Search & Filters */}
            <div className="space-y-4 mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, FUN ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Platform Filter */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={cn(
                      "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 no-tap-highlight",
                      selectedPlatform === platform.id
                        ? `bg-gradient-to-r ${platform.color} text-white shadow-lg`
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {platform.logo ? (
                      <img src={platform.logo} alt="" className="w-4 h-4 rounded-full" />
                    ) : (
                      <platform.icon className="w-4 h-4" />
                    )}
                    {platform.name}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Sắp xếp:</span>
                <div className="flex gap-1">
                  {[
                    { id: "online", label: "Online" },
                    { id: "name", label: "Tên" },
                    { id: "mutual", label: "Bạn chung" },
                    { id: "recent", label: "Gần đây" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id as SortOption)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition-all",
                        sortBy === option.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="friends" className="space-y-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="friends" className="gap-2">
                  <Users className="w-4 h-4" />
                  Bạn bè ({filteredFriends.length})
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Gợi ý ({filteredSuggestions.length})
                </TabsTrigger>
              </TabsList>

              {/* Friends Tab */}
              <TabsContent value="friends">
                {filteredFriends.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {filteredFriends.map((friend, i) => {
                        const platform = getPlatformInfo(friend.source_platform || "charity");
                        return (
                          <motion.div
                            key={friend.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative bg-card rounded-xl p-4 border hover:border-primary/50 hover:shadow-lg transition-all"
                          >
                            {/* Online indicator */}
                            {friend.is_online && (
                              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-background animate-pulse" />
                            )}

                            <div className="flex items-start gap-3">
                              <div className={`p-0.5 rounded-full bg-gradient-to-br ${platform.color}`}>
                                <Avatar className="w-14 h-14 border-2 border-white dark:border-background">
                                  <AvatarImage src={friend.avatar_url || undefined} />
                                  <AvatarFallback className="text-2xl bg-muted">
                                    {PLATFORM_AVATARS[friend.source_platform || "charity"] || "👤"}
                                  </AvatarFallback>
                                </Avatar>
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground truncate">
                                  {friend.full_name || "Người dùng"}
                                </h4>
                                {friend.fun_id && (
                                  <p className="text-xs font-mono text-muted-foreground">
                                    {friend.fun_id}
                                  </p>
                                )}
                                <div className="flex items-center gap-1 mt-1">
                                  {platform.logo ? (
                                    <img src={platform.logo} alt="" className="w-3 h-3 rounded-full" />
                                  ) : (
                                    <platform.icon className="w-3 h-3 text-muted-foreground" />
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {platform.name}
                                  </span>
                                  {friend.mutual_friends_count && friend.mutual_friends_count > 0 && (
                                    <>
                                      <span className="text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">
                                        {friend.mutual_friends_count} bạn chung
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {friend.bio && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {friend.bio}
                              </p>
                            )}

                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" className="flex-1 h-9">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Nhắn tin
                              </Button>
                              <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                                <Gift className="w-4 h-4 text-pink-500" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || selectedPlatform !== "all"
                        ? "Không tìm thấy bạn bè phù hợp"
                        : "Bạn chưa có bạn bè nào"}
                    </p>
                    <Button onClick={() => setSelectedPlatform("all")}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Khám phá gợi ý
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Suggestions Tab */}
              <TabsContent value="suggestions">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredSuggestions.map((friend, i) => {
                      const platform = getPlatformInfo(friend.source_platform || "charity");
                      const isAdded = addedFriends.has(friend.user_id);

                      return (
                        <motion.div
                          key={friend.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: i * 0.05 }}
                          className="relative bg-card rounded-xl p-4 border hover:border-primary/50 hover:shadow-lg transition-all"
                        >
                          {friend.is_online && (
                            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-background animate-pulse" />
                          )}

                          <div className="flex items-start gap-3">
                            <div className={`p-0.5 rounded-full bg-gradient-to-br ${platform.color}`}>
                              <div className="w-14 h-14 rounded-full bg-white dark:bg-background flex items-center justify-center text-2xl">
                                {PLATFORM_AVATARS[friend.source_platform || "charity"] || "👤"}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground truncate">
                                {friend.full_name}
                              </h4>
                              {friend.fun_id && (
                                <p className="text-xs font-mono text-muted-foreground">
                                  {friend.fun_id}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-1">
                                {platform.logo ? (
                                  <img src={platform.logo} alt="" className="w-3 h-3 rounded-full" />
                                ) : (
                                  <platform.icon className="w-3 h-3 text-muted-foreground" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {platform.name}
                                </span>
                                {friend.mutual_friends_count && friend.mutual_friends_count > 0 && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">
                                      {friend.mutual_friends_count} bạn chung
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {friend.bio && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {friend.bio}
                            </p>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant={isAdded ? "secondary" : "default"}
                              className={cn("flex-1 h-9", isAdded && "bg-green-100 text-green-700")}
                              onClick={() => handleAddFriend(friend.user_id, friend.full_name || "")}
                              disabled={isAdded}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Đã gửi
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Kết bạn
                                </>
                              )}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                              <X className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>

      {/* FUN ID Login Dialog */}
      <FunIdLoginDialog
        open={showFunIdDialog}
        onOpenChange={setShowFunIdDialog}
        onLinkFunId={linkFunId}
      />
    </>
  );
}
