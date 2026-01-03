import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHonorStats } from "@/hooks/useHonorStats";
import { useCountAnimation } from "@/hooks/useCountAnimation";
import { Users, DollarSign, FileText, Video, UserPlus, Award } from "lucide-react";

const formatNumber = (num: number): string => {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B ₫`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M ₫`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K ₫`;
  return `${amount} ₫`;
};

interface StatCardProps {
  icon: React.ElementType;
  labelKey: string;
  value: number;
  isCurrency?: boolean;
  delay: number;
}

function StatCard({ icon: Icon, labelKey, value, isCurrency = false, delay }: StatCardProps) {
  const { t } = useLanguage();
  const animatedValue = useCountAnimation(value);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-4 text-center hover-luxury-glow"
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
        {isCurrency ? formatCurrency(animatedValue) : formatNumber(animatedValue)}
      </p>
      <p className="text-sm text-muted-foreground">{t(labelKey)}</p>
    </motion.div>
  );
}

export function HonorStatsOverview() {
  const { data: stats } = useHonorStats();

  const statsData = [
    { icon: Users, labelKey: "honor.topProfile", value: stats?.topProfiles || 0 },
    { icon: DollarSign, labelKey: "honor.earnings", value: stats?.totalEarnings || 0, isCurrency: true },
    { icon: FileText, labelKey: "honor.posts", value: stats?.totalPosts || 0 },
    { icon: Video, labelKey: "honor.videos", value: stats?.videosCount || 0 },
    { icon: UserPlus, labelKey: "honor.friends", value: stats?.friendsCount || 0 },
    { icon: Award, labelKey: "honor.nftCount", value: stats?.nftCount || 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8"
    >
      {statsData.map((stat, index) => (
        <StatCard
          key={stat.labelKey}
          icon={stat.icon}
          labelKey={stat.labelKey}
          value={stat.value}
          isCurrency={stat.isCurrency}
          delay={0.3 + index * 0.1}
        />
      ))}
    </motion.div>
  );
}
