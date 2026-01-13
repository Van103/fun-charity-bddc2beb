import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Send, Loader2, X, Smile, ImageIcon } from "lucide-react";
import { CommentStickerPicker } from "./CommentStickerPicker";
import { GifPicker } from "./GifPicker";
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
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setSelectedSticker(null);
      setSelectedGif(null);
    }
  };

  const handleStickerSelect = (sticker: string) => {
    setSelectedSticker(sticker);
    setImagePreview(null);
    setImageFile(null);
    setSelectedGif(null);
  };

  const handleGifSelect = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setSelectedSticker(null);
    setImagePreview(null);
    setImageFile(null);
  };

  const clearAttachment = () => {
    setImagePreview(null);
    setImageFile(null);
    setSelectedSticker(null);
    setSelectedGif(null);
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
    
    // Must have either text, image, sticker, or GIF
    if (!commentText.trim() && !imageFile && !selectedSticker && !selectedGif) return;

    let imageUrl: string | undefined;
    if (imageFile) {
      const url = await uploadImage();
      if (url) imageUrl = url;
    }

    // If GIF is selected, pass it as imageUrl
    if (selectedGif) {
      imageUrl = selectedGif;
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
  const hasContent = commentText.trim() || imageFile || selectedSticker || selectedGif;

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
        {(imagePreview || selectedSticker || selectedGif) && (
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
              <motion.div 
                className="relative inline-block"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10, stiffness: 200 }}
              >
                <span className="text-5xl drop-shadow-lg">{selectedSticker}</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                  onClick={clearAttachment}
                >
                  <X className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
            {selectedGif && (
              <motion.div 
                className="relative inline-block"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img
                  src={selectedGif}
                  alt="GIF"
                  className="max-h-32 rounded-lg border border-border"
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
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input form - Facebook style */}
      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <Avatar className="w-8 h-8 shrink-0 mt-1">
          <AvatarImage src={currentUserAvatar || ""} />
          <AvatarFallback className="bg-secondary/20 text-xs">U</AvatarFallback>
        </Avatar>

        <div className="flex-1 flex flex-col gap-1">
          <div 
            className={cn(
              "flex items-center gap-1 bg-muted/50 rounded-2xl px-3 py-2 transition-all",
              isFocused && "ring-1 ring-secondary/30"
            )}
          >
            {/* Text input */}
            <Input
              ref={inputRef}
              placeholder={
                replyingTo
                  ? `Trả lời ${replyingTo.name}...`
                  : "Viết bình luận..."
              }
              value={commentText}
              onChange={(e) => {
                setCommentText(e.target.value);
                if (e.target.value && (selectedSticker || selectedGif)) {
                  setSelectedSticker(null);
                  setSelectedGif(null);
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="border-none bg-transparent p-0 h-auto focus-visible:ring-0 text-sm flex-1 min-w-0"
              disabled={isLoading}
            />
          </div>

          {/* Action buttons - Facebook style row */}
          <div className="flex items-center gap-1 ml-1">
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
                  <Smile className="w-4 h-4 text-muted-foreground hover:text-secondary transition-colors" />
                </Button>
              }
            />

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
              <Camera className="w-4 h-4 text-muted-foreground hover:text-secondary transition-colors" />
            </Button>

            {/* GIF picker */}
            <GifPicker
              onSelect={handleGifSelect}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 shrink-0 rounded-full hover:bg-secondary/20"
                  disabled={isLoading}
                >
                  <span className="text-xs font-bold text-muted-foreground hover:text-secondary transition-colors">GIF</span>
                </Button>
              }
            />

            <div className="flex-1" />

            {/* Send button */}
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 shrink-0 rounded-full transition-all",
                hasContent 
                  ? "text-secondary hover:bg-secondary/20 scale-100" 
                  : "text-muted-foreground scale-90 opacity-50"
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
        </div>
      </form>
    </div>
  );
}
