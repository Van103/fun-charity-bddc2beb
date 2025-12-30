import { motion } from "framer-motion";
import { Heart, Linkedin, Twitter, Mail, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const founders = [
  {
    id: 1,
    name: "Nguyễn Minh Đức",
    role: "Nhà Sáng Lập & CEO",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face",
    bio: "Đam mê sử dụng công nghệ để tạo ra tác động xã hội tích cực. Cựu giám đốc tổ chức phi lợi nhuận với 15 năm kinh nghiệm trong lĩnh vực từ thiện.",
    social: { linkedin: "#", twitter: "#", email: "duc@funcharity.org" },
    color: "from-rose-400 to-pink-500",
  },
  {
    id: 2,
    name: "Trần Thị Mai Anh",
    role: "Đồng Sáng Lập & COO",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face",
    bio: "Chuyên gia vận hành tận tâm xây dựng hệ thống từ thiện minh bạch và hiệu quả. Thạc sĩ Quản trị Kinh doanh từ Đại học Stanford.",
    social: { linkedin: "#", twitter: "#", email: "maianh@funcharity.org" },
    color: "from-amber-400 to-orange-500",
  },
  {
    id: 3,
    name: "Lê Hoàng Khang",
    role: "Giám Đốc Công Nghệ",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face",
    bio: "Chuyên gia công nghệ xây dựng nền tảng an toàn, có thể mở rộng vì mục tiêu xã hội. Từng làm việc tại Google và các startup blockchain.",
    social: { linkedin: "#", twitter: "#", email: "khang@funcharity.org" },
    color: "from-violet-400 to-purple-500",
  },
];

const teamMembers = [
  {
    id: 4,
    name: "Phạm Thu Hà",
    role: "Trưởng Phòng Cộng Đồng",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: 5,
    name: "Đỗ Quốc Bảo",
    role: "Trưởng Phòng Thiết Kế",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: 6,
    name: "Võ Ngọc Linh",
    role: "Quản Lý Chiến Dịch",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    color: "from-pink-400 to-rose-500",
  },
  {
    id: 7,
    name: "Hoàng Văn Thịnh",
    role: "Giám Đốc Tài Chính",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    color: "from-amber-400 to-yellow-500",
  },
];

export function TeamSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50/20 via-background to-rose-50/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-violet-200/20 to-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-rose-200/20 to-pink-200/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="text-rose-500 font-medium tracking-wide uppercase text-sm">Đội Ngũ Của Chúng Tôi</span>
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Gặp Gỡ <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500">Những Trái Tim</span> Đằng Sau Fun Charity
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Một đội ngũ đầy nhiệt huyết cam kết làm cho việc từ thiện trở nên vui vẻ, minh bạch và có tác động thực sự
          </p>
        </motion.div>

        {/* Founders Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {founders.map((founder, index) => (
            <motion.div
              key={founder.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-rose-100/50 text-center h-full flex flex-col">
                {/* Avatar */}
                <div className="relative mx-auto mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${founder.color} rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                  <Avatar className="w-32 h-32 ring-4 ring-white shadow-xl relative">
                    <AvatarImage src={founder.avatar} alt={founder.name} className="object-cover" />
                    <AvatarFallback className={`bg-gradient-to-br ${founder.color} text-white text-2xl`}>
                      {founder.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${founder.color} text-white text-xs font-medium shadow-lg`}>
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    Sáng Lập
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-foreground mb-1">{founder.name}</h3>
                <p className="text-rose-500 font-medium mb-4">{founder.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">{founder.bio}</p>

                {/* Social links */}
                <div className="flex justify-center gap-3">
                  <a href={founder.social.linkedin} className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                  </a>
                  <a href={founder.social.twitter} className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-colors">
                    <Twitter className="w-5 h-5 text-sky-500" />
                  </a>
                  <a href={`mailto:${founder.social.email}`} className="w-10 h-10 rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center transition-colors">
                    <Mail className="w-5 h-5 text-rose-500" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Đội Ngũ <span className="text-rose-500">Tuyệt Vời</span> Của Chúng Tôi
          </h3>
          <p className="text-muted-foreground">Những con người tận tâm làm nên tất cả điều kỳ diệu</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group text-center"
            >
              <div className="relative mx-auto mb-4 w-fit">
                <div className={`absolute inset-0 bg-gradient-to-br ${member.color} rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity`} />
                <Avatar className="w-20 h-20 md:w-24 md:h-24 ring-3 ring-white shadow-lg relative group-hover:scale-105 transition-transform">
                  <AvatarImage src={member.avatar} alt={member.name} className="object-cover" />
                  <AvatarFallback className={`bg-gradient-to-br ${member.color} text-white`}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h4 className="font-semibold text-foreground text-sm md:text-base">{member.name}</h4>
              <p className="text-muted-foreground text-xs md:text-sm">{member.role}</p>
            </motion.div>
          ))}
        </div>

        {/* Join the team CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-rose-100/80 via-pink-100/80 to-amber-100/80 rounded-2xl px-8 py-6 border border-rose-200/50">
            <p className="text-foreground font-medium mb-2">Bạn muốn cùng chúng tôi lan tỏa yêu thương?</p>
            <p className="text-muted-foreground text-sm mb-4">Chúng tôi luôn tìm kiếm những người đầy nhiệt huyết để gia nhập đội ngũ</p>
            <a
              href="mailto:careers@funcharity.org"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-200"
            >
              <Mail className="w-4 h-4" />
              Liên Hệ Ngay
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
