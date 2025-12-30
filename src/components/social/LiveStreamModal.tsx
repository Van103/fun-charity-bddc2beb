import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Camera, 
  Users, 
  MessageCircle,
  Heart,
  Share2,
  X,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

interface LiveStreamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function LiveStreamModal({ open, onOpenChange, profile }: LiveStreamModalProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState<Array<{ user: string; text: string }>>([]);
  const [newMessage, setNewMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera preview
  useEffect(() => {
    if (open && !isStreaming) {
      startCameraPreview();
    }
    return () => {
      stopStream();
    };
  }, [open]);

  const startCameraPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const switchCamera = async () => {
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera switch error:", error);
      startCameraPreview();
    }
  };

  const startStreaming = () => {
    if (!streamTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề cho buổi phát trực tiếp");
      return;
    }
    setIsStreaming(true);
    setViewerCount(1);
    toast.success("Bắt đầu phát trực tiếp!");
    
    // Simulate viewer count
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    
    return () => clearInterval(interval);
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setViewerCount(0);
    toast.info("Đã kết thúc phát trực tiếp");
    onOpenChange(false);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, { user: profile?.full_name || "Bạn", text: newMessage }]);
      setNewMessage("");
    }
  };

  const handleClose = () => {
    if (isStreaming) {
      stopStreaming();
    }
    stopStream();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden bg-black">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white/50">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium text-sm">{profile?.full_name || "Bạn"}</p>
                  {isStreaming && (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        LIVE
                      </Badge>
                      <span className="text-white/80 text-xs flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {viewerCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Video Preview */}
          <div className="flex-1 relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <VideoOff className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-70">Camera đã tắt</p>
                </div>
              </div>
            )}
          </div>

          {/* Stream Title Input (before streaming) */}
          {!isStreaming && (
            <div className="absolute bottom-24 left-4 right-4 z-20">
              <Input
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="Hãy mô tả video trực tiếp của bạn..."
                className="bg-black/50 border-white/30 text-white placeholder:text-white/60 focus:border-primary"
              />
            </div>
          )}

          {/* Live Chat (during streaming) */}
          {isStreaming && (
            <div className="absolute bottom-24 left-4 right-4 z-20 max-h-40 overflow-y-auto scrollbar-hide">
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <div key={index} className="flex items-start gap-2 bg-black/50 rounded-lg px-3 py-2">
                    <span className="text-primary text-sm font-medium">{msg.user}</span>
                    <span className="text-white text-sm">{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/70 to-transparent">
            {isStreaming && (
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Viết bình luận..."
                  className="flex-1 bg-black/50 border-white/30 text-white placeholder:text-white/60 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={sendMessage}
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${isVideoEnabled ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${isAudioEnabled ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                  onClick={toggleAudio}
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/20 text-white"
                  onClick={switchCamera}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>

              {isStreaming ? (
                <Button
                  onClick={stopStreaming}
                  className="bg-red-500 hover:bg-red-600 text-white px-6"
                >
                  Kết thúc
                </Button>
              ) : (
                <Button
                  onClick={startStreaming}
                  className="bg-red-500 hover:bg-red-600 text-white px-6"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Phát trực tiếp
                </Button>
              )}

              {isStreaming && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/20 text-white"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/20 text-white"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
