import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  MessageCircle,
  MapPin,
  Pencil,
  Trash2,
  Loader2,
  Video,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { FeedPost } from "@/hooks/useFeedPosts";
import { formatDistanceToNow, Locale } from "date-fns";
import { vi, enUS, zhCN, ja, ko, th, fr, de, es, pt, ru, ar, hi } from "date-fns/locale";
import { FeedReactionPicker, REACTIONS } from "./FeedReactionPicker";
import { SharedPostPreview } from "./SharedPostPreview";
import { usePostReactions } from "@/hooks/useFeedReactions";
import { FeedComments } from "./FeedComments";
import { SharePopover } from "./SharePopover";
import { GiftDonateModal } from "./GiftDonateModal";
import { ImageLightbox } from "./ImageLightbox";
import { EditFeedPostModal } from "./EditFeedPostModal";
import { ReactionUsersTooltip } from "./ReactionUsersTooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { formatPostContent } from "@/lib/formatContent";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const localeMap: Record<Language, Locale> = {
  en: enUS, vi, zh: zhCN, ja, ko, th, fr, de, es, pt, ru, ar, hi
};

interface MentionedUser {
  user_id: string;
  full_name: string | null;
}

interface ExtendedFeedPost extends FeedPost {
  is_live_video?: boolean;
  live_viewer_count?: number;
}

interface SocialPostCardProps {
  post: ExtendedFeedPost;
  highlightPostId?: string | null;
}

// Soft gradient backgrounds for letter avatars
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

export function SocialPostCard({ post, highlightPostId }: SocialPostCardProps) {
  const isLiveVideo = (post as ExtendedFeedPost).is_live_video;
  const liveViewerCount = (post as ExtendedFeedPost).live_viewer_count || 0;
  const [showComments, setShowComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  // Fetch mentioned users for this post
  const { data: mentionedUsers = [] } = useQuery({
    queryKey: ["post-mentions", post.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("post_mentions")
        .select("mentioned_user_id")
        .eq("post_id", post.id);
      
      if (!data || data.length === 0) return [];
      
      const userIds = data.map(m => m.mentioned_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      
      return (profiles || []) as MentionedUser[];
    },
  });

  // Earned amount for this post (sum from reward_transactions)
  const { data: earnedCamly = 0, isLoading: earnedCamlyLoading } = useQuery({
    queryKey: ["post-earned-camly", post.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_transactions")
        .select("amount")
        .eq("reference_type", "feed_post")
        .eq("reference_id", post.id)
        .eq("currency", "CAMLY")
        .eq("status", "completed");

      if (error) throw error;
      return (data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    },
    staleTime: 60_000,
  });

  // Handle highlight and scroll
  useEffect(() => {
    if (highlightPostId === post.id && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setIsHighlighted(true);
        setTimeout(() => setIsHighlighted(false), 3000);
      }, 100);
    }
  }, [highlightPostId, post.id]);

  // Fetch current user
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("user_id", data.user.id)
          .maybeSingle();
        setCurrentUserAvatar(profile?.avatar_url || null);
      }
    });
  }, []);

  const isOwnPost = currentUserId === post.user_id;

  // Reactions hook
  const {
    userReaction,
    reactionCounts,
    totalReactions,
    addReaction,
    removeReaction,
  } = usePostReactions(post.id);

  // Get top 3 reaction types for display
  const topReactions = Object.entries(reactionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => REACTIONS.find((r) => r.type === type))
    .filter(Boolean);

  // Parse media_urls - handle both string[] and {url, type}[] formats
  const mediaUrls = (post.media_urls || []).map((item) => {
    if (typeof item === 'string') {
      const isVideo = item.match(/\.(mp4|webm|mov)$/i);
      return { url: item, type: isVideo ? 'video' : 'image' };
    }
    return item as { url: string; type: string };
  });

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { 
    addSuffix: false, 
    locale: localeMap[language] 
  });

  const userName = post.profiles?.full_name || t("social.user");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("feed_posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;

      toast({ title: t("social.deleted") });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("social.deleteError"),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mobile-card overflow-hidden transition-all duration-500 ${
        isHighlighted ? "ring-4 ring-primary/50 shadow-lg shadow-primary/20" : ""
      }`}
    >
      {/* Header - Mobile optimized padding */}
      <div className="p-3 sm:p-4 pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {/* Avatar with gold ring - clickable to profile */}
            <Link 
              to={isOwnPost ? "/profile" : `/user/${post.user_id}`}
              className="p-0.5 rounded-full bg-gradient-to-br from-gold-champagne to-gold-light flex-shrink-0 touch-target no-tap-highlight"
            >
              <Avatar className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-card">
                <AvatarImage src={post.profiles?.avatar_url || ""} />
                <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(userName)} text-white font-semibold text-sm sm:text-base`}>
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link 
                  to={isOwnPost ? "/profile" : `/user/${post.user_id}`}
                  className="font-semibold text-foreground hover:underline"
                >
                  {userName}
                </Link>
                {mentionedUsers.length > 0 && (
                  <span className="text-muted-foreground text-sm">
                    {t("social.with")}{" "}
                    <Link 
                      to={`/user/${mentionedUsers[0].user_id}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {mentionedUsers[0].full_name || t("social.user")}
                    </Link>
                    {mentionedUsers.length > 1 && (
                      <span> {t("social.andOthers").replace("{count}", String(mentionedUsers.length - 1))}</span>
                    )}
                  </span>
                )}
                {post.profiles?.is_verified && (
                  <span className="text-primary text-sm">✓</span>
                )}
                {post.location && (
                  <>
                    <span className="text-muted-foreground text-sm">{t("post.at")}</span>
                    <span className="text-primary text-sm font-medium flex items-center gap-1 hover:underline cursor-pointer">
                      <MapPin className="w-3 h-3" />
                      {post.location}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
                {isLiveVideo && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1 bg-red-500/10 text-red-500 border-red-500/20">
                    <Video className="w-2.5 h-2.5" />
                    {t("social.wasLive")}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live viewer count badge */}
            {isLiveVideo && liveViewerCount > 0 && (
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1 text-xs">
                <Eye className="w-3 h-3" />
                {liveViewerCount.toLocaleString()}
              </Badge>
            )}
            
            {/* Earned amount badge - shows total Camly (CLC) received */}
            <Badge variant="outline" className="bg-gold-champagne/10 text-gold-dark border-gold-champagne/30 gap-1 text-xs font-medium">
              +{earnedCamlyLoading ? "…" : earnedCamly.toLocaleString()} CLC
            </Badge>
            
            {/* More options dropdown - only show for own posts */}
            {isOwnPost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem 
                    className="gap-2 cursor-pointer"
                    onClick={() => setShowEditModal(true)}
                  >
                    <Pencil className="w-4 h-4" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("social.deletePost")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Title - Mobile optimized */}
      {post.title && (
        <div className="px-3 sm:px-4 pb-2">
          <h3 className="font-semibold text-base sm:text-lg text-foreground">{post.title}</h3>
        </div>
      )}

      {/* Content - Mobile optimized text size */}
      {post.content && (
        <div className="px-3 sm:px-4 pb-3">
          <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-foreground">
            {formatPostContent(post.content)}
          </div>
        </div>
      )}

      {/* Shared Post Preview (Facebook-style) */}
      {(post as any).shared_post_id && (
        <div className="px-3 sm:px-4 pb-3">
          <SharedPostPreview sharedPostId={(post as any).shared_post_id} />
        </div>
      )}

      {/* Media - Full-bleed on mobile, responsive on desktop */}
      {mediaUrls.length > 0 && (
        <div className="relative">
          {mediaUrls.length === 1 ? (
            mediaUrls[0].type === "video" ? (
              <video
                src={mediaUrls[0].url}
                controls
                playsInline
                className="w-full max-h-[350px] sm:max-h-[450px] object-cover"
              />
            ) : (
              <img
                src={mediaUrls[0].url}
                alt=""
                loading="lazy"
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
                className="w-full max-h-[350px] sm:max-h-[450px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
              />
            )
          ) : (
            <div className={`grid gap-0.5 ${
              mediaUrls.length === 2 ? "grid-cols-2" :
              mediaUrls.length === 3 ? "grid-cols-2" :
              "grid-cols-2"
            }`}>
              {mediaUrls.slice(0, 4).map((item, i) => (
                <div 
                  key={i}
                  className={`relative ${
                    mediaUrls.length === 3 && i === 0 ? "row-span-2" : ""
                  }`}
                >
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      controls
                      className={`w-full object-cover bg-black ${
                        mediaUrls.length === 3 && i === 0 
                          ? "h-full" 
                          : "aspect-square"
                      }`}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      onClick={() => {
                        setLightboxIndex(i);
                        setLightboxOpen(true);
                      }}
                      className={`w-full object-cover cursor-pointer hover:opacity-95 transition-opacity ${
                        mediaUrls.length === 3 && i === 0 
                          ? "h-full" 
                          : "aspect-square"
                      }`}
                    />
                  )}
                  {i === 3 && mediaUrls.length > 4 && (
                    <div 
                      className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        setLightboxIndex(3);
                        setLightboxOpen(true);
                      }}
                    >
                      <span className="text-white text-2xl font-bold">
                        +{mediaUrls.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        images={mediaUrls}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Stats - Mobile optimized */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between text-xs sm:text-sm text-muted-foreground border-b border-border">
        <ReactionUsersTooltip postId={post.id}>
          <div className="flex items-center gap-1.5 cursor-pointer">
            {topReactions.length > 0 ? (
              <div className="flex -space-x-1">
                {topReactions.map((reaction) => (
                  <motion.span
                    key={reaction?.type}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-sm sm:text-base"
                  >
                    {reaction?.emoji}
                  </motion.span>
                ))}
              </div>
            ) : (
              <div className="flex -space-x-1">
                <span className="text-sm sm:text-base">👍</span>
                <span className="text-sm sm:text-base">❤️</span>
                <span className="text-sm sm:text-base">😆</span>
              </div>
            )}
            <span className="text-xs hover:underline no-tap-highlight">
              {(totalReactions || post.reactions_count || 0).toLocaleString()} {t("post.people")}
            </span>
          </div>
        </ReactionUsersTooltip>
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          <span className="hover:underline cursor-pointer no-tap-highlight">{(post.comments_count || 0).toLocaleString()} {t("post.comments")}</span>
          <span className="hover:underline cursor-pointer no-tap-highlight">{((post as any).shares_count || 0).toLocaleString()} {t("post.shares")}</span>
        </div>
      </div>

      {/* Actions - Touch-friendly Facebook style */}
      <div className="action-bar">
        <FeedReactionPicker
          currentReaction={userReaction}
          onReact={(type) => addReaction.mutate(type)}
          onRemoveReaction={() => removeReaction.mutate()}
          isLoading={addReaction.isPending || removeReaction.isPending}
        />
        <Button 
          variant="ghost" 
          size="sm"
          className={`action-bar-btn ${showComments ? "text-primary bg-primary/5" : ""}`}
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden xs:inline">{t("post.comment")}</span>
        </Button>
        <GiftDonateModal post={post} />
        <SharePopover post={post} currentUserAvatar={currentUserAvatar} />
      </div>

      {/* Comments Section */}
      {showComments && (
        <FeedComments postId={post.id} currentUserAvatar={currentUserAvatar} />
      )}

      {/* Edit Post Modal */}
      {showEditModal && (
        <EditFeedPostModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          post={{
            id: post.id,
            user_id: post.user_id,
            content: post.content,
            media_urls: mediaUrls,
          }}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("social.deletePost")}?</AlertDialogTitle>
            <AlertDialogDescription>
              {t("social.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}