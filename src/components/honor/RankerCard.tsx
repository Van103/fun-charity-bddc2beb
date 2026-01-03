import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle } from "lucide-react";
import { TopRanker } from "@/hooks/useHonorStats";
import { VolunteerRanker } from "@/hooks/useVolunteerRanking";

type Ranker = TopRanker | VolunteerRanker;

interface RankerCardProps {
  ranker: Ranker;
  type: "donor" | "volunteer";
  delay?: number;
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

export function RankerCard({ ranker, type, delay = 0 }: RankerCardProps) {
  const { t } = useLanguage();
  const isVolunteer = type === "volunteer";
  const volunteerRanker = ranker as VolunteerRanker;
  const donorRanker = ranker as TopRanker;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02, x: 5 }}
      className="glass-card p-4 flex items-center gap-4 hover-luxury-glow cursor-pointer"
    >
      {/* Rank Badge */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground shrink-0">
        #{ranker.rank}
      </div>

      {/* Avatar */}
      <Link to={`/user/${ranker.userId}`} className="shrink-0">
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-primary/20">
            <AvatarImage src={ranker.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-light text-white font-semibold">
              {ranker.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {ranker.verified && (
            <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
              <CheckCircle className="w-4 h-4 text-primary fill-primary" />
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/user/${ranker.userId}`}>
          <h4 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
            {ranker.name}
          </h4>
        </Link>
        {isVolunteer && (
          <p className="text-xs text-muted-foreground">
            {volunteerRanker.tasksCompleted} {t("honorBoard.tasksCompleted")}
          </p>
        )}
      </div>

      {/* Amount / Hours */}
      <div className="text-right shrink-0">
        {isVolunteer ? (
          <>
            <p className="font-bold text-primary">
              {formatHours(volunteerRanker.hours)} {t("honorBoard.hrs")}
            </p>
            <p className="text-xs text-muted-foreground">
              {volunteerRanker.impactScore} pts
            </p>
          </>
        ) : (
          <p className="font-bold text-primary">
            {formatCurrency(donorRanker.amount)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
