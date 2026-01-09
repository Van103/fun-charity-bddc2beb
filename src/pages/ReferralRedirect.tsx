import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageLoader from "@/components/ui/PageLoader";

export default function ReferralRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAndRedirect = async () => {
      if (!code) {
        navigate("/", { replace: true });
        return;
      }

      try {
        // Tìm referral code (case-insensitive)
        const { data } = await supabase
          .from("referral_codes")
          .select("code")
          .ilike("code", code)
          .eq("is_active", true)
          .maybeSingle();

        if (data) {
          // Lưu code chính xác từ database
          localStorage.setItem("referral_code", data.code);
        } else {
          // Vẫn lưu code gốc để xử lý sau
          localStorage.setItem("referral_code", code);
        }
      } catch (error) {
        console.error("Error validating referral code:", error);
        localStorage.setItem("referral_code", code);
      } finally {
        navigate("/auth", { replace: true });
      }
    };

    validateAndRedirect();
  }, [code, navigate]);

  if (loading) {
    return <PageLoader />;
  }

  return null;
}
