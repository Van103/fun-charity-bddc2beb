import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VolunteerProfile {
  id: string;
  user_id: string;
  skills: string[];
  availability: {
    weekdays: string[];
    timeSlots: string[];
  };
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  service_radius_km: number;
  experience_level: 'beginner' | 'intermediate' | 'expert';
  certifications: string[];
  total_hours: number;
  completed_tasks: number;
  rating: number;
  rating_count: number;
  is_available: boolean;
  bio: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface VolunteerProfileInput {
  skills?: string[];
  availability?: {
    weekdays: string[];
    timeSlots: string[];
  };
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  service_radius_km?: number;
  experience_level?: 'beginner' | 'intermediate' | 'expert';
  certifications?: string[];
  is_available?: boolean;
  bio?: string | null;
  phone?: string | null;
}

export const SKILL_OPTIONS = [
  { id: 'education', labelVi: 'Giáo dục', labelEn: 'Education', icon: '📚' },
  { id: 'healthcare', labelVi: 'Y tế', labelEn: 'Healthcare', icon: '🏥' },
  { id: 'construction', labelVi: 'Xây dựng', labelEn: 'Construction', icon: '🏗️' },
  { id: 'food', labelVi: 'Thực phẩm', labelEn: 'Food', icon: '🍲' },
  { id: 'clothing', labelVi: 'Quần áo', labelEn: 'Clothing', icon: '👕' },
  { id: 'transport', labelVi: 'Vận chuyển', labelEn: 'Transport', icon: '🚗' },
  { id: 'elderly_care', labelVi: 'Chăm sóc người già', labelEn: 'Elderly Care', icon: '👴' },
  { id: 'child_care', labelVi: 'Chăm sóc trẻ em', labelEn: 'Child Care', icon: '👶' },
  { id: 'disaster_relief', labelVi: 'Cứu trợ thiên tai', labelEn: 'Disaster Relief', icon: '🆘' },
  { id: 'environment', labelVi: 'Môi trường', labelEn: 'Environment', icon: '🌱' },
  { id: 'technology', labelVi: 'Công nghệ', labelEn: 'Technology', icon: '💻' },
  { id: 'counseling', labelVi: 'Tư vấn', labelEn: 'Counseling', icon: '💬' },
];

export const WEEKDAY_OPTIONS = [
  { id: 'mon', labelVi: 'Thứ 2', labelEn: 'Monday' },
  { id: 'tue', labelVi: 'Thứ 3', labelEn: 'Tuesday' },
  { id: 'wed', labelVi: 'Thứ 4', labelEn: 'Wednesday' },
  { id: 'thu', labelVi: 'Thứ 5', labelEn: 'Thursday' },
  { id: 'fri', labelVi: 'Thứ 6', labelEn: 'Friday' },
  { id: 'sat', labelVi: 'Thứ 7', labelEn: 'Saturday' },
  { id: 'sun', labelVi: 'Chủ nhật', labelEn: 'Sunday' },
];

export const TIME_SLOT_OPTIONS = [
  { id: 'morning', labelVi: 'Sáng (6h-12h)', labelEn: 'Morning (6AM-12PM)' },
  { id: 'afternoon', labelVi: 'Chiều (12h-18h)', labelEn: 'Afternoon (12PM-6PM)' },
  { id: 'evening', labelVi: 'Tối (18h-22h)', labelEn: 'Evening (6PM-10PM)' },
];

export const useVolunteerProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching volunteer profile:', error);
      }

      if (data) {
        setProfile({
          ...data,
          availability: data.availability as { weekdays: string[]; timeSlots: string[] },
        } as VolunteerProfile);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const createOrUpdateProfile = async (input: VolunteerProfileInput) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const profileData = {
        user_id: user.id,
        ...input,
      };

      const { data, error } = await supabase
        .from('volunteer_profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setProfile({
        ...data,
        availability: data.availability as { weekdays: string[]; timeSlots: string[] },
      } as VolunteerProfile);

      toast({
        title: 'Thành công!',
        description: 'Hồ sơ tình nguyện viên đã được cập nhật.',
      });

      return data;
    } catch (error: any) {
      console.error('Error saving volunteer profile:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể lưu hồ sơ.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async () => {
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('volunteer_profiles')
        .update({ is_available: !profile.is_available })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, is_available: !profile.is_available });
    } catch (error: any) {
      console.error('Error toggling availability:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái.',
        variant: 'destructive',
      });
    }
  };

  return {
    profile,
    loading,
    saving,
    createOrUpdateProfile,
    toggleAvailability,
    refetch: fetchProfile,
  };
};
