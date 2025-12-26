import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { DonationModal } from "@/components/donations/DonationModal";
import { useCampaignApi, Campaign } from "@/hooks/useCampaignApi";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Users,
  Clock,
  Verified,
  TrendingUp,
  ExternalLink,
  MessageCircle,
  Image as ImageIcon,
  ThumbsUp,
  Send,
  Shield,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_MAP: Record<string, string> = {
  education: "Giáo Dục",
  healthcare: "Y Tế",
  disaster_relief: "Cứu Trợ Thiên Tai",
  poverty: "Xóa Đói Giảm Nghèo",
  environment: "Môi Trường",
  animal_welfare: "Bảo Vệ Động Vật",
  community: "Cộng Đồng",
  other: "Khác",
};

const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  if (currency === 'USD') {
    return `$${amount.toLocaleString()}`;
  }
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B ₫`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ₫`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K ₫`;
  }
  return `${amount.toLocaleString()} ₫`;
};

const getDaysLeft = (endDate: string | null): number | null => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [comment, setComment] = useState("");
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  
  const { loading, getCampaign } = useCampaignApi();

  useEffect(() => {
    if (id) {
      loadCampaign();
    }
  }, [id]);

  const loadCampaign = async () => {
    if (!id) return;
    const data = await getCampaign(id);
    if (data) {
      setCampaign(data);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title,
          text: campaign?.short_description || '',
          url,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép link chiến dịch!');
    }
  };

  if (loading && !campaign) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-40 mb-6" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="w-full h-[400px] rounded-2xl" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div>
                <Skeleton className="w-full h-[400px] rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy chiến dịch</h1>
            <p className="text-muted-foreground mb-6">
              Chiến dịch này có thể đã bị xóa hoặc không tồn tại.
            </p>
            <Link to="/campaigns">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const daysLeft = getDaysLeft(campaign.end_date);
  const progress = campaign.goal_amount > 0 
    ? (campaign.raised_amount / campaign.goal_amount) * 100 
    : 0;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link to="/campaigns">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </Button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden"
              >
                <img
                  src={campaign.cover_image_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80"}
                  alt={campaign.title}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {campaign.is_verified && (
                    <Badge variant="verified" className="backdrop-blur-sm">
                      <Verified className="w-3 h-3" />
                      Đã Xác Minh
                    </Badge>
                  )}
                  {campaign.is_featured && (
                    <Badge variant="trending" className="backdrop-blur-sm">
                      <TrendingUp className="w-3 h-3" />
                      Nổi Bật
                    </Badge>
                  )}
                </div>
              </motion.div>

              {/* Title & Organization */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  {campaign.location && (
                    <>
                      <MapPin className="w-4 h-4" />
                      {campaign.location}
                      <span className="mx-2">•</span>
                    </>
                  )}
                  <Badge variant="secondary">
                    {CATEGORY_MAP[campaign.category] || campaign.category}
                  </Badge>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  {campaign.title}
                </h1>

                {/* Organization */}
                {campaign.creator && (
                  <div className="flex items-center gap-3 p-4 glass-card">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={campaign.creator.avatar_url || undefined} />
                      <AvatarFallback>
                        {campaign.creator.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {campaign.creator.full_name || 'Người tạo chiến dịch'}
                        </span>
                        {campaign.creator.is_verified && (
                          <Verified className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Người khởi tạo chiến dịch
                      </div>
                    </div>
                    <Link to={`/profile/${campaign.creator.user_id}`}>
                      <Button variant="outline" size="sm">
                        Xem hồ sơ
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Tabs defaultValue="story" className="w-full">
                  <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
                    <TabsTrigger
                      value="story"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Câu chuyện
                    </TabsTrigger>
                    <TabsTrigger
                      value="updates"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                      Cập nhật ({campaign.updates?.length || 0})
                    </TabsTrigger>
                    {campaign.wallet_address && (
                      <TabsTrigger
                        value="transactions"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                      >
                        Sổ cái On-Chain
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="story" className="pt-6">
                    <div className="prose prose-neutral max-w-none">
                      {campaign.description ? (
                        campaign.description.split("\n\n").map((paragraph, index) => (
                          <p key={index} className="mb-4 text-muted-foreground whitespace-pre-line">
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p className="text-muted-foreground">
                          {campaign.short_description || 'Chưa có mô tả chi tiết.'}
                        </p>
                      )}
                    </div>

                    {/* Campaign Media */}
                    {campaign.media && campaign.media.length > 0 && (
                      <div className="mt-8">
                        <h3 className="font-semibold mb-4">Hình ảnh & Video</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {campaign.media.map((item) => (
                            <div key={item.id} className="relative rounded-xl overflow-hidden">
                              {item.media_type === 'video' ? (
                                <video
                                  src={item.media_url}
                                  className="w-full h-32 object-cover"
                                  controls
                                />
                              ) : (
                                <img
                                  src={item.media_url}
                                  alt={item.caption || 'Campaign media'}
                                  className="w-full h-32 object-cover"
                                />
                              )}
                              {item.is_proof && (
                                <Badge className="absolute top-2 left-2" variant="verified">
                                  Bằng chứng
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="updates" className="pt-6 space-y-6">
                    {campaign.updates && campaign.updates.length > 0 ? (
                      campaign.updates.map((update) => (
                        <div key={update.id} className="glass-card p-6">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Calendar className="w-4 h-4" />
                            {new Date(update.created_at).toLocaleDateString('vi-VN')}
                          </div>
                          <h3 className="font-display font-semibold text-lg mb-2">
                            {update.title}
                          </h3>
                          <p className="text-muted-foreground">{update.content}</p>
                          {update.author && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={update.author.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {update.author.full_name?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                {update.author.full_name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Chưa có cập nhật nào.
                      </div>
                    )}

                    {/* Comment Input */}
                    <div className="glass-card p-4">
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Viết bình luận..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="mb-3"
                          />
                          <div className="flex justify-between">
                            <Button variant="ghost" size="sm">
                              <ImageIcon className="w-4 h-4" />
                              Thêm ảnh
                            </Button>
                            <Button size="sm">
                              <Send className="w-4 h-4" />
                              Đăng
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="transactions" className="pt-6">
                    <div className="glass-card overflow-hidden">
                      <div className="p-4 bg-muted/50 border-b flex items-center gap-2">
                        <Shield className="w-5 h-5 text-success" />
                        <span className="font-medium">Tất cả giao dịch được ghi trên blockchain</span>
                      </div>
                      <div className="p-8 text-center text-muted-foreground">
                        <p>Wallet Address: {campaign.wallet_address}</p>
                        <p className="mt-2 text-sm">
                          Xem giao dịch trên block explorer
                        </p>
                        <Button variant="outline" className="mt-4" asChild>
                          <a
                            href={`https://polygonscan.com/address/${campaign.wallet_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Xem trên PolygonScan
                          </a>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Donation Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 sticky top-24"
              >
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-display text-3xl font-bold">
                      {formatCurrency(campaign.raised_amount, campaign.currency)}
                    </span>
                    <span className="text-muted-foreground">
                      mục tiêu {formatCurrency(campaign.goal_amount, campaign.currency)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(progress, 100)}
                    className="h-3 mb-2"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{Math.round(progress)}% đạt được</span>
                    {daysLeft !== null && <span>còn {daysLeft} ngày</span>}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-muted/50 rounded-xl">
                    <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <div className="font-semibold">{campaign.stats?.donor_count || 0}</div>
                    <div className="text-xs text-muted-foreground">Nhà hảo tâm</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-xl">
                    <Heart className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                    <div className="font-semibold">{campaign.stats?.donation_count || 0}</div>
                    <div className="text-xs text-muted-foreground">Lượt quyên góp</div>
                  </div>
                </div>

                {/* Donation Buttons */}
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full mb-3"
                  onClick={() => setDonationModalOpen(true)}
                >
                  <Heart className="w-5 h-5" fill="currentColor" />
                  Quyên Góp Ngay
                </Button>
                <Button variant="outline" className="w-full" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                  Chia Sẻ Chiến Dịch
                </Button>

                {/* Campaign Info */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tạo ngày:</span>
                    <span>{new Date(campaign.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {campaign.end_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Kết thúc:</span>
                      <span>{new Date(campaign.end_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  {campaign.region && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Khu vực:</span>
                      <span>{campaign.region}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Donation Modal */}
      <DonationModal
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        campaignId={campaign.id}
        campaignTitle={campaign.title}
        campaignWalletAddress={campaign.wallet_address}
      />
    </main>
  );
};

export default CampaignDetail;
