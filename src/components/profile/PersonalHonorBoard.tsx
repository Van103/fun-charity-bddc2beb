import { usePersonalStats } from "@/hooks/usePersonalStats";
import { TrendingUp, Trophy, Coins, FileText, Video, Users, Award } from "lucide-react";
import { useCountAnimation } from "@/hooks/useCountAnimation";

interface PersonalHonorBoardProps {
  userId: string | null;
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const animatedValue = useCountAnimation(value, 1500);
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString("vi-VN");
  };

  return (
    <span>
      {formatNumber(animatedValue)}{suffix}
    </span>
  );
}

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  showTrend?: boolean;
}

function StatRow({ icon, label, value, suffix = "", showTrend = true }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className="text-gold-champagne/80">{icon}</span>
        <span className="text-white/90 text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {showTrend && value > 0 && (
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        )}
        <span className="text-white font-semibold text-sm">
          <AnimatedNumber value={value} suffix={suffix} />
        </span>
      </div>
    </div>
  );
}

export function PersonalHonorBoard({ userId }: PersonalHonorBoardProps) {
  const { data: stats, isLoading } = usePersonalStats(userId);

  if (isLoading) {
    return (
      <div className="absolute top-4 right-4 z-10 hidden md:block">
        <div className="w-[200px] h-[200px] bg-black/30 backdrop-blur-md rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="absolute top-4 right-4 z-10 hidden md:block">
      <div className="w-[200px] bg-gradient-to-br from-purple-900/80 via-purple-800/70 to-pink-900/80 backdrop-blur-md rounded-xl border border-gold-champagne/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-champagne/20 to-transparent px-3 py-2 border-b border-gold-champagne/20">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-gold-champagne" />
            <span className="text-gold-champagne font-bold text-sm tracking-wide">
              BẢNG VINH DANH
            </span>
            <Trophy className="w-4 h-4 text-gold-champagne" />
          </div>
        </div>

        {/* Stats */}
        <div className="px-3 py-2 space-y-0.5">
          <StatRow
            icon={<Award className="w-4 h-4" />}
            label="Hồ Sơ Nổi Bật"
            value={stats.featuredScore}
          />
          <StatRow
            icon={<Coins className="w-4 h-4" />}
            label="Thu Nhập"
            value={stats.income}
            suffix="đ"
            showTrend={false}
          />
          <StatRow
            icon={<FileText className="w-4 h-4" />}
            label="Bài Viết"
            value={stats.postsCount}
          />
          <StatRow
            icon={<Video className="w-4 h-4" />}
            label="Video"
            value={stats.videosCount}
          />
          <StatRow
            icon={<Users className="w-4 h-4" />}
            label="Bạn Bè"
            value={stats.friendsCount}
          />
          <StatRow
            icon={<Award className="w-4 h-4" />}
            label="Số Lượng NFT"
            value={stats.nftCount}
            showTrend={false}
          />
        </div>
      </div>
    </div>
  );
}
