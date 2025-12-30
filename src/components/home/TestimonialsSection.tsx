import { motion } from "framer-motion";
import { Quote, Star, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    id: 1,
    name: "Chị Hạnh",
    role: "Nhà Hảo Tâm Mỗi Tháng 💕",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    quote: "Mình thích cách Fun Charity làm cho việc sẻ chia trở nên nhẹ nhàng và vui vẻ. Mỗi lần nhận được ảnh các bé cười, trái tim mình như ấm lên vậy đó!",
    rating: 5,
    type: "donor",
  },
  {
    id: 2,
    name: "Anh Minh",
    role: "Người Được Giúp Đỡ 🙏",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
    quote: "Nhờ các cô chú, anh chị nơi đây mà con mình giờ được đi học đầy đủ sách vở. Gia đình mình biết ơn lắm, cảm ơn mọi người nhiều!",
    rating: 5,
    type: "beneficiary",
  },
  {
    id: 3,
    name: "Bạn Nam",
    role: "Tình Nguyện Viên ✨",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "Làm tình nguyện ở Fun Charity vui lắm mọi người ơi! Ai cũng nhiệt tình, chân thành. Mình học được nhiều điều và có thêm nhiều bạn mới nữa.",
    rating: 5,
    type: "volunteer",
  },
  {
    id: 4,
    name: "Chị Hương",
    role: "Người Tạo Chiến Dịch 🌸",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    quote: "Mình gây quỹ cho vườn rau cộng đồng trong xóm, chỉ vài tuần là đủ rồi! Cộng đồng ở đây dễ thương và nhiệt tình lắm, ai cũng sẵn lòng giúp đỡ.",
    rating: 5,
    type: "creator",
  },
  {
    id: 5,
    name: "Anh Huy",
    role: "Đối Tác Doanh Nghiệp 🤝",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    quote: "Công ty mình hợp tác với Fun Charity vì họ làm việc rất tâm huyết. Nhân viên ai cũng thích tham gia vì thấy được việc mình làm có ý nghĩa thật.",
    rating: 5,
    type: "partner",
  },
  {
    id: 6,
    name: "Cô Lan Anh",
    role: "Gia Đình Được Hỗ Trợ 💖",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    quote: "Lúc ba mình bệnh nặng, nhờ có các nhà hảo tâm mà gia đình có tiền chữa trị. Giờ ba đã khỏe lại rồi. Cảm ơn mọi người, mình sẽ nhớ hoài!",
    rating: 5,
    type: "beneficiary",
  },
];

const typeColors = {
  donor: "from-rose-400 to-pink-500",
  beneficiary: "from-amber-400 to-orange-500",
  volunteer: "from-emerald-400 to-teal-500",
  creator: "from-violet-400 to-purple-500",
  partner: "from-blue-400 to-indigo-500",
};

const typeBgColors = {
  donor: "bg-rose-100 text-rose-700",
  beneficiary: "bg-amber-100 text-amber-700",
  volunteer: "bg-emerald-100 text-emerald-700",
  creator: "bg-violet-100 text-violet-700",
  partner: "bg-blue-100 text-blue-700",
};

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-rose-50/30 to-amber-50/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-20 w-72 h-72 bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-gradient-to-tl from-amber-200/20 to-orange-200/20 rounded-full blur-3xl" />
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
            <Quote className="w-5 h-5 text-rose-500" />
            <span className="text-rose-500 font-medium tracking-wide uppercase text-sm">Tiếng Nói Từ Trái Tim</span>
            <Quote className="w-5 h-5 text-rose-500 rotate-180" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Những <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">Câu Chuyện Ấm Áp</span> Từ Cộng Đồng
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cùng lắng nghe những chia sẻ chân thành từ các nhà hảo tâm, bạn bè tình nguyện và những người được yêu thương nhé! 💕
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-rose-100/50 h-full flex flex-col">
                {/* Quote icon */}
                <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-to-br ${typeColors[testimonial.type as keyof typeof typeColors]} flex items-center justify-center shadow-lg`}>
                  <Quote className="w-5 h-5 text-white" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4 pt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-foreground/80 leading-relaxed mb-6 flex-grow">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-rose-100/50">
                  <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeBgColors[testimonial.type as keyof typeof typeBgColors]}`}>
                      {testimonial.role}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-6 flex-wrap justify-center bg-white/60 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border border-rose-100/50">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span className="text-foreground font-semibold">10,000+</span>
              <span className="text-muted-foreground">Trái Tim Yêu Thương</span>
            </div>
            <div className="w-px h-6 bg-rose-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-foreground font-semibold">4.9/5</span>
              <span className="text-muted-foreground">Yêu Thích</span>
            </div>
            <div className="w-px h-6 bg-rose-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Quote className="w-5 h-5 text-pink-500" />
              <span className="text-foreground font-semibold">500+</span>
              <span className="text-muted-foreground">Câu Chuyện Đẹp</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
