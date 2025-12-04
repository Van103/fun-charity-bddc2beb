import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { MotionProvider } from "@/contexts/MotionContext";
import { AnimatedBackground } from "@/components/background/AnimatedBackground";
import Index from "./pages/Index";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import Dashboard from "./pages/Dashboard";
import NeedsMap from "./pages/NeedsMap";
import Profiles from "./pages/Profiles";
import Reviews from "./pages/Reviews";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MotionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <BackgroundWithVariant />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/needs-map" element={<NeedsMap />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MotionProvider>
  </QueryClientProvider>
);

export default App;
