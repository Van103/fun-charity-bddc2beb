import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface RewardConfig {
  id: string;
  action_type: string;
  reward_amount: number;
  reward_currency: string;
  reward_percentage: number | null;
  max_per_day: number | null;
  min_threshold: number | null;
  is_active: boolean | null;
  bonus_conditions: Json | null;
  display_name: string | null;
  display_name_vi: string | null;
  icon_name: string | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useRewardConfig() {
  return useQuery({
    queryKey: ["reward-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_config")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as unknown as RewardConfig[];
    },
    staleTime: 60000,
  });
}

export function useUpdateRewardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<RewardConfig> & { id: string }) => {
      const { id, ...updates } = config;
      const { data, error } = await supabase
        .from("reward_config")
        .update({ ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reward-config"] });
    },
  });
}

export function useCreateRewardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<RewardConfig>) => {
      const insertData = {
        action_type: config.action_type || "custom",
        reward_amount: config.reward_amount || 0,
        reward_currency: config.reward_currency || "CAMLY",
        is_active: config.is_active ?? true,
        display_name: config.display_name,
        display_name_vi: config.display_name_vi,
        icon_name: config.icon_name,
        sort_order: config.sort_order,
      };
      
      const { data, error } = await supabase
        .from("reward_config")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reward-config"] });
    },
  });
}

export function useDeleteRewardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reward_config")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reward-config"] });
    },
  });
}
