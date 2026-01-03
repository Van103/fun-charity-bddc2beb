import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const playNotificationSound = () => {
  try {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch {}
};

const formatCurrency = (amount: number, currency: string = "VND") => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function useRealtimeRankingUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to donation changes for ranking updates
    const donationChannel = supabase
      .channel("ranking-donations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "donations",
        },
        async (payload) => {
          const donation = payload.new as any;
          
          if (donation.status === "completed") {
            // Invalidate ranking queries
            queryClient.invalidateQueries({ queryKey: ["top-rankers"] });
            queryClient.invalidateQueries({ queryKey: ["honor-stats"] });

            // Fetch donor and campaign info for toast
            const [campaignRes, donorRes] = await Promise.all([
              supabase.from("campaigns").select("title").eq("id", donation.campaign_id).single(),
              donation.is_anonymous ? null : supabase.from("profiles").select("full_name").eq("user_id", donation.donor_id).single()
            ]);

            const donorName = donation.is_anonymous ? "Người ủng hộ ẩn danh" : (donorRes?.data?.full_name || "Ai đó");
            const campaignTitle = campaignRes?.data?.title || "chiến dịch";

            playNotificationSound();
            toast.success(
              `🎉 ${donorName} vừa quyên góp ${formatCurrency(donation.amount, donation.currency)}`,
              {
                description: `Cho "${campaignTitle}" - Bảng xếp hạng đã cập nhật!`,
                duration: 5000,
              }
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "donations",
        },
        async (payload) => {
          const donation = payload.new as any;
          const oldDonation = payload.old as any;

          // Only trigger when status changes to completed
          if (oldDonation.status !== "completed" && donation.status === "completed") {
            queryClient.invalidateQueries({ queryKey: ["top-rankers"] });
            queryClient.invalidateQueries({ queryKey: ["honor-stats"] });

            const [campaignRes, donorRes] = await Promise.all([
              supabase.from("campaigns").select("title").eq("id", donation.campaign_id).single(),
              donation.is_anonymous ? null : supabase.from("profiles").select("full_name").eq("user_id", donation.donor_id).single()
            ]);

            const donorName = donation.is_anonymous ? "Người ủng hộ ẩn danh" : (donorRes?.data?.full_name || "Ai đó");
            const campaignTitle = campaignRes?.data?.title || "chiến dịch";

            playNotificationSound();
            toast.success(
              `🎉 ${donorName} vừa quyên góp ${formatCurrency(donation.amount, donation.currency)}`,
              {
                description: `Cho "${campaignTitle}" - Bảng xếp hạng đã cập nhật!`,
                duration: 5000,
              }
            );
          }
        }
      )
      .subscribe();

    // Subscribe to reputation events for volunteer activity
    const reputationChannel = supabase
      .channel("ranking-reputation")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reputation_events",
        },
        async (payload) => {
          const event = payload.new as any;

          // Invalidate volunteer ranking
          queryClient.invalidateQueries({ queryKey: ["volunteer-ranking"] });
          queryClient.invalidateQueries({ queryKey: ["honor-stats"] });

          // Fetch user info
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", event.user_id)
            .single();

          const userName = profile?.full_name || "Tình nguyện viên";

          if (event.event_type === "volunteer_activity") {
            playNotificationSound();
            toast.info(
              `⭐ ${userName} đã ghi nhận hoạt động tình nguyện`,
              {
                description: `+${event.points} điểm - Bảng xếp hạng đã cập nhật!`,
                duration: 4000,
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(donationChannel);
      supabase.removeChannel(reputationChannel);
    };
  }, [queryClient]);
}
