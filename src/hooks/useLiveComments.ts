import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LiveComment {
  id: string;
  live_id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  message: string;
  created_at: string;
}

interface UseLiveCommentsProps {
  liveId: string | null;
  enabled?: boolean;
}

export function useLiveComments({ liveId, enabled = true }: UseLiveCommentsProps) {
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing comments
  const fetchComments = useCallback(async () => {
    if (!liveId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('live_comments')
        .select('*')
        .eq('live_id', liveId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching live comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [liveId]);

  // Send a comment
  const sendComment = useCallback(async (message: string) => {
    if (!liveId || !message.trim()) return false;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Bạn cần đăng nhập để bình luận');
        return false;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', userData.user.id)
        .single();

      const { error } = await supabase
        .from('live_comments')
        .insert({
          live_id: liveId,
          user_id: userData.user.id,
          username: profile?.full_name || 'Người dùng',
          avatar_url: profile?.avatar_url,
          message: message.trim()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending comment:', error);
      toast.error('Không thể gửi bình luận');
      return false;
    }
  }, [liveId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!liveId || !enabled) return;

    // Fetch initial comments
    fetchComments();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`live-comments-${liveId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_comments',
          filter: `live_id=eq.${liveId}`
        },
        (payload) => {
          const newComment = payload.new as LiveComment;
          setComments(prev => [...prev.slice(-100), newComment]); // Keep last 100 comments
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'live_comments',
          filter: `live_id=eq.${liveId}`
        },
        (payload) => {
          const deletedId = (payload.old as LiveComment).id;
          setComments(prev => prev.filter(c => c.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [liveId, enabled, fetchComments]);

  // Clear comments (when live ends)
  const clearComments = useCallback(() => {
    setComments([]);
  }, []);

  return {
    comments,
    isLoading,
    sendComment,
    clearComments,
    refetch: fetchComments
  };
}
