import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PersonalStats {
  charityRank: number;
  totalCharityUsers: number;
  charityGiving: number;
  campaignCount: number;
  friendsCount: number;
  videosCount: number;
  nftCount: number;
  claimedAmount: number;
  totalReward: number;
}

export function usePersonalStats(userId: string | null) {
  return useQuery({
    queryKey: ["personal-stats", userId],
    queryFn: async (): Promise<PersonalStats> => {
      if (!userId) {
        return {
          charityRank: 0,
          totalCharityUsers: 0,
          charityGiving: 0,
          campaignCount: 0,
          friendsCount: 0,
          videosCount: 0,
          nftCount: 0,
          claimedAmount: 0,
          totalReward: 0,
        };
      }

      // Fetch all data in parallel
      const [
        donationsResult,
        totalDonorsResult,
        userDonationResult,
        campaignsResult,
        friendsResult,
        videosResult,
        badgesResult,
        balanceResult,
        rewardsResult,
      ] = await Promise.all([
        // Get user's donation rank (count how many users have more donations)
        supabase
          .from("donations")
          .select("donor_id, amount")
          .eq("status", "completed"),

        // Total donors count
        supabase
          .from("donations")
          .select("donor_id", { count: "exact", head: true })
          .eq("status", "completed"),

        // User's total donations
        supabase
          .from("donations")
          .select("amount")
          .eq("donor_id", userId)
          .eq("status", "completed"),

        // Campaign count for user
        supabase
          .from("campaigns")
          .select("id", { count: "exact", head: true })
          .eq("creator_id", userId),

        // Friends count
        supabase
          .from("friendships")
          .select("id", { count: "exact", head: true })
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
          .eq("status", "accepted"),

        // Videos count
        supabase
          .from("feed_posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_live_video", true),

        // NFT count (badges)
        supabase
          .from("user_badges")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),

        // Balance (claimed amount)
        supabase
          .from("user_balances")
          .select("balance, total_earned")
          .eq("user_id", userId)
          .eq("currency", "CAMLY")
          .maybeSingle(),

        // Total rewards earned
        supabase
          .from("reward_transactions")
          .select("amount")
          .eq("user_id", userId)
          .eq("status", "completed"),
      ]);

      // Calculate charity rank
      const donationsByUser = new Map<string, number>();
      donationsResult.data?.forEach((d) => {
        if (d.donor_id) {
          donationsByUser.set(
            d.donor_id,
            (donationsByUser.get(d.donor_id) || 0) + d.amount
          );
        }
      });
      
      const userTotal = donationsByUser.get(userId) || 0;
      const sortedDonations = Array.from(donationsByUser.values()).sort((a, b) => b - a);
      const charityRank = sortedDonations.findIndex((v) => v === userTotal) + 1 || sortedDonations.length + 1;
      const totalCharityUsers = Math.max(donationsByUser.size, 150);

      // Calculate user's total charity giving
      const charityGiving = userDonationResult.data?.reduce((sum, d) => sum + d.amount, 0) || 0;

      // Calculate total rewards
      const totalReward = rewardsResult.data?.reduce((sum, r) => sum + r.amount, 0) || 0;

      return {
        charityRank: charityRank || 0,
        totalCharityUsers,
        charityGiving,
        campaignCount: campaignsResult.count || 0,
        friendsCount: friendsResult.count || 0,
        videosCount: videosResult.count || 0,
        nftCount: badgesResult.count || 0,
        claimedAmount: balanceResult.data?.balance || 0,
        totalReward: (balanceResult.data?.total_earned || 0) + totalReward,
      };
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}