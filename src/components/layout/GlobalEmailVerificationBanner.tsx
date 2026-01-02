import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";

// Pages where the banner should NOT be shown
const EXCLUDED_ROUTES = [
  "/auth",
  "/verify-email",
  "/auth/callback",
];

export const GlobalEmailVerificationBanner = () => {
  const location = useLocation();
  const [email, setEmail] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthenticated(true);
        setEmail(user.email || null);
        setIsEmailVerified(user.email_confirmed_at != null);
      } else {
        setIsAuthenticated(false);
        setEmail(null);
        setIsEmailVerified(true);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setEmail(session.user.email || null);
        setIsEmailVerified(session.user.email_confirmed_at != null);
      } else {
        setIsAuthenticated(false);
        setEmail(null);
        setIsEmailVerified(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Don't show on excluded routes
  if (EXCLUDED_ROUTES.some(route => location.pathname.startsWith(route))) {
    return null;
  }

  // Don't show if not authenticated or email is verified
  if (!isAuthenticated || isEmailVerified || !email) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto">
        <EmailVerificationBanner email={email} />
      </div>
    </div>
  );
};
