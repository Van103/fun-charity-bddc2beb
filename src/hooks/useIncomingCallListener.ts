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
}

export function useIncomingCallListener({ userId, onAnswerCall }: UseIncomingCallListenerProps) {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneAudioRef = useRef<HTMLAudioElement | null>(null);

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

        // Save declined call message to chat history
        const callTypeLabel = incomingCall.callType === 'video' ? 'video' : 'thoại';
        await supabase.from('messages').insert({
          conversation_id: incomingCall.conversationId,
          sender_id: incomingCall.callerId, // Message shows caller initiated
          content: `❌ Cuộc gọi ${callTypeLabel} bị từ chối`,
          is_read: false
        });

        // Update conversation's last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', incomingCall.conversationId);
      } catch (error) {
        console.error("Error declining call:", error);
      }
    }
    dismissCall();
  }, [incomingCall, dismissCall, userId]);

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

  useEffect(() => {
    if (!userId) return;

    console.log("Setting up incoming call listener for user:", userId);

    // Listen for new call sessions where user is a participant
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
          console.log("New call session detected:", payload);
          
          const callSession = payload.new as {
            id: string;
            conversation_id: string;
            caller_id: string;
            call_type: string;
            status: string;
          };

          // Don't notify if user is the caller
          if (callSession.caller_id === userId) {
            console.log("Ignoring own call");
            return;
          }

          // Check if user is a participant in this conversation
          const { data: conversation, error: convError } = await supabase
            .from("conversations")
            .select("participant1_id, participant2_id")
            .eq("id", callSession.conversation_id)
            .single();

          if (convError || !conversation) {
            console.log("Could not fetch conversation");
            return;
          }

          const isParticipant = 
            conversation.participant1_id === userId || 
            conversation.participant2_id === userId;

          if (!isParticipant) {
            console.log("User is not a participant in this conversation");
            return;
          }

          // Get caller info
          const { data: callerProfile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", callSession.caller_id)
            .single();

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
            userId,
            incomingCallData.callerName,
            incomingCallData.callerAvatar,
            incomingCallData.id,
            incomingCallData.conversationId,
            incomingCallData.callType
          );

          // Auto dismiss after 30 seconds and save as missed call
          dismissTimeoutRef.current = setTimeout(async () => {
            // Save missed call message to chat history
            try {
              const callTypeLabel = incomingCallData.callType === 'video' ? 'video' : 'thoại';
              await supabase.from('messages').insert({
                conversation_id: incomingCallData.conversationId,
                sender_id: incomingCallData.callerId, // Message shows caller initiated
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
            } catch (error) {
              console.error('Error saving missed call message:', error);
            }
            
            setIncomingCall(null);
            stopLegacyRingtone();
          }, 30000);
        }
      )
      .subscribe();

    channelRef.current = channel;

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
    };
  }, [userId, sendPushNotification, stopLegacyRingtone]);

  return {
    incomingCall,
    answerCall,
    declineCall,
    dismissCall
  };
}
