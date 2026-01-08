import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTransparencyStats } from "@/hooks/useTransparencyStats";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import { 
  Heart, 
  Users, 
  Target, 
  Clock, 
  TrendingUp, 
  Award,
  HandHeart,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatNumber = (num: number): string => {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B ₫`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M ₫`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K ₫`;
  return `${amount.toLocaleString()} ₫`;
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  isCurrency?: boolean;
  suffix?: string;
  delay: number;
  gradient: string;
}

function StatCard({ icon: Icon, label, value, isCurrency = false, suffix = "", delay, gradient }: StatCardProps) {
  const animatedValue = useCountAnimation(value);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group"
    >
      <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-300 overflow-hidden relative">
        <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity ${gradient}`} />
        <CardContent className="p-4 relative">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-foreground truncate">
                {isCurrency ? formatCurrency(animatedValue) : formatNumber(animatedValue)}{suffix}
              </p>
              <p className="text-sm text-muted-foreground truncate">{label}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TransparencyDashboard() {
  const { t, language } = useLanguage();
  const { data: stats, isLoading } = useTransparencyStats();

  const statsData = [
    { 
      icon: Wallet, 
      label: language === "vi" ? "Tổng tiền quyên góp" : "Total Donated", 
      value: stats?.totalDonated || 0, 
      isCurrency: true,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600"
    },
    { 
      icon: Heart, 
      label: language === "vi" ? "Nhà hảo tâm" : "Donors", 
      value: stats?.totalDonors || 0,
      gradient: "bg-gradient-to-br from-pink-500 to-rose-600"
    },
    { 
      icon: HandHeart, 
      label: language === "vi" ? "Người được giúp đỡ" : "Recipients Helped", 
      value: stats?.totalRecipients || 0,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600"
    },
    { 
      icon: Users, 
      label: language === "vi" ? "Tình nguyện viên" : "Volunteers", 
      value: stats?.totalVolunteers || 0,
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-600"
    },
    { 
      icon: Target, 
      label: language === "vi" ? "Chiến dịch đang hoạt động" : "Active Campaigns", 
      value: stats?.activeCampaigns || 0,
      gradient: "bg-gradient-to-br from-purple-500 to-violet-600"
    },
    { 
      icon: Award, 
      label: language === "vi" ? "Chiến dịch hoàn thành" : "Completed Campaigns", 
      value: stats?.completedCampaigns || 0,
      gradient: "bg-gradient-to-br from-cyan-500 to-sky-600"
    },
    { 
      icon: Clock, 
      label: language === "vi" ? "Giờ tình nguyện" : "Volunteer Hours", 
      value: stats?.totalHoursVolunteered || 0,
      suffix: "h",
      gradient: "bg-gradient-to-br from-fuchsia-500 to-pink-600"
    },
    { 
      icon: TrendingUp, 
      label: language === "vi" ? "Quyên góp trung bình" : "Avg. Donation", 
      value: stats?.averageDonation || 0,
      isCurrency: true,
      gradient: "bg-gradient-to-br from-lime-500 to-green-600"
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-muted rounded w-20" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <section className="py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {language === "vi" ? "🌟 Minh Bạch Từ Thiện" : "🌟 Charity Transparency"}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {language === "vi" 
            ? "Mọi hoạt động từ thiện đều được ghi nhận công khai trên blockchain"
            : "All charity activities are publicly recorded on blockchain"
          }
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            isCurrency={stat.isCurrency}
            suffix={stat.suffix}
            delay={0.1 + index * 0.05}
            gradient={stat.gradient}
          />
        ))}
      </div>
    </section>
  );
}
