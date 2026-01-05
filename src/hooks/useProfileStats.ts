import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileStats {
  postsCount: number;
  income: number;
  videosCount: number;
  friendsCount: number;
  totalReward: number;
  textPostsCount: number;
}

async function fetchProfileStats(userId: string): Promise<ProfileStats> {
  // Fetch all stats in parallel
  const [
    postsResult,
    videosResult,
    friendsResult,
    balanceResult,
    textPostsResult,
  ] = await Promise.all([
    // Total posts count
    supabase
      .from("feed_posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    
    // Videos count (posts with video in media_urls)
    supabase
      .from("feed_posts")
      .select("id, media_urls")
      .eq("user_id", userId),
    
    // Friends count
    supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq("status", "accepted"),
    
    // User balance (total earned as income and total reward)
    supabase
      .from("user_balances")
      .select("balance, total_earned, total_withdrawn")
      .eq("user_id", userId)
      .maybeSingle(),
    
    // Text posts count (posts without media)
    supabase
      .from("feed_posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("media_urls", null),
  ]);

  // Calculate videos count from media_urls
  let videosCount = 0;
  if (videosResult.data) {
    videosCount = videosResult.data.filter(post => {
      if (!post.media_urls) return false;
      const urls = Array.isArray(post.media_urls) ? post.media_urls : [];
      return urls.some((url: string) => 
        typeof url === 'string' && (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov'))
      );
    }).length;
  }

  return {
    postsCount: postsResult.count || 0,
    income: balanceResult.data?.total_earned || 0,
    videosCount,
    friendsCount: friendsResult.count || 0,
    totalReward: balanceResult.data?.balance || 0,
    textPostsCount: textPostsResult.count || 0,
  };
}

export function useProfileStats(userId: string | null) {
  return useQuery({
    queryKey: ["profile-stats", userId],
    queryFn: () => fetchProfileStats(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });
}
