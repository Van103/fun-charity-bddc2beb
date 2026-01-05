import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Loader2, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClaimRewardsButtonProps {
  claimableAmount: number;
  className?: string;
}

export function ClaimRewardsButton({ claimableAmount, className }: ClaimRewardsButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');

      const { data, error } = await supabase.rpc('claim_rewards', {
        p_user_id: user.id
      });

      if (error) throw error;
      return data as { success: boolean; message: string; claimed_amount: number };
    },
    onSuccess: (data) => {
      if (data.success) {
        setShowSuccess(true);
        toast.success(`🎉 Đã nhận ${data.claimed_amount.toLocaleString()} Camly Coin!`);
        queryClient.invalidateQueries({ queryKey: ['user-balances'] });
        queryClient.invalidateQueries({ queryKey: ['reward-transactions'] });
        
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    }
  });

  if (claimableAmount <= 0) {
    return null;
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-2 text-green-500 font-medium"
          >
            <Check className="w-5 h-5" />
            <span>Đã nhận thành công!</span>
          </motion.div>
        ) : (
          <motion.div
            key="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <Button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
            >
              {claimMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Gift className="w-4 h-4 mr-2" />
              )}
              Nhận {claimableAmount.toLocaleString()} Xu
              
              {/* Sparkle effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
