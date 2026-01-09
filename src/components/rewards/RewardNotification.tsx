import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles } from 'lucide-react';
import { useRewardNotifications, RewardTransaction, formatCurrency, getCurrencyIcon, getActionName } from '@/hooks/useRewards';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function RewardNotification() {
  const [notifications, setNotifications] = useState<RewardTransaction[]>([]);
  const [currentNotification, setCurrentNotification] = useState<RewardTransaction | null>(null);
  const shownIds = useRef<Set<string>>(new Set());
  const lastCheckTime = useRef<string | null>(null);

  // Fetch recent rewards on mount and auth change to catch signup/referral rewards
  useEffect(() => {
    const checkRecentRewards = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get rewards from last 30 seconds that we haven't shown yet
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      const checkFrom = lastCheckTime.current || thirtySecondsAgo;
      
      const { data: recentRewards } = await supabase
        .from('reward_transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', checkFrom)
        .order('created_at', { ascending: true });

      if (recentRewards && recentRewards.length > 0) {
        const newRewards = recentRewards.filter(r => !shownIds.current.has(r.id));
        if (newRewards.length > 0) {
          newRewards.forEach(r => shownIds.current.add(r.id));
          setNotifications(prev => [...prev, ...newRewards as RewardTransaction[]]);
        }
      }
      
      lastCheckTime.current = new Date().toISOString();
    };

    // Check immediately on mount
    checkRecentRewards();

    // Also check on auth state change (user just signed up/in)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // Small delay to allow triggers to complete
        setTimeout(checkRecentRewards, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReward = useCallback((transaction: RewardTransaction) => {
    // Prevent duplicates
    if (shownIds.current.has(transaction.id)) return;
    shownIds.current.add(transaction.id);
    setNotifications(prev => [...prev, transaction]);
  }, []);

  useRewardNotifications(handleReward);

  // Hiển thị notification tiếp theo
  useEffect(() => {
    if (!currentNotification && notifications.length > 0) {
      setCurrentNotification(notifications[0]);
      setNotifications(prev => prev.slice(1));
    }
  }, [currentNotification, notifications]);

  // Tự động ẩn sau 5 giây
  useEffect(() => {
    if (currentNotification) {
      const timer = setTimeout(() => {
        setCurrentNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentNotification]);

  const dismiss = () => {
    setCurrentNotification(null);
  };

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="relative bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-2xl p-1 shadow-2xl">
            {/* Sparkle effects */}
            <div className="absolute -top-2 -left-2 animate-ping">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="absolute -top-2 -right-2 animate-ping delay-100">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="absolute -bottom-1 left-1/2 animate-ping delay-200">
              <Sparkles className="w-3 h-3 text-orange-300" />
            </div>

            <div className="bg-background/95 backdrop-blur-sm rounded-xl p-4 min-w-[300px]">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={dismiss}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: 2,
                  }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-3xl shadow-lg"
                >
                  {getCurrencyIcon(currentNotification.currency)}
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-amber-500 font-medium">
                    <Gift className="w-4 h-4" />
                    <span>Chúc mừng!</span>
                  </div>
                  <p className="text-foreground font-semibold text-lg">
                    +{formatCurrency(currentNotification.amount, currentNotification.currency)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {currentNotification.description || getActionName(currentNotification.action_type)}
                  </p>
                </div>
              </div>

              {/* Confetti-like decoration */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      y: 0, 
                      x: Math.random() * 300,
                      opacity: 1 
                    }}
                    animate={{ 
                      y: 100 + Math.random() * 50,
                      opacity: 0,
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.1,
                      repeat: 2,
                    }}
                    className="absolute top-0 w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#fde68a', '#fef3c7'][i],
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
