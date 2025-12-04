import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Friend {
  id: string;
  friend_id: string;
  user_id: string;
  status: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  };
}

interface FriendsTabProps {
  userId: string | null;
  currentUserId: string | null;
}

export function FriendsTab({ userId, currentUserId }: FriendsTabProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchFriends();
    }
  }, [userId]);

  const fetchFriends = async () => {
    if (!userId) return;

    try {
      // Get friendships where user is either the sender or receiver and status is accepted
      const { data: sentFriendships, error: sentError } = await supabase
        .from("friendships")
        .select("id, friend_id, user_id, status")
        .eq("user_id", userId)
        .eq("status", "accepted");

      const { data: receivedFriendships, error: receivedError } = await supabase
        .from("friendships")
        .select("id, friend_id, user_id, status")
        .eq("friend_id", userId)
        .eq("status", "accepted");

      if (sentError) throw sentError;
      if (receivedError) throw receivedError;

      // Get friend IDs from both directions
      const friendIds = [
        ...(sentFriendships || []).map((f) => f.friend_id),
        ...(receivedFriendships || []).map((f) => f.user_id),
      ];

      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for all friends
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, role")
        .in("user_id", friendIds);

      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.user_id, p])
      );

      // Combine friendships with profiles
      const allFriends = [
        ...(sentFriendships || []).map((f) => ({
          ...f,
          profiles: profilesMap.get(f.friend_id) || {
            full_name: null,
            avatar_url: null,
            role: null,
          },
        })),
        ...(receivedFriendships || []).map((f) => ({
          ...f,
          profiles: profilesMap.get(f.user_id) || {
            full_name: null,
            avatar_url: null,
            role: null,
          },
        })),
      ];

      setFriends(allFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã hủy kết bạn",
      });
      fetchFriends();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể hủy kết bạn",
        variant: "destructive",
      });
    }
  };

  const isOwnProfile = currentUserId === userId;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Chưa có bạn bè</h3>
        <p className="text-muted-foreground">
          Kết nối với cộng đồng để mở rộng mạng lưới của bạn
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {friends.map((friendship) => (
        <div
          key={friendship.id}
          className="glass-card p-4 flex items-center gap-4"
        >
          <Avatar className="w-14 h-14">
            <AvatarImage src={friendship.profiles?.avatar_url || ""} />
            <AvatarFallback className="bg-secondary/20 text-secondary">
              {friendship.profiles?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              {friendship.profiles?.full_name || "Người dùng"}
            </h4>
            <p className="text-sm text-muted-foreground capitalize">
              {friendship.profiles?.role === "donor"
                ? "Nhà Tài Trợ"
                : friendship.profiles?.role === "volunteer"
                ? "Tình Nguyện Viên"
                : friendship.profiles?.role === "ngo"
                ? "Tổ Chức NGO"
                : "Thành Viên"}
            </p>
          </div>
          {isOwnProfile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveFriend(friendship.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <UserMinus className="w-5 h-5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
