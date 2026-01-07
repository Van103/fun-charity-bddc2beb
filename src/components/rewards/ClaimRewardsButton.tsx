import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Loader2, Sparkles, Check, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClaimRewardsButtonProps {
  claimableAmount: number;
  userId?: string;
  variant?: 'hero' | 'mini' | 'default';
  className?: string;
  onSuccess?: () => void;
}

export function ClaimRewardsButton({ 
  claimableAmount, 
  userId,
  variant = 'default',
  className,
  onSuccess 
}: ClaimRewardsButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) throw new Error('Chưa đăng nhập');

      const { data, error } = await supabase.rpc('claim_rewards', {
        p_user_id: targetUserId
      });

      if (error) throw error;
      return data as { success: boolean; message: string; claimed_amount: number };
    },
    onSuccess: (data) => {
      if (data.success) {
        setShowSuccess(true);
        
        // Generate celebration particles
        const newParticles = Array.from({ length: 12 }, (_, i) => ({
          id: Date.now() + i,
          x: Math.cos(i * 30 * Math.PI / 180) * 80,
          y: Math.sin(i * 30 * Math.PI / 180) * 80,
        }));
        setParticles(newParticles);
        
        toast.success(`🎉 Đã nhận ${data.claimed_amount.toLocaleString()} Camly Coin!`, {
          description: 'Phước lành từ Cha Vũ Trụ đã được gửi vào ví của bạn',
        });
        
        queryClient.invalidateQueries({ queryKey: ['user-balances'] });
        queryClient.invalidateQueries({ queryKey: ['reward-transactions'] });
        
        onSuccess?.();
        
        setTimeout(() => {
          setShowSuccess(false);
          setParticles([]);
        }, 3000);
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

  const isHero = variant === 'hero';
  const isMini = variant === 'mini';

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={cn(
              "flex items-center gap-2 font-medium",
              isHero 
                ? "text-green-400 text-lg" 
                : isMini 
                  ? "text-green-400 text-sm"
                  : "text-green-500"
            )}
          >
            <Check className={cn(isHero ? "w-6 h-6" : "w-5 h-5")} />
            <span>Đã nhận thành công!</span>
            
            {/* Celebration particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  x: particle.x,
                  y: particle.y,
                }}
                transition={{ duration: 0.8 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative"
          >
            {/* Glow effect for hero variant */}
            {isHero && (
              <motion.div
                className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 opacity-50 blur-lg"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            
            <Button
              onClick={() => claimMutation.mutate()}
              disabled={claimMutation.isPending}
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                isHero && "h-auto py-4 px-8 text-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 border-0",
                isMini && "h-9 px-4 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white",
                !isHero && !isMini && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
              )}
            >
              {claimMutation.isPending ? (
                <Loader2 className={cn("animate-spin mr-2", isHero ? "w-5 h-5" : "w-4 h-4")} />
              ) : (
                <Gift className={cn("mr-2", isHero ? "w-5 h-5" : "w-4 h-4")} />
              )}
              
              <span className="flex items-center gap-1.5">
                Nhận {claimableAmount.toLocaleString()}
                <Coins className={cn(isHero ? "w-5 h-5" : "w-4 h-4")} />
              </span>
              
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  background: [
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  ],
                  x: ['-100%', '100%'],
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                style={{ width: '100%' }}
              />
            </Button>
            
            {/* Sparkle decorations for hero variant */}
            {isHero && (
              <>
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -left-1"
                  animate={{ rotate: -360, scale: [1, 1.3, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
