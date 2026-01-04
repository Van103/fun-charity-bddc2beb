import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VolunteerMatch {
  id: string;
  request_id: string;
  volunteer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  match_score: number;
  matched_at: string;
  accepted_at: string | null;
  checked_in_at: string | null;
  checked_out_at: string | null;
  hours_logged: number;
  volunteer_rating: number | null;
  volunteer_feedback: string | null;
  requester_rating: number | null;
  requester_feedback: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  help_request?: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    urgency: string;
    location_name: string | null;
    scheduled_date: string | null;
    estimated_duration_hours: number;
    requester_id: string;
    contact_name: string | null;
    contact_phone: string | null;
  };
  volunteer?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  requester?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useVolunteerMatches = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<VolunteerMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch matches where user is volunteer
      const { data: volunteerMatches, error: volunteerError } = await supabase
        .from('volunteer_matches')
        .select('*')
        .eq('volunteer_id', user.id)
        .order('created_at', { ascending: false });

      if (volunteerError) throw volunteerError;

      // Fetch matches where user is requester
      const { data: userRequests } = await supabase
        .from('help_requests')
        .select('id')
        .eq('requester_id', user.id);

      const requestIds = userRequests?.map(r => r.id) || [];
      
      let requesterMatches: any[] = [];
      if (requestIds.length > 0) {
        const { data } = await supabase
          .from('volunteer_matches')
          .select('*')
          .in('request_id', requestIds)
          .order('created_at', { ascending: false });
        requesterMatches = data || [];
      }

      // Combine and deduplicate
      const allMatches = [...(volunteerMatches || []), ...requesterMatches];
      const uniqueMatches = Array.from(
        new Map(allMatches.map(m => [m.id, m])).values()
      );

      // Fetch related data
      const matchRequestIds = [...new Set(uniqueMatches.map(m => m.request_id))];
      const volunteerIds = [...new Set(uniqueMatches.map(m => m.volunteer_id))];

      const [requestsResult, profilesResult] = await Promise.all([
        supabase
          .from('help_requests')
          .select('id, title, description, category, urgency, location_name, scheduled_date, estimated_duration_hours, requester_id, contact_name, contact_phone')
          .in('id', matchRequestIds),
        supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', volunteerIds),
      ]);

      const requestMap = new Map(requestsResult.data?.map(r => [r.id, r]));
      const profileMap = new Map(profilesResult.data?.map(p => [p.user_id, p]));

      // Fetch requester profiles
      const requesterIds = [...new Set(requestsResult.data?.map(r => r.requester_id) || [])];
      const { data: requesterProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', requesterIds);
      const requesterProfileMap = new Map(requesterProfiles?.map(p => [p.user_id, p]));

      const enrichedMatches = uniqueMatches.map(match => {
        const request = requestMap.get(match.request_id);
        return {
          ...match,
          help_request: request || null,
          volunteer: profileMap.get(match.volunteer_id) || null,
          requester: request ? requesterProfileMap.get(request.requester_id) : null,
        };
      }) as VolunteerMatch[];

      setMatches(enrichedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('volunteer_matches_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'volunteer_matches' },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMatches]);

  const updateMatchStatus = async (matchId: string, status: VolunteerMatch['status']) => {
    try {
      const updates: any = { status };
      if (status === 'accepted') {
        updates.accepted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('volunteer_matches')
        .update(updates)
        .eq('id', matchId);

      if (error) throw error;

      setMatches(prev =>
        prev.map(m => (m.id === matchId ? { ...m, ...updates } : m))
      );

      toast({
        title: 'Thành công!',
        description: status === 'accepted' ? 'Đã chấp nhận nhiệm vụ.' : 'Đã cập nhật trạng thái.',
      });
    } catch (error: any) {
      console.error('Error updating match status:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật.',
        variant: 'destructive',
      });
    }
  };

  const checkIn = async (matchId: string) => {
    try {
      const { error } = await supabase
        .from('volunteer_matches')
        .update({
          checked_in_at: new Date().toISOString(),
          status: 'accepted',
        })
        .eq('id', matchId);

      if (error) throw error;

      await fetchMatches();

      toast({
        title: 'Check-in thành công!',
        description: 'Bạn đã bắt đầu nhiệm vụ.',
      });
    } catch (error: any) {
      console.error('Error checking in:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể check-in.',
        variant: 'destructive',
      });
    }
  };

  const checkOut = async (matchId: string) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match?.checked_in_at) return;

      const checkedIn = new Date(match.checked_in_at);
      const checkedOut = new Date();
      const hoursLogged = (checkedOut.getTime() - checkedIn.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('volunteer_matches')
        .update({
          checked_out_at: checkedOut.toISOString(),
          hours_logged: Math.round(hoursLogged * 100) / 100,
          status: 'completed',
        })
        .eq('id', matchId);

      if (error) throw error;

      // Award reputation points via edge function or direct update
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const points = Math.max(10, Math.round(hoursLogged * 10));
        
        // Update volunteer profile stats
        await supabase
          .from('volunteer_profiles')
          .update({
            total_hours: match.hours_logged + hoursLogged,
            completed_tasks: (match as any).volunteer_profile?.completed_tasks ? (match as any).volunteer_profile.completed_tasks + 1 : 1,
          })
          .eq('user_id', user.id);

        // Update profile reputation score
        await supabase
          .from('profiles')
          .update({
            reputation_score: supabase.rpc ? points : points, // Will add to existing via trigger if available
          })
          .eq('user_id', user.id);
      }

      await fetchMatches();

      toast({
        title: 'Hoàn thành!',
        description: `Bạn đã hoàn thành nhiệm vụ. Thời gian: ${hoursLogged.toFixed(1)} giờ.`,
      });
    } catch (error: any) {
      console.error('Error checking out:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể check-out.',
        variant: 'destructive',
      });
    }
  };

  const submitRating = async (
    matchId: string,
    rating: number,
    feedback: string,
    isVolunteer: boolean
  ) => {
    try {
      const updates = isVolunteer
        ? { requester_rating: rating, requester_feedback: feedback }
        : { volunteer_rating: rating, volunteer_feedback: feedback };

      const { error } = await supabase
        .from('volunteer_matches')
        .update(updates)
        .eq('id', matchId);

      if (error) throw error;

      await fetchMatches();

      toast({
        title: 'Cảm ơn!',
        description: 'Đánh giá của bạn đã được ghi nhận.',
      });
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi đánh giá.',
        variant: 'destructive',
      });
    }
  };

  return {
    matches,
    loading,
    updateMatchStatus,
    checkIn,
    checkOut,
    submitRating,
    refetch: fetchMatches,
  };
};
