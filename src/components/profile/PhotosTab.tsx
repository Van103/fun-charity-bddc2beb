import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MediaItem {
  url: string;
  type: string;
}

interface PhotosTabProps {
  userId: string | null;
}

export function PhotosTab({ userId }: PhotosTabProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchMedia();
    }
  }, [userId]);

  const fetchMedia = async () => {
    if (!userId) return;

    try {
      // Fetch from posts table
      const { data: postsData } = await supabase
        .from("posts")
        .select("image_url, media_urls")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      // Fetch from feed_posts table
      const { data: feedPostsData } = await supabase
        .from("feed_posts")
        .select("media_urls")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      const allMedia: MediaItem[] = [];
      
      // Process posts
      postsData?.forEach((post) => {
        if (post.media_urls && Array.isArray(post.media_urls)) {
          (post.media_urls as unknown as MediaItem[]).forEach((item) => {
            if (item && item.url) {
              allMedia.push(item);
            }
          });
        } else if (post.image_url) {
          allMedia.push({ url: post.image_url, type: "image" });
        }
      });

      // Process feed_posts
      feedPostsData?.forEach((post) => {
        if (post.media_urls && Array.isArray(post.media_urls)) {
          (post.media_urls as unknown as MediaItem[]).forEach((item) => {
            if (item && item.url) {
              allMedia.push(item);
            }
          });
        }
      });
      
      setMedia(allMedia);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Chưa có hình ảnh/video</h3>
        <p className="text-muted-foreground">
          Các hình ảnh và video từ bài viết sẽ xuất hiện ở đây
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {media.map((item, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div className="aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted hover:opacity-90 transition-opacity relative">
              {item.type === "video" ? (
                <>
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-foreground fill-current ml-1" />
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
            {item.type === "video" ? (
              <video
                src={item.url}
                className="w-full h-auto max-h-[90vh] rounded-lg"
                controls
                autoPlay
              />
            ) : (
              <img
                src={item.url}
                alt={`Media ${index + 1}`}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

// Preview component for profile sidebar
interface PhotosPreviewCardProps {
  userId: string | null;
  onViewAll?: () => void;
}

export function PhotosPreviewCard({ userId, onViewAll }: PhotosPreviewCardProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPhotos();
    }
  }, [userId]);

  const fetchPhotos = async () => {
    if (!userId) return;

    try {
      const allPhotos: string[] = [];

      // Fetch from posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("image_url, media_urls")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch from feed_posts
      const { data: feedPostsData } = await supabase
        .from("feed_posts")
        .select("media_urls")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      postsData?.forEach(post => {
        if (allPhotos.length >= 9) return;
        if (post.image_url) {
          allPhotos.push(post.image_url);
        }
        const mediaUrls = post.media_urls as unknown as MediaItem[] | null;
        if (mediaUrls && Array.isArray(mediaUrls)) {
          mediaUrls.forEach(media => {
            if (media.type === 'image' && media.url && allPhotos.length < 9) {
              allPhotos.push(media.url);
            }
          });
        }
      });

      feedPostsData?.forEach(post => {
        if (allPhotos.length >= 9) return;
        const mediaUrls = post.media_urls as unknown as MediaItem[] | null;
        if (mediaUrls && Array.isArray(mediaUrls)) {
          mediaUrls.forEach(media => {
            if (media.type === 'image' && media.url && allPhotos.length < 9) {
              allPhotos.push(media.url);
            }
          });
        }
      });

      setPhotos(allPhotos.slice(0, 9));
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {photos.length > 0 ? (
        photos.map((photo, index) => (
          <div 
            key={index}
            className="aspect-square cursor-pointer overflow-hidden rounded-md hover:opacity-90 transition-opacity"
            onClick={onViewAll}
          >
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))
      ) : (
        [...Array(9)].map((_, i) => (
          <div 
            key={i} 
            className="aspect-square bg-gradient-to-br from-secondary/20 to-primary/20 rounded-md"
          />
        ))
      )}
    </div>
  );
}
