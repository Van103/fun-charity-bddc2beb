import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MessageReaction {
  message_id: string;
  reaction_type: string;
  user_id: string;
}

interface ReactionSummary {
  reaction_type: string;
  count: number;
  hasReacted: boolean;
}

export function useMessageReactions(messageIds: string[], currentUserId: string | null) {
  const [reactions, setReactions] = useState<Map<string, ReactionSummary[]>>(new Map());
  const [loading, setLoading] = useState(false);

  // Load reactions for messages
  const loadReactions = useCallback(async () => {
    if (messageIds.length === 0 || !currentUserId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("message_reactions")
        .select("message_id, reaction_type, user_id")
        .in("message_id", messageIds);

      if (error) throw error;

      // Group reactions by message
      const reactionsMap = new Map<string, ReactionSummary[]>();
      
      messageIds.forEach(msgId => {
        const msgReactions = data?.filter(r => r.message_id === msgId) || [];
        
        // Group by reaction type
        const reactionGroups = msgReactions.reduce((acc, r) => {
          if (!acc[r.reaction_type]) {
            acc[r.reaction_type] = { count: 0, hasReacted: false };
          }
          acc[r.reaction_type].count++;
          if (r.user_id === currentUserId) {
            acc[r.reaction_type].hasReacted = true;
          }
          return acc;
        }, {} as Record<string, { count: number; hasReacted: boolean }>);

        const summaries: ReactionSummary[] = Object.entries(reactionGroups).map(
          ([reaction_type, data]) => ({
            reaction_type,
            ...data,
          })
        );

        reactionsMap.set(msgId, summaries);
      });

      setReactions(reactionsMap);
    } catch (error) {
      console.error("Error loading reactions:", error);
    } finally {
      setLoading(false);
    }
  }, [messageIds, currentUserId]);

  useEffect(() => {
    loadReactions();
  }, [loadReactions]);

  // Subscribe to reaction changes
  useEffect(() => {
    if (messageIds.length === 0) return;

    const channel = supabase
      .channel("message-reactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        (payload) => {
          const msgId = (payload.new as MessageReaction)?.message_id || 
                       (payload.old as MessageReaction)?.message_id;
          if (messageIds.includes(msgId)) {
            loadReactions();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageIds, loadReactions]);

  // Toggle reaction
  const toggleReaction = useCallback(async (messageId: string, reactionType: string) => {
    if (!currentUserId) return;

    try {
      // Check if user already reacted
      const { data: existing } = await supabase
        .from("message_reactions")
        .select("id")
        .eq("message_id", messageId)
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (existing) {
        // Remove existing reaction
        await supabase
          .from("message_reactions")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", currentUserId);

        // Add new reaction if different
        const currentReaction = reactions.get(messageId)?.find(r => r.hasReacted);
        if (currentReaction?.reaction_type !== reactionType) {
          await supabase
            .from("message_reactions")
            .insert({
              message_id: messageId,
              user_id: currentUserId,
              reaction_type: reactionType,
            });
        }
      } else {
        // Add new reaction
        await supabase
          .from("message_reactions")
          .insert({
            message_id: messageId,
            user_id: currentUserId,
            reaction_type: reactionType,
          });
      }

      // Reload reactions
      await loadReactions();
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  }, [currentUserId, reactions, loadReactions]);

  // Get user's current reaction for a message
  const getUserReaction = useCallback((messageId: string): string | null => {
    const msgReactions = reactions.get(messageId) || [];
    const userReaction = msgReactions.find(r => r.hasReacted);
    return userReaction?.reaction_type || null;
  }, [reactions]);

  return {
    reactions,
    loading,
    toggleReaction,
    getUserReaction,
    getMessageReactions: (messageId: string) => reactions.get(messageId) || [],
  };
}
