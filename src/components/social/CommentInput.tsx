import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Send, Loader2, X, Smile, Sticker } from "lucide-react";
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
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      setSelectedGif(null);
    }
  };

  // Append emoji/sticker to text instead of auto-sending
  const handleEmojiSelect = (emoji: string) => {
    setCommentText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  // For large stickers, we still want to send them as sticker
  const handleStickerSelect = (sticker: string) => {
    // Send sticker directly
    onSubmit({
      content: sticker,
      stickerUrl: sticker,
      parentCommentId: replyingTo?.id,
    });
    setCommentText("");
    clearAttachment();
  };

  const handleGifSelect = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setImagePreview(null);
    setImageFile(null);
  };

  const clearAttachment = () => {
    setImagePreview(null);
    setImageFile(null);
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
    
    // Must have either text, image, or GIF
    if (!commentText.trim() && !imageFile && !selectedGif) return;

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
      content: commentText,
      imageUrl,
      parentCommentId: replyingTo?.id,
    });

    // Reset
    setCommentText("");
    clearAttachment();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isLoading = isSubmitting || isUploadingImage;
  const hasContent = commentText.trim() || imageFile || selectedGif;

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
        {(imagePreview || selectedGif) && (
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

        <div className="flex-1">
          {/* Input container with right icons - Facebook style */}
          <div 
            className={cn(
              "flex items-center bg-muted/50 rounded-full transition-all px-3",
              isFocused && "ring-1 ring-secondary/30"
            )}
          >
            {/* Text input */}
            <textarea
              ref={inputRef}
              placeholder={
                replyingTo
                  ? `Bình luận dưới tên ${replyingTo.name}`
                  : "Viết bình luận..."
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              rows={1}
              className={cn(
                "flex-1 bg-transparent resize-none border-none py-2.5 text-sm",
                "focus:outline-none focus:ring-0 placeholder:text-muted-foreground",
                "min-h-[36px] max-h-[100px]"
              )}
              style={{
                height: 'auto',
                overflow: 'hidden'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 100) + 'px';
              }}
              disabled={isLoading}
            />

            {/* Right side icons inside input - Facebook style */}
            <div className="flex items-center gap-0.5 ml-1">
              <CommentStickerPicker
                onSelect={handleEmojiSelect}
                appendMode={true}
                trigger={
                  <button
                    type="button"
                    className="p-1.5 rounded-full hover:bg-background/50 transition-colors"
                    disabled={isLoading}
                  >
                    <Smile className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                }
              />
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-background/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Camera className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
              <GifPicker
                onSelect={handleGifSelect}
                trigger={
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-background/50 transition-colors"
                    disabled={isLoading}
                  >
                    <span className="text-[9px] font-bold text-muted-foreground hover:text-foreground border border-muted-foreground/50 rounded px-1 py-0.5">GIF</span>
                  </button>
                }
              />
            </div>
          </div>

          {/* Bottom row - icons left, send right - Facebook style */}
          <div className="flex items-center justify-between mt-1 px-1">
            <div className="flex items-center">
              <CommentStickerPicker
                onSelect={handleEmojiSelect}
                appendMode={true}
                trigger={
                  <button
                    type="button"
                    className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                    disabled={isLoading}
                  >
                    <span className="text-base opacity-70 hover:opacity-100">😊</span>
                  </button>
                }
              />
              <CommentStickerPicker
                onSelect={handleEmojiSelect}
                appendMode={true}
                trigger={
                  <button
                    type="button"
                    className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                    disabled={isLoading}
                  >
                    <span className="text-base opacity-70 hover:opacity-100">😀</span>
                  </button>
                }
              />
              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Camera className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
              <GifPicker
                onSelect={handleGifSelect}
                trigger={
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-muted/50 transition-colors"
                    disabled={isLoading}
                  >
                    <span className="text-[9px] font-bold text-muted-foreground hover:text-foreground border border-muted-foreground/50 rounded px-1 py-0.5">GIF</span>
                  </button>
                }
              />
              <CommentStickerPicker
                onSelect={handleStickerSelect}
                appendMode={false}
                trigger={
                  <button
                    type="button"
                    className="p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                    disabled={isLoading}
                  >
                    <Sticker className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                }
              />
            </div>

            {/* Send button - always visible like Facebook */}
            <button
              type="submit"
              className={cn(
                "p-1.5 rounded-full transition-colors",
                hasContent 
                  ? "text-secondary hover:bg-secondary/10" 
                  : "text-muted-foreground/50 cursor-not-allowed"
              )}
              disabled={!hasContent || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>
      </form>
    </div>
  );
}
