import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Newspaper,
  Users,
  MessageCircle,
  Menu,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Sprout,
  Globe,
  Gamepad2,
  GraduationCap,
  TrendingUp,
  PiggyBank,
  Heart,
  Scale,
  MapPin,
  LayoutDashboard,
  Star,
  ExternalLink,
} from "lucide-react";

const mainNavItems = [
  { icon: Home, labelKey: "nav.home", href: "/social" },
  { icon: Newspaper, labelKey: "nav.campaigns", href: "/campaigns" },
  { icon: Users, labelKey: "nav.communityProfiles", href: "/profiles" },
  { icon: MessageCircle, labelKey: "menu.chat", href: "/messages" },
];

const menuItems = [
  { icon: User, labelKey: "menu.profile", href: "https://fun.rich/", external: true },
  { icon: Sprout, labelKey: "menu.farm", href: "https://funfarm.life/feed", external: true },
  { icon: Globe, labelKey: "menu.planet", href: "https://planet.fun.rich/", external: true },
  { icon: Gamepad2, labelKey: "menu.play", href: "https://play.fun.rich/", external: true },
  { icon: MessageCircle, labelKey: "menu.chat", href: "/messages", external: false },
  { icon: GraduationCap, labelKey: "menu.academy", href: "/academy", external: false },
  { icon: TrendingUp, labelKey: "menu.trading", href: "/trading", external: false },
  { icon: PiggyBank, labelKey: "menu.investment", href: "/investment", external: false },
  { icon: Heart, labelKey: "menu.life", href: "/life", external: false },
  { icon: Scale, labelKey: "menu.legal", href: "/legal", external: false },
];

const platformItems = [
  { icon: Newspaper, labelKey: "nav.campaigns", href: "/campaigns" },
  { icon: MapPin, labelKey: "nav.needsMap", href: "/needs-map" },
  { icon: LayoutDashboard, labelKey: "nav.overview", href: "/dashboard" },
  { icon: Star, labelKey: "nav.reviews", href: "/reviews" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', user.id);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('unread-messages-mobile')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          const isChat = item.labelKey === "menu.chat";
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full py-1.5 relative"
            >
              {/* Active indicator line - like Facebook */}
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    layoutId="activeIndicator"
                  />
                )}
              </AnimatePresence>
              
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-xl transition-colors relative"
              >
                {/* Glow effect for active icon */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-primary/20 blur-md"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <Icon className={`w-6 h-6 transition-colors relative z-10 ${
                  isActive ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" : "text-muted-foreground"
                }`} />
                
                {/* Unread badge for Chat icon */}
                {isChat && unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 z-20"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </motion.span>
                )}
              </motion.div>
              <span className={`text-[10px] mt-0.5 font-medium truncate max-w-[56px] transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}

        {/* Menu Button with Sheet */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center flex-1 h-full py-1.5"
            >
              <div className="p-1.5 rounded-xl">
                <Menu className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-[10px] mt-0.5 font-medium text-muted-foreground">
                {t("common.menu")}
              </span>
            </motion.button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="pb-4 border-b border-border">
              <SheetTitle className="text-lg font-bold text-center">
                {t("sidebar.ecosystem")}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(85vh-80px)] py-4">
              {/* Platform Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
                  {t("nav.platform")}
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {platformItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className={`p-2.5 rounded-full mb-2 ${
                          isActive ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-center leading-tight">
                          {t(item.labelKey)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* FUN Ecosystem Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
                  FUN Ecosystem
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = !item.external && location.pathname === item.href;
                    
                    if (item.external) {
                      return (
                        <a
                          key={item.labelKey}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex flex-col items-center p-3 rounded-xl hover:bg-muted transition-all relative"
                        >
                          <div className="p-2.5 rounded-full bg-muted mb-2">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-xs font-medium text-center leading-tight">
                            {t(item.labelKey)}
                          </span>
                          <ExternalLink className="w-3 h-3 absolute top-2 right-2 text-muted-foreground" />
                        </a>
                      );
                    }
                    
                    return (
                      <Link
                        key={item.labelKey}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className={`p-2.5 rounded-full mb-2 ${
                          isActive ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-center leading-tight">
                          {t(item.labelKey)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
