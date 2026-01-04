import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PendingPost {
  id: string;
  user_id: string;
  post_type: string;
  title: string | null;
  content: string | null;
  media_urls: string[];
  location: string | null;
  moderation_status: string;
  moderation_note: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean | null;
  };
}

export function usePendingPosts() {
  return useQuery({
    queryKey: ["pending-posts"],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("feed_posts")
        .select("*")
        .eq("moderation_status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each post
      const postsWithProfiles = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, is_verified")
            .eq("user_id", post.user_id)
            .maybeSingle();

          return {
            ...post,
            media_urls: (post.media_urls as string[]) || [],
            profiles: profile || undefined,
          } as PendingPost;
        })
      );

      return postsWithProfiles;
    },
  });
}

export function useApprovePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update post status
      const { error: updateError } = await supabase
        .from("feed_posts")
        .update({
          moderation_status: "approved",
          moderated_by: user.id,
          moderated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      if (updateError) throw updateError;

      // Get post owner to send notification
      const { data: post } = await supabase
        .from("feed_posts")
        .select("user_id, title, content")
        .eq("id", postId)
        .single();

      if (post) {
        // Create notification for post owner
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          type: "campaign_approved" as any, // Using existing type as fallback
          title: "Bài viết đã được duyệt",
          message: `Bài viết "${post.title || post.content?.slice(0, 50) || "của bạn"}" đã được duyệt và hiển thị trên bảng tin.`,
          data: { post_id: postId },
        });
      }

      return postId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts-infinite"] });
      toast({
        title: "Đã duyệt bài viết",
        description: "Bài viết đã được hiển thị trên bảng tin",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRejectPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, reason }: { postId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update post status
      const { error: updateError } = await supabase
        .from("feed_posts")
        .update({
          moderation_status: "rejected",
          moderation_note: reason,
          moderated_by: user.id,
          moderated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      if (updateError) throw updateError;

      // Get post owner to send notification
      const { data: post } = await supabase
        .from("feed_posts")
        .select("user_id, title, content")
        .eq("id", postId)
        .single();

      if (post) {
        // Create notification for post owner
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          type: "campaign_rejected" as any, // Using existing type as fallback
          title: "Bài viết không được duyệt",
          message: `Bài viết "${post.title || post.content?.slice(0, 50) || "của bạn"}" không được duyệt. Lý do: ${reason}`,
          data: { post_id: postId, reason },
        });
      }

      return postId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-posts"] });
      toast({
        title: "Đã từ chối bài viết",
        description: "Người dùng sẽ được thông báo",
      });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useModerationStats() {
  return useQuery({
    queryKey: ["moderation-stats"],
    queryFn: async () => {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        supabase
          .from("feed_posts")
          .select("id", { count: "exact" })
          .eq("moderation_status", "pending"),
        supabase
          .from("feed_posts")
          .select("id", { count: "exact" })
          .eq("moderation_status", "approved"),
        supabase
          .from("feed_posts")
          .select("id", { count: "exact" })
          .eq("moderation_status", "rejected"),
      ]);

      return {
        pending: pendingRes.count || 0,
        approved: approvedRes.count || 0,
        rejected: rejectedRes.count || 0,
      };
    },
  });
}
