import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lock, Award } from "lucide-react";
import { Badge as BadgeType } from "@/hooks/useBadges";

interface BadgeCardProps {
  badge: BadgeType;
  delay?: number;
}

const badgeEmojis: Record<string, string> = {
  donor_bronze: "🥉",
  donor_silver: "🥈",
  donor_gold: "🥇",
  donor_platinum: "💎",
  donor_diamond: "💠",
  volunteer_starter: "🌱",
  volunteer_active: "🌿",
  volunteer_hero: "🦸",
  first_donation: "❤️",
  recurring_donor: "🔄",
  campaign_creator: "🎯",
  verified_ngo: "✅",
  community_helper: "🤝",
  early_adopter: "🚀",
};

export function BadgeCard({ badge, delay = 0 }: BadgeCardProps) {
  const { language } = useLanguage();
  const isEarned = badge.isEarned;
  const emoji = badgeEmojis[badge.badge_type] || "🏆";
  
  const name = language === "vi" ? badge.name_vi : badge.name;
  const description = language === "vi" ? badge.description_vi : badge.description;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`relative glass-card p-4 text-center transition-all ${
        isEarned 
          ? "hover-luxury-glow" 
          : "opacity-60 grayscale"
      }`}
    >
      {/* Lock icon for unearned badges */}
      {!isEarned && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      {/* Badge Emoji/Icon */}
      <motion.div
        animate={isEarned ? { y: [0, -3, 0] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-4xl md:text-5xl mb-3"
      >
        {badge.icon_url ? (
          <img src={badge.icon_url} alt={name} className="w-12 h-12 mx-auto" />
        ) : (
          emoji
        )}
      </motion.div>

      {/* Badge Name */}
      <h4 className={`font-semibold text-sm mb-1 ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>
        {name}
      </h4>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2">
        {description}
      </p>

      {/* Points Required */}
      {badge.points_required > 0 && (
        <div className="mt-2">
          <span className={`text-xs font-medium ${isEarned ? "text-primary" : "text-muted-foreground"}`}>
            {badge.points_required} pts
          </span>
        </div>
      )}

      {/* NFT Badge Indicator */}
      {badge.is_nft && (
        <div className="absolute top-2 left-2">
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
            NFT
          </span>
        </div>
      )}

      {/* Earned glow effect */}
      {isEarned && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{ 
            boxShadow: [
              "0 0 0 0 rgba(168, 85, 247, 0)",
              "0 0 20px 5px rgba(168, 85, 247, 0.2)",
              "0 0 0 0 rgba(168, 85, 247, 0)"
            ]
          }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
      )}
    </motion.div>
  );
}
