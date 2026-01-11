import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Send, Loader2, X, Image as ImageIcon } from "lucide-react";
import { CommentStickerPicker } from "./CommentStickerPicker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CommentInputProps {
  postId: string;
  currentUserAvatar?: string | null;
  replyingTo?: { id: string; name: string } | null;
  onCancelReply?: () => void;
  onSubmit: (data: { content: string; imageUrl?: string; stickerUrl?: string; parentCommentId?: string }) => void;
  isSubmitting?: boolean;
}

export function CommentInput({
  postId,
  currentUserAvatar,
  replyingTo,
  onCancelReply,
  onSubmit,
  isSubmitting,
}: CommentInputProps): React.ReactElement {
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Ảnh quá lớn",
          description: "Vui lòng chọn ảnh nhỏ hơn 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedSticker(null); // Clear sticker if image selected
    }
  };

  const handleStickerSelect = (sticker: string) => {
    setSelectedSticker(sticker);
    setImagePreview(null);
    setImageFile(null);
  };

  const clearAttachment = () => {
    setImagePreview(null);
    setImageFile(null);
    setSelectedSticker(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setIsUploadingImage(true);
    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `comment-${postId}-${Date.now()}.${fileExt}`;
      const filePath = `comment-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("posts").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Lỗi tải ảnh",
        description: "Không thể tải ảnh lên. Vui lòng thử lại.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Must have either text, image, or sticker
    if (!commentText.trim() && !imageFile && !selectedSticker) return;

    let imageUrl: string | undefined;
    if (imageFile) {
      const url = await uploadImage();
      if (url) imageUrl = url;
    }

    onSubmit({
      content: selectedSticker ? selectedSticker : commentText,
      imageUrl,
      stickerUrl: selectedSticker || undefined,
      parentCommentId: replyingTo?.id,
    });

    // Reset
    setCommentText("");
    clearAttachment();
  };

  const isLoading = isSubmitting || isUploadingImage;
  const hasContent = commentText.trim() || imageFile || selectedSticker;

  return (
    <div className="space-y-2">
      {/* Replying indicator */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-xs text-muted-foreground px-2"
          >
            <span>
              Đang trả lời <strong className="text-foreground">{replyingTo.name}</strong>
            </span>
            <button
              className="text-secondary hover:underline"
              onClick={onCancelReply}
            >
              Hủy
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment preview */}
      <AnimatePresence>
        {(imagePreview || selectedSticker) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative inline-block ml-10"
          >
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-24 rounded-lg border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                  onClick={clearAttachment}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            {selectedSticker && (
              <div className="relative inline-block">
                <span className="text-4xl">{selectedSticker}</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                  onClick={clearAttachment}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={currentUserAvatar || ""} />
          <AvatarFallback className="bg-secondary/20 text-xs">U</AvatarFallback>
        </Avatar>

        <div className="flex-1 flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1.5">
          {/* Camera button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-full hover:bg-secondary/20"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Camera className="w-4 h-4 text-muted-foreground" />
          </Button>

          {/* Sticker picker */}
          <CommentStickerPicker
            onSelect={handleStickerSelect}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-full hover:bg-secondary/20"
                disabled={isLoading}
              >
                <span className="text-base">😊</span>
              </Button>
            }
          />

          {/* Text input */}
          <Input
            placeholder={
              replyingTo
                ? `Trả lời ${replyingTo.name}...`
                : "Viết bình luận..."
            }
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              if (e.target.value && selectedSticker) {
                setSelectedSticker(null);
              }
            }}
            className="border-none bg-transparent p-0 h-auto focus-visible:ring-0 text-sm flex-1"
            disabled={isLoading}
          />

          {/* Send button */}
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 shrink-0 rounded-full transition-colors",
              hasContent ? "text-secondary hover:bg-secondary/20" : "text-muted-foreground"
            )}
            disabled={!hasContent || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
