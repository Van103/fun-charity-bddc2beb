import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  verified?: boolean;
}

type LeaderboardType = 'posts' | 'donations' | 'friends' | 'coins';

async function fetchLeaderboard(type: LeaderboardType): Promise<LeaderboardUser[]> {
  const users: LeaderboardUser[] = [];

  switch (type) {
    case 'posts': {
      const { data, error } = await supabase
        .from('feed_posts')
        .select('user_id')
        .eq('moderation_status', 'approved');
      
      if (error) throw error;

      // Count posts per user
      const countMap: Record<string, number> = {};
      data?.forEach(post => {
        countMap[post.user_id] = (countMap[post.user_id] || 0) + 1;
      });

      // Sort and get top 50
      const sorted = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

      // Get profiles
      const userIds = sorted.map(([id]) => id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, is_verified')
        .in('user_id', userIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map(p => [p.user_id, p])
      );

      sorted.forEach(([userId, count], index) => {
        const profile = profileMap[userId];
        users.push({
          rank: index + 1,
          userId,
          name: profile?.full_name || 'Người dùng',
          avatar: profile?.avatar_url || undefined,
          score: count,
          verified: profile?.is_verified || false
        });
      });
      break;
    }

    case 'donations': {
      const { data, error } = await supabase
        .from('donations')
        .select('donor_id, amount')
        .eq('status', 'completed')
        .not('donor_id', 'is', null);

      if (error) throw error;

      // Sum donations per user
      const sumMap: Record<string, number> = {};
      data?.forEach(d => {
        if (d.donor_id) {
          sumMap[d.donor_id] = (sumMap[d.donor_id] || 0) + d.amount;
        }
      });

      // Sort and get top 50
      const sorted = Object.entries(sumMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

      // Get profiles
      const userIds = sorted.map(([id]) => id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, is_verified')
        .in('user_id', userIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map(p => [p.user_id, p])
      );

      sorted.forEach(([userId, amount], index) => {
        const profile = profileMap[userId];
        users.push({
          rank: index + 1,
          userId,
          name: profile?.full_name || 'Người dùng',
          avatar: profile?.avatar_url || undefined,
          score: amount,
          verified: profile?.is_verified || false
        });
      });
      break;
    }

    case 'friends': {
      const { data, error } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .eq('status', 'accepted');

      if (error) throw error;

      // Count friends per user
      const countMap: Record<string, number> = {};
      data?.forEach(f => {
        countMap[f.user_id] = (countMap[f.user_id] || 0) + 1;
        countMap[f.friend_id] = (countMap[f.friend_id] || 0) + 1;
      });

      // Sort and get top 50
      const sorted = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

      // Get profiles
      const userIds = sorted.map(([id]) => id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, is_verified')
        .in('user_id', userIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map(p => [p.user_id, p])
      );

      sorted.forEach(([userId, count], index) => {
        const profile = profileMap[userId];
        users.push({
          rank: index + 1,
          userId,
          name: profile?.full_name || 'Người dùng',
          avatar: profile?.avatar_url || undefined,
          score: count,
          verified: profile?.is_verified || false
        });
      });
      break;
    }

    case 'coins': {
      const { data, error } = await supabase
        .from('user_balances')
        .select('user_id, total_earned')
        .eq('currency', 'CAMLY')
        .order('total_earned', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get profiles
      const userIds = (data || []).map(b => b.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, is_verified')
        .in('user_id', userIds);

      const profileMap = Object.fromEntries(
        (profiles || []).map(p => [p.user_id, p])
      );

      data?.forEach((balance, index) => {
        const profile = profileMap[balance.user_id];
        users.push({
          rank: index + 1,
          userId: balance.user_id,
          name: profile?.full_name || 'Người dùng',
          avatar: profile?.avatar_url || undefined,
          score: balance.total_earned,
          verified: profile?.is_verified || false
        });
      });
      break;
    }
  }

  return users;
}

export function useLeaderboard(type: LeaderboardType) {
  return useQuery({
    queryKey: ['leaderboard', type],
    queryFn: () => fetchLeaderboard(type),
    staleTime: 60 * 1000, // 1 minute
  });
}

// Get score label based on type
export function getScoreLabel(type: LeaderboardType): string {
  switch (type) {
    case 'posts': return 'bài viết';
    case 'donations': return '₫';
    case 'friends': return 'bạn bè';
    case 'coins': return 'Camly';
  }
}

// Get score icon based on type
export function getScoreIcon(type: LeaderboardType): string {
  switch (type) {
    case 'posts': return '📝';
    case 'donations': return '💰';
    case 'friends': return '👥';
    case 'coins': return '🪙';
  }
}
