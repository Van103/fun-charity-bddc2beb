import { motion } from "framer-motion";
import { 
  Sparkles, FileText, Heart, Users, Gift, 
  Video, Star, Coins, Award, Crown, Image
} from "lucide-react";
import type { RewardConfig } from "@/hooks/useRewardConfig";

const iconMap: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  "file-text": FileText,
  heart: Heart,
  users: Users,
  gift: Gift,
  video: Video,
  star: Star,
  coins: Coins,
  award: Award,
  crown: Crown,
  image: Image,
};

interface GiftCardProps {
  config: RewardConfig;
  index: number;
}

export function GiftCard({ config, index }: GiftCardProps) {
  const Icon = iconMap[config.icon_name || "gift"] || Gift;

  const formatReward = () => {
    if (config.reward_percentage) {
      return `${config.reward_percentage * 100}%`;
    }
    return new Intl.NumberFormat("vi-VN").format(config.reward_amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="glass-card-divine p-6 rounded-2xl relative overflow-hidden group"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Icon container */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg">
          <Icon className="w-7 h-7 text-amber-300" />
        </div>
        {config.is_active && (
          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
            Đang hoạt động
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-white mb-1">
        {config.display_name_vi || config.action_type}
      </h3>
      <p className="text-sm text-purple-200/70 mb-4">
        {config.display_name || config.action_type}
      </p>

      {/* Reward amount */}
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-amber-400" />
        <span className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
          {formatReward()}
        </span>
        <span className="text-purple-300 text-sm">{config.reward_currency}</span>
      </div>

      {/* Daily limit */}
      {config.max_per_day && (
        <p className="text-xs text-purple-300/60 mt-2">
          Tối đa: {new Intl.NumberFormat("vi-VN").format(config.max_per_day)}/ngày
        </p>
      )}

      {/* Decorative elements */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-2xl" />
    </motion.div>
  );
}
