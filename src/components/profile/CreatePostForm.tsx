import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, X, Send } from "lucide-react";

interface CreatePostFormProps {
  profile: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  onPostCreated: () => void;
}

export function CreatePostForm({ profile, onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;
    if (!profile?.user_id) return;

    setIsSubmitting(true);
    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `${profile.user_id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("posts").insert({
        user_id: profile.user_id,
        content: content.trim() || null,
        image_url: imageUrl,
      });

      if (error) throw error;

      setContent("");
      setImageFile(null);
      setImagePreview(null);
      onPostCreated();

      toast({
        title: "Thành công",
        description: "Bài viết đã được đăng",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đăng bài viết",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={profile?.avatar_url || ""} />
          <AvatarFallback className="bg-secondary/20 text-secondary">
            {profile?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Bạn đang nghĩ gì?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-none border-none bg-muted/50 focus-visible:ring-1 focus-visible:ring-secondary"
          />
        </div>
      </div>

      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-64 rounded-lg object-cover"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 w-8 h-8"
            onClick={removeImage}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-secondary"
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Thêm ảnh
          </Button>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && !imageFile)}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Đăng
        </Button>
      </div>
    </div>
  );
}
