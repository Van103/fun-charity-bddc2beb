import { motion } from "framer-motion";
import { Award, CheckCircle, MapPin, Heart, Wallet, Calendar, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CharityRecipient } from "@/hooks/useRecipients";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

interface RecipientNFTCardProps {
  recipient: CharityRecipient;
  showActions?: boolean;
  compact?: boolean;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toLocaleString();
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

export function RecipientNFTCard({ recipient, showActions = true, compact = false }: RecipientNFTCardProps) {
  const { language } = useLanguage();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20 hover:border-primary/40 transition-all">
        {/* NFT Header */}
        <div className="bg-gradient-to-r from-primary to-accent p-3 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="text-xs font-mono font-bold tracking-wider">
                {recipient.nft_token_id || "GENERATING..."}
              </span>
            </div>
            {recipient.is_verified && (
              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                {language === "vi" ? "Đã xác minh" : "Verified"}
              </Badge>
            )}
          </div>
        </div>

        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="flex gap-4">
            {/* Avatar */}
            <Avatar className={compact ? "h-12 w-12" : "h-16 w-16"}>
              <AvatarImage src={recipient.avatar_url || undefined} alt={recipient.full_name} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                {recipient.full_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-foreground truncate ${compact ? "text-sm" : "text-base"}`}>
                {recipient.full_name}
              </h3>
              
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {recipient.location && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {recipient.location}
                  </span>
                )}
                <Badge variant="outline" className="text-xs">
                  {getCategoryLabel(recipient.category, language)}
                </Badge>
              </div>

              {!compact && recipient.story && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {recipient.story}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-3 gap-2 ${compact ? "mt-3" : "mt-4"}`}>
            <div className="text-center p-2 rounded-lg bg-primary/10">
              <div className="text-lg font-bold text-primary">
                {formatCurrency(recipient.total_received)}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === "vi" ? "Đã nhận" : "Received"}
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-accent/10">
              <div className="text-lg font-bold text-accent-foreground">
                {recipient.donation_count}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === "vi" ? "Lượt giúp" : "Donations"}
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted">
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(recipient.created_at), "MM/yyyy")}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === "vi" ? "Đăng ký" : "Joined"}
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          {recipient.wallet_address && (
            <div className="mt-3 p-2 rounded-lg bg-muted/50 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <code className="text-xs text-muted-foreground truncate flex-1">
                {recipient.wallet_address.slice(0, 8)}...{recipient.wallet_address.slice(-6)}
              </code>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 mt-4">
              <Button asChild variant="default" size="sm" className="flex-1">
                <Link to={`/recipient/${recipient.id}`}>
                  <Heart className="h-4 w-4 mr-1" />
                  {language === "vi" ? "Ủng hộ" : "Support"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to={`/recipient/${recipient.id}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
