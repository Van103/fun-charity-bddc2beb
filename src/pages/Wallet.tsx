import { Helmet } from 'react-helmet-async';
import { MyWallet } from '@/components/rewards/MyWallet';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AnimatedBackground } from '@/components/background/AnimatedBackground';
import { SwipeIndicator } from '@/components/layout/SwipeIndicator';

export default function Wallet() {
  return (
    <>
      <Helmet>
        <title>Ví Thưởng | Fun Charity</title>
        <meta name="description" content="Quản lý phần thưởng Camly Coin của bạn - Xem số dư, lịch sử và mã giới thiệu" />
      </Helmet>

      <AnimatedBackground />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
          <MyWallet />
        </main>

        <Footer />
        <MobileBottomNav />
        <SwipeIndicator />
      </div>
    </>
  );
}
