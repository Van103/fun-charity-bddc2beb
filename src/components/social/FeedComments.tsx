import React, { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CornerDownRight,
  Trash2,
  CheckCircle,
  Loader2,
  UserPlus,
  Pencil,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useFeedComments, FeedComment } from "@/hooks/useFeedComments";
import { useCommentReactions } from "@/hooks/useCommentReactions";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { CommentReactionButton } from "./CommentReactionButton";
import { CommentInput } from "./CommentInput";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FeedCommentsProps {
  postId: string;
  currentUserAvatar?: string | null;
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  onEdit,
  isDeleting,
  getReactions,
  getUserReaction,
  getTotalCount,
  onReact,
  isReacting,
  level = 0,
}: {
  comment: FeedComment;
  currentUserId: string | null;
  onReply: (commentId: string, authorName: string) => void;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, newContent: string) => void;
  isDeleting: boolean;
  getReactions: (commentId: string) => any[];
  getUserReaction: (commentId: string) => string | null;
  getTotalCount: (commentId: string) => number;
  onReact: (commentId: string, reactionType: string) => void;
  isReacting: boolean;
  level?: number;
}): React.ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const { isGuest, requireAuth } = useGuestMode();

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: false,
    locale: vi,
  });

  const isOwner = currentUserId === comment.user_id;
  const isOwnComment = currentUserId === comment.user_id;

  // Check if content is a sticker (single emoji or short emoji string)
  const isSticker = comment.content.length <= 4 && /^\p{Emoji}+$/u.test(comment.content);

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent);
    }
    setIsEditing(false);
  };

  const handleReply = () => {
    if (isGuest) {
      requireAuth("Đăng ký để trả lời bình luận");
      return;
    }
    onReply(comment.id, comment.profiles?.full_name || "Người dùng");
  };

  const handleReact = (reactionType: string) => {
    if (isGuest) {
      requireAuth("Đăng ký để bày tỏ cảm xúc");
      return;
    }
    onReact(comment.id, reactionType);
  };

  // Show only first 2 replies, rest hidden
  const visibleReplies = showAllReplies 
    ? comment.replies 
    : comment.replies?.slice(0, 2);
  const hiddenRepliesCount = (comment.replies?.length || 0) - 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group"
    >
      <div className="flex gap-2">
        <Avatar className={cn("shrink-0", level > 0 ? "w-6 h-6" : "w-8 h-8")}>
          <AvatarImage src={comment.profiles?.avatar_url || ""} />
          <AvatarFallback className="bg-secondary/20 text-xs">
            {comment.profiles?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div 
            className={cn(
              "rounded-2xl px-3 py-2 inline-block max-w-full",
              isOwnComment ? "bg-secondary/10" : "bg-muted/50"
            )}
          >
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">
                {comment.profiles?.full_name || "Người dùng"}
              </span>
              {comment.profiles?.is_verified && (
                <CheckCircle className="w-3 h-3 text-secondary fill-secondary/20" />
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="text-sm h-8"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSubmit();
                    if (e.key === "Escape") setIsEditing(false);
                  }}
                />
                <Button size="sm" variant="ghost" onClick={handleEditSubmit}>
                  Lưu
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
              </div>
            ) : isSticker ? (
              <motion.p 
                className="text-4xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 200 }}
              >
                {comment.content}
              </motion.p>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {comment.content}
                {(comment as any).is_edited && (
                  <span className="text-xs text-muted-foreground ml-1">(đã chỉnh sửa)</span>
                )}
              </p>
            )}

            {/* Image */}
            {comment.image_url && (
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={comment.image_url}
                alt=""
                className="mt-2 rounded-lg max-w-[200px] max-h-[150px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-muted-foreground flex-wrap">
            <span>{timeAgo}</span>
            
            {/* Reaction button */}
            <CommentReactionButton
              commentId={comment.id}
              reactions={getReactions(comment.id)}
              userReaction={getUserReaction(comment.id)}
              totalCount={getTotalCount(comment.id)}
              onReact={handleReact}
              isLoading={isReacting}
              disabled={isGuest}
            />
            
            <button
              className="hover:text-secondary font-medium"
              onClick={handleReply}
            >
              Trả lời
            </button>
            
            {isOwner && (
              <>
                <button
                  className="hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setEditContent(comment.content);
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  className="hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDelete(comment.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2 pl-2 border-l-2 border-border/50">
              <AnimatePresence>
                {visibleReplies?.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    isDeleting={isDeleting}
                    getReactions={getReactions}
                    getUserReaction={getUserReaction}
                    getTotalCount={getTotalCount}
                    onReact={onReact}
                    isReacting={isReacting}
                    level={level + 1}
                  />
                ))}
              </AnimatePresence>

              {/* Show more replies button */}
              {hiddenRepliesCount > 0 && !showAllReplies && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1 text-xs text-secondary hover:underline ml-2"
                  onClick={() => setShowAllReplies(true)}
                >
                  <ChevronDown className="w-3 h-3" />
                  Xem thêm {hiddenRepliesCount} phản hồi
                </motion.button>
              )}

              {showAllReplies && hiddenRepliesCount > 0 && (
                <button
                  className="flex items-center gap-1 text-xs text-secondary hover:underline ml-2"
                  onClick={() => setShowAllReplies(false)}
                >
                  <ChevronUp className="w-3 h-3" />
                  Thu gọn
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function FeedComments({ postId, currentUserAvatar }: FeedCommentsProps): React.ReactElement {
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { isGuest, requireAuth } = useGuestMode();

  const {
    comments,
    totalComments,
    isLoading,
    currentUserId,
    addComment,
    deleteComment,
    updateComment,
  } = useFeedComments(postId);

  // Collect all comment IDs for reactions
  const allCommentIds = useMemo(() => {
    const ids: string[] = [];
    const collectIds = (commentList: FeedComment[]) => {
      commentList.forEach(c => {
        ids.push(c.id);
        if (c.replies) collectIds(c.replies);
      });
    };
    collectIds(comments);
    return ids;
  }, [comments]);

  const {
    getReactions,
    getUserReaction,
    getTotalCount,
    toggleReaction,
  } = useCommentReactions(allCommentIds, currentUserId);

  const handleSubmit = (data: { 
    content: string; 
    imageUrl?: string; 
    stickerUrl?: string; 
    parentCommentId?: string 
  }) => {
    if (isGuest) {
      requireAuth("Đăng ký để bình luận và tham gia thảo luận");
      return;
    }

    addComment.mutate(
      {
        content: data.content,
        parentCommentId: data.parentCommentId,
        imageUrl: data.imageUrl,
      },
      {
        onSuccess: () => {
          setReplyingTo(null);
        },
      }
    );
  };

  const handleReply = (commentId: string, authorName: string) => {
    if (isGuest) {
      requireAuth("Đăng ký để trả lời bình luận");
      return;
    }
    setReplyingTo({ id: commentId, name: authorName });
  };

  const handleDelete = (commentId: string) => {
    deleteComment.mutate(commentId);
  };

  const handleEdit = (commentId: string, newContent: string) => {
    updateComment.mutate({ commentId, content: newContent });
  };

  const handleReact = (commentId: string, reactionType: string) => {
    toggleReaction.mutate({ commentId, reactionType });
  };

  return (
    <div className="px-4 py-3 border-t border-border bg-muted/30">
      {/* Comments Count */}
      {totalComments > 0 && (
        <div className="text-sm text-muted-foreground mb-3">
          {totalComments} bình luận
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3 mb-3 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-16 w-3/4 rounded-2xl" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onReply={handleReply}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isDeleting={deleteComment.isPending}
                getReactions={getReactions}
                getUserReaction={getUserReaction}
                getTotalCount={getTotalCount}
                onReact={handleReact}
                isReacting={toggleReaction.isPending}
              />
            ))}
          </AnimatePresence>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        )}
      </div>

      {/* Comment input */}
      {isGuest ? (
        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <UserPlus className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-sm text-muted-foreground flex-1">
            Đăng ký để bình luận
          </span>
          <Button 
            size="sm"
            onClick={() => requireAuth("Đăng ký để bình luận và tham gia thảo luận")}
          >
            Đăng ký
          </Button>
        </div>
      ) : (
        <CommentInput
          postId={postId}
          currentUserAvatar={currentUserAvatar}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onSubmit={handleSubmit}
          isSubmitting={addComment.isPending}
        />
      )}
    </div>
  );
}
