import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Loader2, Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FloatingClaimButtonProps {
  claimableAmount: number;
  userId: string | null;
  onLoginClick?: () => void;
}

export function FloatingClaimButton({ claimableAmount, userId, onLoginClick }: FloatingClaimButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Chưa đăng nhập');

      const { data, error } = await supabase.rpc('claim_rewards', {
        p_user_id: userId
      });

      if (error) throw error;
      return data as { success: boolean; message: string; claimed_amount: number };
    },
    onSuccess: (data) => {
      if (data.success) {
        setShowSuccess(true);
        toast.success(`🎉 Đã nhận ${data.claimed_amount.toLocaleString()} Camly Coin!`, {
          description: 'Phước lành đã được thêm vào ví của bạn',
        });
        queryClient.invalidateQueries({ queryKey: ['user-balances'] });
        queryClient.invalidateQueries({ queryKey: ['reward-transactions'] });
        
        setTimeout(() => {
          setShowSuccess(false);
          setIsExpanded(false);
        }, 3000);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  });

  // Don't show if no claimable amount
  if (claimableAmount <= 0 && userId) {
    return null;
  }

  // If not logged in, show login prompt
  if (!userId) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50"
      >
        <Button
          onClick={onLoginClick}
          className="relative h-14 px-6 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30"
        >
          <Gift className="w-5 h-5 mr-2" />
          Đăng nhập để nhận thưởng
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50"
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg shadow-green-500/30"
          >
            <Check className="w-5 h-5" />
            <span>Đã nhận thành công!</span>
            
            {/* Sparkle particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                  x: Math.cos(i * 45 * Math.PI / 180) * 60,
                  y: Math.sin(i * 45 * Math.PI / 180) * 60,
                }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
                className="absolute w-2 h-2 rounded-full bg-yellow-300"
                style={{ left: '50%', top: '50%' }}
              />
            ))}
          </motion.div>
        ) : isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ scale: 0.8, opacity: 0, width: 56 }}
            animate={{ scale: 1, opacity: 1, width: 'auto' }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-lg shadow-amber-500/30"
          >
            <div className="text-white">
              <p className="text-xs opacity-80">Có thể nhận</p>
              <p className="font-bold">{claimableAmount.toLocaleString()} Camly</p>
            </div>
            <Button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              {claimMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-1" />
                  Nhận
                </>
              )}
            </Button>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            onClick={() => setIsExpanded(true)}
            className={cn(
              "relative h-14 w-14 rounded-full flex items-center justify-center",
              "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600",
              "shadow-lg shadow-amber-500/40 hover:shadow-amber-500/60",
              "transition-shadow duration-300"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Pulse ring animation */}
            <motion.div
              className="absolute inset-0 rounded-full bg-amber-400"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Icon */}
            <Gift className="w-6 h-6 text-white relative z-10" />
            
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[24px] h-6 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-lg"
            >
              {claimableAmount > 999999 
                ? `${Math.floor(claimableAmount / 1000000)}M` 
                : claimableAmount > 999 
                  ? `${Math.floor(claimableAmount / 1000)}K`
                  : claimableAmount}
            </motion.div>
            
            {/* Sparkle decorations */}
            <Sparkles className="absolute -top-2 -left-2 w-4 h-4 text-yellow-300 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
