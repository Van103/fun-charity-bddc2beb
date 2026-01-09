import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { MotionProvider } from "@/contexts/MotionContext";
import { CursorProvider } from "@/contexts/CursorContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AngelThemeProvider } from "@/components/angel/AngelThemeContext";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import { EnergyBokeh } from "@/components/background/EnergyBokeh";
import CustomCursor from "@/components/cursor/CustomCursor";
import FlyingAngel from "@/components/cursor/FlyingAngel";
import { useIncomingCallListener } from "@/hooks/useIncomingCallListener";
import { IncomingCallNotification } from "@/components/chat/IncomingCallNotification";
import { GlobalEmailVerificationBanner } from "@/components/layout/GlobalEmailVerificationBanner";
import { usePushNotification } from "@/hooks/usePushNotification";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import PageLoader from "@/components/ui/PageLoader";
import { RewardNotification } from "@/components/rewards/RewardNotification";
import { MilestoneAnimation } from "@/components/rewards/MilestoneAnimation";
import { AngelAIButton } from "@/components/angel/AngelAIButton";
import MobileBackButton from "@/components/layout/MobileBackButton";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const CampaignDetail = lazy(() => import("./pages/CampaignDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NeedsMap = lazy(() => import("./pages/NeedsMap"));
const Profiles = lazy(() => import("./pages/Profiles"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Auth = lazy(() => import("./pages/Auth"));
const LawOfLight = lazy(() => import("./pages/LawOfLight"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const SocialFeed = lazy(() => import("./pages/SocialFeed"));
const Messages = lazy(() => import("./pages/Messages"));
const Life = lazy(() => import("./pages/Life"));
const Academy = lazy(() => import("./pages/Academy"));
const Trading = lazy(() => import("./pages/Trading"));
const Investment = lazy(() => import("./pages/Investment"));
const Farm = lazy(() => import("./pages/Farm"));
const Play = lazy(() => import("./pages/Play"));
const Legal = lazy(() => import("./pages/Legal"));
const Planet = lazy(() => import("./pages/Planet"));
const Friends = lazy(() => import("./pages/Friends"));
const MyCampaigns = lazy(() => import("./pages/MyCampaigns"));
const AdminVerify = lazy(() => import("./pages/AdminVerify"));
const Volunteer = lazy(() => import("./pages/Volunteer"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const LiveStream = lazy(() => import("./pages/LiveStream"));
const HonorBoard = lazy(() => import("./pages/HonorBoard"));
const AdminModeration = lazy(() => import("./pages/AdminModeration"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const ModerationLogs = lazy(() => import("./pages/ModerationLogs"));
const BrandGuidelines = lazy(() => import("./pages/BrandGuidelines"));
const GiftsFromCosmicFather = lazy(() => import("./pages/GiftsFromCosmicFather"));
const AdminRewards = lazy(() => import("./pages/AdminRewards"));
const AdminAngelKnowledge = lazy(() => import("./pages/AdminAngelKnowledge"));
const RecipientProfile = lazy(() => import("./pages/RecipientProfile"));
const ReferralRedirect = lazy(() => import("./pages/ReferralRedirect"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Background variant selector based on route
function BackgroundWithVariant() {
  const location = useLocation();
  
  const getVariant = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname === "/profile") return "profile";
    if (location.pathname.includes("/campaigns")) return "default";
    return "default";
  };

  return <AnimatedBackground variant={getVariant()} intensity="medium" />;
}

// Global incoming call listener component
function IncomingCallListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize push notifications
  const { subscribe, isSupported, permission } = usePushNotification();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      // Auto-subscribe to push notifications if permission is granted
      if (user && isSupported && permission === "granted") {
        subscribe();
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, [isSupported, permission, subscribe]);

  // Callback to handle when a call ends (declined/missed) - triggers refresh
  const handleCallEnded = useCallback(() => {
    // Dispatch custom event to notify Messages page to refresh
    window.dispatchEvent(new CustomEvent('call-ended-refresh'));
  }, []);

  const { incomingCall, answerCall, declineCall } = useIncomingCallListener({
    userId,
    onAnswerCall: (call) => {
      // Always navigate to messages page with call info, even if already there
      // Adding timestamp ensures URL change triggers re-render/effect
      const callUrl = `/messages?answer=${call.id}&conversation=${call.conversationId}&type=${call.callType}&t=${Date.now()}`;
      console.log('[IncomingCallListener] Navigating to:', callUrl);
      navigate(callUrl, { replace: location.pathname === "/messages" });
    },
    onCallEnded: handleCallEnded
  });

  // Show notification on ALL pages including /messages (global singleton)
  if (!incomingCall) {
    return null;
  }

  return (
    <IncomingCallNotification
      callerName={incomingCall.callerName}
      callerAvatar={incomingCall.callerAvatar}
      callType={incomingCall.callType}
      onAnswer={answerCall}
      onDecline={declineCall}
    />
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <MotionProvider>
        <CursorProvider>
          <AngelThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <CustomCursor />
              <FlyingAngel />
              <BrowserRouter>
                <BackgroundWithVariant />
                <EnergyBokeh />
                <IncomingCallListener />
                <GlobalEmailVerificationBanner />
                <RewardNotification />
                <MilestoneAnimation />
                <AngelAIButton />
                <MobileBackButton />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/campaigns/:id" element={<CampaignDetail />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/needs-map" element={<NeedsMap />} />
                    <Route path="/profiles" element={<Profiles />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/law-of-light" element={<LawOfLight />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/user/:userId" element={<PublicProfile />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/feed" element={<SocialFeed />} />
                    <Route path="/social" element={<SocialFeed />} />
                    <Route path="/life" element={<Life />} />
                    <Route path="/academy" element={<Academy />} />
                    <Route path="/trading" element={<Trading />} />
                    <Route path="/investment" element={<Investment />} />
                    <Route path="/farm" element={<Farm />} />
                    <Route path="/play" element={<Play />} />
                    <Route path="/legal" element={<Legal />} />
                    <Route path="/planet" element={<Planet />} />
                    <Route path="/friends" element={<Friends />} />
                    <Route path="/my-campaigns" element={<MyCampaigns />} />
                    <Route path="/admin/verify" element={<AdminVerify />} />
                    <Route path="/admin/moderation" element={<AdminModeration />} />
                    <Route path="/admin/moderation-logs" element={<ModerationLogs />} />
                    <Route path="/volunteer" element={<Volunteer />} />
                    <Route path="/install" element={<Install />} />
                    <Route path="/live/:streamId" element={<LiveStream />} />
                    <Route path="/honor-board" element={<HonorBoard />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/brand" element={<BrandGuidelines />} />
                    <Route path="/gifts" element={<GiftsFromCosmicFather />} />
                    <Route path="/admin/rewards" element={<AdminRewards />} />
                    <Route path="/admin/angel-knowledge" element={<AdminAngelKnowledge />} />
                    <Route path="/recipient/:id" element={<RecipientProfile />} />
                    <Route path="/r/:code" element={<ReferralRedirect />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </AngelThemeProvider>
        </CursorProvider>
      </MotionProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
