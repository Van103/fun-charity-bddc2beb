import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Users, Coins, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface Milestone {
  type: string;
  value: number;
}

const milestoneConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  posts: { icon: <Star className="w-12 h-12" />, color: 'from-blue-500 to-cyan-500', label: 'bài viết' },
  friends: { icon: <Users className="w-12 h-12" />, color: 'from-pink-500 to-rose-500', label: 'bạn bè' },
  coins: { icon: <Coins className="w-12 h-12" />, color: 'from-amber-500 to-orange-500', label: 'Camly Coin' }
};

export function MilestoneAnimation() {
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [milestoneQueue, setMilestoneQueue] = useState<Milestone[]>([]);
  const queryClient = useQueryClient();

  const checkMilestones = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.rpc('check_milestones', {
      p_user_id: user.id
    });

    if (error || !data) return;

    const newMilestones = (data as Array<{ milestone_type: string; milestone_value: number; is_new: boolean }>)
      .filter(m => m.is_new)
      .map(m => ({ type: m.milestone_type, value: m.milestone_value }));

    if (newMilestones.length > 0) {
      setMilestoneQueue(prev => [...prev, ...newMilestones]);
    }
  }, []);

  // Show next milestone from queue
  useEffect(() => {
    if (milestoneQueue.length > 0 && !currentMilestone) {
      const [next, ...rest] = milestoneQueue;
      setCurrentMilestone(next);
      setMilestoneQueue(rest);
    }
  }, [milestoneQueue, currentMilestone]);

  // Auto dismiss after 5 seconds
  useEffect(() => {
    if (currentMilestone) {
      const timer = setTimeout(() => {
        setCurrentMilestone(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentMilestone]);

  // Check milestones periodically and on mount
  useEffect(() => {
    checkMilestones();
    
    // Check every 30 seconds
    const interval = setInterval(checkMilestones, 30000);
    return () => clearInterval(interval);
  }, [checkMilestones]);

  // Also check when user balances or posts change
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === 'user-balances' || 
          event?.query?.queryKey?.[0] === 'feed-posts') {
        checkMilestones();
      }
    });
    return () => unsubscribe();
  }, [queryClient, checkMilestones]);

  const config = currentMilestone ? milestoneConfig[currentMilestone.type] : null;

  return (
    <AnimatePresence>
      {currentMilestone && config && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -100 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className="relative">
            {/* Sparkles background */}
            <div className="absolute inset-0 -m-8">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-400"
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 0,
                    scale: 0 
                  }}
                  animate={{ 
                    x: Math.cos(i * 30 * Math.PI / 180) * 80,
                    y: Math.sin(i * 30 * Math.PI / 180) * 80,
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    delay: i * 0.1 
                  }}
                  style={{
                    left: '50%',
                    top: '50%'
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ))}
            </div>

            {/* Main card */}
            <motion.div
              className={`relative bg-gradient-to-br ${config.color} rounded-2xl p-6 shadow-2xl text-white min-w-[280px]`}
              animate={{ 
                boxShadow: [
                  '0 25px 50px -12px rgba(0,0,0,0.25)',
                  '0 25px 50px -12px rgba(255,215,0,0.4)',
                  '0 25px 50px -12px rgba(0,0,0,0.25)'
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {/* Trophy icon */}
              <motion.div
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 rounded-full p-3 shadow-lg"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                <Trophy className="w-8 h-8 text-yellow-900" />
              </motion.div>

              <div className="text-center pt-6">
                {/* Icon */}
                <motion.div
                  className="flex justify-center mb-3"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  {config.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-1">🎉 Milestone đạt được!</h3>
                
                {/* Value */}
                <motion.p
                  className="text-3xl font-extrabold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {currentMilestone.value.toLocaleString()}
                </motion.p>
                <p className="text-white/90">{config.label}</p>
              </div>

              {/* Confetti effect */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
                    left: `${Math.random() * 100}%`,
                    top: 0
                  }}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ 
                    y: 200,
                    opacity: 0,
                    x: (Math.random() - 0.5) * 100
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
