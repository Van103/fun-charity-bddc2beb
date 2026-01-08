import { useState, useEffect, useRef, memo, useCallback } from "react";
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
  RotateCcw,
  RotateCw,
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
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [doubleTapLike, setDoubleTapLike] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSkipIndicator, setShowSkipIndicator] = useState<'forward' | 'backward' | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  
  const { isMuted, toggleMute, setMuted } = useGlobalMute();

  const userName = video.profiles?.full_name || "Người dùng";
  const timeAgo = formatDistanceToNow(new Date(video.created_at), { 
    addSuffix: false, 
    locale: vi 
  });

  // Format time helper (mm:ss)
  const formatTime = useCallback((seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Skip forward/backward
  const skipTime = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress((newTime / videoRef.current.duration) * 100);
    setShowSkipIndicator(seconds > 0 ? 'forward' : 'backward');
    setTimeout(() => setShowSkipIndicator(null), 500);
    setShowControls(true);
  }, []);

  // Handle progress bar click/drag
  const handleProgressBarInteraction = useCallback((clientX: number) => {
    if (!progressBarRef.current || !videoRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = percent * videoRef.current.duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percent * 100);
  }, []);

  const handleProgressBarClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleProgressBarInteraction(e.clientX);
  }, [handleProgressBarInteraction]);

  const handleProgressBarMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    handleProgressBarInteraction(e.clientX);
  }, [handleProgressBarInteraction]);

  const handleProgressBarTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    handleProgressBarInteraction(e.touches[0].clientX);
  }, [handleProgressBarInteraction]);

  // Handle mouse/touch move for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleProgressBarInteraction(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      handleProgressBarInteraction(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleProgressBarInteraction]);

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

  // Progress and duration update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration && !isDragging) {
        setCurrentTime(video.currentTime);
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('durationchange', handleDurationChange);
    
    // Set duration if already loaded
    if (video.duration) {
      setDuration(video.duration);
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('durationchange', handleDurationChange);
    };
  }, [isDragging]);

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

      {/* Skip Indicator Animation */}
      <AnimatePresence>
        {showSkipIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none",
              showSkipIndicator === 'backward' ? "left-12" : "right-12"
            )}
          >
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
              {showSkipIndicator === 'backward' ? (
                <div className="flex flex-col items-center">
                  <RotateCcw className="w-6 h-6 text-white" />
                  <span className="text-white text-xs mt-1">10s</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <RotateCw className="w-6 h-6 text-white" />
                  <span className="text-white text-xs mt-1">10s</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Facebook-style Video Controls Bottom Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-40 left-3 right-20 z-30"
          >
            {/* Progress Bar - Seekable */}
            <div 
              ref={progressBarRef}
              className="relative h-8 flex items-center cursor-pointer group"
              onClick={handleProgressBarClick}
              onMouseDown={handleProgressBarMouseDown}
              onTouchStart={handleProgressBarTouchStart}
            >
              {/* Track Background */}
              <div className="absolute left-0 right-0 h-1 bg-white/30 rounded-full group-hover:h-1.5 transition-all">
                {/* Progress Fill */}
                <div 
                  className="h-full bg-white rounded-full relative"
                  style={{ width: `${progress}%` }}
                >
                  {/* Drag Handle */}
                  <div 
                    className={cn(
                      "absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-transform",
                      "opacity-0 group-hover:opacity-100",
                      isDragging && "opacity-100 scale-125"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Time Display & Skip Controls */}
            <div className="flex items-center justify-between mt-1">
              {/* Time Display */}
              <div className="flex items-center gap-1.5 text-white text-xs font-medium drop-shadow-lg">
                <span>{formatTime(currentTime)}</span>
                <span className="text-white/60">/</span>
                <span className="text-white/80">{formatTime(duration)}</span>
              </div>

              {/* Skip Controls */}
              <div className="flex items-center gap-2">
                {/* Skip Backward 10s */}
                <button
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    skipTime(-10);
                  }}
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                </button>

                {/* Play/Pause */}
                <button
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current) {
                      if (videoRef.current.paused) {
                        videoRef.current.play();
                        setIsPlaying(true);
                      } else {
                        videoRef.current.pause();
                        setIsPlaying(false);
                      }
                    }
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>

                {/* Skip Forward 10s */}
                <button
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    skipTime(10);
                  }}
                >
                  <RotateCw className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-5" />
      
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
    </div>
  );
});
