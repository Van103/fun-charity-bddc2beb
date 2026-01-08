import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CharityRecipient {
  id: string;
  user_id: string | null;
  full_name: string;
  story: string | null;
  avatar_url: string | null;
  location: string | null;
  category: string;
  nft_token_id: string | null;
  nft_minted_at: string | null;
  wallet_address: string | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  total_received: number;
  donation_count: number;
  created_at: string;
  updated_at: string;
}

export interface RecipientDonation {
  id: string;
  recipient_id: string;
  donation_id: string | null;
  donor_id: string | null;
  donor_name: string | null;
  amount: number;
  currency: string;
  asset_type: string;
  asset_description: string | null;
  proof_media_urls: string[];
  tx_hash: string | null;
  message: string | null;
  received_at: string;
}

export interface RecipientAsset {
  id: string;
  recipient_id: string;
  asset_type: string;
  asset_name: string;
  asset_value: number | null;
  currency: string;
  description: string | null;
  proof_url: string | null;
  donor_id: string | null;
  donor_name: string | null;
  received_at: string;
}

// Fetch list of recipients
export function useRecipients(options?: { verified?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ["recipients", options?.verified, options?.limit],
    queryFn: async () => {
      let query = supabase
        .from("charity_recipients")
        .select("*")
        .order("total_received", { ascending: false });

      if (options?.verified !== undefined) {
        query = query.eq("is_verified", options.verified);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CharityRecipient[];
    },
  });
}

// Fetch single recipient detail
export function useRecipientDetail(recipientId: string | undefined) {
  return useQuery({
    queryKey: ["recipient", recipientId],
    queryFn: async () => {
      if (!recipientId) return null;
      
      const { data, error } = await supabase
        .from("charity_recipients")
        .select("*")
        .eq("id", recipientId)
        .single();

      if (error) throw error;
      return data as CharityRecipient;
    },
    enabled: !!recipientId,
  });
}

// Fetch recipient's donation history
export function useRecipientDonations(recipientId: string | undefined) {
  return useQuery({
    queryKey: ["recipient-donations", recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      
      const { data, error } = await supabase
        .from("recipient_donations")
        .select("*")
        .eq("recipient_id", recipientId)
        .order("received_at", { ascending: false });

      if (error) throw error;
      return data as RecipientDonation[];
    },
    enabled: !!recipientId,
  });
}

// Fetch recipient's assets
export function useRecipientAssets(recipientId: string | undefined) {
  return useQuery({
    queryKey: ["recipient-assets", recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      
      const { data, error } = await supabase
        .from("recipient_assets")
        .select("*")
        .eq("recipient_id", recipientId)
        .order("received_at", { ascending: false });

      if (error) throw error;
      return data as RecipientAsset[];
    },
    enabled: !!recipientId,
  });
}

// Get top recipients for honor board
export function useTopRecipients(limit: number = 10) {
  return useQuery({
    queryKey: ["top-recipients", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("charity_recipients")
        .select("*")
        .eq("is_verified", true)
        .order("total_received", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as CharityRecipient[];
    },
  });
}
