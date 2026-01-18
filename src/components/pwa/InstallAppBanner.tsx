import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPWA } from "@/hooks/useInstallPWA";
import { useLanguage } from "@/contexts/LanguageContext";

const BANNER_DISMISS_KEY = "pwa-banner-dismissed";
const DISMISS_DURATION_DAYS = 7;

export function InstallAppBanner() {
  const { t } = useLanguage();
  const { isInstalled, isIOS, canInstall, promptInstall, showInstallOption } = useInstallPWA();
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed recently
    const dismissedAt = localStorage.getItem(BANNER_DISMISS_KEY);
    if (dismissedAt) {
      const dismissDate = new Date(dismissedAt);
      const now = new Date();
      const daysSinceDismiss = (now.getTime() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismiss < DISMISS_DURATION_DAYS) {
        setIsDismissed(true);
        return;
      }
    }
    
    setIsDismissed(false);
    
    // Delay showing banner for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(BANNER_DISMISS_KEY, new Date().toISOString());
    setTimeout(() => setIsDismissed(true), 300);
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      // Navigate to install page for iOS instructions
      return;
    }
    
    const success = await promptInstall();
    if (success) {
      setIsVisible(false);
      setIsDismissed(true);
    }
  };

  // Don't show if: already installed, dismissed, or no install option
  if (isInstalled || isDismissed || !showInstallOption) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-0 right-0 z-40 px-4 py-2 md:top-20"
        >
          <div className="max-w-xl mx-auto">
            <div className="bg-gradient-to-r from-primary/90 to-primary backdrop-blur-lg rounded-xl shadow-lg shadow-primary/20 p-3 flex items-center gap-3">
              <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
                <img
                  src="/funcharity-icon-192-v3.png"
                  alt="Biểu tượng FUN Charity"
                  className="w-5 h-5 object-contain"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-foreground truncate">
                  {t("install.bannerTitle") || "Cài đặt app để trải nghiệm tốt hơn"}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {isIOS ? (
                  <Link to="/install" onClick={() => setIsVisible(false)}>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="gap-1.5 text-xs h-8 px-3 bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t("install.howTo") || "Hướng dẫn"}
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={handleInstallClick}
                    className="gap-1.5 text-xs h-8 px-3 bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t("install.installNow") || "Cài đặt"}
                  </Button>
                )}
                
                <button
                  onClick={handleDismiss}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Đóng"
                >
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
