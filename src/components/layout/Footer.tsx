import { Link } from "react-router-dom";
import { Heart, Twitter, Github, Linkedin, Mail, Sparkles, Globe, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { DivineMantrasCarousel } from "./DivineMantrasCarousel";

const footerLinks = {
  "Nền Tảng 🏠": [
    { name: "Chiến Dịch Từ Thiện", href: "/campaigns" },
    { name: "Bản Đồ Nhu Cầu", href: "/needs-map" },
    { name: "Tổng Quan Hoạt Động", href: "/dashboard" },
    { name: "Cách Mình Hoạt Động", href: "/how-it-works" },
  ],
  "Cộng Đồng 💞": [
    { name: "Dành Cho Nhà Hảo Tâm", href: "/donors" },
    { name: "Dành Cho Tình Nguyện Viên", href: "/volunteers" },
    { name: "Dành Cho Tổ Chức", href: "/ngos" },
    { name: "Bảng Vinh Danh", href: "/leaderboard" },
  ],
  "Hỗ Trợ 📚": [
    { name: "Hướng Dẫn Sử Dụng", href: "/docs" },
    { name: "Minh Bạch Blockchain", href: "/contracts" },
    { name: "Blog Chia Sẻ", href: "/blog" },
    { name: "Liên Hệ Hỗ Trợ", href: "/support" },
  ],
  "Pháp Lý 📋": [
    { name: "Chính Sách Bảo Mật", href: "/privacy" },
    { name: "Điều Khoản Sử Dụng", href: "/terms" },
    { name: "Quy Định KYC", href: "/kyc" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/funcharity", label: "Twitter" },
  { icon: Github, href: "https://github.com/funcharity", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/company/funcharity", label: "LinkedIn" },
  { icon: Globe, href: "https://funcharity.org", label: "Website" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Divine Mantras Carousel */}
      <DivineMantrasCarousel />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand & Contact */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo size="md" />
            </Link>
            <p className="text-primary-foreground/80 text-sm mb-4 max-w-xs font-medium">
              💛 Cho đi là hạnh phúc. Minh bạch là niềm tin.
            </p>
            <p className="text-primary-foreground/60 text-xs mb-6 max-w-xs">
              FUN Charity – Nơi mỗi tấm lòng đều được ghi nhận, mỗi sự giúp đỡ đều trong sáng và chạm đến trái tim.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="w-4 h-4 text-secondary" />
                <span>hello@funcharity.org</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="w-4 h-4 text-secondary" />
                <span>+84 28 1234 5678</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer" title={social.label}>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-primary-foreground/70 hover:text-secondary hover:bg-primary-light">
                      <Icon className="w-4 h-4" />
                    </Button>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-secondary mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-light/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 FUN Charity 💛 Được xây dựng với tình yêu{" "}
            <Heart className="inline w-3 h-3 text-secondary" fill="currentColor" /> và công nghệ blockchain.
          </p>
          <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>✨ Minh Bạch 100% • Yêu Thương Lan Tỏa • Cộng Đồng Kết Nối</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
