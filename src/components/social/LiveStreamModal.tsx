import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  Heart,
  Share2,
  X,
  RotateCcw,
  Palette,
  Sparkles,
  Download,
  Send,
  Globe,
  Lock,
  UserCheck,
  Loader2,
  Clock,
  Eye,
  Zap,
  ZapOff,
  Type,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  UserMinus,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCreateFeedPost } from "@/hooks/useFeedPosts";

interface LiveStreamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    user_id?: string;
  } | null;
}

interface ChatMessage {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  timestamp: Date;
}

interface LiveReaction {
  id: string;
  emoji: string;
  x: number;
}

type AudienceType = 'public' | 'friends' | 'friends_except' | 'only_me';

// Available filters including beauty filters
const FILTERS = [
  { id: 'none', name: 'Không', filter: '' },
  { id: 'beauty', name: '✨ Làm đẹp', filter: 'brightness(1.1) contrast(0.95) saturate(1.1)' },
  { id: 'smooth', name: '🌸 Mịn da', filter: 'blur(0.3px) brightness(1.08) contrast(0.92)' },
  { id: 'bright', name: '☀️ Sáng', filter: 'brightness(1.25) contrast(1.05)' },
  { id: 'warm', name: 'Ấm áp', filter: 'sepia(0.3) saturate(1.4) brightness(1.1)' },
  { id: 'cool', name: 'Mát mẻ', filter: 'saturate(1.2) hue-rotate(20deg) brightness(1.05)' },
  { id: 'vintage', name: 'Vintage', filter: 'sepia(0.5) contrast(1.1) brightness(0.9)' },
  { id: 'dramatic', name: 'Kịch tính', filter: 'contrast(1.3) saturate(1.2)' },
  { id: 'bw', name: 'Đen trắng', filter: 'grayscale(1) contrast(1.2)' },
  { id: 'pink', name: 'Hồng', filter: 'hue-rotate(-20deg) saturate(1.5) brightness(1.1)' },
  { id: 'sunset', name: 'Hoàng hôn', filter: 'sepia(0.4) saturate(1.6) hue-rotate(-10deg)' },
];

// Available stickers
const STICKERS = [
  { id: 'crown', emoji: '👑', position: 'top' },
  { id: 'heart', emoji: '❤️', position: 'bottom-right' },
  { id: 'star', emoji: '⭐', position: 'top-right' },
  { id: 'fire', emoji: '🔥', position: 'bottom-left' },
  { id: 'sparkle', emoji: '✨', position: 'top-left' },
  { id: 'glasses', emoji: '😎', position: 'center' },
  { id: 'party', emoji: '🎉', position: 'top' },
  { id: 'butterfly', emoji: '🦋', position: 'top-right' },
  { id: 'rainbow', emoji: '🌈', position: 'top' },
  { id: 'kiss', emoji: '💋', position: 'bottom-right' },
  { id: 'angel', emoji: '😇', position: 'top' },
  { id: 'devil', emoji: '😈', position: 'top-left' },
];

const AUDIENCE_OPTIONS = [
  { value: 'public' as AudienceType, label: 'Công khai', icon: Globe, description: 'Mọi người đều có thể xem' },
  { value: 'friends' as AudienceType, label: 'Bạn bè', icon: UserCheck, description: 'Chỉ bạn bè mới xem được' },
  { value: 'friends_except' as AudienceType, label: 'Bạn bè trừ...', icon: UserMinus, description: 'Ẩn với một số người bạn bè' },
  { value: 'only_me' as AudienceType, label: 'Chỉ mình tôi', icon: Lock, description: 'Chỉ bạn có thể xem' },
];

export function LiveStreamModal({ open, onOpenChange, profile }: LiveStreamModalProps) {
  // Setup phase states
  const [phase, setPhase] = useState<'setup' | 'live' | 'ended'>('setup');
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [audience, setAudience] = useState<AudienceType>('public');
  
  // Live states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [viewerCount, setViewerCount] = useState(0);
  const [peakViewers, setPeakViewers] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const [streamDuration, setStreamDuration] = useState(0);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Filter & Sticker states
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [activeStickers, setActiveStickers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showRightToolbar, setShowRightToolbar] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [enhancementEnabled, setEnhancementEnabled] = useState(true);
  const [showTextOverlay, setShowTextOverlay] = useState(false);
  const [textOverlay, setTextOverlay] = useState("");
  const [shareToStory, setShareToStory] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const viewerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const createFeedPost = useCreateFeedPost();

  const startCameraPreview = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: 1280, height: 720 },
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
  }, [facingMode]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (viewerIntervalRef.current) clearInterval(viewerIntervalRef.current);
    if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    
    try {
      const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
      let selectedMimeType = '';
      
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }

      if (!selectedMimeType) {
        toast.error('Trình duyệt không hỗ trợ ghi video');
        return;
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: selectedMimeType
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: selectedMimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Không thể ghi hình. Trình duyệt có thể không hỗ trợ.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Start camera preview
  useEffect(() => {
    if (open) {
      startCameraPreview();
      setPhase('setup');
      setStreamTitle("");
      setStreamDescription("");
      setMessages([]);
      setViewerCount(0);
      setPeakViewers(0);
      setStreamDuration(0);
    }
    return () => {
      stopStream();
      if (isRecording) {
        stopRecording();
      }
    };
  }, [open, startCameraPreview, stopStream, isRecording, stopRecording]);

  // Handle camera switch
  useEffect(() => {
    if (open && streamRef.current) {
      stopStream();
      startCameraPreview();
    }
  }, [facingMode]);

  // Simulate viewers and chat when streaming
  useEffect(() => {
    if (phase !== 'live') return;

    // Duration counter
    durationIntervalRef.current = setInterval(() => {
      setStreamDuration(prev => prev + 1);
    }, 1000);

    // Viewer simulation
    viewerIntervalRef.current = setInterval(() => {
      setViewerCount(prev => {
        const newCount = Math.max(1, prev + Math.floor(Math.random() * 7) - 3);
        setPeakViewers(peak => Math.max(peak, newCount));
        return newCount;
      });
    }, 3000);

    const demoUsers = [
      { name: 'Nguyễn Văn A', avatar: null },
      { name: 'Trần Thị B', avatar: null },
      { name: 'Lê Văn C', avatar: null },
      { name: 'Phạm Thị D', avatar: null },
      { name: 'User123', avatar: null }
    ];
    const demoMessages = [
      'Xin chào! 👋',
      'Live hay quá! ❤️',
      'Chào mọi người!',
      'Đang xem nè 👀',
      '🔥🔥🔥',
      'Tuyệt vời!',
      'Ủng hộ bạn nè 💪',
      'Chất lượng tốt quá!',
      'Cố lên nhé ❤️',
      'Hi hi 😄',
    ];

    chatIntervalRef.current = setInterval(() => {
      const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        user: user.name,
        avatar: user.avatar || undefined,
        text: demoMessages[Math.floor(Math.random() * demoMessages.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev.slice(-50), newMsg]);
    }, 3500);

    return () => {
      if (viewerIntervalRef.current) clearInterval(viewerIntervalRef.current);
      if (chatIntervalRef.current) clearInterval(chatIntervalRef.current);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [phase]);

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

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const goLive = () => {
    if (!streamTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề cho buổi phát trực tiếp");
      return;
    }
    setPhase('live');
    setViewerCount(1);
    startRecording();
    toast.success("🔴 Bắt đầu phát trực tiếp!");
  };

  const endLive = async () => {
    stopRecording();
    
    // Wait a moment for the recording to finalize
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if we have recorded content
    if (recordedChunksRef.current.length > 0) {
      setPhase('ended');
    } else {
      // No recording, just close
      toast.info('Buổi phát trực tiếp đã kết thúc');
      stopStream();
      onOpenChange(false);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const msg: ChatMessage = {
        id: Date.now().toString(),
        user: profile?.full_name || "Bạn",
        avatar: profile?.avatar_url || undefined,
        text: newMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
    }
  };

  const addReaction = (emoji: string) => {
    const reaction: LiveReaction = {
      id: Date.now().toString() + Math.random(),
      emoji,
      x: Math.random() * 60 + 20
    };
    setReactions(prev => [...prev, reaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 2500);
  };

  const toggleSticker = (stickerId: string) => {
    setActiveStickers(prev => 
      prev.includes(stickerId) 
        ? prev.filter(id => id !== stickerId)
        : [...prev, stickerId]
    );
  };

  const handleClose = () => {
    if (phase === 'live') {
      endLive();
    } else {
      stopStream();
      onOpenChange(false);
    }
  };

  const handleSaveToFeed = async () => {
    if (!recordedBlob || !profile?.user_id) {
      toast.error('Không thể lưu video');
      return;
    }

    setIsUploading(true);

    try {
      // Upload video to storage
      const fileName = `${profile.user_id}/${Date.now()}-live-stream.webm`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('live-videos')
        .upload(fileName, recordedBlob, {
          contentType: 'video/webm',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('live-videos')
        .getPublicUrl(fileName);

      // Create feed post with video - use direct URL format
      await createFeedPost.mutateAsync({
        post_type: 'update',
        title: streamTitle,
        content: streamDescription || `🔴 Video phát trực tiếp: ${streamTitle}`,
        media_urls: [publicUrl],
        is_live_video: false, // Not live anymore, it's a recorded video
        live_viewer_count: peakViewers,
      });

      toast.success('Video đã được đăng lên bảng tin!');
      
      // Cleanup
      stopStream();
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
      setRecordedBlob(null);
      setRecordedVideoUrl(null);
      recordedChunksRef.current = [];
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving video:', error);
      toast.error(error.message || 'Không thể lưu video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadVideo = () => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `live-stream-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Đang tải video...');
    }
  };

  const handleDiscardVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setRecordedBlob(null);
    recordedChunksRef.current = [];
    stopStream();
    onOpenChange(false);
  };

  const getCurrentFilter = () => {
    return FILTERS.find(f => f.id === selectedFilter)?.filter || '';
  };

  const getStickerPosition = (position: string) => {
    switch (position) {
      case 'top': return 'top-20 left-1/2 -translate-x-1/2';
      case 'top-left': return 'top-20 left-4';
      case 'top-right': return 'top-20 right-4';
      case 'bottom-left': return 'bottom-40 left-4';
      case 'bottom-right': return 'bottom-40 right-4';
      case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default: return 'top-20 left-4';
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[100vw] md:max-w-4xl h-[100vh] md:h-[90vh] p-0 overflow-hidden bg-black border-0 rounded-none md:rounded-lg">
        <div className="relative w-full h-full flex flex-col">
          
          {/* Setup Phase - Facebook-like UI */}
          {phase === 'setup' && (
            <>
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-30 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full w-10 h-10"
                    onClick={handleClose}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Avatar className="w-11 h-11 border-2 border-white/50">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-semibold text-sm">{profile?.full_name || "Bạn"}</p>
                    {/* Audience dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full text-white text-xs transition-all"
                      >
                        {(() => {
                          const option = AUDIENCE_OPTIONS.find(o => o.value === audience);
                          const Icon = option?.icon || Globe;
                          return <Icon className="w-3.5 h-3.5" />;
                        })()}
                        <span>{AUDIENCE_OPTIONS.find(o => o.value === audience)?.label}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {/* Dropdown menu */}
                      <AnimatePresence>
                        {showAudienceDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            {AUDIENCE_OPTIONS.map(option => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setAudience(option.value);
                                  setShowAudienceDropdown(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                                  audience === option.value ? 'bg-primary/10' : ''
                                }`}
                              >
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                  audience === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                }`}>
                                  <option.icon className="w-4 h-4" />
                                </div>
                                <div className="text-left flex-1">
                                  <p className={`text-sm font-medium ${audience === option.value ? 'text-primary' : 'text-foreground'}`}>
                                    {option.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{option.description}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10"
                  onClick={() => toast.info('Trung tâm trợ giúp đang được phát triển')}
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </div>

              {/* Video Preview */}
              <div className="flex-1 relative bg-black overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ 
                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                    filter: getCurrentFilter()
                  }}
                />
                
                {/* Active Stickers */}
                {activeStickers.map(stickerId => {
                  const sticker = STICKERS.find(s => s.id === stickerId);
                  if (!sticker) return null;
                  return (
                    <motion.div 
                      key={stickerId}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute ${getStickerPosition(sticker.position)} text-5xl md:text-6xl pointer-events-none`}
                      style={{ 
                        animation: 'bounce 2s infinite',
                        textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                      }}
                    >
                      {sticker.emoji}
                    </motion.div>
                  );
                })}

                {/* Text Overlay on video */}
                {textOverlay && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold text-center px-4 drop-shadow-lg">
                    {textOverlay}
                  </div>
                )}
                
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <VideoOff className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-70">Camera đã tắt</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right side toolbar - Facebook style */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30">
                <AnimatePresence>
                  {showRightToolbar && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col gap-4"
                    >
                      {/* Flash */}
                      <button
                        onClick={() => {
                          setFlashEnabled(!flashEnabled);
                          toast.info(flashEnabled ? 'Đã tắt Flash' : 'Đã bật Flash');
                        }}
                        className="flex items-center gap-2 group"
                      >
                        <span className="text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-right whitespace-nowrap">
                          {flashEnabled ? 'Flash đang bật' : 'Flash đang tắt'}
                        </span>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          flashEnabled ? 'bg-yellow-500' : 'bg-white/20 hover:bg-white/30'
                        }`}>
                          {flashEnabled ? <Zap className="w-5 h-5 text-black" /> : <ZapOff className="w-5 h-5 text-white" />}
                        </div>
                      </button>

                      {/* Mic */}
                      <button
                        onClick={toggleAudio}
                        className="flex items-center gap-2 group"
                      >
                        <span className="text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-right whitespace-nowrap">
                          {isAudioEnabled ? 'Tắt tiếng micrô' : 'Bật tiếng micrô'}
                        </span>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          !isAudioEnabled ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                        }`}>
                          {isAudioEnabled ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
                        </div>
                      </button>

                      {/* Rotate camera */}
                      <button
                        onClick={switchCamera}
                        className="flex items-center gap-2 group"
                      >
                        <span className="text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-right whitespace-nowrap">
                          Xoay
                        </span>
                        <div className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
                          <RotateCcw className="w-5 h-5 text-white" />
                        </div>
                      </button>

                      {/* Stickers */}
                      <button
                        onClick={() => { setShowStickers(!showStickers); setShowFilters(false); }}
                        className="flex items-center gap-2 group"
                      >
                        <span className="text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-right whitespace-nowrap">
                          Nhãn dán
                        </span>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          showStickers ? 'bg-primary' : 'bg-white/20 hover:bg-white/30'
                        }`}>
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      </button>

                      {/* Enhancement/Filter */}
                      <button
                        onClick={() => { setShowFilters(!showFilters); setShowStickers(false); }}
                        className="flex items-center gap-2 group"
                      >
                        <span className="text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-right whitespace-nowrap">
                          {showFilters ? 'Ẩn bộ lọc' : 'Tính năng cải thiện'}
                        </span>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          showFilters || selectedFilter !== 'none' ? 'bg-primary' : 'bg-white/20 hover:bg-white/30'
                        }`}>
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                      </button>

                      {/* Text overlay */}
                      <button
                        onClick={() => setShowTextOverlay(!showTextOverlay)}
                        className="flex items-center gap-2 group"
                      >
                        <span className="text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-right whitespace-nowrap">
                          Văn bản
                        </span>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          showTextOverlay || textOverlay ? 'bg-primary' : 'bg-white/20 hover:bg-white/30'
                        }`}>
                          <Type className="w-5 h-5 text-white" />
                        </div>
                      </button>

                      {/* Collapse button */}
                      <button
                        onClick={() => setShowRightToolbar(false)}
                        className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                      >
                        <ChevronUp className="w-5 h-5 text-white" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Show toolbar button when collapsed */}
                {!showRightToolbar && (
                  <button
                    onClick={() => setShowRightToolbar(true)}
                    className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                  >
                    <ChevronDown className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>

              {/* Filter Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-44 left-0 right-16 bg-black/90 p-4 backdrop-blur-sm z-30 rounded-r-xl"
                  >
                    <p className="text-white text-sm mb-3 font-medium flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Bộ lọc & Làm đẹp
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {FILTERS.map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => setSelectedFilter(filter.id)}
                          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
                            selectedFilter === filter.id
                              ? 'bg-primary text-primary-foreground ring-2 ring-primary-foreground'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          {filter.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sticker Panel */}
              <AnimatePresence>
                {showStickers && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-44 left-0 right-16 bg-black/90 p-4 backdrop-blur-sm z-30 rounded-r-xl"
                  >
                    <p className="text-white text-sm mb-3 font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Sticker
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {STICKERS.map(sticker => (
                        <button
                          key={sticker.id}
                          onClick={() => toggleSticker(sticker.id)}
                          className={`flex-shrink-0 w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                            activeStickers.includes(sticker.id)
                              ? 'bg-primary ring-2 ring-primary-foreground scale-110'
                              : 'bg-white/20 hover:bg-white/30 hover:scale-105'
                          }`}
                        >
                          {sticker.emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Text overlay input */}
              <AnimatePresence>
                {showTextOverlay && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-44 left-0 right-16 bg-black/90 p-4 backdrop-blur-sm z-30 rounded-r-xl"
                  >
                    <p className="text-white text-sm mb-3 font-medium flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Thêm văn bản
                    </p>
                    <Input
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                      placeholder="Nhập văn bản hiển thị trên video..."
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom section */}
              <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                {/* Description input */}
                <div className="mb-3">
                  <Input
                    value={streamDescription}
                    onChange={(e) => setStreamDescription(e.target.value)}
                    placeholder="Nhấn để thêm mô tả..."
                    className="bg-transparent border-0 text-white placeholder:text-white/60 text-base p-0 h-auto focus-visible:ring-0"
                  />
                </div>

                {/* Share to story option */}
                <div className="flex items-center justify-between mb-4 py-3 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-white/60" />
                    <div>
                      <p className="text-white text-sm font-medium">Chia sẻ lên</p>
                      <p className="text-white/60 text-xs">Tin: {shareToStory ? 'Bật' : 'Tắt'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShareToStory(!shareToStory)}
                    className="text-white/60 hover:text-white"
                  >
                    <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                  </button>
                </div>

                {/* Go Live button */}
                <Button
                  onClick={goLive}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 text-base font-medium rounded-xl"
                  disabled={!streamRef.current}
                >
                  Phát trực tiếp
                </Button>
              </div>
            </>
          )}

          {/* Live Phase */}
          {phase === 'live' && (
            <>
              {/* Header khi đang live */}
              <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11 border-2 border-white/50 ring-2 ring-red-500">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-semibold text-sm">{profile?.full_name || "Bạn"}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-red-500 text-white text-xs animate-pulse px-2">
                          🔴 LIVE
                        </Badge>
                        <span className="text-white/80 text-xs flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {viewerCount}
                        </span>
                        <span className="text-white/80 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(streamDuration)}
                        </span>
                        {isRecording && (
                          <span className="text-red-400 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            REC
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full"
                    onClick={handleClose}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Video Preview with Filter */}
              <div className="flex-1 relative bg-black overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ 
                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                    filter: getCurrentFilter()
                  }}
                />
                
                {/* Active Stickers */}
                {activeStickers.map(stickerId => {
                  const sticker = STICKERS.find(s => s.id === stickerId);
                  if (!sticker) return null;
                  return (
                    <motion.div 
                      key={stickerId}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute ${getStickerPosition(sticker.position)} text-5xl md:text-6xl pointer-events-none`}
                      style={{ 
                        animation: 'bounce 2s infinite',
                        textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                      }}
                    >
                      {sticker.emoji}
                    </motion.div>
                  );
                })}

                {/* Floating Reactions */}
                <AnimatePresence>
                  {reactions.map(reaction => (
                    <motion.div
                      key={reaction.id}
                      initial={{ bottom: 150, opacity: 1, scale: 1 }}
                      animate={{ bottom: 500, opacity: 0, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2.5, ease: 'easeOut' }}
                      className="absolute text-4xl pointer-events-none z-30"
                      style={{ left: `${reaction.x}%` }}
                    >
                      {reaction.emoji}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <VideoOff className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-70">Camera đã tắt</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Chat (during streaming) */}
              <div className="absolute bottom-24 left-4 right-20 z-20">
                <ScrollArea className="h-36 mb-2">
                  <div className="space-y-2">
                    {messages.slice(-15).map((msg) => (
                      <motion.div 
                        key={msg.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2 bg-black/60 rounded-2xl px-3 py-2 backdrop-blur-sm"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={msg.avatar} />
                          <AvatarFallback className="text-xs bg-primary/50">
                            {msg.user.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <span className="text-primary text-xs font-semibold">{msg.user}</span>
                          <p className="text-white text-sm break-words">{msg.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex items-center gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Viết bình luận..."
                    className="flex-1 bg-black/60 border-white/30 text-white placeholder:text-white/60 text-sm rounded-full"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full"
                    onClick={sendMessage}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Reaction buttons when streaming */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                {['❤️', '😂', '😮', '😢', '👏', '🔥'].map(emoji => (
                  <motion.button
                    key={emoji}
                    whileTap={{ scale: 1.3 }}
                    onClick={() => addReaction(emoji)}
                    className="w-11 h-11 bg-black/50 rounded-full flex items-center justify-center text-xl hover:scale-110 hover:bg-black/70 transition-all backdrop-blur-sm"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>

              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-full text-white ${showFilters ? 'bg-primary' : 'bg-white/20'}`}
                      onClick={() => { setShowFilters(!showFilters); setShowStickers(false); }}
                    >
                      <Palette className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-full text-white ${showStickers ? 'bg-primary' : 'bg-white/20'}`}
                      onClick={() => { setShowStickers(!showStickers); setShowFilters(false); }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </Button>
                  </div>

                  <Button
                    onClick={endLive}
                    className="bg-red-500 hover:bg-red-600 text-white px-6"
                  >
                    Kết thúc
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-white/20 text-white"
                      onClick={() => addReaction('❤️')}
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
                </div>
              </div>
            </>
          )}
        </div>

        {/* Save Video Dialog */}
        {phase === 'ended' && (
          <div className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                {recordedVideoUrl ? 'Lưu video Live Stream' : 'Buổi phát đã kết thúc'}
              </h3>
              
              {/* Stream stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {peakViewers} người xem cao nhất
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(streamDuration)}
                </span>
              </div>
              
              {recordedVideoUrl ? (
                <>
                  <video 
                    src={recordedVideoUrl} 
                    controls 
                    className="w-full rounded-xl aspect-video bg-black"
                  />

                  {/* Edit title/description before posting */}
                  <div className="space-y-2">
                    <Input
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      placeholder="Tiêu đề video..."
                      className="text-sm"
                    />
                    <Textarea
                      value={streamDescription}
                      onChange={(e) => setStreamDescription(e.target.value)}
                      placeholder="Thêm mô tả..."
                      className="resize-none h-16 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handleSaveToFeed}
                      className="w-full gap-2"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang đăng...
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          Đăng lên bảng tin
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadVideo}
                      className="w-full gap-2"
                      disabled={isUploading}
                    >
                      <Download className="w-4 h-4" />
                      Tải về thiết bị
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={handleDiscardVideo}
                      className="w-full text-muted-foreground hover:text-destructive"
                      disabled={isUploading}
                    >
                      Hủy bỏ video
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground text-sm">
                    Video không thể ghi lại do trình duyệt không hỗ trợ hoặc buổi phát quá ngắn.
                  </p>
                  <Button 
                    onClick={handleDiscardVideo}
                    className="w-full"
                  >
                    Đóng
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
