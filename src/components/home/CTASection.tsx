import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ParticleButton } from "@/components/ui/ParticleButton";
import { Heart, ArrowRight, Building2, Users, Sparkles, Crown, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: Heart,
    title: "Bạn Muốn Sẻ Chia? 💕",
    description: "Gửi đi yêu thương và xem từng nụ cười được tạo ra. Nhận lại niềm vui và huy hiệu dễ thương!",
    cta: "Bắt Đầu Cho Đi",
    href: "/campaigns",
    gradient: "from-secondary to-secondary-light",
  },
  {
    icon: Users,
    title: "Bạn Có Thời Gian? ✨",
    description: "Cùng mình làm tình nguyện nhé! Học thêm điều mới, có thêm bạn bè và tạo kỷ niệm đẹp.",
    cta: "Tham Gia Cùng Mình",
    href: "/auth",
    gradient: "from-primary to-primary-light",
  },
  {
    icon: Building2,
    title: "Bạn Là Tổ Chức? 🏢",
    description: "Tạo chiến dịch, xây dựng niềm tin với cộng đồng. Cùng nhau lan tỏa yêu thương lớn hơn!",
    cta: "Đăng Ký Ngay",
    href: "/auth",
    gradient: "from-success to-secondary",
  },
];

export function CTASection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={role.href}>
                  <div className="glass-card-hover p-8 h-full group luxury-border">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {role.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {role.description}
                    </p>
                    <Button variant="outline" className="group/btn hover-glossy">
                      {role.cta}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-primary" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(43_55%_52%_/_0.2),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(275_60%_30%_/_0.3),_transparent_50%)]" />

          {/* Content */}
          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center crown-glow">
                <Crown className="w-8 h-8 text-secondary" />
              </div>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              Bạn Ơi, Sẵn Sàng <span className="text-secondary">Lan Tỏa Yêu Thương</span> Chưa? 💖
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-4 max-w-2xl mx-auto">
              Hàng nghìn trái tim ấm áp đang chờ đón bạn! Cùng nhau, chúng ta sẽ tạo nên những điều kỳ diệu mỗi ngày.
            </p>
            <p className="text-secondary font-medium mb-8">
              Cho đi là nhận lại. Yêu thương là hạnh phúc. ✨
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/campaigns">
                <ParticleButton 
                  variant="hero" 
                  size="xl" 
                  className="glossy-btn glossy-btn-gradient"
                  particleColors={['#84D9BA', '#FFD700', '#FF6B9D', '#00D4FF']}
                  glowColor="#84D9BA"
                >
                  <Heart className="w-5 h-5" fill="currentColor" />
                  Khám Phá Chiến Dịch
                </ParticleButton>
              </Link>
              <ParticleButton 
                variant="wallet" 
                size="xl" 
                className="glossy-btn glossy-btn-purple"
                particleColors={['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']}
                glowColor="#8B5CF6"
              >
                <Wallet className="w-5 h-5" />
                Kết Nối Ví
              </ParticleButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
