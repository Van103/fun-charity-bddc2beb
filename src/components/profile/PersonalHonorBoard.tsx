import { usePersonalStats } from "@/hooks/usePersonalStats";
import { useCountAnimation } from "@/hooks/useCountAnimation";

interface PersonalHonorBoardProps {
  userId: string | null;
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const animatedValue = useCountAnimation(value, 1500);
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(".", ",") + "M";
    }
    if (num >= 1000) {
      return num.toLocaleString("vi-VN");
    }
    return num.toLocaleString("vi-VN");
  };

  return (
    <span>
      {formatNumber(animatedValue)}{suffix}
    </span>
  );
}

interface StatBoxProps {
  label: string;
  value: number | string;
  suffix?: string;
  isRank?: boolean;
  rankTotal?: number;
}

function StatBox({ label, value, suffix = "", isRank = false, rankTotal }: StatBoxProps) {
  return (
    <div className="bg-gradient-to-r from-yellow-300/90 via-yellow-200/95 to-yellow-300/90 rounded-lg px-3 py-2 flex items-center justify-between shadow-md border border-yellow-400/50">
      <span className="text-purple-900 font-bold text-xs uppercase tracking-wide">
        {label}
      </span>
      <span className="text-purple-900 font-bold text-sm">
        {isRank ? (
          `${value}/${rankTotal}`
        ) : typeof value === "number" ? (
          <AnimatedNumber value={value} suffix={suffix} />
        ) : (
          value
        )}
      </span>
    </div>
  );
}

export function PersonalHonorBoard({ userId }: PersonalHonorBoardProps) {
  const { data: stats, isLoading } = usePersonalStats(userId);

  if (isLoading) {
    return (
      <div className="absolute top-4 right-4 z-10 hidden md:block">
        <div className="w-[320px] h-[180px] bg-black/30 backdrop-blur-md rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="absolute top-4 right-4 z-10 hidden md:block">
      <div className="w-[320px] backdrop-blur-sm rounded-xl p-2">
        <div className="grid grid-cols-2 gap-2">
          <StatBox
            label="TOP CHARITY"
            value={stats.charityRank}
            isRank={true}
            rankTotal={stats.totalCharityUsers}
          />
          <StatBox
            label="CHARITY GIVING"
            value={stats.charityGiving}
          />
          <StatBox
            label="CAMPAIGN"
            value={stats.campaignCount}
          />
          <StatBox
            label="FRIEND"
            value={stats.friendsCount}
          />
          <StatBox
            label="VIDEO"
            value={stats.videosCount}
          />
          <StatBox
            label="SỐ NFT"
            value={stats.nftCount}
          />
          <StatBox
            label="CLAIMED"
            value={stats.claimedAmount}
          />
          <StatBox
            label="TOTAL REWARD"
            value={stats.totalReward}
          />
        </div>
      </div>
    </div>
  );
}