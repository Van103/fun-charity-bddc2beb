import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  Award, CheckCircle, MapPin, Heart, Wallet, Calendar, 
  ArrowLeft, Gift, Home, GraduationCap, Utensils, 
  Building, Clock, User, Share2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";
import { useRecipientDetail, useRecipientDonations, useRecipientAssets } from "@/hooks/useRecipients";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

const formatCurrency = (amount: number, currency: string = "VND") => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getAssetIcon = (type: string) => {
  switch (type) {
    case "house":
      return <Home className="h-5 w-5" />;
    case "education":
    case "scholarship":
      return <GraduationCap className="h-5 w-5" />;
    case "food":
      return <Utensils className="h-5 w-5" />;
    case "land":
    case "property":
      return <Building className="h-5 w-5" />;
    default:
      return <Gift className="h-5 w-5" />;
  }
};

const getCategoryLabel = (category: string, lang: string) => {
  const categories: Record<string, { en: string; vi: string }> = {
    medical: { en: "Medical", vi: "Y tế" },
    education: { en: "Education", vi: "Giáo dục" },
    housing: { en: "Housing", vi: "Nhà ở" },
    food: { en: "Food", vi: "Thực phẩm" },
    disaster: { en: "Disaster Relief", vi: "Cứu trợ thiên tai" },
    children: { en: "Children", vi: "Trẻ em" },
    elderly: { en: "Elderly", vi: "Người già" },
    other: { en: "Other", vi: "Khác" },
  };
  return categories[category]?.[lang === "vi" ? "vi" : "en"] || category;
};

export default function RecipientProfile() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { data: recipient, isLoading: recipientLoading } = useRecipientDetail(id);
  const { data: donations, isLoading: donationsLoading } = useRecipientDonations(id);
  const { data: assets } = useRecipientAssets(id);

  if (recipientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">
          {language === "vi" ? "Không tìm thấy người nhận" : "Recipient not found"}
        </h1>
        <Button asChild>
          <Link to="/honor-board">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === "vi" ? "Quay lại" : "Go back"}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{recipient.full_name} - Camly Charity NFT ID</title>
        <meta name="description" content={recipient.story || `Support ${recipient.full_name} on Camly Charity`} />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background pb-24 md:pb-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-8 px-4">
          <div className="container mx-auto">
            <Button asChild variant="ghost" className="mb-4 text-primary-foreground hover:bg-white/20">
              <Link to="/honor-board">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === "vi" ? "Bảng Vinh Danh" : "Honor Board"}
              </Link>
            </Button>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-32 w-32 border-4 border-white/20">
                <AvatarImage src={recipient.avatar_url || undefined} alt={recipient.full_name} />
                <AvatarFallback className="bg-white/20 text-3xl font-bold">
                  {recipient.full_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <h1 className="text-3xl font-bold">{recipient.full_name}</h1>
                  {recipient.is_verified && (
                    <CheckCircle className="h-6 w-6" />
                  )}
                </div>

                {/* NFT Token ID */}
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-3">
                  <Award className="h-5 w-5" />
                  <span className="font-mono font-bold tracking-wider">
                    {recipient.nft_token_id}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                  {recipient.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {recipient.location}
                    </span>
                  )}
                  <Badge variant="secondary" className="bg-white/20">
                    {getCategoryLabel(recipient.category, language)}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(recipient.created_at), "dd/MM/yyyy")}
                  </span>
                </div>
              </div>

              <div className="md:ml-auto flex gap-2">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  <Heart className="h-5 w-5 mr-2" />
                  {language === "vi" ? "Ủng hộ ngay" : "Support now"}
                </Button>
                <Button size="icon" variant="ghost" className="text-primary-foreground hover:bg-white/20">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Stats & Info */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "vi" ? "Thống kê" : "Statistics"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(recipient.total_received)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === "vi" ? "Tổng nhận" : "Total received"}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-accent/10">
                    <div className="text-2xl font-bold text-accent-foreground">
                      {recipient.donation_count}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === "vi" ? "Lượt giúp đỡ" : "Donations"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Wallet Info */}
              {recipient.wallet_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      {language === "vi" ? "Ví Crypto" : "Crypto Wallet"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {recipient.wallet_address}
                    </code>
                  </CardContent>
                </Card>
              )}

              {/* Assets Received */}
              {assets && assets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      {language === "vi" ? "Tài sản đã nhận" : "Assets received"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assets.map((asset) => (
                      <div key={asset.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          {getAssetIcon(asset.asset_type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{asset.asset_name}</div>
                          {asset.asset_value && (
                            <div className="text-sm text-primary font-semibold">
                              {formatCurrency(asset.asset_value, asset.currency)}
                            </div>
                          )}
                          {asset.donor_name && (
                            <div className="text-xs text-muted-foreground">
                              {language === "vi" ? "Từ" : "From"}: {asset.donor_name}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(asset.received_at), "dd/MM/yyyy")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Story & Donations */}
            <div className="lg:col-span-2 space-y-6">
              {/* Story */}
              {recipient.story && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {language === "vi" ? "Câu chuyện" : "Story"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {recipient.story}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Donation Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {language === "vi" ? "Lịch sử nhận từ thiện" : "Donation History"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {donationsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : donations && donations.length > 0 ? (
                    <div className="space-y-4">
                      {donations.map((donation, index) => (
                        <motion.div
                          key={donation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-primary" />
                              {index < donations.length - 1 && (
                                <div className="w-0.5 h-full bg-border" />
                              )}
                            </div>
                            <div className="flex-1 pb-6">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {donation.donor_name || (language === "vi" ? "Ẩn danh" : "Anonymous")}
                                    </span>
                                  </div>
                                  <div className="text-lg font-bold text-primary mt-1">
                                    {formatCurrency(donation.amount, donation.currency)}
                                  </div>
                                  {donation.message && (
                                    <p className="text-sm text-muted-foreground mt-2 italic">
                                      "{donation.message}"
                                    </p>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(donation.received_at), "dd/MM/yyyy HH:mm")}
                                </div>
                              </div>
                              {donation.tx_hash && (
                                <div className="mt-2 text-xs">
                                  <a 
                                    href={`https://polygonscan.com/tx/${donation.tx_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {language === "vi" ? "Xem giao dịch" : "View transaction"} →
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {language === "vi" 
                        ? "Chưa có lịch sử nhận từ thiện"
                        : "No donation history yet"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </>
  );
}
