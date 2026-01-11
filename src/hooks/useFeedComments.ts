import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface FeedComment {
  id: string;
  feed_post_id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  parent_comment_id: string | null;
  created_at: string;
  // Joined data
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean | null;
  };
  replies?: FeedComment[];
}

export function useFeedComments(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // Fetch comments for the post
  const commentsQuery = useQuery({
    queryKey: ["feed-comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_comments")
        .select("*")
        .eq("feed_post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles for all comments
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, is_verified")
        .in("user_id", userIds);

      const profilesMap = new Map(
        profiles?.map((p) => [p.user_id, p]) || []
      );

      // Build comment tree with replies
      const commentsWithProfiles = data.map((comment) => ({
        ...comment,
        profiles: profilesMap.get(comment.user_id) || undefined,
        replies: [] as FeedComment[],
      }));

      // Separate parent comments and replies
      const parentComments: FeedComment[] = [];
      const replies: FeedComment[] = [];

      commentsWithProfiles.forEach((comment) => {
        if (comment.parent_comment_id) {
          replies.push(comment);
        } else {
          parentComments.push(comment);
        }
      });

      // Attach replies to parent comments
      replies.forEach((reply) => {
        const parent = parentComments.find(
          (c) => c.id === reply.parent_comment_id
        );
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(reply);
        }
      });

      return parentComments;
    },
  });

  // Add comment mutation with AI moderation
  const addComment = useMutation({
    mutationFn: async ({
      content,
      parentCommentId,
      imageUrl,
    }: {
      content: string;
      parentCommentId?: string;
      imageUrl?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // AI Content Moderation for comments (with timeout and fallback)
      try {
        const moderationPayload: { text?: string; imageUrls?: string[]; userId: string } = {
          userId: user.user.id,
        };

        if (content?.trim()) {
          moderationPayload.text = content;
        }

        if (imageUrl) {
          moderationPayload.imageUrls = [imageUrl];
        }

        // Add timeout to prevent hanging if moderation service is slow
        const moderationPromise = supabase.functions.invoke(
          'content-moderation',
          { body: moderationPayload }
        );

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Moderation timeout')), 5000)
        );

        const { data: moderationResult, error: moderationError } = await Promise.race([
          moderationPromise,
          timeoutPromise.then(() => ({ data: null, error: { message: 'timeout' } }))
        ]) as { data: any; error: any };

        if (moderationError) {
          console.warn('Moderation skipped due to error/timeout:', moderationError);
          // Continue posting if moderation fails or times out
        } else if (moderationResult) {
          const decision = moderationResult.decision || 'SAFE';

          if (decision === 'HARD_VIOLATION') {
            throw new Error(
              moderationResult.reason || 
              'Bình luận vi phạm quy định cộng đồng. Vui lòng chỉnh sửa nội dung.'
            );
          }

          if (decision === 'SOFT_VIOLATION') {
            // Show warning but allow posting
            toast({
              title: "⚠️ Lưu ý nhẹ",
              description: moderationResult.reason || "Bình luận có thể cần xem xét lại ngôn từ",
            });
          }
        }
      } catch (moderationError: any) {
        // Only block if it's a hard violation error
        if (moderationError.message?.includes('vi phạm')) {
          throw moderationError;
        }
        // For all other errors (timeout, network, etc.), continue with posting
        console.warn('Moderation check skipped:', moderationError.message);
      }

      const { data, error } = await supabase
        .from("feed_comments")
        .insert({
          feed_post_id: postId,
          user_id: user.user.id,
          content,
          parent_comment_id: parentCommentId || null,
          image_url: imageUrl || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts-infinite"] });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("feed_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts-infinite"] });
      toast({
        title: "Đã xóa",
        description: "Bình luận đã được xóa",
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

  // Update comment mutation
  const updateComment = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("feed_comments")
        .update({ content })
        .eq("id", commentId)
        .eq("user_id", user.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-comments", postId] });
      toast({
        title: "Đã cập nhật",
        description: "Bình luận đã được chỉnh sửa",
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

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`feed-comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feed_comments",
          filter: `feed_post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["feed-comments", postId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);

  return {
    comments: commentsQuery.data || [],
    totalComments:
      (commentsQuery.data?.length || 0) +
      (commentsQuery.data?.reduce((acc, c) => acc + (c.replies?.length || 0), 0) || 0),
    isLoading: commentsQuery.isLoading,
    currentUserId,
    addComment,
    deleteComment,
    updateComment,
  };
}
