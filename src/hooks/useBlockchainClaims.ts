import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BlockchainClaim {
  id: string;
  user_id: string;
  wallet_address: string;
  points_claimed: number;
  tokens_minted: number;
  tx_hash: string | null;
  chain: string;
  status: string;
  signature: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export function useBlockchainClaims() {
  return useQuery({
    queryKey: ["blockchain-claims"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("blockchain_claims")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlockchainClaim[];
    },
  });
}

export function useClaimTokens() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletAddress,
      pointsClaimed,
      tokensMinted,
    }: {
      walletAddress: string;
      pointsClaimed: number;
      tokensMinted: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Call edge function to process claim
      const { data, error } = await supabase.functions.invoke("process-claim", {
        body: {
          wallet_address: walletAddress,
          points_claimed: pointsClaimed,
          tokens_minted: tokensMinted,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Claim failed");

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blockchain-claims"] });
      queryClient.invalidateQueries({ queryKey: ["user-balances"] });
      queryClient.invalidateQueries({ queryKey: ["reward-transactions"] });
      
      toast.success(`Đã claim thành công ${data.tokens_minted} FUN Token!`, {
        description: data.tx_hash ? `TX: ${data.tx_hash.slice(0, 10)}...` : undefined,
      });
    },
    onError: (error: Error) => {
      toast.error("Claim thất bại", {
        description: error.message,
      });
    },
  });
}

// Admin hook to view all claims
export function useAllBlockchainClaims() {
  return useQuery({
    queryKey: ["all-blockchain-claims"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blockchain_claims")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });
}
