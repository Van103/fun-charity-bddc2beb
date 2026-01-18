import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Listen for auth state changes including PASSWORD_RECOVERY
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY") {
            // User is resetting password - redirect to reset password page
            navigate("/reset-password", { replace: true });
            return;
          }
        });

        // Get the session - Supabase automatically handles the token exchange
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          toast({
            title: "Lỗi xác thực",
            description: "Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.",
            variant: "destructive",
          });
          navigate("/auth", { replace: true });
          return;
        }

        if (session?.user) {
          // Check if email is verified
          if (session.user.email_confirmed_at) {
            toast({
              title: "Xác thực thành công! 🎉",
              description: "Chào mừng bạn đến với FUN Charity!",
            });
            navigate("/social", { replace: true });
          } else {
            // Still not verified, redirect back to verify page
            navigate(`/verify-email?email=${encodeURIComponent(session.user.email || "")}`, { replace: true });
          }
        } else {
          // No session, redirect to auth
          navigate("/auth", { replace: true });
        }

        // Cleanup subscription
        return () => subscription.unsubscribe();
      } catch (err) {
        console.error("Callback processing error:", err);
        navigate("/auth", { replace: true });
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <main className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary mx-auto mb-4" />
        <p className="text-primary-foreground">Đang xác thực...</p>
      </div>
    </main>
  );
};

export default AuthCallback;
