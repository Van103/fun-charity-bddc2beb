import { motion } from "framer-motion";
import { Trophy, Star, Crown, Gem, Award, Coins, Gift } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ClaimRewardsButton } from "@/components/rewards/ClaimRewardsButton";

interface Milestone {
  value: number;
  label: string;
  icon: React.ElementType;
}

const milestones: Milestone[] = [
  { value: 10000, label: "Người Sáng Tạo", icon: Star },
  { value: 100000, label: "Thiên Sứ Nhỏ", icon: Award },
  { value: 500000, label: "Thiên Sứ Bạc", icon: Trophy },
  { value: 1000000, label: "Thiên Sứ Vàng", icon: Crown },
  { value: 5000000, label: "Thiên Sứ Kim Cương", icon: Gem },
];

interface CosmicMilestoneProps {
  totalEarned: number;
  claimableBalance?: number;
  userId?: string;
}

export function CosmicMilestone({ totalEarned, claimableBalance = 0, userId }: CosmicMilestoneProps) {
  // Find current milestone
  const currentMilestoneIndex = milestones.findIndex((m) => totalEarned < m.value);
  const currentMilestone = currentMilestoneIndex === -1 
    ? milestones[milestones.length - 1] 
    : milestones[currentMilestoneIndex];
  const previousMilestone = currentMilestoneIndex > 0 
    ? milestones[currentMilestoneIndex - 1] 
    : { value: 0, label: "Khởi đầu", icon: Star };

  const progress = currentMilestoneIndex === -1 
    ? 100 
    : ((totalEarned - previousMilestone.value) / (currentMilestone.value - previousMilestone.value)) * 100;

  const Icon = currentMilestone.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card-divine p-6 rounded-2xl"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Hành Trình Thiên Sứ</h3>
            <p className="text-purple-300/70">Cấp độ hiện tại: {previousMilestone.label}</p>
          </div>
        </div>
        
        {/* Claimable balance section */}
        {claimableBalance > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Gift className="w-5 h-5 text-amber-400" />
              </motion.div>
              <div className="text-sm">
                <p className="text-amber-300/80">Có thể nhận</p>
                <p className="font-bold text-amber-400 flex items-center gap-1">
                  {claimableBalance.toLocaleString()}
                  <Coins className="w-4 h-4" />
                </p>
              </div>
            </div>
            <ClaimRewardsButton
              claimableAmount={claimableBalance}
              userId={userId}
              variant="mini"
            />
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-purple-300">
            {new Intl.NumberFormat("vi-VN").format(totalEarned)} Camly
          </span>
          <span className="text-amber-400">
            {new Intl.NumberFormat("vi-VN").format(currentMilestone.value)} Camly
          </span>
        </div>
        <Progress value={progress} className="h-3 bg-purple-900/50" />
        <p className="text-xs text-purple-300/60 text-center">
          Còn {new Intl.NumberFormat("vi-VN").format(Math.max(0, currentMilestone.value - totalEarned))} Camly để đạt {currentMilestone.label}
        </p>
      </div>

      {/* Milestone roadmap */}
      <div className="flex justify-between items-center">
        {milestones.slice(0, 5).map((milestone, index) => {
          const MIcon = milestone.icon;
          const isAchieved = totalEarned >= milestone.value;
          const isCurrent = milestone.value === currentMilestone.value;

          return (
            <motion.div
              key={milestone.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex flex-col items-center gap-1 ${
                isCurrent ? "scale-110" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isAchieved
                    ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30"
                    : isCurrent
                    ? "bg-purple-600 border-2 border-amber-400"
                    : "bg-purple-800/50 border border-purple-500/30"
                }`}
              >
                <MIcon
                  className={`w-5 h-5 ${
                    isAchieved ? "text-white" : isCurrent ? "text-amber-300" : "text-purple-400"
                  }`}
                />
              </div>
              <span className={`text-[10px] font-medium text-center max-w-[60px] ${
                isAchieved ? "text-amber-400" : "text-purple-400/60"
              }`}>
                {milestone.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
