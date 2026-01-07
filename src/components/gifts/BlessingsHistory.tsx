import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Sparkles, FileText, Heart, Users, Gift, 
  ArrowDownCircle, ArrowUpCircle, CheckCircle 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RewardTransaction } from "@/hooks/useRewards";

const actionIcons: Record<string, React.ElementType> = {
  signup: Sparkles,
  post: FileText,
  donation: Heart,
  referral: Users,
  claim: ArrowDownCircle,
  manual_grant: Gift,
};

const actionNames: Record<string, string> = {
  signup: "Phước lành đăng ký",
  post: "Phước lành đăng bài",
  donation: "Phước lành quyên góp",
  referral: "Phước lành giới thiệu",
  claim: "Nhận phần thưởng",
  manual_grant: "Quà tặng đặc biệt",
};

interface BlessingsHistoryProps {
  transactions: RewardTransaction[];
  isLoading: boolean;
}

export function BlessingsHistory({ transactions, isLoading }: BlessingsHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-purple-500/10 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-12">
        <Gift className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
        <p className="text-purple-300/70">Chưa có phước lành nào được ghi nhận</p>
        <p className="text-sm text-purple-400/50 mt-1">Hãy bắt đầu hoạt động để nhận phước lành!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {transactions.map((tx, index) => {
          const Icon = actionIcons[tx.action_type] || Gift;
          const isCredit = tx.amount > 0 && tx.action_type !== "claim";

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-purple-900/30 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isCredit ? "bg-green-500/20" : "bg-purple-500/20"
              }`}>
                <Icon className={`w-5 h-5 ${isCredit ? "text-green-400" : "text-purple-400"}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">
                  {actionNames[tx.action_type] || tx.action_type}
                </p>
                <p className="text-xs text-purple-300/60 truncate">
                  {tx.description || formatDistanceToNow(new Date(tx.created_at), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </p>
              </div>

              <div className="text-right">
                <p className={`font-bold ${isCredit ? "text-green-400" : "text-purple-400"}`}>
                  {isCredit ? "+" : ""}{new Intl.NumberFormat("vi-VN").format(tx.amount)}
                </p>
                <p className="text-xs text-purple-300/50">{tx.currency}</p>
              </div>

              {tx.status === "completed" && (
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
