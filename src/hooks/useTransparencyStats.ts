import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TransparencyStats {
  totalDonated: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalDonors: number;
  totalRecipients: number;
  totalVolunteers: number;
  averageDonation: number;
  completedCampaigns: number;
  totalHoursVolunteered: number;
}

export function useTransparencyStats() {
  return useQuery({
    queryKey: ["transparency-stats"],
    queryFn: async (): Promise<TransparencyStats> => {
      // Fetch donations stats
      const { data: donations } = await supabase
        .from("donations")
        .select("amount, donor_id")
        .eq("status", "completed");

      const totalDonated = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
      const uniqueDonors = new Set(donations?.map(d => d.donor_id).filter(Boolean)).size;
      const averageDonation = donations?.length ? totalDonated / donations.length : 0;

      // Fetch campaigns stats
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, status");

      const totalCampaigns = campaigns?.length || 0;
      const activeCampaigns = campaigns?.filter(c => c.status === "active").length || 0;
      const completedCampaigns = campaigns?.filter(c => c.status === "completed").length || 0;

      // Fetch volunteer stats
      const { data: volunteers } = await supabase
        .from("profiles")
        .select("id")
        .not("reputation_score", "is", null);

      // Fetch volunteer hours from leaderboard
      const { data: volunteerHours } = await supabase
        .from("leaderboard_cache")
        .select("score")
        .eq("leaderboard_type", "volunteer_hours");

      const totalHoursVolunteered = volunteerHours?.reduce((sum, v) => sum + (v.score || 0), 0) || 0;

      // Get recipients count (users who received donations via campaigns)
      const { data: recipientCampaigns } = await supabase
        .from("campaigns")
        .select("creator_id")
        .in("status", ["active", "completed"]);

      const totalRecipients = new Set(recipientCampaigns?.map(c => c.creator_id)).size;

      return {
        totalDonated,
        totalCampaigns,
        activeCampaigns,
        totalDonors: uniqueDonors,
        totalRecipients,
        totalVolunteers: volunteers?.length || 0,
        averageDonation,
        completedCampaigns,
        totalHoursVolunteered,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
