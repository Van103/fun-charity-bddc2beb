import { motion } from "framer-motion";
import { Users, Trophy, Heart, UserPlus, FileText, Video, Award, Coins, Gift } from "lucide-react";
import { usePersonalStats } from "@/hooks/usePersonalStats";
import { useCountAnimation } from "@/hooks/useCountAnimation";

interface PersonalHonorBoardProps {
  userId: string | null;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(".", ",") + "M";
  }
  if (num >= 1000) {
    return num.toLocaleString("vi-VN");
  }
  return num.toString();
};

interface StatCellProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  delay: number;
}

const StatCell = ({ icon, label, value, delay }: StatCellProps) => {
  const numericValue = typeof value === "number" ? value : 0;
  const animatedValue = useCountAnimation(numericValue, 2000);
  const displayValue = typeof value === "string" ? value : formatNumber(animatedValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      className="metal-gold-border flex items-center justify-between gap-2 px-4 py-1.5 w-[240px]"
    >
      <div className="flex items-center gap-2">
        <span className="text-purple-500 flex-shrink-0">{icon}</span>
        <span className="text-[13px] uppercase tracking-wide text-purple-500 font-semibold">
          {label}
        </span>
      </div>
      <span className="text-[13px] font-semibold text-purple-500">{displayValue}</span>
    </motion.div>
  );
};

export function PersonalHonorBoard({ userId }: PersonalHonorBoardProps) {
  const { data: stats, isLoading } = usePersonalStats(userId);

  if (isLoading) {
    return (
      <>
        {/* Users Button - Top Left - Fixed position */}
        <div className="absolute top-4 left-4 z-20">
          <div className="metal-gold-border-button px-4 py-2 bg-amber-100/50 animate-pulse w-32 h-10" />
        </div>
        {/* Stats Grid - Right Side */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex flex-col gap-1.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="metal-gold-border w-36 h-8 bg-amber-100/50 animate-pulse" />
              <div className="metal-gold-border w-36 h-8 bg-amber-100/50 animate-pulse" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!stats) return null;

  const statsData = [
    { icon: <Trophy size={14} />, label: "Top Charity", value: "8/150" },
    { icon: <Heart size={14} />, label: "Charity Giving", value: stats.income || 0 },
    { icon: <UserPlus size={14} />, label: "Friends", value: stats.friendsCount || 0 },
    { icon: <FileText size={14} />, label: "Posts", value: stats.postsCount || 0 },
    { icon: <Video size={14} />, label: "Videos", value: stats.videosCount || 0 },
    { icon: <Award size={14} />, label: "Số NFT", value: stats.nftCount || 0 },
    { icon: <Coins size={14} />, label: "Claimed", value: stats.income || 0 },
    { icon: <Gift size={14} />, label: "Total Reward", value: (stats.income || 0) + (stats.featuredScore || 0) },
  ];

  return (
    <>
      {/* Users Button - Top Left - Fixed position with higher z-index */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        className="absolute top-4 left-4 z-20"
      >
        <div className="metal-gold-border-button flex items-center gap-2 px-4 sm:px-5 py-2 cursor-pointer shadow-lg">
          <Users className="text-purple-500" size={16} />
          <span className="text-[13px] sm:text-[15px] font-semibold text-purple-500 whitespace-nowrap">
            {formatNumber(stats.featuredScore || 100000)} Users
          </span>
        </div>
      </motion.div>

      {/* Stats Grid - Right Side - Desktop */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 right-4 z-20 hidden lg:flex flex-col gap-2"
      >
        {/* Row 1: TOP CHARITY | CHARITY GIVING */}
        <div className="flex gap-3">
          <StatCell icon={statsData[0].icon} label={statsData[0].label} value={statsData[0].value} delay={0.1} />
          <StatCell icon={statsData[1].icon} label={statsData[1].label} value={statsData[1].value} delay={0.15} />
        </div>
        {/* Row 2: FRIENDS | POSTS */}
        <div className="flex gap-3">
          <StatCell icon={statsData[2].icon} label={statsData[2].label} value={statsData[2].value} delay={0.2} />
          <StatCell icon={statsData[3].icon} label={statsData[3].label} value={statsData[3].value} delay={0.25} />
        </div>
        {/* Row 3: VIDEOS | SỐ NFT */}
        <div className="flex gap-3">
          <StatCell icon={statsData[4].icon} label={statsData[4].label} value={statsData[4].value} delay={0.3} />
          <StatCell icon={statsData[5].icon} label={statsData[5].label} value={statsData[5].value} delay={0.35} />
        </div>
        {/* Row 4: CLAIMED | TOTAL REWARD */}
        <div className="flex gap-3">
          <StatCell icon={statsData[6].icon} label={statsData[6].label} value={statsData[6].value} delay={0.4} />
          <StatCell icon={statsData[7].icon} label={statsData[7].label} value={statsData[7].value} delay={0.45} />
        </div>
      </motion.div>

      {/* Stats Grid - Tablet (md) - Compact 2 columns */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 right-4 z-20 hidden md:flex lg:hidden flex-col gap-1"
      >
        {[...Array(4)].map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-2">
            <StatCell 
              icon={statsData[rowIdx * 2].icon} 
              label={statsData[rowIdx * 2].label} 
              value={statsData[rowIdx * 2].value} 
              delay={0.1 + rowIdx * 0.05} 
            />
            <StatCell 
              icon={statsData[rowIdx * 2 + 1].icon} 
              label={statsData[rowIdx * 2 + 1].label} 
              value={statsData[rowIdx * 2 + 1].value} 
              delay={0.15 + rowIdx * 0.05} 
            />
          </div>
        ))}
      </motion.div>

      {/* Stats - Mobile - Horizontal scroll */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-2 left-2 right-2 z-20 md:hidden"
      >
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {statsData.slice(0, 4).map((stat, idx) => (
            <div 
              key={idx} 
              className="metal-gold-border flex items-center gap-1.5 px-2 py-1 flex-shrink-0"
            >
              <span className="text-purple-500">{stat.icon}</span>
              <span className="text-[10px] uppercase text-purple-500 font-semibold whitespace-nowrap">
                {stat.label}
              </span>
              <span className="text-[10px] font-semibold text-purple-500">
                {typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}

export default PersonalHonorBoard;
