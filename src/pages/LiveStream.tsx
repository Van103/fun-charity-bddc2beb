import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useLiveComments } from "@/hooks/useLiveComments";
import { Helmet } from "react-helmet-async";
import { 
  ArrowLeft, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Users,
  Radio,
  Send
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LiveStreamSharePanel } from "@/components/social/LiveStreamSharePanel";

interface LiveStreamData {
  id: string;
  content: string | null;
  title: string | null;
  user_id: string;
  live_viewer_count: number;
  is_live_video: boolean;
  is_active: boolean;
  created_at: string;
  media_urls: any;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function LiveStream() {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const [stream, setStream] = useState<LiveStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [newComment, setNewComment] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Real-time comments hook
  const { comments, sendComment, isLoading: commentsLoading } = useLiveComments({
    liveId: streamId || null,
    enabled: !!streamId
  });

  // Auto-scroll to bottom when new comments arrive
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  useEffect(() => {
    if (streamId) {
      fetchStreamData();
      subscribeToStream();
    }
  }, [streamId]);

  const fetchStreamData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("feed_posts")
        .select(`
          id,
          content,
          title,
          user_id,
          live_viewer_count,
          is_live_video,
          is_active,
          created_at,
          media_urls,
          profiles!feed_posts_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("id", streamId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching stream:", fetchError);
        setError("Không thể tải thông tin live stream");
        return;
      }

      if (!data) {
        setError("Live stream không tồn tại hoặc đã kết thúc");
        return;
      }

      // Transform the data to match our interface
      const streamData: LiveStreamData = {
        ...data,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
      };

      setStream(streamData);

      // Increment viewer count
      if (streamData.is_live_video && streamData.is_active) {
        await supabase
          .from("feed_posts")
          .update({ live_viewer_count: (streamData.live_viewer_count || 0) + 1 })
          .eq("id", streamId);
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Đã xảy ra lỗi khi tải live stream");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToStream = () => {
    const channel = supabase
      .channel(`live-stream-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'feed_posts',
          filter: `id=eq.${streamId}`
        },
        (payload) => {
          setStream(prev => prev ? { 
            ...prev, 
            ...payload.new,
            live_viewer_count: (payload.new as any).live_viewer_count 
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToFeed = () => {
    navigate("/social");
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    
    const success = await sendComment(newComment.trim());
    if (success) {
      setNewComment("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 sm:pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Đang tải live stream...</p>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 sm:pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 p-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Radio className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {error || "Live stream không tồn tại"}
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              Live stream này có thể đã kết thúc hoặc không tồn tại. 
              Hãy quay lại bảng tin để xem các live stream khác.
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <Button onClick={handleGoToFeed}>
                Xem bảng tin
              </Button>
            </div>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  const isLive = stream.is_live_video && stream.is_active;

  return (
    <>
      <Helmet>
        <title>{stream.title || "Live Stream"} - FUN Charity</title>
        <meta name="description" content={stream.content || "Xem live stream trên FUN Charity"} />
        <meta property="og:title" content={stream.title || "Live Stream"} />
        <meta property="og:description" content={stream.content || "Xem live stream trực tiếp"} />
        <meta property="og:type" content="video.other" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-16 sm:pt-20 pb-24 md:pb-12">
          <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
            {/* Back button */}
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>

            {/* Live Stream Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              {/* Video/Stream Area */}
              <div className="relative aspect-video bg-black">
                {stream.media_urls && Array.isArray(stream.media_urls) && stream.media_urls.length > 0 ? (
                  <video
                    ref={videoRef}
                    src={stream.media_urls[0]}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="text-center space-y-4">
                      <Radio className="w-16 h-16 text-primary mx-auto animate-pulse" />
                      <p className="text-white text-lg font-medium">
                        {isLive ? "Đang phát trực tiếp..." : "Live stream đã kết thúc"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Live Badge */}
                {isLive && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-semibold animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      LIVE
                    </Badge>
                  </div>
                )}

                {/* Viewer Count */}
                <div className="absolute top-4 right-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      {stream.live_viewer_count || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stream Info */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Streamer Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-primary/50">
                      <AvatarImage src={stream.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20">
                        {stream.profiles?.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {stream.profiles?.full_name || "Người dùng"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isLive ? "Đang phát trực tiếp" : "Đã kết thúc"}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSharePanel(true)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Chia sẻ
                  </Button>
                </div>

                {/* Title */}
                {stream.title && (
                  <h2 className="text-xl font-bold text-foreground">
                    {stream.title}
                  </h2>
                )}

                {/* Description */}
                {stream.content && (
                  <p className="text-muted-foreground">
                    {stream.content}
                  </p>
                )}

                {/* Live Comments Section */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Bình luận ({comments.length})
                  </h3>
                  
                  {/* Comments List */}
                  <ScrollArea className="h-64 mb-4 pr-4">
                    <div className="space-y-3">
                      {comments.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-8">
                          {isLive ? "Chưa có bình luận nào. Hãy là người đầu tiên!" : "Không có bình luận nào."}
                        </p>
                      ) : (
                        comments.map((comment) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3"
                          >
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={comment.avatar_url || undefined} />
                              <AvatarFallback className="text-xs bg-primary/20">
                                {comment.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-sm text-foreground">
                                  {comment.username}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.created_at).toLocaleTimeString('vi-VN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-foreground break-words">
                                {comment.message}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      )}
                      <div ref={commentsEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Comment Input */}
                  {isLive && (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                        placeholder="Viết bình luận..."
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        onClick={handleSendComment}
                        disabled={!newComment.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Heart className="w-5 h-5" />
                    Thích
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => setShowSharePanel(true)}
                  >
                    <Share2 className="w-5 h-5" />
                    Chia sẻ
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
        <MobileBottomNav />

        {/* Share Panel */}
        <LiveStreamSharePanel
          open={showSharePanel}
          onClose={() => setShowSharePanel(false)}
          streamTitle={stream.title || "Live Stream"}
          streamId={stream.id}
        />
      </div>
    </>
  );
}
