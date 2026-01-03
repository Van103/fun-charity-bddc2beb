import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Badge {
  id: string;
  badge_type: string;
  name: string;
  name_vi: string;
  description: string | null;
  description_vi: string | null;
  icon_url: string | null;
  points_required: number;
  is_nft: boolean;
  isEarned: boolean;
}

async function fetchBadges(): Promise<Badge[]> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch all badges
    const { data: badges, error } = await supabase
      .from("badges")
      .select("*")
      .order("points_required", { ascending: true });

    if (error) {
      console.error("Error fetching badges:", error);
      return [];
    }

    // Fetch user's earned badges if logged in
    let earnedBadgeIds: string[] = [];
    if (user) {
      const { data: userBadges } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", user.id);
      
      earnedBadgeIds = userBadges?.map(ub => ub.badge_id) || [];
    }

    return badges.map(badge => ({
      ...badge,
      isEarned: earnedBadgeIds.includes(badge.id),
    }));
  } catch (error) {
    console.error("Error in fetchBadges:", error);
    return [];
  }
}

export function useBadges() {
  return useQuery({
    queryKey: ["all-badges"],
    queryFn: fetchBadges,
    staleTime: 60000,
  });
}
