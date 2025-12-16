import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePresence(userId: string | null) {
  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("user_presence")
        .upsert({
          user_id: userId,
          is_online: isOnline,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) console.error("Error updating presence:", error);
    } catch (err) {
      console.error("Presence update failed:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Set online when component mounts
    updatePresence(true);

    // Handle visibility change
    const handleVisibilityChange = () => {
      updatePresence(!document.hidden);
    };

    // Handle before unload
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability
      const data = JSON.stringify({
        user_id: userId,
        is_online: false,
        last_seen: new Date().toISOString()
      });
      navigator.sendBeacon?.(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?on_conflict=user_id`, data);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      if (!document.hidden) {
        updatePresence(true);
      }
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(heartbeat);
      updatePresence(false);
    };
  }, [userId, updatePresence]);
}

export async function getOnlineStatus(userIds: string[]): Promise<Map<string, boolean>> {
  const statusMap = new Map<string, boolean>();
  
  if (userIds.length === 0) return statusMap;

  const { data } = await supabase
    .from("user_presence")
    .select("user_id, is_online, last_seen")
    .in("user_id", userIds);

  if (data) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    data.forEach(presence => {
      // Consider online if is_online=true AND last_seen within 5 minutes
      const isRecent = new Date(presence.last_seen) > fiveMinutesAgo;
      statusMap.set(presence.user_id, presence.is_online && isRecent);
    });
  }

  return statusMap;
}