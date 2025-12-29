import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Bell, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    {
      icon: Bell,
      title: "Thông báo cuộc gọi",
      description: "Nhận thông báo khi có cuộc gọi đến, ngay cả khi không mở app",
    },
    {
      icon: Zap,
      title: "Truy cập nhanh",
      description: "Mở app ngay từ màn hình chính, không cần mở trình duyệt",
    },
    {
      icon: Smartphone,
      title: "Trải nghiệm như native",
      description: "Giao diện toàn màn hình, mượt mà như ứng dụng thật",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Cài đặt App | FUN Charity</title>
        <meta name="description" content="Cài đặt FUN Charity lên điện thoại để nhận thông báo cuộc gọi và truy cập nhanh hơn" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/30">
              <Download className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Cài đặt FUN Charity</h1>
            <p className="text-muted-foreground">
              Thêm app vào màn hình chính để trải nghiệm tốt nhất
            </p>
          </motion.div>

          {isInstalled ? (
            <Card className="mb-8 border-green-500/30 bg-green-500/10">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Đã cài đặt!</h2>
                <p className="text-muted-foreground">
                  App đã được cài đặt trên thiết bị của bạn.
                  Bạn có thể mở từ màn hình chính.
                </p>
              </CardContent>
            </Card>
          ) : isIOS ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Cài đặt trên iPhone/iPad</CardTitle>
                <CardDescription>Làm theo các bước sau:</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Nhấn nút Chia sẻ</p>
                    <p className="text-sm text-muted-foreground">
                      Nút hình vuông với mũi tên hướng lên ở thanh dưới cùng
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Cuộn xuống và chọn "Thêm vào MH chính"</p>
                    <p className="text-sm text-muted-foreground">
                      Add to Home Screen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Nhấn "Thêm" ở góc trên phải</p>
                    <p className="text-sm text-muted-foreground">
                      App sẽ xuất hiện trên màn hình chính
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : deferredPrompt ? (
            <Card className="mb-8">
              <CardContent className="p-6">
                <Button 
                  onClick={handleInstall} 
                  size="lg" 
                  className="w-full gap-2"
                >
                  <Download className="w-5 h-5" />
                  Cài đặt ngay
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Cài đặt trên Android</CardTitle>
                <CardDescription>Làm theo các bước sau:</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Mở menu trình duyệt</p>
                    <p className="text-sm text-muted-foreground">
                      Nhấn nút 3 chấm ở góc trên phải
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Chọn "Thêm vào màn hình chính"</p>
                    <p className="text-sm text-muted-foreground">
                      Hoặc "Install app" / "Add to Home screen"
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Xác nhận cài đặt</p>
                    <p className="text-sm text-muted-foreground">
                      App sẽ xuất hiện trên màn hình chính
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">Tính năng khi cài app</h2>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
