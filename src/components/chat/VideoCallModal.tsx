import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Loader2,
  X,
  RotateCcw,
  Monitor,
  MonitorOff,
  PhoneIncoming,
  PhoneMissed
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// Messenger-like ringtone generator using Web Audio API
// Simulates the iconic Facebook Messenger "brrring brrring" sound pattern
class MessengerRingtone {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private isPlaying = false;
  private timeoutIds: NodeJS.Timeout[] = [];

  private createRingSound(startTime: number, duration: number) {
    if (!this.audioContext) return;
    
    // Messenger uses a characteristic "trill" pattern - rapid alternating tones
    const baseFreq = 440; // A4
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Use sine wave for clean, pleasant tone
    oscillator.type = 'sine';
    
    // Create the "trill" effect by modulating frequency
    const time = startTime;
    const trillSpeed = 15; // Hz - speed of trill
    const trillDepth = 50; // Hz - how much frequency varies
    
    // Create rapid frequency modulation for trill effect
    for (let i = 0; i < duration * trillSpeed; i++) {
      const t = time + (i / trillSpeed);
      const freq = baseFreq + (i % 2 === 0 ? trillDepth : -trillDepth);
      oscillator.frequency.setValueAtTime(freq, t);
    }
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
    gainNode.gain.setValueAtTime(0.25, startTime + duration - 0.02);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    this.oscillators.push(oscillator);
    this.gainNodes.push(gainNode);
  }

  private playPattern() {
    if (!this.isPlaying) return;
    
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    
    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const now = this.audioContext.currentTime;
    
    // Messenger pattern: "brrrring" (0.4s) - pause (0.2s) - "brrrring" (0.4s) - long pause (2s)
    this.createRingSound(now, 0.4);
    this.createRingSound(now + 0.6, 0.4);
    
    // Add a second layer for richer sound (higher octave)
    const highOsc = this.audioContext.createOscillator();
    const highGain = this.audioContext.createGain();
    highOsc.type = 'sine';
    highOsc.frequency.setValueAtTime(880, now); // A5
    
    highGain.gain.setValueAtTime(0, now);
    highGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    highGain.gain.setValueAtTime(0.08, now + 0.38);
    highGain.gain.linearRampToValueAtTime(0, now + 0.4);
    
    highOsc.connect(highGain);
    highGain.connect(this.audioContext.destination);
    highOsc.start(now);
    highOsc.stop(now + 0.4);
    
    // Second ring high octave
    const highOsc2 = this.audioContext.createOscillator();
    const highGain2 = this.audioContext.createGain();
    highOsc2.type = 'sine';
    highOsc2.frequency.setValueAtTime(880, now + 0.6);
    
    highGain2.gain.setValueAtTime(0, now + 0.6);
    highGain2.gain.linearRampToValueAtTime(0.08, now + 0.62);
    highGain2.gain.setValueAtTime(0.08, now + 0.98);
    highGain2.gain.linearRampToValueAtTime(0, now + 1);
    
    highOsc2.connect(highGain2);
    highGain2.connect(this.audioContext.destination);
    highOsc2.start(now + 0.6);
    highOsc2.stop(now + 1);
    
    this.oscillators.push(highOsc, highOsc2);
    this.gainNodes.push(highGain, highGain2);
    
    // Schedule next ring pattern after 3 seconds
    if (this.isPlaying) {
      const timeoutId = setTimeout(() => {
        this.playPattern();
      }, 3000);
      this.timeoutIds.push(timeoutId);
    }
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    console.log("Starting Messenger ringtone...");
    this.playPattern();
  }

  stop() {
    console.log("Stopping Messenger ringtone...");
    this.isPlaying = false;
    
    // Clear all scheduled timeouts
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
    
    // Stop all oscillators
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch (e) {}
    });
    this.oscillators = [];
    this.gainNodes = [];
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}

// Call end sound generator
class CallEndSound {
  play() {
    const audioContext = new AudioContext();
    
    // Low tone for "call ended" (like Messenger)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator.frequency.linearRampToValueAtTime(330, audioContext.currentTime + 0.3); // E4
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  }
}

const messengerRingtone = new MessengerRingtone();
const callEndSound = new CallEndSound();

interface VideoCallModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  currentUserId: string;
  otherUser: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  callType: "video" | "audio";
  isIncoming?: boolean;
  callSessionId?: string;
  autoAnswer?: boolean; // Auto answer when opened from notification
}

export function VideoCallModal({
  open,
  onClose,
  conversationId,
  currentUserId,
  otherUser,
  callType,
  isIncoming = false,
  callSessionId,
  autoAnswer = false
}: VideoCallModalProps) {
  const { toast } = useToast();
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "ringing" | "active" | "ended" | "no_answer" | "busy">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [ringCount, setRingCount] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const sessionIdRef = useRef<string | null>(callSessionId || null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ringTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const isCleanedUpRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ]
  };

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Play ringtone for outgoing calls (Messenger-like)
  const playRingtone = useCallback(() => {
    console.log("Playing Messenger-like ringtone...");
    messengerRingtone.start();
  }, []);

  // Stop ringtone
  const stopRingtone = useCallback(() => {
    console.log("Stopping ringtone...");
    messengerRingtone.stop();
  }, []);

  // Play call end sound
  const playCallEndSound = useCallback(() => {
    console.log("Playing call end sound...");
    callEndSound.play();
  }, []);

  // Cleanup function - uses refs to avoid stale closures
  const cleanup = useCallback(() => {
    if (isCleanedUpRef.current) return;
    isCleanedUpRef.current = true;
    
    console.log("Cleaning up video call resources...");
    
    // Stop ringtone
    stopRingtone();
    
    // Clear ring timer
    if (ringTimerRef.current) {
      clearInterval(ringTimerRef.current);
      ringTimerRef.current = null;
    }
    
    // Stop screen share stream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Stopped screen track:", track.kind);
      });
      screenStreamRef.current = null;
    }
    
    // Stop all tracks from local stream using ref
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      localStreamRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      console.log("Closed peer connection");
    }
    
    // Remove channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      console.log("Removed signaling channel");
    }
    
    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    // Reset states
    setLocalStream(null);
    setRemoteStream(null);
    setCallDuration(0);
    setIsScreenSharing(false);
    setRingCount(0);
  }, [stopRingtone]);

  // Sync local video ref with stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log("Setting local video srcObject");
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Sync remote video ref with stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log("Setting remote video srcObject");
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Start call timer
  useEffect(() => {
    if (callStatus === "active") {
      stopRingtone();
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    };
  }, [callStatus, stopRingtone]);

  // Play ringtone when ringing (outgoing call)
  useEffect(() => {
    if (callStatus === "ringing" && !isIncoming) {
      playRingtone();
      // Start ring count timer - auto end after 30 seconds (6 rings of ~5 sec each)
      setRingCount(0);
      ringTimerRef.current = setInterval(() => {
        setRingCount(prev => {
          if (prev >= 6) {
            // No answer after 30 seconds
            stopRingtone();
            playCallEndSound();
            if (ringTimerRef.current) {
              clearInterval(ringTimerRef.current);
            }
            setCallStatus("no_answer");
            toast({
              title: "Không có phản hồi",
              description: `${otherUser.full_name || "Người dùng"} không trả lời cuộc gọi`,
            });
            // Auto close after 2 seconds
            setTimeout(() => {
              cleanup();
              onClose();
            }, 2000);
            return prev;
          }
          return prev + 1;
        });
      }, 5000);
    } else {
      stopRingtone();
      if (ringTimerRef.current) {
        clearInterval(ringTimerRef.current);
        ringTimerRef.current = null;
      }
    }
    
    return () => {
      stopRingtone();
      if (ringTimerRef.current) {
        clearInterval(ringTimerRef.current);
        ringTimerRef.current = null;
      }
    };
  }, [callStatus, isIncoming, playRingtone, stopRingtone, playCallEndSound, otherUser.full_name, toast, cleanup, onClose]);

  // End call
  const endCall = useCallback(async () => {
    console.log("Ending call...");
    
    if (sessionIdRef.current) {
      try {
        await supabase
          .from("call_sessions")
          .update({ status: "ended", ended_at: new Date().toISOString() })
          .eq("id", sessionIdRef.current);

        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "call-ended",
            payload: {}
          });
        }
      } catch (error) {
        console.error("Error updating call session:", error);
      }
    }
    
    cleanup();
    setCallStatus("ended");
    onClose();
  }, [onClose, cleanup]);

  // Initialize media stream
  const initializeMedia = useCallback(async () => {
    try {
      console.log("Requesting media access...", callType);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video" ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: "user"
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log("Got media stream:", stream.getTracks().map(t => t.kind));
      
      // Store in ref for cleanup
      localStreamRef.current = stream;
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error: any) {
      console.error("Error accessing media devices:", error);
      
      let errorMessage = "Không thể truy cập camera/microphone.";
      if (error.name === "NotAllowedError") {
        errorMessage = "Vui lòng cho phép truy cập camera và microphone trong trình duyệt.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "Không tìm thấy camera hoặc microphone.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "Camera hoặc microphone đang được sử dụng bởi ứng dụng khác.";
      }
      
      toast({
        title: "Lỗi truy cập thiết bị",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  }, [callType, toast]);

  // Create peer connection
  const createPeerConnection = useCallback((stream: MediaStream) => {
    // Close existing connection if any
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    console.log("Creating new peer connection...");
    const pc = new RTCPeerConnection(configuration);
    
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
      console.log("Added track:", track.kind);
    });

    pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        console.log("Sending ICE candidate");
        channelRef.current.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: { candidate: event.candidate }
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setCallStatus("active");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        console.log("Connection lost, ending call");
        endCall();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [endCall]);

  // Start outgoing call
  const startCall = useCallback(async () => {
    if (isCleanedUpRef.current) return;
    
    console.log("Starting outgoing call...");
    setCallStatus("connecting");
    
    const stream = await initializeMedia();
    if (!stream) {
      setCallStatus("ended");
      onClose();
      return;
    }

    const pc = createPeerConnection(stream);
    
    try {
      // Create offer first
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("Created offer");

      // Create call session in database with offer stored
      const { data: session, error } = await supabase
        .from("call_sessions")
        .insert({
          conversation_id: conversationId,
          caller_id: currentUserId,
          call_type: callType,
          status: "pending",
          signaling_data: { offer: { type: offer.type, sdp: offer.sdp } }
        })
        .select()
        .single();

      if (error || !session) {
        console.error("Error creating call session:", error);
        toast({
          title: "Lỗi",
          description: "Không thể bắt đầu cuộc gọi",
          variant: "destructive"
        });
        cleanup();
        onClose();
        return;
      }

      sessionIdRef.current = session.id;
      setCallStatus("ringing");
      console.log("Call session created:", session.id);
      
      // Setup signaling channel
      const channel = supabase.channel(`call-${session.id}`);
      channelRef.current = channel;

      channel.on("broadcast", { event: "answer" }, async (msg) => {
        console.log("Received answer");
        const answer = msg.payload.answer;
        if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== "closed") {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (e) {
            console.error("Error setting remote description:", e);
          }
        }
      });

      channel.on("broadcast", { event: "ice-candidate" }, async (msg) => {
        console.log("Received ICE candidate");
        try {
          if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== "closed") {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(msg.payload.candidate));
          }
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      });

      channel.on("broadcast", { event: "call-declined" }, () => {
        stopRingtone();
        playCallEndSound();
        toast({
          title: "Cuộc gọi bị từ chối",
          description: `${otherUser.full_name || "Người dùng"} đã từ chối cuộc gọi`
        });
        setCallStatus("busy");
        setTimeout(() => {
          cleanup();
          onClose();
        }, 2000);
      });

      channel.on("broadcast", { event: "call-ended" }, () => {
        console.log("Call ended by remote");
        cleanup();
        setCallStatus("ended");
        onClose();
      });

      await channel.subscribe();
      console.log("Subscribed to signaling channel");
      
    } catch (error) {
      console.error("Error starting call:", error);
      toast({
        title: "Lỗi",
        description: "Không thể bắt đầu cuộc gọi",
        variant: "destructive"
      });
      cleanup();
      onClose();
    }
  }, [conversationId, currentUserId, callType, initializeMedia, createPeerConnection, otherUser, toast, cleanup, onClose]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    if (!callSessionId || isCleanedUpRef.current) return;

    console.log("Answering incoming call...");
    setCallStatus("connecting");

    // First, get the offer from the database
    const { data: callSession, error: fetchError } = await supabase
      .from("call_sessions")
      .select("signaling_data")
      .eq("id", callSessionId)
      .single();

    if (fetchError || !callSession) {
      console.error("Error fetching call session:", fetchError);
      toast({
        title: "Lỗi",
        description: "Không thể tham gia cuộc gọi",
        variant: "destructive"
      });
      onClose();
      return;
    }

    const stream = await initializeMedia();
    if (!stream) {
      onClose();
      return;
    }

    const pc = createPeerConnection(stream);
    
    const channel = supabase.channel(`call-${callSessionId}`);
    channelRef.current = channel;

    channel.on("broadcast", { event: "ice-candidate" }, async (msg) => {
      console.log("Received ICE candidate");
      try {
        if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== "closed") {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(msg.payload.candidate));
        }
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    });

    channel.on("broadcast", { event: "call-ended" }, () => {
      console.log("Call ended by remote");
      cleanup();
      setCallStatus("ended");
      onClose();
    });

    await channel.subscribe();
    console.log("Subscribed to signaling channel");

    try {
      // Set remote description from stored offer
      const signalingData = callSession.signaling_data as { offer?: RTCSessionDescriptionInit };
      if (signalingData?.offer) {
        console.log("Setting remote description from stored offer");
        await pc.setRemoteDescription(new RTCSessionDescription(signalingData.offer));
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("Created answer");

        channel.send({
          type: "broadcast",
          event: "answer",
          payload: { answer: { type: answer.type, sdp: answer.sdp } }
        });
        
        // Update call status in DB
        await supabase
          .from("call_sessions")
          .update({ status: "active" })
          .eq("id", callSessionId);

        setCallStatus("active");
      } else {
        console.error("No offer found in call session");
        toast({
          title: "Lỗi",
          description: "Không tìm thấy dữ liệu cuộc gọi",
          variant: "destructive"
        });
        cleanup();
        onClose();
      }
    } catch (error) {
      console.error("Error answering call:", error);
      toast({
        title: "Lỗi",
        description: "Không thể trả lời cuộc gọi",
        variant: "destructive"
      });
      cleanup();
      onClose();
    }
  }, [callSessionId, initializeMedia, createPeerConnection, cleanup, toast, onClose]);

  // Decline incoming call
  const declineCall = useCallback(async () => {
    console.log("Declining call...");
    
    if (callSessionId) {
      try {
        await supabase
          .from("call_sessions")
          .update({ status: "declined", ended_at: new Date().toISOString() })
          .eq("id", callSessionId);

        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "call-declined",
            payload: {}
          });
        }
      } catch (error) {
        console.error("Error declining call:", error);
      }
    }
    
    cleanup();
    setCallStatus("ended");
    onClose();
  }, [callSessionId, cleanup, onClose]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  }, [isVideoOff]);

  // Switch camera (for mobile)
  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current) return;
    
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;

    const constraints = videoTrack.getConstraints();
    const currentFacingMode = (constraints.facingMode as string) || "user";
    const newFacingMode = currentFacingMode === "user" ? "environment" : "user";

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      
      // Replace track in peer connection
      const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === "video");
      if (sender) {
        await sender.replaceTrack(newVideoTrack);
      }

      // Update local stream
      videoTrack.stop();
      localStreamRef.current.removeTrack(videoTrack);
      localStreamRef.current.addTrack(newVideoTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } catch (error) {
      console.error("Error switching camera:", error);
      toast({
        title: "Lỗi",
        description: "Không thể chuyển đổi camera",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    if (!peerConnectionRef.current) return;

    if (isScreenSharing) {
      // Stop screen sharing, restore camera
      console.log("Stopping screen share...");
      
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }

      // Restore original video track
      if (originalVideoTrackRef.current && localStreamRef.current) {
        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === "video");
        if (sender) {
          try {
            // Get new camera stream
            const cameraStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: "user" },
              audio: false
            });
            const newVideoTrack = cameraStream.getVideoTracks()[0];
            
            await sender.replaceTrack(newVideoTrack);
            
            // Update local stream
            const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
            if (oldVideoTrack) {
              localStreamRef.current.removeTrack(oldVideoTrack);
            }
            localStreamRef.current.addTrack(newVideoTrack);
            
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
            }
          } catch (error) {
            console.error("Error restoring camera:", error);
          }
        }
      }

      setIsScreenSharing(false);
      toast({
        title: "Chia sẻ màn hình",
        description: "Đã dừng chia sẻ màn hình"
      });
    } else {
      // Start screen sharing
      console.log("Starting screen share...");
      
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Save original video track
        if (localStreamRef.current) {
          const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
          if (currentVideoTrack) {
            originalVideoTrackRef.current = currentVideoTrack;
          }
        }
        
        // Replace video track with screen track
        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }

        // Update local video preview to show screen
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        // Handle when user stops sharing via browser UI
        screenTrack.onended = () => {
          console.log("Screen share ended by user");
          toggleScreenShare();
        };

        setIsScreenSharing(true);
        toast({
          title: "Chia sẻ màn hình",
          description: "Đang chia sẻ màn hình của bạn"
        });
      } catch (error: any) {
        console.error("Error starting screen share:", error);
        
        if (error.name !== "NotAllowedError") {
          toast({
            title: "Lỗi",
            description: "Không thể chia sẻ màn hình",
            variant: "destructive"
          });
        }
      }
    }
  }, [isScreenSharing, toast]);

  // Handle close button
  const handleClose = useCallback(() => {
    endCall();
  }, [endCall]);

  // Initialize call on mount
  useEffect(() => {
    if (open && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      isCleanedUpRef.current = false;
      
      if (isIncoming) {
        if (autoAnswer) {
          // Auto answer when opened from notification/URL params
          console.log("Auto answering incoming call...");
          answerCall();
        } else {
          setCallStatus("ringing");
        }
      } else {
        startCall();
      }
    }
  }, [open, isIncoming, startCall, autoAnswer, answerCall]);

  // Cleanup on unmount or when modal closes
  useEffect(() => {
    return () => {
      console.log("VideoCallModal unmounting, cleaning up...");
      cleanup();
      hasInitializedRef.current = false;
    };
  }, [cleanup]);

  // Reset refs when modal closes
  useEffect(() => {
    if (!open) {
      hasInitializedRef.current = false;
      isCleanedUpRef.current = false;
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/20">
                <AvatarImage src={otherUser.avatar_url || ""} />
                <AvatarFallback className="text-lg bg-primary/20 text-white">
                  {otherUser.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-lg">{otherUser.full_name || "Người dùng"}</p>
                <p className="text-white/60 text-sm">
                  {callStatus === "idle" && "Chuẩn bị..."}
                  {callStatus === "connecting" && "Đang kết nối..."}
                  {callStatus === "ringing" && (isIncoming ? "Cuộc gọi đến..." : `Đang đổ chuông... (${ringCount * 5}s)`)}
                  {callStatus === "active" && formatDuration(callDuration)}
                  {callStatus === "ended" && "Đã kết thúc"}
                  {callStatus === "no_answer" && "Không trả lời"}
                  {callStatus === "busy" && "Đã từ chối"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {callType === "video" && callStatus === "active" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={switchCamera}
                  className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                  title="Đổi camera"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-white hover:bg-white/20 rounded-full h-10 w-10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main video area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Remote video/avatar */}
          {callType === "video" && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <motion.div
                animate={callStatus === "ringing" ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-2xl">
                  <AvatarImage src={otherUser.avatar_url || ""} />
                  <AvatarFallback className="text-4xl bg-primary/20 text-white">
                    {otherUser.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <p className="text-white text-2xl font-semibold mt-6">
                {otherUser.full_name || "Người dùng"}
              </p>
              
              {callStatus === "connecting" && (
                <div className="flex items-center gap-2 text-white/60 mt-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang kết nối...</span>
                </div>
              )}
              {callStatus === "ringing" && !isIncoming && (
                <div className="mt-4 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-primary animate-bounce" />
                    <span className="text-white/80">Đang đổ chuông...</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full ${i < ringCount ? 'bg-primary' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {callStatus === "ringing" && isIncoming && (
                <div className="mt-4 flex flex-col items-center">
                  <PhoneIncoming className="w-8 h-8 text-green-400 animate-bounce mb-2" />
                  <p className="text-green-400 animate-pulse text-lg">
                    Cuộc gọi {callType === "video" ? "video" : "thoại"} đến
                  </p>
                </div>
              )}
              {callStatus === "active" && callType === "audio" && (
                <p className="text-green-400 mt-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  Đang trong cuộc gọi
                </p>
              )}
              {callStatus === "no_answer" && (
                <div className="mt-4 flex flex-col items-center text-red-400">
                  <PhoneMissed className="w-10 h-10 mb-2" />
                  <p className="text-lg">Không có phản hồi</p>
                </div>
              )}
              {callStatus === "busy" && (
                <div className="mt-4 flex flex-col items-center text-orange-400">
                  <PhoneOff className="w-10 h-10 mb-2" />
                  <p className="text-lg">Cuộc gọi bị từ chối</p>
                </div>
              )}
            </div>
          )}

          {/* Local video (picture-in-picture) */}
          {callType === "video" && localStream && (
            <motion.div 
              drag
              dragConstraints={containerRef}
              className="absolute bottom-24 right-4 w-32 sm:w-40 aspect-[3/4] bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 cursor-move"
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? "hidden" : ""}`}
              />
              {isVideoOff && (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <VideoOff className="w-8 h-8 text-white/50" />
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Call controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-4">
            {isIncoming && callStatus === "ringing" ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={declineCall}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={answerCall}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg"
                >
                  <Phone className="w-7 h-7 text-white" />
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                </motion.button>
                
                {callType === "video" && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleVideo}
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                        isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
                      }`}
                    >
                      {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
                    </motion.button>

                    {callStatus === "active" && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleScreenShare}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                          isScreenSharing ? "bg-green-500 hover:bg-green-600" : "bg-white/20 hover:bg-white/30"
                        }`}
                        title={isScreenSharing ? "Dừng chia sẻ màn hình" : "Chia sẻ màn hình"}
                      >
                        {isScreenSharing ? <MonitorOff className="w-6 h-6 text-white" /> : <Monitor className="w-6 h-6 text-white" />}
                      </motion.button>
                    )}
                  </>
                )}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
