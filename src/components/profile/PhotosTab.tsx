import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PhotosTabProps {
  userId: string | null;
}

export function PhotosTab({ userId }: PhotosTabProps) {
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
      const { data, error } = await supabase
        .from("posts")
        .select("image_url")
        .eq("user_id", userId)
        .not("image_url", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const photoUrls = data
        .map((post) => post.image_url)
        .filter((url): url is string => url !== null);
      
      setPhotos(photoUrls);
    } catch (error) {
      console.error("Error fetching photos:", error);
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

  if (photos.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Chưa có hình ảnh</h3>
        <p className="text-muted-foreground">
          Các hình ảnh từ bài viết sẽ xuất hiện ở đây
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div className="aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted hover:opacity-90 transition-opacity">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
