import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EcosystemFriend {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  fun_id: string | null;
  ecosystem_platforms: string[];
  is_online: boolean;
  last_active_at: string | null;
  friendship_id?: string;
  friendship_status?: string;
  source_platform?: string;
  mutual_friends_count?: number;
}

export interface FriendshipEvent {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  source_platform: string;
  synced_from_fun_id: boolean;
}

// Mock ecosystem friends data for demonstration
const MOCK_ECOSYSTEM_FRIENDS: EcosystemFriend[] = [
  {
    id: "mock-farm-1",
    user_id: "farm-user-1",
    full_name: "Nông Dân Vui Vẻ",
    avatar_url: null,
    bio: "Yêu cây cối, thích làm vườn! 🌱",
    fun_id: "FUN-FARM-001",
    ecosystem_platforms: ["farm", "charity"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "farm",
    mutual_friends_count: 12,
  },
  {
    id: "mock-farm-2",
    user_id: "farm-user-2",
    full_name: "Chị Hai Lúa",
    avatar_url: null,
    bio: "Mùa màng bội thu! 🌾",
    fun_id: "FUN-FARM-002",
    ecosystem_platforms: ["farm"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "farm",
    mutual_friends_count: 8,
  },
  {
    id: "mock-planet-1",
    user_id: "planet-user-1",
    full_name: "Nhà Thám Hiểm Sao",
    avatar_url: null,
    bio: "Bay xa hơn, khám phá nhiều hơn! 🚀",
    fun_id: "FUN-PLANET-001",
    ecosystem_platforms: ["planet", "profile"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "planet",
    mutual_friends_count: 15,
  },
  {
    id: "mock-planet-2",
    user_id: "planet-user-2",
    full_name: "Captain Galaxy",
    avatar_url: null,
    bio: "Đội trưởng phi đội Alpha 🌌",
    fun_id: "FUN-PLANET-002",
    ecosystem_platforms: ["planet"],
    is_online: false,
    last_active_at: new Date(Date.now() - 3600000).toISOString(),
    source_platform: "planet",
    mutual_friends_count: 20,
  },
  {
    id: "mock-play-1",
    user_id: "play-user-1",
    full_name: "Pro Gamer VN",
    avatar_url: null,
    bio: "Top 1 rank mùa này! 🏆",
    fun_id: "FUN-PLAY-001",
    ecosystem_platforms: ["play", "profile"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "play",
    mutual_friends_count: 45,
  },
  {
    id: "mock-play-2",
    user_id: "play-user-2",
    full_name: "Game Master",
    avatar_url: null,
    bio: "100% hoàn thành mọi game 🎯",
    fun_id: "FUN-PLAY-002",
    ecosystem_platforms: ["play"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "play",
    mutual_friends_count: 32,
  },
  {
    id: "mock-charity-1",
    user_id: "charity-user-1",
    full_name: "Thiên Sứ Nhỏ",
    avatar_url: null,
    bio: "Lan tỏa yêu thương mỗi ngày 💕",
    fun_id: "FUN-CHARITY-001",
    ecosystem_platforms: ["charity", "profile"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "charity",
    mutual_friends_count: 28,
  },
  {
    id: "mock-profile-1",
    user_id: "profile-user-1",
    full_name: "FUN Ambassador",
    avatar_url: null,
    bio: "Đại sứ FUN Ecosystem chính thức ✨",
    fun_id: "FUN-PROFILE-001",
    ecosystem_platforms: ["profile", "farm", "planet", "play", "charity"],
    is_online: true,
    last_active_at: new Date().toISOString(),
    source_platform: "profile",
    mutual_friends_count: 120,
  },
];

export function useEcosystemFriends(userId: string | null) {
  const [friends, setFriends] = useState<EcosystemFriend[]>([]);
  const [suggestions, setSuggestions] = useState<EcosystemFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  // Fetch real friends from database
  const fetchFriends = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: friendships, error } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (error) throw error;

      const friendIds = (friendships || []).map(f =>
        f.user_id === userId ? f.friend_id : f.user_id
      );

      if (friendIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, avatar_url, bio")
          .in("user_id", friendIds);

        const friendsWithData: EcosystemFriend[] = (friendships || []).map(friendship => {
          const friendUserId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
          const profile = profiles?.find(p => p.user_id === friendUserId);
          // Cast to access new columns that may not be in types yet
          const extendedProfile = profile as any;
          const extendedFriendship = friendship as any;
          
          return {
            id: profile?.id || friendship.id,
            user_id: friendUserId,
            full_name: profile?.full_name || null,
            avatar_url: profile?.avatar_url || null,
            bio: profile?.bio || null,
            fun_id: extendedProfile?.fun_id || null,
            ecosystem_platforms: (extendedProfile?.ecosystem_platforms as string[]) || ["charity"],
            is_online: extendedProfile?.is_online || false,
            last_active_at: extendedProfile?.last_active_at || null,
            friendship_id: friendship.id,
            friendship_status: friendship.status,
            source_platform: extendedFriendship?.source_platform || "charity",
          };
        });

        setFriends(friendsWithData);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching ecosystem friends:", error);
    }
  }, [userId]);

  // Load mock suggestions (simulating API call to other platforms)
  const fetchSuggestions = useCallback(async () => {
    if (!userId) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter out users that are already friends
    const friendUserIds = friends.map(f => f.user_id);
    const filtered = MOCK_ECOSYSTEM_FRIENDS.filter(
      f => !friendUserIds.includes(f.user_id)
    );

    setSuggestions(filtered);
  }, [userId, friends]);

  // Sync friends from FUN ID (mock implementation)
  const syncFromFunId = useCallback(async () => {
    if (!userId) return;

    setSyncing(true);
    try {
      // Simulate syncing from other platforms
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "🔄 Đã đồng bộ xong!",
        description: "Danh sách bạn bè từ FUN Ecosystem đã được cập nhật",
      });

      // Refresh friends list
      await fetchFriends();
      await fetchSuggestions();
    } catch (error) {
      toast({
        title: "Lỗi đồng bộ",
        description: "Không thể kết nối với FUN Ecosystem",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  }, [userId, toast, fetchFriends, fetchSuggestions]);

  // Link FUN ID to current account
  const linkFunId = useCallback(async (funIdValue: string) => {
    if (!userId) return false;

    try {
      // Use raw update since columns may not be in types yet
      const { error } = await supabase
        .from("profiles")
        .update({
          fun_id: funIdValue,
          fun_id_linked_at: new Date().toISOString(),
        } as any)
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "🎉 Kết nối thành công!",
        description: `FUN ID ${funIdValue} đã được liên kết với tài khoản của bạn`,
      });

      // Trigger sync after linking
      await syncFromFunId();
      return true;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }, [userId, toast, syncFromFunId]);

  // Setup realtime subscription for friendships
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("ecosystem-friends-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchFriends();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `friend_id=eq.${userId}`,
        },
        () => {
          fetchFriends();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchFriends]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchFriends();
      await fetchSuggestions();
      setLoading(false);
    };
    load();
  }, [fetchFriends, fetchSuggestions]);

  return {
    friends,
    suggestions,
    loading,
    syncing,
    fetchFriends,
    fetchSuggestions,
    syncFromFunId,
    linkFunId,
    mockFriends: MOCK_ECOSYSTEM_FRIENDS,
  };
}

export function useFunIdStatus(userId: string | null) {
  const [funId, setFunId] = useState<string | null>(null);
  const [linkedAt, setLinkedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        // Cast to access new columns
        const extendedData = data as any;
        setFunId(extendedData?.fun_id || null);
        setLinkedAt(extendedData?.fun_id_linked_at || null);
      } catch (error) {
        console.error("Error fetching FUN ID status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [userId]);

  return { funId, linkedAt, loading, isLinked: !!funId };
}
