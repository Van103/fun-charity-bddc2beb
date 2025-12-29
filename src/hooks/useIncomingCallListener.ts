import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface IncomingCall {
  id: string;
  conversationId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string | null;
  callType: "video" | "audio";
}

interface UseIncomingCallListenerProps {
  userId: string | null;
  onAnswerCall?: (call: IncomingCall) => void;
  onCallEnded?: () => void; // Callback to refresh UI after call ends
}

export function useIncomingCallListener({ userId, onAnswerCall, onCallEnded }: UseIncomingCallListenerProps) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneAudioRef = useRef<HTMLAudioElement | null>(null);
  const processedCallIdsRef = useRef<Set<string>>(new Set()); // De-dup
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopLegacyRingtone = useCallback(() => {
    // We now play the Messenger-style ringtone in IncomingCallNotification.
    // This stops any leftover HTMLAudioElement ringtone so it won't keep ringing after accept.
    const audio = ringtoneAudioRef.current;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore
      }
      ringtoneAudioRef.current = null;
    }
  }, []);

  const dismissCall = useCallback(() => {
    setIncomingCall(null);
    stopLegacyRingtone();
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
  }, [stopLegacyRingtone]);

  const answerCall = useCallback(() => {
    if (incomingCall && onAnswerCall) {
      onAnswerCall(incomingCall);
    }
    dismissCall();
  }, [incomingCall, onAnswerCall, dismissCall]);

  const declineCall = useCallback(async () => {
    if (incomingCall) {
      try {
        await supabase
          .from("call_sessions")
          .update({ status: "declined", ended_at: new Date().toISOString() })
          .eq("id", incomingCall.id);

        // Create notification for the caller about declined call
        const { data: conversation } = await supabase
          .from("conversations")
          .select("participant1_id, participant2_id")
          .eq("id", incomingCall.conversationId)
          .single();

        if (conversation) {
          // Get current user's profile to show in notification
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", userId)
            .single();

          await supabase.from("notifications").insert({
            user_id: incomingCall.callerId,
            type: "missed_call" as any,
            title: "Cuộc gọi bị từ chối",
            message: `${userProfile?.full_name || "Người dùng"} đã từ chối cuộc gọi của bạn`,
            data: {
              conversation_id: incomingCall.conversationId,
              callee_id: userId,
              callee_name: userProfile?.full_name,
              callee_avatar: userProfile?.avatar_url,
              call_type: incomingCall.callType
            }
          });
        }

        // Save declined call message to chat history - USE CURRENT USER as sender (RLS requires auth.uid() = sender_id)
        const callTypeLabel = incomingCall.callType === 'video' ? 'video' : 'thoại';
        await supabase.from('messages').insert({
          conversation_id: incomingCall.conversationId,
          sender_id: userId, // MUST be current user for RLS
          content: `❌ Cuộc gọi ${callTypeLabel} bị từ chối`,
          is_read: false
        });

        // Update conversation's last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', incomingCall.conversationId);
          
        // Trigger refresh callback
        onCallEnded?.();
      } catch (error) {
        console.error("Error declining call:", error);
      }
    }
    dismissCall();
  }, [incomingCall, dismissCall, userId, onCallEnded]);

  // Function to send push notification
  const sendPushNotification = useCallback(async (
    targetUserId: string,
    callerName: string,
    callerAvatar: string | null,
    callId: string,
    conversationId: string,
    callType: "video" | "audio"
  ) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: targetUserId,
          title: `Cuộc gọi ${callType === "video" ? "video" : "thoại"} đến`,
          body: `${callerName} đang gọi cho bạn`,
          url: `/messages?answer=${callId}&conversation=${conversationId}&type=${callType}`,
          callId,
          conversationId,
          callType,
          callerName,
          callerAvatar,
        }),
      });

      if (!response.ok) {
        console.log("Push notification response:", await response.text());
      }
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }, []);

  // Process incoming call (shared by realtime + polling)
  const processIncomingCall = useCallback(async (callSession: {
    id: string;
    conversation_id: string;
    caller_id: string;
    call_type: string;
    status: string;
  }) => {
    // De-dup: skip if already processed
    if (processedCallIdsRef.current.has(callSession.id)) {
      return;
    }

    // Don't notify if user is the caller
    if (callSession.caller_id === userId) {
      return;
    }

    // Check if user is a participant in this conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("participant1_id, participant2_id")
      .eq("id", callSession.conversation_id)
      .maybeSingle();

    if (convError || !conversation) {
      console.log("Could not fetch conversation");
      return;
    }

    const isParticipant = 
      conversation.participant1_id === userId || 
      conversation.participant2_id === userId;

    if (!isParticipant) {
      return;
    }

    // Mark as processed
    processedCallIdsRef.current.add(callSession.id);

    // Get caller info
    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", callSession.caller_id)
      .maybeSingle();

    const incomingCallData: IncomingCall = {
      id: callSession.id,
      conversationId: callSession.conversation_id,
      callerId: callSession.caller_id,
      callerName: callerProfile?.full_name || "Người dùng",
      callerAvatar: callerProfile?.avatar_url || null,
      callType: callSession.call_type as "video" | "audio"
    };

    console.log("Incoming call from:", incomingCallData.callerName);
    setIncomingCall(incomingCallData);

    // Send push notification (for when app is in background or closed)
    sendPushNotification(
      userId!,
      incomingCallData.callerName,
      incomingCallData.callerAvatar,
      incomingCallData.id,
      incomingCallData.conversationId,
      incomingCallData.callType
    );

    // Auto dismiss after 30 seconds and save as missed call
    dismissTimeoutRef.current = setTimeout(async () => {
      // Save missed call message - USE CURRENT USER as sender (RLS requires auth.uid() = sender_id)
      try {
        const callTypeLabel = incomingCallData.callType === 'video' ? 'video' : 'thoại';
        await supabase.from('messages').insert({
          conversation_id: incomingCallData.conversationId,
          sender_id: userId, // MUST be current user for RLS
          content: `📵 Cuộc gọi ${callTypeLabel} nhỡ`,
          is_read: false
        });

        // Update conversation's last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', incomingCallData.conversationId);

        // Update call session status to missed
        await supabase
          .from('call_sessions')
          .update({ status: 'no_answer', ended_at: new Date().toISOString() })
          .eq('id', incomingCallData.id)
          .eq('status', 'pending');
          
        console.log('Missed call message saved');
        
        // Trigger refresh callback
        onCallEnded?.();
      } catch (error) {
        console.error('Error saving missed call message:', error);
      }
      
      setIncomingCall(null);
      stopLegacyRingtone();
    }, 30000);
  }, [userId, sendPushNotification, stopLegacyRingtone, onCallEnded]);

  useEffect(() => {
    if (!userId) return;

    console.log("Setting up incoming call listener for user:", userId);

    // Listen for new call sessions where user is a participant (realtime)
    const channel = supabase
      .channel("incoming-calls")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_sessions",
          filter: `status=eq.pending`
        },
        async (payload) => {
          console.log("New call session detected via realtime:", payload);
          const callSession = payload.new as {
            id: string;
            conversation_id: string;
            caller_id: string;
            call_type: string;
            status: string;
          };
          await processIncomingCall(callSession);
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Polling fallback: check for pending calls every 3 seconds (catches missed realtime events)
    const pollForCalls = async () => {
      try {
        // Get conversations where user is participant
        const { data: conversations } = await supabase
          .from("conversations")
          .select("id")
          .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);
        
        if (!conversations?.length) return;

        const conversationIds = conversations.map(c => c.id);
        
        // Check for pending calls in these conversations
        const { data: pendingCalls } = await supabase
          .from("call_sessions")
          .select("*")
          .in("conversation_id", conversationIds)
          .eq("status", "pending")
          .neq("caller_id", userId)
          .order("started_at", { ascending: false })
          .limit(1);

        if (pendingCalls?.length) {
          const call = pendingCalls[0];
          // Check if call is recent (within 35 seconds)
          const callAge = Date.now() - new Date(call.started_at).getTime();
          if (callAge < 35000) {
            await processIncomingCall(call);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    // Start polling
    pollingIntervalRef.current = setInterval(pollForCalls, 3000);
    // Also run immediately
    pollForCalls();

    return () => {
      console.log("Cleaning up incoming call listener");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
        dismissTimeoutRef.current = null;
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [userId, processIncomingCall]);

  return {
    incomingCall,
    answerCall,
    declineCall,
    dismissCall
  };
}
