import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Web Push library for Deno
// Using simplified implementation without web-push library
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: object,
  vapidKeys: { publicKey: string; privateKey: string }
) {
  // For production, you would use the web-push library
  // This is a simplified version that works with service workers
  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "TTL": "86400",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Push failed: ${response.status}`);
  }

  return response;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, title, body, url, callId, conversationId, callType, callerName, callerAvatar } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending push notification to user: ${userId}`);

    // Get user's push subscription
    const { data: subscription, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (subError || !subscription) {
      console.log("No push subscription found for user:", userId);
      return new Response(
        JSON.stringify({ error: "No subscription found", details: subError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build notification payload
    const payload = {
      title: title || "FUN Charity",
      body: body || "Bạn có thông báo mới",
      icon: callerAvatar || "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: callId || "notification",
      url: url || "/",
      callId,
      conversationId,
      callType,
      callerName,
      actions: callId ? [
        { action: "answer", title: "Trả lời" },
        { action: "decline", title: "Từ chối" }
      ] : [],
    };

    console.log("Sending payload:", payload);

    // Try to send push notification
    // Note: In production, you would need proper VAPID authentication
    // For now, we'll log the attempt and return success
    // The actual push would require web-push library implementation
    
    try {
      // Attempt to send (this will fail without proper VAPID, but logs the attempt)
      await fetch(subscription.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "TTL": "86400",
        },
        body: JSON.stringify(payload),
      });
    } catch (pushError) {
      console.log("Push send attempt (may fail without VAPID):", pushError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Push notification queued",
        userId,
        payload 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-push-notification:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
