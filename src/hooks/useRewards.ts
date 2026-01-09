import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserBalance {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  action_type: string;
  currency: string;
  amount: number;
  reference_id: string | null;
  reference_type: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  uses_count: number;
  total_earned: number;
  is_active: boolean;
}

// Hook để lấy số dư của user
export function useUserBalances() {
  return useQuery({
    queryKey: ['user-balances'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []) as UserBalance[];
    },
  });
}

// Hook để lấy lịch sử giao dịch thưởng
export function useRewardTransactions(limit = 20) {
  return useQuery({
    queryKey: ['reward-transactions', limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('reward_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as RewardTransaction[];
    },
  });
}

// Hook để lấy mã giới thiệu
export function useReferralCode() {
  return useQuery({
    queryKey: ['referral-code'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as ReferralCode | null;
    },
  });
}

// Hook để lắng nghe realtime reward notifications
export function useRewardNotifications(onReward: (transaction: RewardTransaction) => void) {
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('reward-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'reward_transactions',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            onReward(payload.new as RewardTransaction);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [onReward]);
}

// Hook để sử dụng mã giới thiệu khi đăng ký
export function useApplyReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Tìm mã referral (case-insensitive)
      const { data: referralCode, error: findError } = await supabase
        .from('referral_codes')
        .select('*')
        .ilike('code', code.trim())
        .eq('is_active', true)
        .single();

      if (findError || !referralCode) {
        throw new Error('Mã giới thiệu không hợp lệ');
      }

      // Kiểm tra user đã sử dụng mã chưa
      const { data: existingUse } = await supabase
        .from('referral_uses')
        .select('id')
        .eq('referred_user_id', user.id)
        .single();

      if (existingUse) {
        throw new Error('Bạn đã sử dụng mã giới thiệu rồi');
      }

      // Ghi nhận sử dụng mã
      const { error: useError } = await supabase
        .from('referral_uses')
        .insert({
          referral_code_id: referralCode.id,
          referred_user_id: user.id,
        });

      if (useError) throw useError;

      return referralCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-balances'] });
      queryClient.invalidateQueries({ queryKey: ['reward-transactions'] });
    },
  });
}

// Hàm format currency
export function formatCurrency(amount: number, currency: string): string {
  switch (currency) {
    case 'CAMLY':
      return `${amount.toLocaleString()} Camly`;
    case 'VND':
      return `${amount.toLocaleString()} ₫`;
    case 'BTC':
      return `${amount.toFixed(8)} BTC`;
    case 'USDT':
      return `${amount.toFixed(2)} USDT`;
    case 'BNB':
      return `${amount.toFixed(6)} BNB`;
    default:
      return `${amount.toLocaleString()} ${currency}`;
  }
}

// Hàm lấy icon currency
export function getCurrencyIcon(currency: string): string {
  switch (currency) {
    case 'CAMLY':
      return '🪙';
    case 'VND':
      return '₫';
    case 'BTC':
      return '₿';
    case 'USDT':
      return '💵';
    case 'BNB':
      return '🔶';
    default:
      return '💰';
  }
}

// Hàm lấy tên action
export function getActionName(actionType: string): string {
  switch (actionType) {
    case 'signup':
      return 'Đăng ký tài khoản';
    case 'post':
      return 'Đăng bài viết';
    case 'donation':
      return 'Quyên góp';
    case 'referral':
      return 'Mời bạn bè';
    case 'referred':
      return 'Được giới thiệu';
    default:
      return actionType;
  }
}
