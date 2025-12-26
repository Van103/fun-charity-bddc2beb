import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useMessageNotifications(
  currentUserId: string | null,
  activeConversationId: string | null
) {
  const { toast } = useToast();

  const showNotification = useCallback(async (message: any) => {
    // Don't show notification for own messages or if already viewing that conversation
    if (message.sender_id === currentUserId) return;
    if (message.conversation_id === activeConversationId) return;

    // Get sender's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", message.sender_id)
      .maybeSingle();

    const senderName = profile?.full_name || "Ai đó";
    const messagePreview = message.image_url 
      ? "đã gửi một hình ảnh" 
      : message.content?.substring(0, 50) + (message.content?.length > 50 ? "..." : "");

    toast({
      title: `💬 ${senderName}`,
      description: messagePreview,
    });

    // Play notification sound
    try {
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
  }, [currentUserId, activeConversationId, toast]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("message-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          showNotification(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, activeConversationId, showNotification]);
}