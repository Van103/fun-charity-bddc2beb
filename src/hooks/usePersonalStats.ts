import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PersonalStats {
  featuredScore: number;
  income: number;
  postsCount: number;
  videosCount: number;
  friendsCount: number;
  nftCount: number;
}

export function usePersonalStats(userId: string | null) {
  return useQuery({
    queryKey: ["personal-stats", userId],
    queryFn: async (): Promise<PersonalStats> => {
      if (!userId) {
        return {
          featuredScore: 0,
          income: 0,
          postsCount: 0,
          videosCount: 0,
          friendsCount: 0,
          nftCount: 0,
        };
      }

      // Fetch all data in parallel
      const [
        profileResult,
        balanceResult,
        postsResult,
        videosResult,
        friendsResult,
        badgesResult,
      ] = await Promise.all([
        // Featured score from profiles
        supabase
          .from("profiles")
          .select("reputation_score")
          .eq("user_id", userId)
          .maybeSingle(),

        // Income from user_balances (CAMLY currency)
        supabase
          .from("user_balances")
          .select("balance")
          .eq("user_id", userId)
          .eq("currency", "CAMLY")
          .maybeSingle(),

        // Posts count (all posts)
        supabase
          .from("feed_posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),

        // Videos count (posts with is_live_video = true)
        supabase
          .from("feed_posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_live_video", true),

        // Friends count (accepted friendships)
        supabase
          .from("friendships")
          .select("id", { count: "exact", head: true })
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
          .eq("status", "accepted"),

        // NFT count (user badges)
        supabase
          .from("user_badges")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
      ]);

      return {
        featuredScore: profileResult.data?.reputation_score || 0,
        income: balanceResult.data?.balance || 0,
        postsCount: postsResult.count || 0,
        videosCount: videosResult.count || 0,
        friendsCount: friendsResult.count || 0,
        nftCount: badgesResult.count || 0,
      };
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
}
