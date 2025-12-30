import { motion } from "framer-motion";
import { Handshake, Building2, Heart, Globe, Users, Sparkles } from "lucide-react";

const partners = [
  {
    name: "Quỹ Trái Tim Việt",
    type: "Đối Tác Chiến Lược",
    icon: Heart,
    description: "Cùng nhau chắp cánh ước mơ cho trẻ em vùng cao",
  },
  {
    name: "Hội Chữ Thập Đỏ VN",
    type: "Đối Tác Từ Thiện",
    icon: Building2,
    description: "Hỗ trợ cứu trợ thiên tai và y tế cộng đồng",
  },
  {
    name: "UNICEF Việt Nam",
    type: "Đối Tác Quốc Tế",
    icon: Globe,
    description: "Bảo vệ quyền lợi và tương lai của trẻ em",
  },
  {
    name: "Mạng Lưới TNV Việt Nam",
    type: "Đối Tác Cộng Đồng",
    icon: Users,
    description: "Kết nối hàng nghìn tình nguyện viên khắp cả nước",
  },
];

const sponsors = [
  {
    name: "VinGroup Foundation",
    tier: "Nhà Tài Trợ Kim Cương 💎",
    contribution: "Hỗ trợ công nghệ và cơ sở hạ tầng",
  },
  {
    name: "FPT Digital",
    tier: "Nhà Tài Trợ Vàng 🏆",
    contribution: "Đối tác phát triển blockchain",
  },
  {
    name: "Techcombank",
    tier: "Nhà Tài Trợ Bạc 🥈",
    contribution: "Hỗ trợ thanh toán và chuyển khoản",
  },
  {
    name: "Grab Việt Nam",
    tier: "Nhà Tài Trợ Đồng 🥉",
    contribution: "Hỗ trợ vận chuyển và logistics",
  },
];

export function PartnersSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
            <Handshake className="w-4 h-4" />
            <span className="text-sm font-medium">Cùng Nhau Lan Tỏa Yêu Thương</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Đối Tác & Nhà Tài Trợ 💞
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chúng mình may mắn được đồng hành cùng những tổ chức và doanh nghiệp tuyệt vời – 
            cùng chung tay vì một Việt Nam nhân ái hơn.
          </p>
        </motion.div>

        {/* Partners Grid */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-xl font-semibold text-foreground mb-8 text-center"
          >
            🤝 Đối Tác Đồng Hành
          </motion.h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner, index) => {
              const Icon = partner.icon;
              return (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-card border border-border rounded-2xl p-6 text-center hover:border-secondary/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-secondary" />
                  </div>
                  <h4 className="font-display font-semibold text-foreground mb-1">
                    {partner.name}
                  </h4>
                  <p className="text-xs text-secondary font-medium mb-2">
                    {partner.type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {partner.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Sponsors Grid */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-xl font-semibold text-foreground mb-8 text-center"
          >
            💎 Nhà Tài Trợ Tuyệt Vời
          </motion.h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-secondary/5 to-primary/5 border border-secondary/20 rounded-2xl p-6 text-center hover:border-secondary/40 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="font-display font-semibold text-foreground mb-1">
                  {sponsor.name}
                </h4>
                <p className="text-xs text-secondary font-medium mb-2">
                  {sponsor.tier}
                </p>
                <p className="text-sm text-muted-foreground">
                  {sponsor.contribution}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Bạn muốn trở thành đối tác hoặc nhà tài trợ? 💛
          </p>
          <a
            href="mailto:partners@funcharity.org"
            className="inline-flex items-center gap-2 text-secondary hover:underline font-medium"
          >
            <Handshake className="w-4 h-4" />
            Liên hệ với chúng mình nhé!
          </a>
        </motion.div>
      </div>
    </section>
  );
}
