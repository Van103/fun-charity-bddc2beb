import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Heart,
  Shield,
  Trophy,
  ArrowRight,
  Sparkles,
  Wallet,
  Link as LinkIcon,
} from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Bước Vào Ngôi Nhà Yêu Thương",
    description:
      "Đăng ký dễ dàng hoặc kết nối ví. Khám phá những chiến dịch ý nghĩa và tìm nơi bạn muốn gửi gắm yêu thương nhé! 💕",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Heart,
    title: "Gửi Đi Tấm Lòng",
    description:
      "Góp yêu thương bằng tiền mặt hoặc crypto. Mọi đóng góp đều được ghi nhận rõ ràng, bạn yên tâm nhé! ✨",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: LinkIcon,
    title: "Theo Dõi Hành Trình Yêu Thương",
    description:
      "Xem trực tiếp đóng góp của bạn đi về đâu, giúp được ai. Minh bạch từng bước, tin tưởng từng đồng! 🌟",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Trophy,
    title: "Nhận Lại Niềm Vui",
    description:
      "Tích lũy điểm uy tín, nhận huy hiệu dễ thương. Càng cho đi nhiều, càng được yêu thương nhiều! 🎉",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="purple" className="mb-4">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Đơn Giản & Ấm Áp
          </Badge>
          <h2 className="font-display text-4xl font-bold mb-4">
            Hành Trình <span className="gradient-text">Sẻ Chia</span> Cùng Mình
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chỉ vài bước đơn giản, bạn đã có thể lan tỏa yêu thương và theo dõi từng niềm vui được tạo ra 💖
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full">
                    <ArrowRight className="w-6 h-6 text-secondary/30 absolute -right-3" />
                  </div>
                )}

                <div className="glass-card p-6 text-center h-full luxury-border">
                  {/* Step Number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full gradient-bg-gold text-xs font-bold text-secondary-foreground">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className={`w-8 h-8 ${step.color}`} />
                  </div>

                  <h3 className="font-display font-semibold text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
