import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { PostsTab } from "@/components/profile/PostsTab";
import { PhotosTab } from "@/components/profile/PhotosTab";
import { FriendsTab } from "@/components/profile/FriendsTab";
import {
  Edit3,
  Users,
  Activity,
  Image as ImageIcon,
  FileText,
  Shield,
  Star,
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  role: string | null;
  reputation_score: number | null;
  is_verified: boolean | null;
}

interface Stats {
  followers: number;
  following: number;
  friends: number;
  posts: number;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    followers: 0,
    following: 0,
    friends: 0,
    posts: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.user_id) {
      fetchStats();
    }
  }, [profile?.user_id]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data as Profile);
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải hồ sơ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!profile?.user_id) return;

    try {
      // Count posts
      const { count: postsCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.user_id);

      // Count friends (accepted friendships)
      const { count: sentCount } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.user_id)
        .eq("status", "accepted");

      const { count: receivedCount } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("friend_id", profile.user_id)
        .eq("status", "accepted");

      setStats({
        followers: 0, // Would need followers table
        following: 0, // Would need following table  
        friends: (sentCount || 0) + (receivedCount || 0),
        posts: postsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "donor":
        return { label: "Nhà Tài Trợ", color: "bg-secondary text-secondary-foreground" };
      case "volunteer":
        return { label: "Tình Nguyện Viên", color: "bg-success text-success-foreground" };
      case "ngo":
        return { label: "Tổ Chức NGO", color: "bg-primary text-primary-foreground" };
      case "beneficiary":
        return { label: "Người Thụ Hưởng", color: "bg-accent text-accent-foreground" };
      default:
        return { label: "Thành Viên", color: "bg-muted text-muted-foreground" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(profile?.role);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Cover Image Section */}
        <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary via-primary-light to-secondary overflow-hidden">
          {profile?.cover_url ? (
            <img
              src={profile.cover_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-luxury opacity-90" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        {/* Profile Info Section */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-20 md:-mt-24 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6"
            >
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                  <AvatarFallback className="text-4xl bg-secondary/20 text-secondary">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {profile?.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1.5 shadow-lg">
                    <Shield className="w-5 h-5 text-secondary-foreground" />
                  </div>
                )}
              </div>

              {/* Name and Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {profile?.full_name || "Người Dùng"}
                  </h1>
                  <Badge className={roleBadge.color}>
                    {roleBadge.label}
                  </Badge>
                </div>
                <p className="text-muted-foreground max-w-xl">
                  {profile?.bio || "Chưa có tiểu sử"}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-secondary" />
                  <span>{profile?.reputation_score || 0} điểm uy tín</span>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                variant="gold"
                className="self-start md:self-end"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Chỉnh Sửa Hồ Sơ
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-6 mt-6 pt-6 border-t border-border"
            >
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {stats.followers.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Người theo dõi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {stats.following.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Đang theo dõi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {stats.friends.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Bạn bè</div>
              </div>
            </motion.div>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="pb-12">
            <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger
                value="posts"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent px-6 py-3"
              >
                <FileText className="w-4 h-4 mr-2" />
                Bài Viết
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent px-6 py-3"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Hình Ảnh
              </TabsTrigger>
              <TabsTrigger
                value="friends"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent px-6 py-3"
              >
                <Users className="w-4 h-4 mr-2" />
                Bạn Bè
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent px-6 py-3"
              >
                <Activity className="w-4 h-4 mr-2" />
                Hoạt Động
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6">
              <PostsTab profile={profile} currentUserId={currentUserId} />
            </TabsContent>

            <TabsContent value="photos" className="mt-6">
              <PhotosTab userId={profile?.user_id || null} />
            </TabsContent>

            <TabsContent value="friends" className="mt-6">
              <FriendsTab userId={profile?.user_id || null} currentUserId={currentUserId} />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <div className="glass-card p-8 text-center">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có hoạt động</h3>
                <p className="text-muted-foreground">
                  Các chiến dịch và hoạt động từ thiện của bạn sẽ xuất hiện ở đây
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}