import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HelpRequest {
  id: string;
  requester_id: string;
  title: string;
  description: string | null;
  category: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  volunteers_needed: number;
  volunteers_matched: number;
  skills_required: string[];
  scheduled_date: string | null;
  estimated_duration_hours: number;
  status: 'open' | 'matching' | 'in_progress' | 'completed' | 'cancelled';
  is_verified: boolean;
  contact_phone: string | null;
  contact_name: string | null;
  media_urls: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  requester?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface HelpRequestInput {
  title: string;
  description?: string | null;
  category: string;
  urgency?: 'critical' | 'high' | 'medium' | 'low';
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  volunteers_needed?: number;
  skills_required?: string[];
  scheduled_date?: string | null;
  estimated_duration_hours?: number;
  contact_phone?: string | null;
  contact_name?: string | null;
  media_urls?: string[];
}

export interface HelpRequestFilters {
  category?: string;
  urgency?: string;
  status?: string;
  search?: string;
}

export const CATEGORY_OPTIONS = [
  { id: 'education', labelVi: 'Giáo dục', labelEn: 'Education', icon: '📚', color: 'from-blue-500 to-cyan-500' },
  { id: 'healthcare', labelVi: 'Y tế', labelEn: 'Healthcare', icon: '🏥', color: 'from-red-500 to-pink-500' },
  { id: 'construction', labelVi: 'Xây dựng', labelEn: 'Construction', icon: '🏗️', color: 'from-orange-500 to-amber-500' },
  { id: 'food', labelVi: 'Thực phẩm', labelEn: 'Food', icon: '🍲', color: 'from-green-500 to-emerald-500' },
  { id: 'clothing', labelVi: 'Quần áo', labelEn: 'Clothing', icon: '👕', color: 'from-purple-500 to-violet-500' },
  { id: 'transport', labelVi: 'Vận chuyển', labelEn: 'Transport', icon: '🚗', color: 'from-indigo-500 to-blue-500' },
  { id: 'elderly_care', labelVi: 'Chăm sóc người già', labelEn: 'Elderly Care', icon: '👴', color: 'from-teal-500 to-cyan-500' },
  { id: 'child_care', labelVi: 'Chăm sóc trẻ em', labelEn: 'Child Care', icon: '👶', color: 'from-pink-500 to-rose-500' },
  { id: 'disaster_relief', labelVi: 'Cứu trợ thiên tai', labelEn: 'Disaster Relief', icon: '🆘', color: 'from-red-600 to-orange-500' },
  { id: 'environment', labelVi: 'Môi trường', labelEn: 'Environment', icon: '🌱', color: 'from-green-600 to-lime-500' },
  { id: 'other', labelVi: 'Khác', labelEn: 'Other', icon: '📋', color: 'from-gray-500 to-slate-500' },
];

export const URGENCY_OPTIONS = [
  { id: 'critical', labelVi: 'Khẩn cấp', labelEn: 'Critical', color: 'destructive' },
  { id: 'high', labelVi: 'Cao', labelEn: 'High', color: 'default' },
  { id: 'medium', labelVi: 'Trung bình', labelEn: 'Medium', color: 'secondary' },
  { id: 'low', labelVi: 'Thấp', labelEn: 'Low', color: 'outline' },
];

export const useHelpRequests = (filters?: HelpRequestFilters) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      let query = supabase
        .from('help_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.urgency) {
        query = query.eq('urgency', filters.urgency);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      } else {
        query = query.neq('status', 'cancelled');
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Fetch requester profiles
      const requesterIds = [...new Set(data?.map(r => r.requester_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', requesterIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      const enrichedRequests = (data || []).map(request => ({
        ...request,
        skills_required: request.skills_required || [],
        media_urls: (request.media_urls as string[]) || [],
        requester: profileMap.get(request.requester_id) || null,
      })) as HelpRequest[];

      setRequests(enrichedRequests);
    } catch (error) {
      console.error('Error fetching help requests:', error);
    } finally {
      setLoading(false);
    }
  }, [filters?.category, filters?.urgency, filters?.status, filters?.search]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('help_requests_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'help_requests' },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  const createRequest = async (input: HelpRequestInput) => {
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('help_requests')
        .insert({
          requester_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Thành công!',
        description: 'Yêu cầu trợ giúp đã được tạo.',
      });

      return data;
    } catch (error: any) {
      console.error('Error creating help request:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo yêu cầu.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: HelpRequest['status']) => {
    try {
      const { error } = await supabase
        .from('help_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev =>
        prev.map(r => (r.id === requestId ? { ...r, status } : r))
      );
    } catch (error: any) {
      console.error('Error updating request status:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái.',
        variant: 'destructive',
      });
    }
  };

  return {
    requests,
    loading,
    creating,
    createRequest,
    updateRequestStatus,
    refetch: fetchRequests,
  };
};
