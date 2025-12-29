import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// VAPID public key - this should match the private key in edge function
const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      
      if (existingSub) {
        setSubscription(existingSub);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      // Request permission first
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        console.log("Notification permission denied");
        return false;
      }

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      setSubscription(sub);
      setIsSubscribed(true);

      // Save subscription to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const subJson = sub.toJSON();
        
        // Upsert subscription using raw SQL to avoid type issues with new table
        const { error } = await supabase.rpc("upsert_push_subscription" as any, {
          p_user_id: user.id,
          p_endpoint: subJson.endpoint || "",
          p_p256dh: subJson.keys?.p256dh || "",
          p_auth: subJson.keys?.auth || "",
        });

        if (error) {
          // Fallback: try direct insert/update
          console.log("RPC not available, trying direct insert");
          // @ts-ignore - table might not be in types yet
          await supabase
            .from("push_subscriptions" as any)
            .upsert({
              user_id: user.id,
              endpoint: subJson.endpoint || "",
              p256dh: subJson.keys?.p256dh || "",
              auth: subJson.keys?.auth || "",
            }, {
              onConflict: "user_id",
            });
        }
      }

      return true;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      return false;
    }
  }, [isSupported, requestPermission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);

      // Remove from database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // @ts-ignore - table might not be in types yet
        await supabase
          .from("push_subscriptions" as any)
          .delete()
          .eq("user_id", user.id);
      }

      return true;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      return false;
    }
  }, [subscription]);

  // Auto-subscribe when user logs in
  useEffect(() => {
    const setupAutoSubscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && isSupported && permission === "granted" && !isSubscribed) {
        // Check if user already has a subscription in DB
        // @ts-ignore - table might not be in types yet
        const { data: existingSub } = await supabase
          .from("push_subscriptions" as any)
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!existingSub) {
          // Auto-subscribe
          subscribe();
        }
      }
    };

    setupAutoSubscribe();

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user && isSupported && permission === "granted") {
        subscribe();
      } else if (event === "SIGNED_OUT") {
        unsubscribe();
      }
    });

    return () => authSub.unsubscribe();
  }, [isSupported, permission, isSubscribed, subscribe, unsubscribe]);

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}
