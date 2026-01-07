import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ManualReward {
  id: string;
  granted_by: string;
  granted_to: string;
  currency: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface RewardAnalytics {
  totalUsers: number;
  totalRewardsDistributed: number;
  activeConfigs: number;
  recentTransactions: number;
  todayRewards: number;
}

export function useRewardAnalytics() {
  return useQuery({
    queryKey: ["reward-analytics"],
    queryFn: async () => {
      const [usersRes, balancesRes, configsRes, transactionsRes, todayRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("user_balances").select("total_earned").eq("currency", "CAMLY"),
        supabase.from("reward_config").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("reward_transactions").select("*", { count: "exact", head: true }),
        supabase.from("reward_transactions")
          .select("amount")
          .gte("created_at", new Date().toISOString().split("T")[0]),
      ]);

      const totalRewards = balancesRes.data?.reduce((sum, b) => sum + (b.total_earned || 0), 0) || 0;
      const todayRewards = todayRes.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      return {
        totalUsers: usersRes.count || 0,
        totalRewardsDistributed: totalRewards,
        activeConfigs: configsRes.count || 0,
        recentTransactions: transactionsRes.count || 0,
        todayRewards,
      } as RewardAnalytics;
    },
    staleTime: 30000,
  });
}

export function useManualRewards() {
  return useQuery({
    queryKey: ["manual-rewards"],
    queryFn: async () => {
      // Use raw SQL query since manual_rewards is a new table
      const { data, error } = await supabase
        .from("manual_rewards" as "profiles") // Type workaround for new table
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as unknown as ManualReward[];
    },
  });
}

export function useGrantReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      amount,
      currency = "CAMLY",
      reason,
    }: {
      userId: string;
      amount: number;
      currency?: string;
      reason: string;
    }) => {
      // Call the RPC function using raw fetch
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/admin_grant_reward`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            p_user_id: userId,
            p_amount: amount,
            p_currency: currency,
            p_reason: reason,
          }),
        }
      );
      
      if (!response.ok) throw new Error("Failed to grant reward");
      const data = await response.json();

      if (error) throw error;
      return data as { success: boolean; message: string; transaction_id?: string };
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Phần thưởng đã được trao thành công!");
        queryClient.invalidateQueries({ queryKey: ["reward-analytics"] });
        queryClient.invalidateQueries({ queryKey: ["manual-rewards"] });
        queryClient.invalidateQueries({ queryKey: ["all-transactions"] });
      } else {
        toast.error(data?.message || "Có lỗi xảy ra");
      }
    },
    onError: (err: Error) => {
      toast.error("Lỗi: " + err.message);
    },
  });
}

export function useAllTransactions(limit = 100) {
  return useQuery({
    queryKey: ["all-transactions", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

export function useAllUsers(searchQuery = "") {
  return useQuery({
    queryKey: ["all-users", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (searchQuery) {
        query = query.ilike("full_name", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 30000,
  });
}

export function useUserBalances(userId: string) {
  return useQuery({
    queryKey: ["user-balances-admin", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_balances")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUserTransactions(userId: string) {
  return useQuery({
    queryKey: ["user-transactions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
