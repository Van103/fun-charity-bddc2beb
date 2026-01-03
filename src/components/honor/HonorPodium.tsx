import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Crown, Medal, Award, CheckCircle } from "lucide-react";
import { TopRanker } from "@/hooks/useHonorStats";
import { VolunteerRanker } from "@/hooks/useVolunteerRanking";

type Ranker = TopRanker | VolunteerRanker;

interface HonorPodiumProps {
  rankers: Ranker[];
  type: "donor" | "volunteer";
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B ₫`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M ₫`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K ₫`;
  return `${amount} ₫`;
};

const formatHours = (hours: number): string => {
  if (hours >= 1000) return `${(hours / 1000).toFixed(1)}K`;
  return hours.toString();
};

function PodiumPlace({ ranker, position, type }: { ranker: Ranker; position: 1 | 2 | 3; type: "donor" | "volunteer" }) {
  const { t } = useLanguage();
  
  const configs = {
    1: {
      height: "h-32 md:h-40",
      avatarSize: "w-20 h-20 md:w-24 md:h-24",
      iconSize: "w-8 h-8",
      bgClass: "bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600",
      glowClass: "glow-gold",
      icon: Crown,
      order: "order-2",
      mt: "mt-0",
    },
    2: {
      height: "h-24 md:h-32",
      avatarSize: "w-16 h-16 md:w-20 md:h-20",
      iconSize: "w-6 h-6",
      bgClass: "bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500",
      glowClass: "glow-silver",
      icon: Medal,
      order: "order-1",
      mt: "mt-8 md:mt-12",
    },
    3: {
      height: "h-20 md:h-28",
      avatarSize: "w-14 h-14 md:w-18 md:h-18",
      iconSize: "w-5 h-5",
      bgClass: "bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700",
      glowClass: "glow-bronze",
      icon: Award,
      order: "order-3",
      mt: "mt-12 md:mt-16",
    },
  };

  const config = configs[position];
  const Icon = config.icon;
  const isVolunteer = type === "volunteer";
  const volunteerRanker = ranker as VolunteerRanker;
  const donorRanker = ranker as TopRanker;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position === 1 ? 0.1 : position === 2 ? 0.2 : 0.3, type: "spring", stiffness: 100 }}
      className={`flex flex-col items-center ${config.order} ${config.mt}`}
    >
      {/* Crown/Medal Icon */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-2"
      >
        <Icon className={`${config.iconSize} text-yellow-500 drop-shadow-lg`} fill="currentColor" />
      </motion.div>

      {/* Avatar */}
      <Link to={`/user/${ranker.userId}`}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`relative ${config.glowClass} rounded-full`}
        >
          <Avatar className={`${config.avatarSize} border-4 border-white shadow-xl`}>
            <AvatarImage src={ranker.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-light text-white text-xl font-bold">
              {ranker.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {ranker.verified && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <CheckCircle className="w-5 h-5 text-primary fill-primary" />
            </div>
          )}
        </motion.div>
      </Link>

      {/* Name */}
      <Link to={`/user/${ranker.userId}`}>
        <h3 className="mt-3 font-bold text-foreground text-center max-w-[120px] truncate hover:text-primary transition-colors">
          {ranker.name}
        </h3>
      </Link>

      {/* Stats */}
      <div className="mt-1 text-center">
        {isVolunteer ? (
          <>
            <p className="text-sm font-semibold text-primary">
              {formatHours(volunteerRanker.hours)} {t("honorBoard.hours")}
            </p>
            <p className="text-xs text-muted-foreground">
              {volunteerRanker.tasksCompleted} {t("honorBoard.tasks")}
            </p>
          </>
        ) : (
          <p className="text-sm font-semibold text-primary">
            {formatCurrency(donorRanker.amount)}
          </p>
        )}
      </div>

      {/* Podium Base */}
      <div className={`${config.height} w-24 md:w-32 ${config.bgClass} rounded-t-xl mt-4 flex items-start justify-center pt-4 shadow-lg`}>
        <span className="text-2xl md:text-3xl font-extrabold text-white drop-shadow">
          #{position}
        </span>
      </div>
    </motion.div>
  );
}

export function HonorPodium({ rankers, type }: HonorPodiumProps) {
  if (rankers.length === 0) return null;

  // Ensure we have at least placeholders for positions
  const positions: (Ranker | null)[] = [
    rankers[1] || null, // 2nd place (left)
    rankers[0] || null, // 1st place (center)
    rankers[2] || null, // 3rd place (right)
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-end gap-2 md:gap-4 py-8"
    >
      {positions[0] && <PodiumPlace ranker={positions[0]} position={2} type={type} />}
      {positions[1] && <PodiumPlace ranker={positions[1]} position={1} type={type} />}
      {positions[2] && <PodiumPlace ranker={positions[2]} position={3} type={type} />}
    </motion.div>
  );
}
