import { useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useGlobalMute } from "@/hooks/useVideoAutoplay";
import { cn } from "@/lib/utils";

interface VideoReelData {
  id: string;
  title?: string | null;
  content?: string | null;
  user_id: string;
  created_at: string;
  media_url: string;
  live_viewer_count?: number;
  is_live_video?: boolean;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    is_verified?: boolean;
  } | null;
  reactions_count?: number;
  comments_count?: number;
  shares_count?: number;
}

interface VideoReelCardProps {
  video: VideoReelData;
  isActive: boolean;
  onRegister: (id: string, element: HTMLVideoElement) => (() => void) | undefined;
  onReact?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

// Get avatar gradient based on name
const getAvatarGradient = (name: string) => {
  const gradients = [
    "from-purple-soft to-purple-light",
    "from-gold-champagne to-gold-light",
    "from-pink-400 to-rose-300",
    "from-sky-400 to-blue-300",
    "from-emerald-400 to-teal-300",
  ];
  const index = (name?.charCodeAt(0) || 0) % gradients.length;
  return gradients[index];
};

export const VideoReelCard = memo(function VideoReelCard({
  video,
  isActive,
  onRegister,
  onReact,
  onComment,
  onShare,
}: VideoReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [doubleTapLike, setDoubleTapLike] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  
  const { isMuted, toggleMute, setMuted } = useGlobalMute();

  const userName = video.profiles?.full_name || "Người dùng";
  const timeAgo = formatDistanceToNow(new Date(video.created_at), { 
    addSuffix: false, 
    locale: vi 
  });

  // Register video with parent observer
  useEffect(() => {
    if (videoRef.current) {
      const cleanup = onRegister(video.id, videoRef.current);
      return cleanup;
    }
  }, [video.id, onRegister]);

  // Handle play/pause based on active state
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {
        // Autoplay blocked - mute and try again
        videoRef.current!.muted = true;
        setMuted(true);
        videoRef.current!.play().catch(() => {});
      });
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, isMuted, setMuted]);

  // Update mute when global state changes
  useEffect(() => {
    if (videoRef.current && isActive) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, isActive]);

  // Progress update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isActive) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isActive]);

  const handleVideoTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300) {
      // Double tap - like
      setIsLiked(true);
      setDoubleTapLike(true);
      setTimeout(() => setDoubleTapLike(false), 1000);
      onReact?.();
    } else {
      // Single tap - toggle play/pause
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
      setShowControls(true);
    }
    
    lastTapRef.current = now;
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMute();
  };

  return (
    <div 
      className="relative w-full h-full snap-start snap-always bg-black flex-shrink-0"
      style={{ height: 'calc(100vh - 7rem)' }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.media_url}
        className="w-full h-full object-contain"
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoTap}
        poster=""
      />

      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {doubleTapLike && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <Heart className="w-32 h-32 text-red-500 fill-red-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10">
        <motion.div
          className="h-full bg-white"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Play/Pause Overlay */}
      <AnimatePresence>
        {!isPlaying && showControls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side Actions - TikTok style */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-20">
        {/* Profile Avatar */}
        <Link 
          to={`/user/${video.user_id}`}
          className="relative no-tap-highlight"
        >
          <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
            <AvatarImage src={video.profiles?.avatar_url || ""} />
            <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(userName)} text-white font-semibold`}>
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-lg leading-none">+</span>
          </div>
        </Link>

        {/* Like Button */}
        <button 
          className="flex flex-col items-center gap-1 no-tap-highlight"
          onClick={() => {
            setIsLiked(!isLiked);
            onReact?.();
          }}
        >
          <motion.div
            whileTap={{ scale: 1.3 }}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              isLiked ? "bg-red-500/20" : "bg-white/10 backdrop-blur-sm"
            )}
          >
            <Heart 
              className={cn(
                "w-7 h-7 transition-all",
                isLiked ? "text-red-500 fill-red-500" : "text-white"
              )} 
            />
          </motion.div>
          <span className="text-white text-xs font-medium drop-shadow-lg">
            {((video.reactions_count || 0) + (isLiked ? 1 : 0)).toLocaleString()}
          </span>
        </button>

        {/* Comment Button */}
        <button 
          className="flex flex-col items-center gap-1 no-tap-highlight"
          onClick={onComment}
        >
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow-lg">
            {(video.comments_count || 0).toLocaleString()}
          </span>
        </button>

        {/* Share Button */}
        <button 
          className="flex flex-col items-center gap-1 no-tap-highlight"
          onClick={onShare}
        >
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow-lg">
            {(video.shares_count || 0).toLocaleString()}
          </span>
        </button>

        {/* Mute Toggle */}
        <button 
          className="flex flex-col items-center gap-1 no-tap-highlight"
          onClick={handleMuteToggle}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </motion.div>
        </button>
      </div>

      {/* Bottom Info - User & Description */}
      <div className="absolute bottom-4 left-3 right-20 z-20">
        {/* User Info */}
        <div className="flex items-center gap-2 mb-2">
          <Link 
            to={`/user/${video.user_id}`}
            className="font-semibold text-white text-base drop-shadow-lg hover:underline no-tap-highlight"
          >
            @{userName.replace(/\s+/g, '').toLowerCase()}
          </Link>
          {video.profiles?.is_verified && (
            <Badge variant="secondary" className="bg-blue-500 text-white text-[10px] px-1.5 py-0">
              ✓
            </Badge>
          )}
          <span className="text-white/70 text-sm">• {timeAgo}</span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          {video.title && (
            <h3 className="text-white font-semibold text-base drop-shadow-lg line-clamp-1">
              {video.title}
            </h3>
          )}
          {video.content && (
            <p className="text-white/90 text-sm drop-shadow-lg line-clamp-2">
              {video.content}
            </p>
          )}
        </div>

        {/* Live indicator if it's a recorded live */}
        {video.is_live_video && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="bg-red-500/80 text-white text-xs px-2 py-0.5 gap-1">
              <Eye className="w-3 h-3" />
              {(video.live_viewer_count || 0).toLocaleString()} đã xem
            </Badge>
          </div>
        )}
      </div>

      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
      
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
    </div>
  );
});
