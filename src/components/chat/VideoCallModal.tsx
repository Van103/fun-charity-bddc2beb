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
  Maximize2,
  Minimize2,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
}

export function VideoCallModal({
  open,
  onClose,
  conversationId,
  currentUserId,
  otherUser,
  callType,
  isIncoming = false,
  callSessionId
}: VideoCallModalProps) {
  const { toast } = useToast();
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "active" | "ended">(
    isIncoming ? "ringing" : "connecting"
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const sessionIdRef = useRef<string | null>(callSessionId || null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ]
  };

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start call timer
  useEffect(() => {
    if (callStatus === "active") {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callStatus]);

  // Initialize media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video" ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Lỗi",
        description: "Không thể truy cập camera/microphone. Vui lòng kiểm tra quyền truy cập.",
        variant: "destructive"
      });
      return null;
    }
  }, [callType, toast]);

  // Create peer connection
  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection(configuration);
    
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      console.log("Received remote track");
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
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
        endCall();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  // Start outgoing call
  const startCall = useCallback(async () => {
    const stream = await initializeMedia();
    if (!stream) return;

    // Create call session in database
    const { data: session, error } = await supabase
      .from("call_sessions")
      .insert({
        conversation_id: conversationId,
        caller_id: currentUserId,
        call_type: callType,
        status: "pending"
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
      return;
    }

    sessionIdRef.current = session.id;
    setCallStatus("ringing");

    const pc = createPeerConnection(stream);
    
    // Setup signaling channel
    const channel = supabase.channel(`call-${session.id}`);
    channelRef.current = channel;

    channel.on("broadcast", { event: "answer" }, async (msg) => {
      console.log("Received answer");
      const answer = msg.payload.answer;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    channel.on("broadcast", { event: "ice-candidate" }, async (msg) => {
      console.log("Received ICE candidate");
      try {
        await pc.addIceCandidate(new RTCIceCandidate(msg.payload.candidate));
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    });

    channel.on("broadcast", { event: "call-declined" }, () => {
      toast({
        title: "Cuộc gọi bị từ chối",
        description: `${otherUser.full_name} đã từ chối cuộc gọi`
      });
      endCall();
    });

    channel.on("broadcast", { event: "call-ended" }, () => {
      endCall();
    });

    await channel.subscribe();

    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    channel.send({
      type: "broadcast",
      event: "offer",
      payload: { 
        offer,
        caller_id: currentUserId,
        call_type: callType
      }
    });
  }, [conversationId, currentUserId, callType, initializeMedia, createPeerConnection, otherUser, toast]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    if (!callSessionId) return;

    const stream = await initializeMedia();
    if (!stream) return;

    const pc = createPeerConnection(stream);
    
    const channel = supabase.channel(`call-${callSessionId}`);
    channelRef.current = channel;

    channel.on("broadcast", { event: "offer" }, async (msg) => {
      console.log("Received offer");
      const offer = msg.payload.offer;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      channel.send({
        type: "broadcast",
        event: "answer",
        payload: { answer }
      });
    });

    channel.on("broadcast", { event: "ice-candidate" }, async (msg) => {
      console.log("Received ICE candidate");
      try {
        await pc.addIceCandidate(new RTCIceCandidate(msg.payload.candidate));
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    });

    channel.on("broadcast", { event: "call-ended" }, () => {
      endCall();
    });

    await channel.subscribe();

    // Update call status
    await supabase
      .from("call_sessions")
      .update({ status: "active" })
      .eq("id", callSessionId);

    setCallStatus("active");
  }, [callSessionId, initializeMedia, createPeerConnection]);

  // Decline incoming call
  const declineCall = useCallback(async () => {
    if (callSessionId) {
      await supabase
        .from("call_sessions")
        .update({ status: "declined", ended_at: new Date().toISOString() })
        .eq("id", callSessionId);

      channelRef.current?.send({
        type: "broadcast",
        event: "call-declined",
        payload: {}
      });
    }
    cleanup();
    onClose();
  }, [callSessionId, onClose]);

  // End call
  const endCall = useCallback(async () => {
    if (sessionIdRef.current) {
      await supabase
        .from("call_sessions")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", sessionIdRef.current);

      channelRef.current?.send({
        type: "broadcast",
        event: "call-ended",
        payload: {}
      });
    }
    cleanup();
    onClose();
  }, [onClose]);

  // Cleanup
  const cleanup = useCallback(() => {
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    peerConnectionRef.current?.close();
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus("ended");
    setCallDuration(0);
  }, [localStream, remoteStream]);

  // Toggle mute
  const toggleMute = () => {
    localStream?.getAudioTracks().forEach(track => {
      track.enabled = isMuted;
    });
    setIsMuted(!isMuted);
  };

  // Toggle video
  const toggleVideo = () => {
    localStream?.getVideoTracks().forEach(track => {
      track.enabled = isVideoOff;
    });
    setIsVideoOff(!isVideoOff);
  };

  // Switch camera (for mobile)
  const switchCamera = async () => {
    if (!localStream) return;
    
    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const constraints = videoTrack.getConstraints();
    const facingMode = constraints.facingMode === "user" ? "environment" : "user";

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
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
      localStream.removeTrack(videoTrack);
      localStream.addTrack(newVideoTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };

  // Initialize call on mount
  useEffect(() => {
    if (open && !isIncoming) {
      startCall();
    }
  }, [open, isIncoming, startCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

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
                  {callStatus === "connecting" && "Đang kết nối..."}
                  {callStatus === "ringing" && (isIncoming ? "Cuộc gọi đến..." : "Đang đổ chuông...")}
                  {callStatus === "active" && formatDuration(callDuration)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {callType === "video" && (
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
                onClick={endCall}
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
                <p className="text-white/60 mt-2 animate-pulse">Đang đổ chuông...</p>
              )}
              {callStatus === "ringing" && isIncoming && (
                <p className="text-primary mt-2 animate-pulse text-lg">Cuộc gọi {callType === "video" ? "video" : "thoại"} đến</p>
              )}
              {callStatus === "active" && (
                <p className="text-green-400 mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Đang trong cuộc gọi
                </p>
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
