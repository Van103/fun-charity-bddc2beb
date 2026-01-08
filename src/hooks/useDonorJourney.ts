import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DonorDonation {
  id: string;
  amount: number;
  currency: string;
  campaign_id: string;
  campaign_title: string;
  campaign_cover: string | null;
  status: string;
  message: string | null;
  is_anonymous: boolean;
  created_at: string;
  completed_at: string | null;
  tx_hash: string | null;
}

export interface DonorStats {
  totalDonated: number;
  totalCampaigns: number;
  totalDonations: number;
  firstDonation: string | null;
  largestDonation: number;
  currentStreak: number; // months in a row
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
}

export interface DonorMilestone {
  type: string;
  value: number;
  achievedAt: string;
  label: string;
  icon: string;
}

const getTier = (totalDonated: number): DonorStats["tier"] => {
  if (totalDonated >= 1_000_000_000) return "diamond"; // 1B+
  if (totalDonated >= 100_000_000) return "platinum"; // 100M+
  if (totalDonated >= 10_000_000) return "gold"; // 10M+
  if (totalDonated >= 1_000_000) return "silver"; // 1M+
  return "bronze";
};

const getMilestones = (donations: DonorDonation[], lang: string): DonorMilestone[] => {
  const milestones: DonorMilestone[] = [];
  
  if (donations.length === 0) return milestones;
  
  // First donation
  const firstDonation = donations[donations.length - 1];
  if (firstDonation) {
    milestones.push({
      type: "first_donation",
      value: firstDonation.amount,
      achievedAt: firstDonation.created_at,
      label: lang === "vi" ? "Lần đầu cho đi" : "First Donation",
      icon: "🌟",
    });
  }
  
  // Total milestones
  let runningTotal = 0;
  const totalMilestones = [1_000_000, 5_000_000, 10_000_000, 50_000_000, 100_000_000, 500_000_000, 1_000_000_000];
  const milestoneLabels: Record<number, { vi: string; en: string }> = {
    1_000_000: { vi: "1 Triệu VNĐ", en: "1M VND" },
    5_000_000: { vi: "5 Triệu VNĐ", en: "5M VND" },
    10_000_000: { vi: "10 Triệu VNĐ", en: "10M VND" },
    50_000_000: { vi: "50 Triệu VNĐ", en: "50M VND" },
    100_000_000: { vi: "100 Triệu VNĐ", en: "100M VND" },
    500_000_000: { vi: "500 Triệu VNĐ", en: "500M VND" },
    1_000_000_000: { vi: "1 Tỷ VNĐ", en: "1B VND" },
  };
  
  // Sort by date ascending
  const sortedDonations = [...donations].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  for (const donation of sortedDonations) {
    const prevTotal = runningTotal;
    runningTotal += donation.amount;
    
    for (const milestone of totalMilestones) {
      if (prevTotal < milestone && runningTotal >= milestone) {
        milestones.push({
          type: "total_milestone",
          value: milestone,
          achievedAt: donation.created_at,
          label: milestoneLabels[milestone][lang === "vi" ? "vi" : "en"],
          icon: milestone >= 100_000_000 ? "💎" : milestone >= 10_000_000 ? "🏆" : "⭐",
        });
      }
    }
  }
  
  // Donation count milestones
  const countMilestones = [5, 10, 25, 50, 100];
  for (const count of countMilestones) {
    if (donations.length >= count) {
      const donation = sortedDonations[count - 1];
      if (donation) {
        milestones.push({
          type: "count_milestone",
          value: count,
          achievedAt: donation.created_at,
          label: lang === "vi" ? `${count} lần đóng góp` : `${count} donations`,
          icon: count >= 50 ? "🎖️" : "🎯",
        });
      }
    }
  }
  
  // Sort milestones by date
  return milestones.sort(
    (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
  );
};

// Fetch donor's donation history
export function useDonorDonations(userId: string | undefined) {
  return useQuery({
    queryKey: ["donor-donations", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("donations")
        .select(`
          id,
          amount,
          currency,
          campaign_id,
          status,
          message,
          is_anonymous,
          created_at,
          completed_at,
          tx_hash,
          campaigns!inner (
            title,
            cover_image_url
          )
        `)
        .eq("donor_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map((d: any) => ({
        id: d.id,
        amount: d.amount,
        currency: d.currency,
        campaign_id: d.campaign_id,
        campaign_title: d.campaigns?.title || "Unknown Campaign",
        campaign_cover: d.campaigns?.cover_image_url,
        status: d.status,
        message: d.message,
        is_anonymous: d.is_anonymous,
        created_at: d.created_at,
        completed_at: d.completed_at,
        tx_hash: d.tx_hash,
      })) as DonorDonation[];
    },
    enabled: !!userId,
  });
}

// Calculate donor stats
export function useDonorStats(userId: string | undefined, lang: string = "vi") {
  const { data: donations = [], isLoading } = useDonorDonations(userId);
  
  const stats: DonorStats = {
    totalDonated: donations.reduce((sum, d) => sum + d.amount, 0),
    totalCampaigns: new Set(donations.map((d) => d.campaign_id)).size,
    totalDonations: donations.length,
    firstDonation: donations.length > 0 ? donations[donations.length - 1].created_at : null,
    largestDonation: donations.length > 0 ? Math.max(...donations.map((d) => d.amount)) : 0,
    currentStreak: 0, // TODO: Calculate streak
    tier: getTier(donations.reduce((sum, d) => sum + d.amount, 0)),
  };
  
  const milestones = getMilestones(donations, lang);
  
  return {
    stats,
    milestones,
    donations,
    isLoading,
  };
}
