import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CornerDownRight,
  Send,
  Trash2,
  CheckCircle,
  Loader2,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useFeedComments, FeedComment } from "@/hooks/useFeedComments";
import { useGuestMode } from "@/contexts/GuestModeContext";

interface FeedCommentsProps {
  postId: string;
  currentUserAvatar?: string | null;
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  isDeleting,
}: {
  comment: FeedComment;
  currentUserId: string | null;
  onReply: (commentId: string, authorName: string) => void;
  onDelete: (commentId: string) => void;
  isDeleting: boolean;
}) {
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: false,
    locale: vi,
  });

  const isOwner = currentUserId === comment.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group"
    >
      <div className="flex gap-2">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={comment.profiles?.avatar_url || ""} />
          <AvatarFallback className="bg-secondary/20 text-xs">
            {comment.profiles?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-2xl px-3 py-2 inline-block max-w-full">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">
                {comment.profiles?.full_name || "Người dùng"}
              </span>
              {comment.profiles?.is_verified && (
                <CheckCircle className="w-3 h-3 text-secondary fill-secondary/20" />
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </p>
            {comment.image_url && (
              <img
                src={comment.image_url}
                alt=""
                className="mt-2 rounded-lg max-w-[200px] max-h-[150px] object-cover"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            <button
              className="hover:text-secondary font-medium"
              onClick={() =>
                onReply(comment.id, comment.profiles?.full_name || "Người dùng")
              }
            >
              Trả lời
            </button>
            {isOwner && (
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
            )}
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2 pl-2 border-l-2 border-border/50">
              <AnimatePresence>
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function FeedComments({ postId, currentUserAvatar }: FeedCommentsProps) {
  const [commentText, setCommentText] = useState("");
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
  } = useFeedComments(postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if guest is trying to comment
    if (isGuest) {
      requireAuth("Đăng ký để bình luận và tham gia thảo luận");
      return;
    }
    
    if (!commentText.trim()) return;

    addComment.mutate(
      {
        content: commentText,
        parentCommentId: replyingTo?.id,
      },
      {
        onSuccess: () => {
          setCommentText("");
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
                isDeleting={deleteComment.isPending}
              />
            ))}
          </AnimatePresence>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        )}
      </div>

      {/* Replying indicator */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-xs text-muted-foreground mb-2"
          >
            <CornerDownRight className="w-3 h-3" />
            <span>
              Đang trả lời <strong>{replyingTo.name}</strong>
            </span>
            <button
              className="text-secondary hover:underline"
              onClick={() => setReplyingTo(null)}
            >
              Hủy
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentUserAvatar || ""} />
            <AvatarFallback className="bg-secondary/20 text-xs">U</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2">
            <Input
              placeholder={
                replyingTo
                  ? `Trả lời ${replyingTo.name}...`
                  : "Viết bình luận..."
              }
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="border-none bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
              disabled={addComment.isPending}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              disabled={!commentText.trim() || addComment.isPending}
            >
              {addComment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-secondary" />
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
