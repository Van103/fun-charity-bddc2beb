import { motion } from 'framer-motion';
import { Coins, ChevronRight } from 'lucide-react';
import { useUserBalances, formatCurrency } from '@/hooks/useRewards';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface WalletBalanceCardProps {
  compact?: boolean;
}

export function WalletBalanceCard({ compact = false }: WalletBalanceCardProps) {
  const { data: balances, isLoading } = useUserBalances();

  const camlyBalance = balances?.find(b => b.currency === 'CAMLY')?.balance || 0;

  if (isLoading) {
    return <Skeleton className={compact ? 'h-12 w-full' : 'h-20 w-full'} />;
  }

  if (compact) {
    return (
      <Link to="/wallet">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 cursor-pointer hover:border-amber-500/40 transition-colors"
        >
          <span className="text-lg">🪙</span>
          <span className="font-bold text-amber-500">{camlyBalance.toLocaleString()}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to="/wallet">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 cursor-pointer hover:border-amber-500/40 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ví Camly</p>
                  <p className="text-xl font-bold text-amber-500">
                    {camlyBalance.toLocaleString()} 🪙
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
