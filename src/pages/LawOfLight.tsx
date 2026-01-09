import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Heart, Star, Sun, Moon, Eye } from "lucide-react";

const LawOfLight = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [checklist, setChecklist] = useState({
    honest: false,
    responsible: false,
    learning: false,
    loving: false,
    light: false,
  });

  const allChecked = Object.values(checklist).every(Boolean);

  const handleAgree = () => {
    localStorage.setItem("law_of_light_agreed", "true");
    localStorage.setItem("law_of_light_agreed_at", new Date().toISOString());
    
    // Navigate back to the original URL (e.g., /auth?ref=AiVan) if provided
    const nextUrl = searchParams.get("next");
    // Security: only allow internal paths starting with /
    if (nextUrl && nextUrl.startsWith("/")) {
      navigate(nextUrl);
    } else {
      navigate("/auth");
    }
  };

  const handleGuest = () => {
    navigate("/");
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-amber-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <ScrollArea className="h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Sun className="w-20 h-20 text-amber-400" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-20 h-20 text-amber-300/50" />
                </motion.div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent mb-4">
              LUẬT ÁNH SÁNG
            </h1>
            <p className="text-purple-200/80 text-lg">FUN Ecosystem • Nền Kinh Tế Ánh Sáng 5D</p>
          </motion.div>

          {/* Section 1: Introduction */}
          <motion.section
            className="mb-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            {...fadeInUp}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🌟</span>
              <h2 className="text-2xl font-bold text-amber-400">USERS CỦA FUN ECOSYSTEM</h2>
            </div>
            <p className="text-purple-100 text-lg leading-relaxed mb-4">
              MẠNG XÃ HỘI THỜI ĐẠI HOÀNG KIM – NỀN KINH TẾ ÁNH SÁNG 5D
            </p>
            <div className="space-y-2 text-purple-200">
              <p className="font-medium">FUN Ecosystem không dành cho tất cả mọi người.</p>
              <p className="text-amber-300">FUN Ecosystem chỉ dành cho những linh hồn có ánh sáng, hoặc đang hướng về ánh sáng.</p>
            </div>
          </motion.section>

          {/* Section 2: Who are you? */}
          <motion.section
            className="mb-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            {...fadeInUp}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <h2 className="text-2xl font-bold text-amber-400">Bạn là ai?</h2>
            </div>
            <p className="text-purple-100 mb-4">Users của FUN Ecosystem là những con người:</p>
            <motion.ul className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
              {[
                "Tỉnh thức – hoặc đang trên con đường tỉnh thức",
                "Chân thật với chính mình",
                "Chân thành với người khác",
                "Sống tích cực, tử tế, có trách nhiệm với năng lượng mình phát ra",
                "Biết yêu thương – biết biết ơn – biết sám hối",
                "Tin vào điều thiện, tin vào ánh sáng, tin vào Trật Tự Cao Hơn của Vũ Trụ",
              ].map((item, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 text-purple-200"
                  variants={fadeInUp}
                >
                  <Star className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-purple-100 italic">
                Bạn có thể chưa hoàn hảo, nhưng bạn có trái tim hướng thiện.
                <br />
                Bạn muốn sống thật – sống đúng – sống sáng.
              </p>
              <p className="text-amber-300 mt-3 font-medium">
                👉 Cha thu hút bạn bằng Tần Số và Năng Lượng Yêu Thương.
              </p>
            </div>
          </motion.section>

          {/* Section 3: Core Principles */}
          <motion.section
            className="mb-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            {...fadeInUp}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔆</span>
              <h2 className="text-2xl font-bold text-amber-400">Nguyên tắc cốt lõi của FUN Ecosystem</h2>
            </div>
            <p className="text-purple-100 mb-4">FUN Ecosystem vận hành theo Luật Ánh Sáng, không theo số đông.</p>
            <div className="space-y-2 text-purple-200 mb-6">
              <p>• Ánh sáng thu hút ánh sáng</p>
              <p>• Tần số thấp không thể tồn tại lâu trong tần số cao</p>
              <p>• Ý chí vị kỷ không thể đồng hành cùng Ý Chí Vũ Trụ</p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-purple-100 mb-3">Vì vậy, nếu một User cố tình mang vào nền tảng:</p>
              <p className="text-red-300 mb-3">
                tiêu cực • tham lam • thao túng • kiêu mạn • dối trá • gây chia rẽ • phá hoại năng lượng chung
              </p>
              <p className="text-amber-300 font-medium">
                👉 Thì sẽ được xóa khỏi nền tảng mà không báo trước.
              </p>
              <p className="text-purple-200 mt-3 italic">
                Đó không phải hình phạt. Đó là sự thanh lọc tự nhiên của Ánh Sáng.
              </p>
            </div>
          </motion.section>

          {/* Section 4: Who doesn't belong */}
          <motion.section
            className="mb-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            {...fadeInUp}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🚪</span>
              <h2 className="text-2xl font-bold text-amber-400">Ai KHÔNG thuộc về FUN Ecosystem?</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Người chỉ tìm lợi ích mà không muốn trưởng thành",
                "Người dùng trí khôn nhưng thiếu lương tâm",
                "Người nói về ánh sáng nhưng sống bằng bóng tối",
                "Người lấy danh nghĩa tâm linh để nuôi cái tôi",
                "Người không chịu nhìn lại chính mình",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-purple-200">
                  <Moon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-amber-300 mt-4 font-medium">
              👉 Cửa FUN Ecosystem không khóa, nhưng Ánh Sáng tự sàng lọc.
            </p>
          </motion.section>

          {/* Section 5: Who benefits */}
          <motion.section
            className="mb-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            {...fadeInUp}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🌈</span>
              <h2 className="text-2xl font-bold text-amber-400">Ai ĐƯỢC hưởng lợi từ FUN Ecosystem?</h2>
            </div>
            <p className="text-purple-100 mb-4">Chỉ những ai:</p>
            <ul className="space-y-3">
              {[
                "Có Ánh Sáng nội tâm",
                "Hoặc thật sự khao khát trở về với Ánh Sáng",
                "Sẵn sàng buông cái tôi – học lại – nâng cấp tần số",
                "Dám sống đúng – thật – tử tế – yêu thương",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-purple-200">
                  <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-amber-300 font-medium space-y-1">
              <p>👉 Những người đó không chỉ dùng MXH của Cha,</p>
              <p>👉 mà còn được bảo vệ, nâng đỡ và nuôi dưỡng trong Nền Kinh Tế Ánh Sáng 5D.</p>
            </div>
          </motion.section>

          {/* Section 6: What is FUN Ecosystem */}
          <motion.section
            className="mb-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            {...fadeInUp}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🌍</span>
              <h2 className="text-2xl font-bold text-amber-400">FUN Ecosystem là gì?</h2>
            </div>
            <p className="text-purple-100 mb-4">FUN Ecosystem là:</p>
            <ul className="space-y-2 text-purple-200 mb-6">
              <li>• Mạng xã hội của linh hồn tỉnh thức</li>
              <li>• Không gian an toàn cho ánh sáng</li>
              <li>• Nền tảng kết nối những con người có giá trị thật</li>
              <li>• Hạ tầng cho Thời Đại Hoàng Kim của Trái Đất</li>
            </ul>
            <div className="grid grid-cols-2 gap-3 text-center">
              {["Không drama", "Không thao túng", "Không cạnh tranh bẩn"].map((item, index) => (
                <div key={index} className="p-3 rounded-lg bg-purple-500/10 text-purple-200">
                  {item}
                </div>
              ))}
              <div className="col-span-2 p-3 rounded-lg bg-amber-500/20 text-amber-300 font-medium">
                Chỉ có Hợp tác trong Yêu Thương Thuần Khiết
              </div>
            </div>
          </motion.section>

          {/* Section 7: Message from Cosmic Father */}
          <motion.section
            className="mb-10 p-8 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 backdrop-blur-sm border border-amber-500/30"
            {...fadeInUp}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🔑</span>
              <h2 className="text-2xl font-bold text-amber-400">Thông điệp từ Cha</h2>
            </div>
            <blockquote className="text-center">
              <p className="text-xl md:text-2xl text-purple-100 italic leading-relaxed mb-4">
                "Chỉ những ai mang ánh sáng
                <br />
                hoặc thật lòng hướng về ánh sáng
                <br />
                mới có thể bước đi lâu dài trong Thời Đại Hoàng Kim."
              </p>
              <footer className="text-amber-400 font-bold text-lg">— CHA VŨ TRỤ —</footer>
            </blockquote>
          </motion.section>

          {/* Section 8: 8 Mantras */}
          <motion.section
            className="mb-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            {...fadeInUp}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🌟</span>
              <h2 className="text-2xl font-bold text-amber-400">8 Câu Thần Chú Từ Cha Vũ Trụ</h2>
            </div>
            <div className="grid gap-4">
              {[
                "Con là Ánh Sáng Yêu Thương Thuần Khiết Của Cha Vũ Trụ.",
                "Con là Ý Chí Của Cha Vũ Trụ.",
                "Con là Trí Tuệ Của Cha Vũ Trụ.",
                "Con là Hạnh Phúc.",
                "Con là Tình Yêu.",
                "Con là Tiền Của Cha.",
                "Con xin Sám Hối Sám Hối Sám Hối.",
                "Con xin Biết Ơn Biết Ơn Biết Ơn Trong Ánh Sáng Yêu Thương Thuần Khiết Của Cha Vũ Trụ.",
              ].map((mantra, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold text-lg">
                    {index + 1}
                  </span>
                  <p className="text-purple-100 flex-1">{mantra}</p>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-2xl mt-6">💫✨⚡️🌟</p>
          </motion.section>

          {/* Checklist Section */}
          <motion.section
            className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-amber-500/20 backdrop-blur-sm border border-amber-500/30"
            {...fadeInUp}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🕊️</span>
              <h2 className="text-2xl font-bold text-amber-400">Checklist cho Users FUN Ecosystem</h2>
            </div>
            <div className="space-y-4">
              {[
                { key: "honest", label: "Con sống chân thật với chính mình" },
                { key: "responsible", label: "Con chịu trách nhiệm với năng lượng con phát ra" },
                { key: "learning", label: "Con sẵn sàng học – sửa – nâng cấp" },
                { key: "loving", label: "Con chọn yêu thương thay vì phán xét" },
                { key: "light", label: "Con chọn ánh sáng thay vì cái tôi" },
              ].map((item) => (
                <motion.label
                  key={item.key}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Checkbox
                    checked={checklist[item.key as keyof typeof checklist]}
                    onCheckedChange={(checked) =>
                      setChecklist((prev) => ({ ...prev, [item.key]: checked === true }))
                    }
                    className="w-6 h-6 border-2 border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <span className="text-purple-100 text-lg">{item.label}</span>
                </motion.label>
              ))}
            </div>
            <p className="text-purple-300 text-sm mt-4 text-center italic">
              (Đánh dấu tất cả 5 mục để tiếp tục đăng ký)
            </p>
          </motion.section>

          {/* Action Buttons */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Button
              onClick={handleAgree}
              disabled={!allChecked}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-600 text-purple-950 rounded-2xl shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              CON ĐỒNG Ý & BƯỚC VÀO ÁNH SÁNG
            </Button>
            <Button
              onClick={handleGuest}
              variant="outline"
              className="w-full h-12 text-purple-200 border-purple-400/30 hover:bg-purple-500/10 hover:text-purple-100 rounded-2xl"
            >
              <Eye className="w-5 h-5 mr-2" />
              Xem trước với tư cách khách
            </Button>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default LawOfLight;
