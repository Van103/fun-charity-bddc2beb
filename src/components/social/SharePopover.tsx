import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Share2,
  Link2,
  Send,
  UserPlus,
  Check,
  Loader2,
  Facebook,
  Twitter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { FeedPost, useCreateFeedPost } from "@/hooks/useFeedPosts";

interface SharePopoverProps {
  post: FeedPost;
  currentUserAvatar?: string | null;
}

export function SharePopover({ post, currentUserAvatar }: SharePopoverProps) {
  const [open, setOpen] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareText, setShareText] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const createPost = useCreateFeedPost();

  const postUrl = `${window.location.origin}/feed?post=${post.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast({
        title: "Đã sao chép",
        description: "Link bài viết đã được sao chép vào clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép link",
        variant: "destructive",
      });
    }
  };

  const handleShareToProfile = () => {
    setShowShareDialog(true);
    setOpen(false);
  };

  const handleConfirmShare = () => {
    // Create a new post that references/shares the original
    const shareContent = shareText
      ? `${shareText}\n\n📢 Chia sẻ từ ${post.profiles?.full_name || "Người dùng"}:\n"${post.title || post.content?.slice(0, 100)}${post.content && post.content.length > 100 ? "..." : ""}"`
      : `📢 Chia sẻ từ ${post.profiles?.full_name || "Người dùng"}:\n"${post.title || post.content?.slice(0, 100)}${post.content && post.content.length > 100 ? "..." : ""}"`;

    createPost.mutate(
      {
        post_type: "story",
        content: shareContent,
        media_urls: post.media_urls?.slice(0, 1) || [],
      },
      {
        onSuccess: () => {
          setShowShareDialog(false);
          setShareText("");
          toast({
            title: "Đã chia sẻ",
            description: "Bài viết đã được chia sẻ lên trang cá nhân của bạn",
          });
        },
      }
    );
  };

  const handleShareViaMessage = () => {
    // Open native share if available, otherwise show toast
    if (navigator.share) {
      navigator
        .share({
          title: post.title || "Bài viết từ FUN Charity",
          text: post.content?.slice(0, 200) || "",
          url: postUrl,
        })
        .catch(() => {
          // User cancelled or error
        });
    } else {
      toast({
        title: "Chia sẻ qua tin nhắn",
        description: "Sao chép link và gửi cho bạn bè của bạn!",
      });
      handleCopyLink();
    }
    setOpen(false);
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      "_blank",
      "width=600,height=400"
    );
    setOpen(false);
  };

  const handleShareTwitter = () => {
    const text = post.title || post.content?.slice(0, 100) || "Bài viết từ FUN Charity";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
      "_blank",
      "width=600,height=400"
    );
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
          >
            <Share2 className="w-5 h-5" />
            Chia sẻ
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-2"
          align="end"
          sideOffset={8}
        >
          <div className="space-y-1">
            <motion.button
              whileHover={{ x: 4 }}
              onClick={handleShareToProfile}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium">Chia sẻ lên trang cá nhân</p>
                <p className="text-xs text-muted-foreground">
                  Đăng lên dòng thời gian của bạn
                </p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="w-4 h-4 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="link"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Link2 className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {copied ? "Đã sao chép!" : "Sao chép liên kết"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Chia sẻ link bài viết
                </p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ x: 4 }}
              onClick={handleShareViaMessage}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                <Send className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Gửi qua tin nhắn</p>
                <p className="text-xs text-muted-foreground">
                  Chia sẻ trực tiếp với bạn bè
                </p>
              </div>
            </motion.button>

            <div className="h-px bg-border my-2" />

            <div className="flex items-center justify-center gap-2 py-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShareFacebook}
                className="w-10 h-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center hover:bg-[#1877F2]/20 transition-colors"
              >
                <Facebook className="w-5 h-5 text-[#1877F2]" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShareTwitter}
                className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center hover:bg-[#1DA1F2]/20 transition-colors"
              >
                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
              </motion.button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Share to Profile Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chia sẻ lên trang cá nhân</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* User input */}
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUserAvatar || ""} />
                <AvatarFallback className="bg-secondary/20">U</AvatarFallback>
              </Avatar>
              <Textarea
                placeholder="Viết gì đó về bài viết này..."
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Preview of shared post */}
            <div className="border border-border rounded-lg p-3 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={post.profiles?.avatar_url || ""} />
                  <AvatarFallback className="bg-secondary/20 text-xs">
                    {post.profiles?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {post.profiles?.full_name || "Người dùng"}
                </span>
              </div>
              {post.title && (
                <p className="text-sm font-medium mb-1">{post.title}</p>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.content}
              </p>
              {post.media_urls && post.media_urls.length > 0 && (
                <div className="mt-2 rounded-md overflow-hidden">
                  <img
                    src={
                      typeof post.media_urls[0] === "string"
                        ? post.media_urls[0]
                        : (post.media_urls[0] as any).url
                    }
                    alt=""
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmShare}
                disabled={createPost.isPending}
                className="gap-2"
              >
                {createPost.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                Chia sẻ ngay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
