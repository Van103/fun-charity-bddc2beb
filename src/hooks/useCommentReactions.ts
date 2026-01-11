import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useCallback, useState } from "react";

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export interface ReactionSummary {
  type: string;
  count: number;
  users: string[];
}

export function useCommentReactions(commentIds: string[], currentUserId: string | null) {
  const queryClient = useQueryClient();
  const [reactionsMap, setReactionsMap] = useState<Map<string, ReactionSummary[]>>(new Map());
  const [userReactionsMap, setUserReactionsMap] = useState<Map<string, string | null>>(new Map());

  // Fetch reactions for all comments
  const { data: reactions, isLoading } = useQuery({
    queryKey: ["comment-reactions", commentIds],
    queryFn: async () => {
      if (commentIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("comment_reactions")
        .select("*")
        .in("comment_id", commentIds);

      if (error) throw error;
      return data as CommentReaction[];
    },
    enabled: commentIds.length > 0,
  });

  // Process reactions into maps
  useEffect(() => {
    if (!reactions) return;

    const newReactionsMap = new Map<string, ReactionSummary[]>();
    const newUserReactionsMap = new Map<string, string | null>();

    // Group reactions by comment
    const groupedByComment = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.comment_id]) {
        acc[reaction.comment_id] = [];
      }
      acc[reaction.comment_id].push(reaction);
      return acc;
    }, {} as Record<string, CommentReaction[]>);

    // Process each comment's reactions
    Object.entries(groupedByComment).forEach(([commentId, commentReactions]) => {
      // Group by reaction type
      const byType = commentReactions.reduce((acc, r) => {
        if (!acc[r.reaction_type]) {
          acc[r.reaction_type] = { type: r.reaction_type, count: 0, users: [] };
        }
        acc[r.reaction_type].count++;
        acc[r.reaction_type].users.push(r.user_id);
        return acc;
      }, {} as Record<string, ReactionSummary>);

      newReactionsMap.set(commentId, Object.values(byType));

      // Find current user's reaction
      const userReaction = commentReactions.find(r => r.user_id === currentUserId);
      newUserReactionsMap.set(commentId, userReaction?.reaction_type || null);
    });

    // Set null for comments without reactions
    commentIds.forEach(id => {
      if (!newReactionsMap.has(id)) {
        newReactionsMap.set(id, []);
        newUserReactionsMap.set(id, null);
      }
    });

    setReactionsMap(newReactionsMap);
    setUserReactionsMap(newUserReactionsMap);
  }, [reactions, currentUserId, commentIds]);

  // Toggle reaction mutation
  const toggleReaction = useMutation({
    mutationFn: async ({ commentId, reactionType }: { commentId: string; reactionType: string }) => {
      if (!currentUserId) throw new Error("Not authenticated");

      const currentReaction = userReactionsMap.get(commentId);

      if (currentReaction === reactionType) {
        // Remove reaction
        const { error } = await supabase
          .from("comment_reactions")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", currentUserId);
        if (error) throw error;
        return { action: "removed", commentId };
      } else if (currentReaction) {
        // Update reaction
        const { error } = await supabase
          .from("comment_reactions")
          .update({ reaction_type: reactionType })
          .eq("comment_id", commentId)
          .eq("user_id", currentUserId);
        if (error) throw error;
        return { action: "updated", commentId, reactionType };
      } else {
        // Add new reaction
        const { error } = await supabase
          .from("comment_reactions")
          .insert({
            comment_id: commentId,
            user_id: currentUserId,
            reaction_type: reactionType,
          });
        if (error) throw error;
        return { action: "added", commentId, reactionType };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment-reactions", commentIds] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (commentIds.length === 0) return;

    const channel = supabase
      .channel("comment-reactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comment_reactions",
        },
        (payload) => {
          const affectedCommentId = (payload.new as any)?.comment_id || (payload.old as any)?.comment_id;
          if (commentIds.includes(affectedCommentId)) {
            queryClient.invalidateQueries({ queryKey: ["comment-reactions", commentIds] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [commentIds, queryClient]);

  const getReactions = useCallback((commentId: string) => {
    return reactionsMap.get(commentId) || [];
  }, [reactionsMap]);

  const getUserReaction = useCallback((commentId: string) => {
    return userReactionsMap.get(commentId) || null;
  }, [userReactionsMap]);

  const getTotalCount = useCallback((commentId: string) => {
    const reactions = reactionsMap.get(commentId) || [];
    return reactions.reduce((sum, r) => sum + r.count, 0);
  }, [reactionsMap]);

  return {
    getReactions,
    getUserReaction,
    getTotalCount,
    toggleReaction,
    isLoading,
  };
}
