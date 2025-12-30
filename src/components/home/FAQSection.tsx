import { motion } from "framer-motion";
import { HelpCircle, Heart, Shield, CreditCard, Users, Clock, Gift, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { ParticleButton } from "@/components/ui/ParticleButton";

const faqItems = [
  {
    id: "1",
    icon: CreditCard,
    question: "Tôi có thể quyên góp bằng những phương thức nào?",
    answer: "Fun Charity hỗ trợ nhiều phương thức thanh toán linh hoạt bao gồm: thẻ tín dụng/ghi nợ (Visa, Mastercard), chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay, VNPay), và cả tiền điện tử (ETH, USDT, BTC). Tất cả các giao dịch đều được mã hóa và bảo mật tuyệt đối.",
    color: "text-blue-500",
  },
  {
    id: "2",
    icon: Shield,
    question: "Làm sao tôi biết tiền quyên góp được sử dụng đúng mục đích?",
    answer: "Chúng tôi cam kết minh bạch 100%. Mỗi chiến dịch đều có báo cáo chi tiết về số tiền nhận được, cách sử dụng, và kết quả đạt được. Bạn sẽ nhận được cập nhật thường xuyên qua email và có thể theo dõi trực tiếp trên trang chiến dịch với hình ảnh, video minh chứng từ người thụ hưởng.",
    color: "text-emerald-500",
  },
  {
    id: "3",
    icon: Users,
    question: "Tôi có thể tạo chiến dịch gây quỹ riêng không?",
    answer: "Hoàn toàn có thể! Bất kỳ ai cũng có thể tạo chiến dịch gây quỹ cho mục đích tốt đẹp. Chỉ cần đăng ký tài khoản, điền thông tin chiến dịch, và chờ đội ngũ chúng tôi xác minh (thường trong 24-48 giờ). Chúng tôi sẽ hướng dẫn bạn từng bước để chiến dịch thành công.",
    color: "text-violet-500",
  },
  {
    id: "4",
    icon: Clock,
    question: "Mất bao lâu để tiền đến tay người thụ hưởng?",
    answer: "Với các chiến dịch đã được xác minh, tiền sẽ được chuyển đến người thụ hưởng trong vòng 3-5 ngày làm việc sau khi giao dịch hoàn tất. Trong trường hợp khẩn cấp (thiên tai, bệnh hiểm nghèo), chúng tôi có quy trình ưu tiên để giải ngân nhanh nhất có thể.",
    color: "text-amber-500",
  },
  {
    id: "5",
    icon: Gift,
    question: "Tôi có thể quyên góp định kỳ hàng tháng không?",
    answer: "Có! Chúng tôi khuyến khích hình thức quyên góp định kỳ vì nó giúp các chiến dịch có nguồn tài chính ổn định. Bạn có thể chọn số tiền và tần suất (hàng tuần, hàng tháng, hàng quý) phù hợp với khả năng. Bạn có thể hủy hoặc điều chỉnh bất kỳ lúc nào.",
    color: "text-pink-500",
  },
  {
    id: "6",
    icon: Heart,
    question: "Tôi muốn trở thành tình nguyện viên, bắt đầu từ đâu?",
    answer: "Thật tuyệt vời! Để trở thành tình nguyện viên, bạn chỉ cần đăng ký tài khoản và truy cập mục 'Tình nguyện viên'. Tại đây, bạn có thể đăng ký các hoạt động phù hợp với kỹ năng và thời gian của mình. Chúng tôi có nhiều vai trò từ hỗ trợ trực tuyến đến tham gia trực tiếp tại các địa điểm từ thiện.",
    color: "text-rose-500",
  },
  {
    id: "7",
    icon: MessageCircle,
    question: "Tôi có thể liên hệ trực tiếp với người thụ hưởng không?",
    answer: "Để bảo vệ quyền riêng tư, chúng tôi không chia sẻ thông tin liên lạc trực tiếp. Tuy nhiên, bạn có thể gửi lời nhắn, lời chúc kèm theo quyên góp và chúng tôi sẽ chuyển đến người thụ hưởng. Nhiều người thụ hưởng cũng chia sẻ câu chuyện và lời cảm ơn trên nền tảng.",
    color: "text-teal-500",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-rose-50/30 via-background to-amber-50/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-pink-200/20 to-rose-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tl from-amber-200/20 to-orange-200/20 rounded-full blur-3xl" />
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
            <HelpCircle className="w-5 h-5 text-rose-500" />
            <span className="text-rose-500 font-medium tracking-wide uppercase text-sm">Câu Hỏi Thường Gặp</span>
            <HelpCircle className="w-5 h-5 text-rose-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Bạn Có <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">Thắc Mắc</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng giải đáp mọi câu hỏi của bạn về quyên góp, tình nguyện và cách nền tảng hoạt động
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <AccordionItem
                  value={item.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-100/50 shadow-md hover:shadow-lg transition-all duration-300 px-6 overflow-hidden"
                >
                  <AccordionTrigger className="py-5 hover:no-underline group">
                    <div className="flex items-center gap-4 text-left">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="font-semibold text-foreground text-base md:text-lg pr-4">
                        {item.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-muted-foreground leading-relaxed pl-14">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-rose-100/80 via-pink-100/80 to-amber-100/80 rounded-2xl px-8 py-8 border border-rose-200/50">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Vẫn còn thắc mắc?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi câu hỏi của bạn với tất cả tình yêu thương
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:support@funcharity.org">
                <ParticleButton variant="default" size="lg" className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-200">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Gửi Email Cho Chúng Tôi
                </ParticleButton>
              </a>
              <Link to="/messages">
                <ParticleButton variant="outline" size="lg" className="border-2 border-amber-400 text-amber-600 hover:bg-amber-50">
                  <Heart className="w-5 h-5 mr-2" />
                  Chat Trực Tiếp
                </ParticleButton>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
