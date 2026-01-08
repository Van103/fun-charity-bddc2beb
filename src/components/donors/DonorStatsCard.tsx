import { motion } from "framer-motion";
import { Award, Calendar, Heart, Star, TrendingUp, Gem } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DonorStats } from "@/hooks/useDonorJourney";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface DonorStatsCardProps {
  stats: DonorStats;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString();
};

const tierConfig = {
  bronze: { 
    label: { vi: "Đồng", en: "Bronze" }, 
    color: "bg-amber-700", 
    icon: "🥉",
    gradient: "from-amber-700/20 to-amber-600/10"
  },
  silver: { 
    label: { vi: "Bạc", en: "Silver" }, 
    color: "bg-gray-400", 
    icon: "🥈",
    gradient: "from-gray-400/20 to-gray-300/10"
  },
  gold: { 
    label: { vi: "Vàng", en: "Gold" }, 
    color: "bg-yellow-500", 
    icon: "🥇",
    gradient: "from-yellow-500/20 to-yellow-400/10"
  },
  platinum: { 
    label: { vi: "Bạch Kim", en: "Platinum" }, 
    color: "bg-cyan-400", 
    icon: "💎",
    gradient: "from-cyan-400/20 to-cyan-300/10"
  },
  diamond: { 
    label: { vi: "Kim Cương", en: "Diamond" }, 
    color: "bg-purple-500", 
    icon: "👑",
    gradient: "from-purple-500/20 to-purple-400/10"
  },
};

export function DonorStatsCard({ stats }: DonorStatsCardProps) {
  const { language } = useLanguage();
  const tier = tierConfig[stats.tier];

  return (
    <Card className={`overflow-hidden bg-gradient-to-br ${tier.gradient} border-primary/20`}>
      <CardContent className="p-6">
        {/* Tier Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{tier.icon}</span>
            <div>
              <Badge className={`${tier.color} text-white`}>
                {tier.label[language === "vi" ? "vi" : "en"]}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">
                {language === "vi" ? "Hạng Nhà Từ Thiện" : "Donor Tier"}
              </div>
            </div>
          </div>
          <Gem className="h-8 w-8 text-primary opacity-50" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-lg bg-background/50"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Heart className="h-4 w-4" />
              <span className="text-xs">
                {language === "vi" ? "Tổng đóng góp" : "Total donated"}
              </span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.totalDonated)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-lg bg-background/50"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Award className="h-4 w-4" />
              <span className="text-xs">
                {language === "vi" ? "Số lần cho" : "Donations"}
              </span>
            </div>
            <div className="text-2xl font-bold text-accent-foreground">
              {stats.totalDonations}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-lg bg-background/50"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="h-4 w-4" />
              <span className="text-xs">
                {language === "vi" ? "Chiến dịch" : "Campaigns"}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalCampaigns}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-4 rounded-lg bg-background/50"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">
                {language === "vi" ? "Lớn nhất" : "Largest"}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(stats.largestDonation)}
            </div>
          </motion.div>
        </div>

        {/* First Donation */}
        {stats.firstDonation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Calendar className="h-4 w-4" />
            <span>
              {language === "vi" ? "Bắt đầu từ" : "Member since"}{" "}
              {format(new Date(stats.firstDonation), "dd/MM/yyyy")}
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
