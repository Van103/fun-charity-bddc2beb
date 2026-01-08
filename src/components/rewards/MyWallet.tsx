import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, History, ArrowUpRight, Copy, Check, Coins, TrendingUp, Gift, Trophy, Link2, Share2 } from 'lucide-react';
import { useUserBalances, useRewardTransactions, useReferralCode, formatCurrency, getCurrencyIcon, getActionName } from '@/hooks/useRewards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ClaimRewardsButton } from './ClaimRewardsButton';
import { vi } from 'date-fns/locale';

export function MyWallet() {
  const { data: balances, isLoading: balancesLoading } = useUserBalances();
  const { data: transactions, isLoading: transactionsLoading } = useRewardTransactions(50);
  const { data: referralCode } = useReferralCode();
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyReferralCode = async () => {
    if (referralCode?.code) {
      await navigator.clipboard.writeText(referralCode.code);
      setCopied(true);
      toast.success('Đã sao chép mã giới thiệu!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralLink = async () => {
    if (referralCode?.code) {
      const referralLink = `${window.location.origin}/auth?ref=${referralCode.code}`;
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      toast.success('Đã sao chép link giới thiệu!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareReferralLink = async () => {
    if (referralCode?.code) {
      const referralLink = `${window.location.origin}/auth?ref=${referralCode.code}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'FUN Charity - Mời bạn tham gia',
            text: 'Đăng ký ngay để nhận 50 Camly Coin miễn phí! 🎁',
            url: referralLink,
          });
        } catch (err) {
          // User cancelled share
        }
      } else {
        await copyReferralLink();
      }
    }
  };

  // Tổng hợp số dư theo currency
  const totalCamly = balances?.find(b => b.currency === 'CAMLY')?.balance || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Ví Thưởng</h2>
          <p className="text-muted-foreground">Quản lý phần thưởng của bạn</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {balancesLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : (
          <>
            {/* Camly Coin Card - Always show */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">🪙</span>
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-600">
                      Chính
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">Camly Coin (Claimable)</p>
                  <p className="text-3xl font-bold text-amber-500">
                    {totalCamly.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span>+{(balances?.find(b => b.currency === 'CAMLY')?.total_earned || 0).toLocaleString()} tổng</span>
                    </div>
                    <ClaimRewardsButton claimableAmount={totalCamly} />
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Đã nhận: {(balances?.find(b => b.currency === 'CAMLY')?.total_withdrawn || 0).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Other currencies */}
            {balances?.filter(b => b.currency !== 'CAMLY').map((balance, i) => (
              <motion.div
                key={balance.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 1) * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{getCurrencyIcon(balance.currency)}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{balance.currency}</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(balance.balance, balance.currency)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Referral Section */}
      {referralCode && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              Mời bạn bè - Nhận thưởng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
                <p className="text-muted-foreground mb-2">
                  Chia sẻ link để nhận <strong className="text-amber-500">30,000 Camly Coin</strong> khi bạn bè đăng ký!
                  <br />
                  <span className="text-sm">Bạn bè cũng nhận <strong className="text-green-500">50,000 Camly Coin</strong> khi đăng ký qua link của bạn!</span>
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-background border-2 border-dashed border-purple-500/50 rounded-lg px-4 py-2 font-mono text-lg font-bold tracking-wider">
                    {referralCode.code}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralCode}
                    className="shrink-0"
                    title="Sao chép mã"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-muted-foreground">Đã mời</p>
                <p className="text-2xl font-bold text-purple-500">{referralCode.uses_count} bạn</p>
                <p className="text-sm text-amber-500">+{referralCode.total_earned} Camly</p>
              </div>
            </div>

            {/* Referral Link Section */}
            <div className="bg-background/50 rounded-xl p-4 border border-purple-500/20">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-500" />
                Link giới thiệu của bạn:
              </p>
              <div className="flex items-center gap-2 bg-background rounded-lg p-2 border">
                <code className="flex-1 text-sm text-muted-foreground truncate">
                  {window.location.origin}/auth?ref={referralCode.code}
                </code>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReferralLink}
                  className="flex-1"
                >
                  {copiedLink ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiedLink ? 'Đã sao chép!' : 'Sao chép Link'}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={shareReferralLink}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Link */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <p className="font-semibold">Bảng Xếp Hạng</p>
              <p className="text-sm text-muted-foreground">Xem thứ hạng của bạn trong cộng đồng</p>
            </div>
          </div>
          <Link to="/leaderboard">
            <Button variant="outline" size="sm">
              Xem ngay
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Tabs: History */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Lịch sử thưởng
          </TabsTrigger>
          <TabsTrigger value="withdraw" disabled>
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Rút tiền (Sắp ra mắt)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-xl">
                        {getCurrencyIcon(tx.currency)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {tx.description || getActionName(tx.action_type)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(tx.created_at), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-500">
                          +{formatCurrency(tx.amount, tx.currency)}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {tx.status === 'completed' ? 'Hoàn thành' : tx.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có giao dịch thưởng nào</p>
                  <p className="text-sm">Hãy đăng bài, quyên góp hoặc mời bạn bè để nhận thưởng!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card>
            <CardContent className="p-8 text-center">
              <ArrowUpRight className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Tính năng đang phát triển</h3>
              <p className="text-muted-foreground">
                Chức năng rút tiền sẽ sớm được ra mắt. Hãy tích lũy thêm phần thưởng nhé!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
