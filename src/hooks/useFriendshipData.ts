import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FriendProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
}

interface GroupChat {
  id: string;
  name: string | null;
  participant_count: number;
}

export function useFriendsCount(userId: string | null) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchCount = async () => {
      const { count: friendCount } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");

      setCount(friendCount || 0);
      setIsLoading(false);
    };

    fetchCount();
  }, [userId]);

  return { count, isLoading };
}

export function useFriendsPreview(userId: string | null, limit: number = 8) {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchFriends = async () => {
      // Get accepted friendships
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted")
        .limit(limit);

      if (!friendships || friendships.length === 0) {
        setFriends([]);
        setIsLoading(false);
        return;
      }

      // Get friend IDs
      const friendIds = friendships.map(f => 
        f.user_id === userId ? f.friend_id : f.user_id
      );

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, is_verified")
        .in("user_id", friendIds);

      setFriends(profiles || []);
      setIsLoading(false);
    };

    fetchFriends();
  }, [userId, limit]);

  return { friends, isLoading };
}

export function useOnlineContacts() {
  const [contacts, setContacts] = useState<FriendProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get accepted friendships
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted")
        .limit(10);

      if (!friendships || friendships.length === 0) {
        setContacts([]);
        setIsLoading(false);
        return;
      }

      // Get friend IDs
      const friendIds = friendships.map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, is_verified")
        .in("user_id", friendIds);

      setContacts(profiles || []);
      setIsLoading(false);
    };

    fetchContacts();
  }, []);

  return { contacts, isLoading };
}

export function useGroupChats() {
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get group conversations where user is participant
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id, name, is_group")
        .eq("is_group", true)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .limit(5);

      if (!conversations || conversations.length === 0) {
        setGroups([]);
        setIsLoading(false);
        return;
      }

      // Get participant counts for each group
      const groupsWithCounts: GroupChat[] = await Promise.all(
        conversations.map(async (conv) => {
          const { count } = await supabase
            .from("conversation_participants")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id);

          return {
            id: conv.id,
            name: conv.name,
            participant_count: count || 0,
          };
        })
      );

      setGroups(groupsWithCounts);
      setIsLoading(false);
    };

    fetchGroups();
  }, []);

  return { groups, isLoading };
}

// Format friend count for display
export function formatFriendsCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M người bạn`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K người bạn`;
  }
  return `${count} người bạn`;
}
