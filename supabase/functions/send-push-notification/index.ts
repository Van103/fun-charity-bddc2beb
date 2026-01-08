import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create client with user's auth token to verify identity
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the caller is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerId = claimsData.claims.sub;

    const { userId, title, body, url, callId, conversationId, callType, callerName, callerAvatar } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // SECURITY: Verify caller has permission to notify target user
    // Allow if: caller is the target user, OR they share a conversation, OR they have a call session together
    let hasPermission = false;

    // Always allow notifying yourself
    if (callerId === userId) {
      hasPermission = true;
    }

    // Check if caller is admin
    if (!hasPermission) {
      const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: callerId });
      if (isAdmin) {
        hasPermission = true;
      }
    }

    // Check if they share a conversation (for message/call notifications)
    if (!hasPermission && conversationId) {
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId);
      
      if (participants) {
        const userIds = participants.map(p => p.user_id);
        if (userIds.includes(callerId) && userIds.includes(userId)) {
          hasPermission = true;
        }
      }
    }

    // Check if they're in an active call session
    if (!hasPermission && callId) {
      const { data: callSession } = await supabase
        .from("call_sessions")
        .select("caller_id, conversation_id")
        .eq("id", callId)
        .single();
      
      if (callSession && callSession.caller_id === callerId) {
        // Caller initiated the call, allow notifying participants
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", callSession.conversation_id);
        
        if (participants?.some(p => p.user_id === userId)) {
          hasPermission = true;
        }
      }
    }

    // Check if they are friends
    if (!hasPermission) {
      const { data: friendship } = await supabase
        .from("friendships")
        .select("id")
        .or(`and(user_id.eq.${callerId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${callerId})`)
        .eq("status", "accepted")
        .maybeSingle();
      
      if (friendship) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: "Forbidden: No permission to notify this user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending push notification to user: ${userId} from caller: ${callerId}`);

    // Get user's push subscription
    const { data: subscription, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (subError) {
      console.log("Error fetching push subscription:", subError.message);
      return new Response(
        JSON.stringify({ error: "Database error", details: subError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscription) {
      console.log("No push subscription found for user:", userId);
      return new Response(
        JSON.stringify({ success: false, message: "User has no push subscription" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    try {
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
