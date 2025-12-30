import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Heart, Sparkles, Send, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ParticleButton } from "@/components/ui/ParticleButton";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Bạn ơi, nhập email để mình gửi tin nhé! 💕");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubscribed(true);
    toast.success("Cảm ơn bạn! Mình sẽ gửi tin yêu thương đến bạn nhé! 💖");
    setEmail("");
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-rose-50/50 via-pink-50/30 to-amber-50/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-tl from-amber-200/30 to-orange-200/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Animated hearts */}
          <div className="flex justify-center gap-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              >
                <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
              </motion.div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-rose-500" />
            <span className="text-rose-500 font-medium tracking-wide uppercase text-sm">Nhận Tin Yêu Thương</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Để Mình Gửi <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">Tin Vui</span> Đến Bạn Nhé! 💌
          </h2>

          <p className="text-muted-foreground mb-8 text-lg">
            Đăng ký để nhận những câu chuyện ấm áp, cập nhật chiến dịch mới và niềm vui từ cộng đồng. 
            Mình hứa không spam đâu, chỉ gửi yêu thương thôi! 💕
          </p>

          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-100/50 shadow-lg"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Cảm Ơn Bạn Nhiều! 🎉</h3>
              <p className="text-muted-foreground">
                Mình đã nhận được email của bạn rồi. Hẹn gặp bạn trong thư nhé!
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email của bạn nè..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 rounded-full border-rose-200 focus:border-rose-400 focus:ring-rose-400 bg-white/80 backdrop-blur-sm text-base"
                />
              </div>
              <ParticleButton
                type="submit"
                variant="default"
                size="lg"
                disabled={isLoading}
                className="h-14 px-8 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Heart className="w-5 h-5" />
                    </motion.div>
                    Đang gửi...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Đăng Ký Nhé!
                  </span>
                )}
              </ParticleButton>
            </form>
          )}

          <p className="mt-6 text-sm text-muted-foreground">
            🔒 Mình bảo mật thông tin của bạn. Có thể hủy đăng ký bất cứ lúc nào!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
