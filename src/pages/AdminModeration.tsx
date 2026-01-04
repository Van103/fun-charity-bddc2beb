import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  Video,
  MapPin,
  Eye,
  Loader2,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { usePendingPosts, useApprovePost, useRejectPost, useModerationStats } from "@/hooks/usePostModeration";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export default function AdminModeration() {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: posts = [], isLoading } = usePendingPosts();
  const { data: stats } = useModerationStats();
  const approvePost = useApprovePost();
  const rejectPost = useRejectPost();

  // Check if user is admin
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase.rpc("is_admin", { _user_id: user.id });
      return data || false;
    },
  });

  useEffect(() => {
    if (!checkingAdmin && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, checkingAdmin, navigate]);

  const handleApprove = async (postId: string) => {
    await approvePost.mutateAsync(postId);
  };

  const handleReject = () => {
    if (selectedPost && rejectReason.trim()) {
      rejectPost.mutate({ postId: selectedPost, reason: rejectReason });
      setShowRejectDialog(false);
      setSelectedPost(null);
      setRejectReason("");
    }
  };

  const openRejectDialog = (postId: string) => {
    setSelectedPost(postId);
    setShowRejectDialog(true);
  };

  if (checkingAdmin || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Kiểm duyệt bài viết</h1>
          </div>
          <p className="text-muted-foreground">
            Xem xét và duyệt các bài viết trước khi hiển thị trên bảng tin
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-500/20">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.pending || 0}</p>
                <p className="text-sm text-muted-foreground">Chờ duyệt</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.approved || 0}</p>
                <p className="text-sm text-muted-foreground">Đã duyệt</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-500/20">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.rejected || 0}</p>
                <p className="text-sm text-muted-foreground">Đã từ chối</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Posts List */}
        {posts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Không có bài viết chờ duyệt
              </h3>
              <p className="text-muted-foreground">
                Tất cả bài viết đã được xử lý
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* User Info */}
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={post.profiles?.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-soft to-purple-light text-white">
                          {post.profiles?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {post.profiles?.full_name || "Người dùng"}
                              </span>
                              {post.profiles?.is_verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <ShieldCheck className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(post.created_at), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                            <Clock className="w-3 h-3 mr-1" />
                            Chờ duyệt
                          </Badge>
                        </div>

                        {/* Content */}
                        {post.title && (
                          <h4 className="font-medium text-foreground mb-1">{post.title}</h4>
                        )}
                        {post.content && (
                          <p className="text-foreground whitespace-pre-wrap mb-3">
                            {post.content}
                          </p>
                        )}

                        {/* Location */}
                        {post.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{post.location}</span>
                          </div>
                        )}

                        {/* Media Preview */}
                        {post.media_urls.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            {post.media_urls.slice(0, 4).map((url, idx) => {
                              const isVideo = url.includes(".mp4") || url.includes(".webm") || url.includes(".mov");
                              return (
                                <div
                                  key={idx}
                                  className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer group"
                                  onClick={() => !isVideo && setPreviewImage(url)}
                                >
                                  {isVideo ? (
                                    <div className="w-full h-full flex items-center justify-center bg-black/20">
                                      <Video className="w-8 h-8 text-white" />
                                    </div>
                                  ) : (
                                    <>
                                      <img
                                        src={url}
                                        alt={`Media ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </>
                                  )}
                                  {idx === 3 && post.media_urls.length > 4 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <span className="text-white font-bold text-lg">
                                        +{post.media_urls.length - 4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(post.id)}
                            disabled={approvePost.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {approvePost.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                            )}
                            Duyệt bài
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => openRejectDialog(post.id)}
                            disabled={rejectPost.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Từ chối bài viết
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Lý do từ chối
            </label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối bài viết..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectPost.isPending}
            >
              {rejectPost.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          <img
            src={previewImage || ""}
            alt="Preview"
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
