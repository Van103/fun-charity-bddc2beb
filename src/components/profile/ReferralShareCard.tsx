import { useState, useEffect } from "react";
import { Gift, Copy, Share2, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReferralShareCardProps {
  userId: string | null;
}

// Hàm chuyển đổi tên thành username format
const generateUsernameFromName = (fullName: string): string => {
  if (!fullName) return "";
  
  // Bỏ dấu tiếng Việt
  const removeVietnameseTones = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };
  
  const normalized = removeVietnameseTones(fullName);
  
  // Tách từng từ và viết hoa chữ cái đầu, nối bằng dấu chấm
  const words = normalized
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  
  return words.join(".");
};

export function ReferralShareCard({ userId }: ReferralShareCardProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [usesCount, setUsesCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchOrCreateReferralCode();
    }
  }, [userId]);

  const generateUniqueUsernameCode = async (baseName: string): Promise<string> => {
    let code = baseName;
    let counter = 0;
    
    while (true) {
      const testCode = counter === 0 ? code : `${code}${counter}`;
      
      // Kiểm tra xem code đã tồn tại chưa
      const { data: existing } = await supabase
        .from("referral_codes")
        .select("id")
        .ilike("code", testCode)
        .maybeSingle();
      
      if (!existing) {
        return testCode;
      }
      
      counter++;
    }
  };

  const fetchOrCreateReferralCode = async () => {
    try {
      // Thử lấy code hiện có
      const { data, error } = await supabase
        .from("referral_codes")
        .select("code, uses_count")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setReferralCode(data.code);
        setUsesCount(data.uses_count);
      } else {
        // Lấy tên người dùng từ profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", userId)
          .single();
        
        const fullName = profile?.full_name || "User";
        const baseName = generateUsernameFromName(fullName);
        
        // Tạo code unique từ tên
        const newCode = await generateUniqueUsernameCode(baseName);
        
        const { data: insertedData, error: insertError } = await supabase
          .from("referral_codes")
          .insert({ user_id: userId, code: newCode })
          .select("code, uses_count")
          .single();

        if (insertError) throw insertError;
        
        if (insertedData) {
          setReferralCode(insertedData.code);
          setUsesCount(insertedData.uses_count);
        }
      }
    } catch (error) {
      console.error("Error fetching/creating referral code:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/r/${referralCode}`;
  };

  const handleCopy = async () => {
    if (!referralCode) return;
    
    try {
      await navigator.clipboard.writeText(getReferralLink());
      setCopied(true);
      toast({
        title: "Đã sao chép!",
        description: "Link giới thiệu đã được sao chép vào clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép link",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!referralCode) return;

    const shareData = {
      title: "Tham gia FUN Charity cùng tôi!",
      text: "Hãy tham gia FUN Charity - nền tảng từ thiện minh bạch. Đăng ký qua link này để nhận thưởng!",
      url: getReferralLink(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        handleCopy();
      }
    }
  };

  if (loading) {
    return (
      <Card className="glass-card animate-pulse">
        <CardContent className="p-4">
          <div className="h-20 bg-muted/50 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!referralCode) {
    return null;
  }

  return (
    <Card className="glass-card overflow-hidden border-secondary/30">
      <CardHeader className="pb-2 bg-gradient-to-r from-secondary/10 to-primary/10">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gift className="w-5 h-5 text-secondary" />
          <span>Mời bạn bè - Nhận thưởng ✨</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          Chia sẻ link giới thiệu để nhận <span className="text-secondary font-semibold">30.000 Camly 💎</span> cho mỗi người đăng ký!
        </p>

        {/* Stats */}
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm">
            <span className="font-semibold text-foreground">{usesCount}</span>
            <span className="text-muted-foreground"> người đã đăng ký qua link của bạn 🎉</span>
          </span>
        </div>

        {/* Referral Link Preview */}
        <div className="p-2 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground truncate font-mono">
            {getReferralLink()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Đã sao chép
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Sao chép link
              </>
            )}
          </Button>
          <Button 
            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            Chia sẻ ✨
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
