import { motion } from "framer-motion";
import { Trophy, FileText, DollarSign, Video, Users, Gift } from "lucide-react";
import { useProfileStats } from "@/hooks/useProfileStats";
import { Logo } from "@/components/brand/Logo";

interface ProfileHonorBoardProps {
  userId: string | null;
  userName?: string | null;
}

// Format number with Vietnamese style (e.g., 602.000)
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace('.', ',') + 'M';
  }
  if (num >= 1000) {
    return num.toLocaleString('vi-VN');
  }
  return num.toString();
}

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  delay: number;
  isCurrency?: boolean;
}

function StatRow({ icon, label, value, delay, isCurrency = false }: StatRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center justify-between py-2 px-3 rounded-full bg-gradient-to-r from-amber-100/90 via-yellow-50/90 to-amber-100/90 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className="text-amber-600">{icon}</span>
        <span className="text-sm font-medium text-amber-800">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-purple-600">~</span>
        <span className="font-bold text-purple-700">
          {isCurrency ? formatNumber(value) + ' ₫' : formatNumber(value)}
        </span>
      </div>
    </motion.div>
  );
}

export function ProfileHonorBoard({ userId, userName }: ProfileHonorBoardProps) {
  const { data: stats, isLoading } = useProfileStats(userId);

  if (isLoading) {
    return (
      <div className="w-full max-w-xs rounded-2xl bg-gradient-to-br from-purple-600/90 via-purple-700/90 to-purple-900/90 backdrop-blur-sm p-4 shadow-xl animate-pulse">
        <div className="h-8 bg-white/20 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-white/10 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  const statsData = [
    { icon: <Trophy className="w-4 h-4" />, label: "Hồ Sơ Nổi Bật", value: stats?.postsCount || 0 },
    { icon: <DollarSign className="w-4 h-4" />, label: "Thu Nhập", value: stats?.income || 0, isCurrency: true },
    { icon: <FileText className="w-4 h-4" />, label: "Bài Viết", value: stats?.textPostsCount || 0 },
    { icon: <Video className="w-4 h-4" />, label: "Video", value: stats?.videosCount || 0 },
    { icon: <Users className="w-4 h-4" />, label: "Bạn Bè", value: stats?.friendsCount || 0 },
    { icon: <Gift className="w-4 h-4" />, label: "Tổng Phần Thưởng", value: stats?.totalReward || 0, isCurrency: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(109, 40, 217, 0.95) 50%, rgba(76, 29, 149, 0.95) 100%)",
      }}
    >
      {/* Header */}
      <div className="relative p-4 text-center">
        {/* Sparkle effects */}
        <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
        <div className="absolute top-4 right-6 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-2 left-8 w-1 h-1 bg-white rounded-full animate-pulse delay-500" />
        
        {/* Title with trophy icons */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold text-yellow-400 tracking-wide drop-shadow-lg">
            BẢNG VINH DANH
          </h3>
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>

        {/* FUN Charity Logo */}
        <div className="flex justify-center mb-2">
          <Logo size="sm" showText={true} />
        </div>
      </div>

      {/* Stats List */}
      <div className="px-3 pb-4 space-y-2">
        {statsData.map((stat, index) => (
          <StatRow
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            delay={0.1 + index * 0.1}
            isCurrency={stat.isCurrency}
          />
        ))}
      </div>

      {/* Bottom glow effect */}
      <div className="h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
    </motion.div>
  );
}
