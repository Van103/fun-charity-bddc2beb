import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";
import { VideoReelCard } from "./VideoReelCard";
import { cn } from "@/lib/utils";

interface VideoPost {
  id: string;
  title: string | null;
  content: string | null;
  user_id: string;
  created_at: string;
  media_urls: any[];
  live_viewer_count: number | null;
  is_live_video: boolean | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean | null;
  } | null;
  reactions_count?: number;
  comments_count?: number;
  shares_count?: number;
}

interface VideoReelsFeedProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideoId?: string;
}

// Sample videos for demo purposes (will be replaced with real data)
const SAMPLE_VIDEOS = [
  {
    id: 'sample-1',
    title: 'Khám phá cảnh đẹp Việt Nam 🇻🇳',
    content: 'Hành trình khám phá những địa điểm tuyệt đẹp trên khắp Việt Nam. Từ Hà Giang đến Phú Quốc! #travel #vietnam',
    user_id: 'sample-user-1',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    is_live_video: true,
    live_viewer_count: 1234,
    profiles: {
      full_name: 'Travel Vietnam',
      avatar_url: null,
      is_verified: true,
    },
    reactions_count: 5432,
    comments_count: 234,
    shares_count: 89,
  },
  {
    id: 'sample-2',
    title: 'Nấu ăn ngon mỗi ngày 🍜',
    content: 'Công thức Phở bò truyền thống Hà Nội - Món ăn quốc hồn quốc túy! #food #pho #hanoi',
    user_id: 'sample-user-2',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    is_live_video: false,
    live_viewer_count: 0,
    profiles: {
      full_name: 'Chef Minh',
      avatar_url: null,
      is_verified: false,
    },
    reactions_count: 8765,
    comments_count: 567,
    shares_count: 234,
  },
  {
    id: 'sample-3',
    title: 'Yoga buổi sáng 🧘‍♀️',
    content: 'Bắt đầu ngày mới với 10 phút yoga nhẹ nhàng. Tốt cho sức khỏe thể chất và tinh thần! #yoga #wellness',
    user_id: 'sample-user-3',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    is_live_video: true,
    live_viewer_count: 567,
    profiles: {
      full_name: 'Yoga Việt Nam',
      avatar_url: null,
      is_verified: true,
    },
    reactions_count: 3456,
    comments_count: 123,
    shares_count: 67,
  },
  {
    id: 'sample-4',
    title: 'Từ thiện tại vùng cao 💜',
    content: 'Hành trình mang yêu thương đến với các em nhỏ vùng cao. Cảm ơn mọi người đã ủng hộ! #charity #funlove',
    user_id: 'sample-user-4',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    is_live_video: true,
    live_viewer_count: 2345,
    profiles: {
      full_name: 'FUN Charity',
      avatar_url: null,
      is_verified: true,
    },
    reactions_count: 12345,
    comments_count: 876,
    shares_count: 432,
  },
  {
    id: 'sample-5',
    title: 'Nhạc acoustic chill 🎸',
    content: 'Cover những bài hit Vpop theo phong cách acoustic. Thư giãn cuối tuần! #music #acoustic',
    user_id: 'sample-user-5',
    created_at: new Date(Date.now() - 18000000).toISOString(),
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    is_live_video: false,
    live_viewer_count: 0,
    profiles: {
      full_name: 'Music Chill',
      avatar_url: null,
      is_verified: false,
    },
    reactions_count: 6789,
    comments_count: 345,
    shares_count: 156,
  },
];

export function VideoReelsFeed({ isOpen, onClose, initialVideoId }: VideoReelsFeedProps) {
  const [videos, setVideos] = useState<typeof SAMPLE_VIDEOS>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { activeVideoId, registerVideo, unregisterVideo } = useVideoAutoplay({
    threshold: 0.6,
  });

  // Fetch videos with video content
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch posts with video content
      const { data, error: fetchError } = await supabase
        .from('feed_posts')
        .select(`
          id,
          title,
          content,
          user_id,
          created_at,
          media_urls,
          live_viewer_count,
          is_live_video
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;

      // Filter posts that have video content
      const videoPosts = (data || [])
        .filter((post) => {
          const mediaUrls = post.media_urls as any[] | null;
          if (!mediaUrls || !Array.isArray(mediaUrls)) return false;
          return mediaUrls.some((media: any) => {
            const url = typeof media === 'string' ? media : media?.url;
            return url && /\.(mp4|webm|mov|m3u8)$/i.test(url);
          });
        })
        .map((post) => {
          const mediaUrls = post.media_urls as any[];
          const videoMedia = mediaUrls.find((media: any) => {
            const url = typeof media === 'string' ? media : media?.url;
            return url && /\.(mp4|webm|mov|m3u8)$/i.test(url);
          });
          const media_url = typeof videoMedia === 'string' ? videoMedia : videoMedia?.url;

          return {
            id: post.id,
            title: post.title,
            content: post.content,
            user_id: post.user_id,
            created_at: post.created_at,
            media_url,
            is_live_video: post.is_live_video || false,
            live_viewer_count: post.live_viewer_count || 0,
            profiles: null,
            reactions_count: 0,
            comments_count: 0,
            shares_count: 0,
          };
        });

      // Combine with sample videos if no real videos found
      if (videoPosts.length === 0) {
        setVideos(SAMPLE_VIDEOS);
      } else {
        setVideos(videoPosts);
      }
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      // Fallback to sample videos
      setVideos(SAMPLE_VIDEOS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchVideos();
      // Lock body scroll when open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, fetchVideos]);

  // Scroll to initial video if provided
  useEffect(() => {
    if (isOpen && initialVideoId && containerRef.current && videos.length > 0) {
      const videoIndex = videos.findIndex(v => v.id === initialVideoId);
      if (videoIndex >= 0) {
        const cardHeight = window.innerHeight - 112; // Height of each card
        containerRef.current.scrollTo({
          top: videoIndex * cardHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [isOpen, initialVideoId, videos]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-gradient-to-b from-black/80 to-transparent">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-white" />
            <span className="font-semibold text-white">Reels</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={fetchVideos}
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </Button>
        </div>

        {/* Video Feed Container */}
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
              <p className="text-white/70">Đang tải video...</p>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 px-6">
              <Video className="w-16 h-16 text-white/50 mx-auto" />
              <h3 className="text-white text-lg font-semibold">Chưa có video nào</h3>
              <p className="text-white/70 text-sm">
                Các video từ live stream và bài viết sẽ xuất hiện ở đây
              </p>
              <Button onClick={onClose} variant="secondary">
                Quay lại
              </Button>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth scrollbar-hide"
            style={{ scrollSnapType: 'y mandatory' }}
          >
            {videos.map((video) => (
              <VideoReelCard
                key={video.id}
                video={video}
                isActive={activeVideoId === video.id}
                onRegister={registerVideo}
                onReact={() => {
                  // TODO: Handle reaction
                }}
                onComment={() => {
                  // TODO: Open comments
                }}
                onShare={() => {
                  // TODO: Handle share
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
