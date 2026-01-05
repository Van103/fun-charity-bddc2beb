import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/layout/Navbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AnimatedBackground } from '@/components/background/AnimatedBackground';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard, getScoreLabel, getScoreIcon, LeaderboardUser } from '@/hooks/useLeaderboard';
import { FileText, Heart, Users, Coins, Trophy, Medal, Award, Crown, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

function LeaderboardCard({ user, type, delay }: { user: LeaderboardUser; type: string; delay: number }) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{rank}</span>;
  };

  const getRankBackground = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
    return 'bg-card hover:bg-muted/50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <Link to={`/user/${user.userId}`}>
        <Card className={`transition-all ${getRankBackground(user.rank)} border`}>
          <CardContent className="p-4 flex items-center gap-4">
            {/* Rank */}
            <div className="w-10 flex justify-center">
              {getRankBadge(user.rank)}
            </div>

            {/* Avatar */}
            <Avatar className="w-12 h-12 ring-2 ring-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{user.name}</span>
                {user.verified && (
                  <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                )}
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-lg">{getScoreIcon(type as any)}</span>
                <span className="font-bold text-lg">
                  {user.score.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {getScoreLabel(type as any)}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function LeaderboardList({ type }: { type: 'posts' | 'donations' | 'friends' | 'coins' }) {
  const { data: users = [], isLoading } = useLeaderboard(type);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Chưa có dữ liệu xếp hạng</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <LeaderboardCard 
          key={user.userId} 
          user={user} 
          type={type}
          delay={index * 0.03}
        />
      ))}
    </div>
  );
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <>
      <Helmet>
        <title>Bảng Xếp Hạng | FUN Charity</title>
        <meta name="description" content="Xếp hạng người dùng theo bài viết, quyên góp, bạn bè và Camly Coin" />
      </Helmet>

      <AnimatedBackground />
      <Navbar />

      <main className="min-h-screen pt-16 pb-20 lg:pb-8">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/20 to-background py-12">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
                <span className="mr-2">🏆</span>
                Bảng Xếp Hạng
                <span className="ml-2">🏆</span>
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Khám phá những thành viên xuất sắc nhất của cộng đồng FUN Charity
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <section className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="posts"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Bài viết</span>
              </TabsTrigger>
              <TabsTrigger 
                value="donations"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Quyên góp</span>
              </TabsTrigger>
              <TabsTrigger 
                value="friends"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Bạn bè</span>
              </TabsTrigger>
              <TabsTrigger 
                value="coins"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              >
                <Coins className="w-4 h-4" />
                <span className="hidden sm:inline">Camly</span>
              </TabsTrigger>
            </TabsList>

            <div className="max-w-2xl mx-auto">
              <TabsContent value="posts">
                <LeaderboardList type="posts" />
              </TabsContent>
              <TabsContent value="donations">
                <LeaderboardList type="donations" />
              </TabsContent>
              <TabsContent value="friends">
                <LeaderboardList type="friends" />
              </TabsContent>
              <TabsContent value="coins">
                <LeaderboardList type="coins" />
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </main>

      <MobileBottomNav />
    </>
  );
}
