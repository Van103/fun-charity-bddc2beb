import { motion } from "framer-motion";
import { Quote, Star, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Thị Hạnh",
    role: "Nhà Hảo Tâm Hàng Tháng",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    quote: "Fun Charity khiến việc cho đi trở nên thật vui vẻ! Tôi có thể thấy rõ tiền quyên góp của mình đi về đâu, và mỗi lần nhận được cập nhật, trái tim tôi đều ấm áp.",
    rating: 5,
    type: "donor",
  },
  {
    id: 2,
    name: "Trần Văn Minh",
    role: "Người Thụ Hưởng",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
    quote: "Nhờ những tấm lòng nhân ái nơi đây, các con tôi giờ đã có thể đến trường với đầy đủ sách vở. Nền tảng này đã thay đổi cuộc sống gia đình tôi mãi mãi.",
    rating: 5,
    type: "beneficiary",
  },
  {
    id: 3,
    name: "Lê Hoàng Nam",
    role: "Tình Nguyện Viên",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "Được là một phần của cộng đồng tình nguyện Fun Charity thật tuyệt vời. Sự minh bạch và tình yêu thương chân thành dành cho mọi người là điều làm nên sự khác biệt.",
    rating: 5,
    type: "volunteer",
  },
  {
    id: 4,
    name: "Phạm Thu Hương",
    role: "Người Tạo Chiến Dịch",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    quote: "Tôi đã gây quỹ cho dự án vườn cộng đồng chỉ trong vài tuần! Sự ủng hộ từ cộng đồng yêu thương này đã vượt xa mọi kỳ vọng của tôi.",
    rating: 5,
    type: "creator",
  },
  {
    id: 5,
    name: "Đỗ Quang Huy",
    role: "Đối Tác Doanh Nghiệp",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    quote: "Công ty chúng tôi hợp tác với Fun Charity cho các hoạt động CSR. Sự chuyên nghiệp và khả năng theo dõi tác động của họ thật xuất sắc.",
    rating: 5,
    type: "partner",
  },
  {
    id: 6,
    name: "Võ Thị Lan Anh",
    role: "Gia Đình Thụ Hưởng",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    quote: "Sự hỗ trợ y tế mà chúng tôi nhận được trong quá trình điều trị cho cha tôi đã cứu sống ông. Chúng tôi mãi mãi biết ơn từng nhà hảo tâm.",
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
            <span className="text-rose-500 font-medium tracking-wide uppercase text-sm">Cảm Nhận Từ Cộng Đồng</span>
            <Quote className="w-5 h-5 text-rose-500 rotate-180" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Những Câu Chuyện <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">Yêu Thương & Lan Tỏa</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tiếng nói chân thực từ cộng đồng nhà hảo tâm, người thụ hưởng và tình nguyện viên chia sẻ những trải nghiệm đầy cảm xúc
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
                <p className="text-foreground/80 leading-relaxed mb-6 flex-grow italic">
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
              <span className="text-muted-foreground">Nhà Hảo Tâm</span>
            </div>
            <div className="w-px h-6 bg-rose-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-foreground font-semibold">4.9/5</span>
              <span className="text-muted-foreground">Đánh Giá</span>
            </div>
            <div className="w-px h-6 bg-rose-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Quote className="w-5 h-5 text-pink-500" />
              <span className="text-foreground font-semibold">500+</span>
              <span className="text-muted-foreground">Câu Chuyện Thành Công</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
