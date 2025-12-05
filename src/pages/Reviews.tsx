import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  ThumbsUp,
  MessageCircle,
  Award,
  Verified,
  Flag,
  Gift,
  Trophy,
  Send,
  X,
} from "lucide-react";

interface ReviewComment {
  id: number;
  reviewId: number;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  date: string;
  likes: number;
  isLiked: boolean;
}

interface Review {
  id: number;
  campaign: string;
  reviewer: {
    name: string;
    avatar: string;
    reputation: number;
    verified: boolean;
  };
  rating: number;
  content: string;
  date: string;
  likes: number;
  comments: number;
  reward: string;
  helpful: boolean;
  isLiked: boolean;
}

const initialReviews: Review[] = [
  {
    id: 1,
    campaign: "Nước Sạch Cho Vùng Nông Thôn Việt Nam",
    reviewer: {
      name: "Sarah Nguyễn",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      reputation: 4.9,
      verified: true,
    },
    rating: 5,
    content: "Tôi đã theo dõi chiến dịch này từ đầu và thực sự ấn tượng với sự minh bạch. Mọi chi tiêu đều có biên lai và bằng chứng on-chain. Báo cáo tác động rất chi tiết và có thể xác minh được.",
    date: "2 ngày trước",
    likes: 45,
    comments: 2,
    reward: "Huy Hiệu Vàng + 50 FUN",
    helpful: true,
    isLiked: false,
  },
  {
    id: 2,
    campaign: "Giáo Dục Cho Trẻ Em Khó Khăn",
    reviewer: {
      name: "Minh Trần",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      reputation: 4.7,
      verified: true,
    },
    rating: 4,
    content: "Chiến dịch tốt, team NGO rất phản hồi nhanh. Một số cập nhật hơi chậm nhưng tổng thể tác động rất tích cực. Khuyến nghị!",
    date: "5 ngày trước",
    likes: 28,
    comments: 1,
    reward: "Huy Hiệu Bạc + 25 FUN",
    helpful: true,
    isLiked: false,
  },
  {
    id: 3,
    campaign: "Cứu Trợ Lương Thực Khẩn Cấp - Đông Phi",
    reviewer: {
      name: "Quỹ Tech4Good",
      avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200",
      reputation: 5.0,
      verified: true,
    },
    rating: 5,
    content: "Là nhà tài trợ doanh nghiệp, chúng tôi đặc biệt đánh giá cao sự minh bạch trong báo cáo. Mọi việc sử dụng quỹ đều được theo dõi on-chain và có kiểm toán bên thứ ba. Đây là cách từ thiện nên được làm.",
    date: "1 tuần trước",
    likes: 89,
    comments: 1,
    reward: "Huy Hiệu Bạch Kim + 100 FUN",
    helpful: true,
    isLiked: false,
  },
];

const initialComments: ReviewComment[] = [
  {
    id: 1,
    reviewId: 1,
    author: { name: "Lan Phương", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200" },
    content: "Đồng ý! Tôi cũng đã đóng góp và rất hài lòng với sự minh bạch.",
    date: "1 ngày trước",
    likes: 5,
    isLiked: false,
  },
  {
    id: 2,
    reviewId: 1,
    author: { name: "Hoàng Anh", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" },
    content: "Cảm ơn bạn đã chia sẻ chi tiết!",
    date: "12 giờ trước",
    likes: 3,
    isLiked: false,
  },
  {
    id: 3,
    reviewId: 2,
    author: { name: "Thu Hà", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200" },
    content: "Tôi cũng thấy team rất nhiệt tình!",
    date: "3 ngày trước",
    likes: 8,
    isLiked: false,
  },
  {
    id: 4,
    reviewId: 3,
    author: { name: "Việt Hoàng", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" },
    content: "Blockchain thực sự đang thay đổi cách làm từ thiện!",
    date: "5 ngày trước",
    likes: 12,
    isLiked: false,
  },
];

const Reviews = () => {
  const [newReview, setNewReview] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [comments, setComments] = useState<ReviewComment[]>(initialComments);
  const [currentUser, setCurrentUser] = useState<{name: string; avatar: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [newCommentText, setNewCommentText] = useState<{[key: number]: string}>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();
        
        setCurrentUser({
          name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Người dùng",
          avatar: profile?.avatar_url || ""
        });
      }
    };
    fetchUser();
  }, []);

  const handleSubmitReview = () => {
    if (!newReview.trim()) {
      toast({
        title: "Vui lòng nhập nội dung đánh giá",
        variant: "destructive"
      });
      return;
    }
    if (selectedRating === 0) {
      toast({
        title: "Vui lòng chọn số sao đánh giá",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const newReviewItem: Review = {
      id: Date.now(),
      campaign: "Chiến Dịch Chung",
      reviewer: {
        name: currentUser?.name || "Người dùng ẩn danh",
        avatar: currentUser?.avatar || "",
        reputation: 4.5,
        verified: !!currentUser,
      },
      rating: selectedRating,
      content: newReview,
      date: "Vừa xong",
      likes: 0,
      comments: 0,
      reward: selectedRating >= 4 ? "Huy Hiệu Vàng + 50 FUN" : "Huy Hiệu Bạc + 25 FUN",
      helpful: false,
      isLiked: false,
    };

    setReviews([newReviewItem, ...reviews]);
    setNewReview("");
    setSelectedRating(0);
    setIsSubmitting(false);

    toast({
      title: "Đánh giá đã được gửi!",
      description: "Cảm ơn bạn đã chia sẻ. Phần thưởng sẽ được xét duyệt.",
    });
  };

  const handleLikeReview = (reviewId: number) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          likes: review.isLiked ? review.likes - 1 : review.likes + 1,
          isLiked: !review.isLiked
        };
      }
      return review;
    }));
  };

  const handleToggleComments = (reviewId: number) => {
    setExpandedComments(expandedComments === reviewId ? null : reviewId);
  };

  const handleSubmitComment = (reviewId: number) => {
    const commentText = newCommentText[reviewId]?.trim();
    if (!commentText) {
      toast({
        title: "Vui lòng nhập nội dung bình luận",
        variant: "destructive"
      });
      return;
    }

    const newComment: ReviewComment = {
      id: Date.now(),
      reviewId,
      author: {
        name: currentUser?.name || "Người dùng ẩn danh",
        avatar: currentUser?.avatar || ""
      },
      content: commentText,
      date: "Vừa xong",
      likes: 0,
      isLiked: false,
    };

    setComments([...comments, newComment]);
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return { ...review, comments: review.comments + 1 };
      }
      return review;
    }));
    setNewCommentText({ ...newCommentText, [reviewId]: "" });

    toast({
      title: "Bình luận đã được gửi!",
    });
  };

  const handleLikeComment = (commentId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked
        };
      }
      return comment;
    }));
  };

  const getCommentsForReview = (reviewId: number) => {
    return comments.filter(comment => comment.reviewId === reviewId);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="gold" className="mb-4">
              <Star className="w-3.5 h-3.5 mr-1" />
              Đánh Giá Cộng Đồng
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Đánh Giá & <span className="gradient-text">Phần Thưởng</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Đánh giá công tâm, nhận phần thưởng xứng đáng. Mọi đánh giá đều đóng góp vào Hệ Thống Uy Tín.
            </p>
          </div>

          {/* Reward Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-8 luxury-border"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">Đánh Giá & Nhận Thưởng</h3>
                  <p className="text-sm text-muted-foreground">
                    Viết đánh giá chất lượng → Nhận Token Uy Tín + FUN Money
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <Badge variant="gold" className="mb-1">
                    <Trophy className="w-3 h-3 mr-1" />
                    Vàng
                  </Badge>
                  <p className="text-xs text-muted-foreground">50 FUN</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-1">
                    <Award className="w-3 h-3 mr-1" />
                    Bạc
                  </Badge>
                  <p className="text-xs text-muted-foreground">25 FUN</p>
                </div>
                <div className="text-center">
                  <Badge variant="muted" className="mb-1">
                    <Star className="w-3 h-3 mr-1" />
                    Đồng
                  </Badge>
                  <p className="text-xs text-muted-foreground">10 FUN</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 luxury-border"
                >
                  {/* Campaign */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="purple">{review.campaign}</Badge>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>

                  {/* Reviewer */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={review.reviewer.avatar} />
                      <AvatarFallback>{review.reviewer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.reviewer.name}</span>
                        {review.reviewer.verified && (
                          <Verified className="w-4 h-4 text-secondary" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "text-secondary fill-secondary"
                                : "text-muted"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({review.reviewer.reputation})
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Badge variant="gold" className="text-xs">
                        <Gift className="w-3 h-3 mr-1" />
                        {review.reward}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground mb-4">{review.content}</p>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLikeReview(review.id)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          review.isLiked 
                            ? "text-secondary" 
                            : "text-muted-foreground hover:text-secondary"
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${review.isLiked ? "fill-secondary" : ""}`} />
                        {review.likes} Hữu ích
                      </button>
                      <button 
                        onClick={() => handleToggleComments(review.id)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          expandedComments === review.id
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {review.comments} Bình luận
                      </button>
                    </div>
                    <button className="text-sm text-muted-foreground hover:text-destructive transition-colors">
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {expandedComments === review.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-border/50"
                      >
                        {/* Existing Comments */}
                        <div className="space-y-3 mb-4">
                          {getCommentsForReview(review.id).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              Chưa có bình luận nào. Hãy là người đầu tiên!
                            </p>
                          ) : (
                            getCommentsForReview(review.id).map((comment) => (
                              <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={comment.author.avatar} />
                                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">{comment.author.name}</span>
                                    <span className="text-xs text-muted-foreground">{comment.date}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                                  <button 
                                    onClick={() => handleLikeComment(comment.id)}
                                    className={`flex items-center gap-1 text-xs mt-2 transition-colors ${
                                      comment.isLiked 
                                        ? "text-secondary" 
                                        : "text-muted-foreground hover:text-secondary"
                                    }`}
                                  >
                                    <ThumbsUp className={`w-3 h-3 ${comment.isLiked ? "fill-secondary" : ""}`} />
                                    {comment.likes}
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Comment */}
                        <div className="flex gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={currentUser?.avatar} />
                            <AvatarFallback>
                              {currentUser?.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder="Viết bình luận..."
                              value={newCommentText[review.id] || ""}
                              onChange={(e) => setNewCommentText({
                                ...newCommentText,
                                [review.id]: e.target.value
                              })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSubmitComment(review.id);
                                }
                              }}
                              className="flex-1"
                            />
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleSubmitComment(review.id)}
                              className="hover:bg-secondary/20"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Write Review */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 luxury-border sticky top-24"
              >
                <h3 className="font-display font-semibold mb-4">Viết Đánh Giá</h3>

                {/* Rating */}
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Đánh Giá Của Bạn
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setSelectedRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= selectedRating
                              ? "text-secondary fill-secondary"
                              : "text-muted hover:text-secondary"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Nội Dung Đánh Giá
                  </label>
                  <Textarea
                    placeholder="Chia sẻ trải nghiệm của bạn với chiến dịch này..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                {/* Potential Reward */}
                <div className="bg-muted/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">Phần Thưởng Tiềm Năng</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Đánh giá chất lượng có thể nhận được Huy Hiệu Vàng + 50 token FUN dựa trên số phiếu hữu ích từ cộng đồng.
                  </p>
                </div>

                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Đang gửi..." : "Gửi Đánh Giá"}
                </Button>
              </motion.div>

              {/* Review Guidelines */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 luxury-border"
              >
                <h4 className="font-semibold mb-3">Hướng Dẫn Đánh Giá</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Verified className="w-4 h-4 text-success mt-0.5" />
                    Trung thực và xây dựng
                  </li>
                  <li className="flex items-start gap-2">
                    <Verified className="w-4 h-4 text-success mt-0.5" />
                    Tập trung vào sự thật có thể xác minh
                  </li>
                  <li className="flex items-start gap-2">
                    <Verified className="w-4 h-4 text-success mt-0.5" />
                    Đề cập tác động cụ thể nếu có
                  </li>
                  <li className="flex items-start gap-2">
                    <Verified className="w-4 h-4 text-success mt-0.5" />
                    Tôn trọng quyền riêng tư của người thụ hưởng
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default Reviews;
