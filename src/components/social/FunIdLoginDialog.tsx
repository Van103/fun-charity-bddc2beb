import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Crown,
  Check,
  Loader2,
  Globe,
  Sprout,
  Gamepad2,
  Heart,
  Link2,
  Shield,
} from "lucide-react";
import funProfileLogo from "@/assets/fun-profile-logo.webp";
import funFarmLogo from "@/assets/fun-farm-logo.png";
import funPlanetLogo from "@/assets/fun-planet-logo.png";
import funPlayLogo from "@/assets/fun-play-logo.png";

interface FunIdLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkFunId: (funId: string) => Promise<boolean>;
}

const ECOSYSTEM_APPS = [
  { name: "FUN Charity", icon: Heart, logo: null, color: "from-pink-500 to-rose-500" },
  { name: "FUN Farm", icon: Sprout, logo: funFarmLogo, color: "from-emerald-500 to-green-500" },
  { name: "FUN Planet", icon: Globe, logo: funPlanetLogo, color: "from-blue-500 to-cyan-500" },
  { name: "FUN Play", icon: Gamepad2, logo: funPlayLogo, color: "from-purple-500 to-violet-500" },
  { name: "FUN Profile", icon: Crown, logo: funProfileLogo, color: "from-amber-500 to-yellow-500" },
];

export function FunIdLoginDialog({ open, onOpenChange, onLinkFunId }: FunIdLoginDialogProps) {
  const [funIdInput, setFunIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"intro" | "input" | "success">("intro");

  const handleLink = async () => {
    if (!funIdInput.trim()) return;

    setLoading(true);
    const success = await onLinkFunId(funIdInput.trim().toUpperCase());
    setLoading(false);

    if (success) {
      setStep("success");
      setTimeout(() => {
        onOpenChange(false);
        setStep("intro");
        setFunIdInput("");
      }, 2000);
    }
  };

  const generateFunId = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFunIdInput(`FUN-${random}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <DialogHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-4">
                  <img src={funProfileLogo} alt="FUN Profile" className="w-12 h-12 rounded-full" />
                </div>
                <DialogTitle className="text-xl">Kết nối FUN ID</DialogTitle>
                <DialogDescription>
                  Một tài khoản, truy cập tất cả dự án FUN Ecosystem
                </DialogDescription>
              </DialogHeader>

              {/* Benefits */}
              <div className="space-y-3 py-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Link2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Đăng nhập một lần</p>
                    <p className="text-xs text-muted-foreground">
                      Truy cập tất cả ứng dụng FUN không cần đăng nhập lại
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Bạn bè xuyên suốt</p>
                    <p className="text-xs text-muted-foreground">
                      Xem và kết nối bạn bè từ Fun Farm, Planet, Play
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Bảo mật cao</p>
                    <p className="text-xs text-muted-foreground">
                      Dữ liệu được mã hóa và bảo vệ an toàn
                    </p>
                  </div>
                </div>
              </div>

              {/* Ecosystem logos */}
              <div className="flex justify-center gap-2 py-2">
                {ECOSYSTEM_APPS.map((app, i) => (
                  <motion.div
                    key={app.name}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${app.color} p-0.5`}
                    title={app.name}
                  >
                    <div className="w-full h-full rounded-full bg-white dark:bg-background flex items-center justify-center">
                      {app.logo ? (
                        <img src={app.logo} alt="" className="w-6 h-6 rounded-full" />
                      ) : (
                        <app.icon className="w-5 h-5" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button className="w-full" onClick={() => setStep("input")}>
                <Crown className="w-4 h-4 mr-2" />
                Tiếp tục với FUN ID
              </Button>
            </motion.div>
          )}

          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Nhập FUN ID của bạn</DialogTitle>
                <DialogDescription>
                  Nhập FUN ID hiện có hoặc tạo mới để kết nối với Ecosystem
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="funId">FUN ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="funId"
                      placeholder="FUN-XXXXXX"
                      value={funIdInput}
                      onChange={(e) => setFunIdInput(e.target.value.toUpperCase())}
                      className="font-mono text-center uppercase"
                    />
                    <Button variant="outline" onClick={generateFunId} type="button">
                      Tạo mới
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nếu bạn đã có FUN ID từ Fun Farm, Planet hoặc Play, hãy nhập vào đây
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-sm">
                  <p className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Mẹo: Nếu chưa có FUN ID, bấm "Tạo mới" để tạo ngay!
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("intro")} className="flex-1">
                  Quay lại
                </Button>
                <Button
                  onClick={handleLink}
                  disabled={!funIdInput.trim() || loading}
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Link2 className="w-4 h-4 mr-2" />
                  )}
                  Kết nối
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                🎉 Kết nối thành công!
              </h3>
              <p className="text-muted-foreground">
                FUN ID của bạn đã được liên kết. Đang đồng bộ bạn bè...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
