import { motion } from "framer-motion";
import { Heart, Users, Globe, Target, Eye, Sparkles, HandHeart, FileCheck, MessageCircleHeart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ParticleButton } from "@/components/ui/ParticleButton";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export function AboutSection() {
  const { t, language } = useLanguage();

  const missionItems = [
    {
      icon: Users,
      text: language === "vi" ? "Nối những trái tim ấm áp với những mảnh đời cần được yêu thương ♥" :
            language === "en" ? "Connect warm hearts with those who need love ♥" :
            language === "zh" ? "将温暖的心与需要关爱的人连接起来 ♥" :
            language === "ja" ? "温かい心を愛を必要とする人々とつなげる ♥" :
            language === "ko" ? "따뜻한 마음을 사랑이 필요한 사람들과 연결합니다 ♥" :
            language === "th" ? "เชื่อมต่อหัวใจอบอุ่นกับผู้ที่ต้องการความรัก ♥" :
            language === "fr" ? "Connecter les cœurs chaleureux avec ceux qui ont besoin d'amour ♥" :
            language === "de" ? "Warme Herzen mit denen verbinden, die Liebe brauchen ♥" :
            language === "es" ? "Conectar corazones cálidos con quienes necesitan amor ♥" :
            language === "pt" ? "Conectar corações calorosos com aqueles que precisam de amor ♥" :
            language === "ru" ? "Соединяем тёплые сердца с теми, кто нуждается в любви ♥" :
            language === "ar" ? "ربط القلوب الدافئة بمن يحتاجون إلى الحب ♥" :
            language === "hi" ? "गर्म दिलों को प्यार की जरूरत वालों से जोड़ें ♥" :
            "Connect warm hearts with those who need love ♥"
    },
    {
      icon: Sparkles,
      text: language === "vi" ? "Gieo niềm vui qua từng hành động sẻ chia, để cho đi là hạnh phúc ✨" :
            language === "en" ? "Spread joy through every act of sharing, because giving is happiness ✨" :
            language === "zh" ? "通过每一次分享传播快乐，因为给予就是幸福 ✨" :
            language === "ja" ? "すべての共有行為を通じて喜びを広げる、与えることは幸せだから ✨" :
            language === "ko" ? "나눔의 모든 행위를 통해 기쁨을 전파합니다, 나눔은 행복이니까요 ✨" :
            language === "th" ? "เผยแพร่ความสุขผ่านทุกการแบ่งปัน เพราะการให้คือความสุข ✨" :
            language === "fr" ? "Répandre la joie par chaque acte de partage, car donner c'est le bonheur ✨" :
            language === "de" ? "Freude verbreiten durch jede Tat des Teilens, denn Geben ist Glück ✨" :
            language === "es" ? "Difundir alegría a través de cada acto de compartir, porque dar es felicidad ✨" :
            language === "pt" ? "Espalhar alegria através de cada ato de compartilhar, porque dar é felicidade ✨" :
            language === "ru" ? "Распространяйте радость через каждый акт обмена, потому что давать — это счастье ✨" :
            language === "ar" ? "نشر الفرح من خلال كل عمل مشاركة، لأن العطاء سعادة ✨" :
            language === "hi" ? "साझा करने के हर कार्य से खुशी फैलाएं, क्योंकि देना खुशी है ✨" :
            "Spread joy through every act of sharing, because giving is happiness ✨"
    },
    {
      icon: Globe,
      text: language === "vi" ? "Vun đắp một cộng đồng yêu thương, nơi mọi người tin tưởng và đồng hành cùng nhau 🌏" :
            language === "en" ? "Build a loving community where everyone trusts and walks together 🌏" :
            language === "zh" ? "建立一个充满爱的社区，每个人都信任并一起前行 🌏" :
            language === "ja" ? "みんなが信頼し、一緒に歩む愛のあるコミュニティを作る 🌏" :
            language === "ko" ? "모두가 신뢰하고 함께 걸어가는 사랑의 커뮤니티를 만듭니다 🌏" :
            language === "th" ? "สร้างชุมชนแห่งความรักที่ทุกคนไว้วางใจและเดินทางไปด้วยกัน 🌏" :
            language === "fr" ? "Construire une communauté aimante où tout le monde fait confiance et marche ensemble 🌏" :
            language === "de" ? "Eine liebevolle Gemeinschaft aufbauen, in der alle vertrauen und zusammen gehen 🌏" :
            language === "es" ? "Construir una comunidad amorosa donde todos confían y caminan juntos 🌏" :
            language === "pt" ? "Construir uma comunidade amorosa onde todos confiam e caminham juntos 🌏" :
            language === "ru" ? "Создать любящее сообщество, где все доверяют и идут вместе 🌏" :
            language === "ar" ? "بناء مجتمع محب حيث يثق الجميع ويسيرون معاً 🌏" :
            language === "hi" ? "एक प्यार भरा समुदाय बनाएं जहां हर कोई भरोसा करता है और साथ चलता है 🌏" :
            "Build a loving community where everyone trusts and walks together 🌏"
    },
  ];

  const visionItems = [
    {
      icon: HandHeart,
      text: language === "vi" ? "Trở thành mái nhà ấm áp cho những ai muốn trao đi yêu thương 🏠" :
            language === "en" ? "Become a warm home for those who want to give love 🏠" :
            language === "zh" ? "成为想要给予爱的人的温暖之家 🏠" :
            language === "ja" ? "愛を与えたい人々の温かい家になる 🏠" :
            language === "ko" ? "사랑을 나누고 싶은 사람들의 따뜻한 집이 되세요 🏠" :
            language === "th" ? "เป็นบ้านอบอุ่นสำหรับผู้ที่ต้องการให้ความรัก 🏠" :
            language === "fr" ? "Devenir un foyer chaleureux pour ceux qui veulent donner de l'amour 🏠" :
            language === "de" ? "Ein warmes Zuhause für diejenigen werden, die Liebe geben wollen 🏠" :
            language === "es" ? "Convertirse en un hogar cálido para quienes quieren dar amor 🏠" :
            language === "pt" ? "Tornar-se um lar acolhedor para quem quer dar amor 🏠" :
            language === "ru" ? "Стать тёплым домом для тех, кто хочет дарить любовь 🏠" :
            language === "ar" ? "أن تصبح بيتاً دافئاً لمن يريد أن يعطي الحب 🏠" :
            language === "hi" ? "उन लोगों के लिए एक गर्म घर बनें जो प्यार देना चाहते हैं 🏠" :
            "Become a warm home for those who want to give love 🏠"
    },
    {
      icon: Heart,
      text: language === "vi" ? "Khơi dậy những hành động yêu thương nhỏ bé nhưng ý nghĩa trong cuộc sống 💕" :
            language === "en" ? "Inspire small but meaningful acts of love in life 💕" :
            language === "zh" ? "激发生活中小而有意义的爱的行动 💕" :
            language === "ja" ? "人生で小さくても意味のある愛の行動を触発する 💕" :
            language === "ko" ? "삶에서 작지만 의미 있는 사랑의 행동을 영감을 주세요 💕" :
            language === "th" ? "สร้างแรงบันดาลใจให้เกิดการกระทำแห่งความรักที่เล็กแต่มีความหมายในชีวิต 💕" :
            language === "fr" ? "Inspirer de petits mais significatifs actes d'amour dans la vie 💕" :
            language === "de" ? "Kleine aber bedeutungsvolle Liebestaten im Leben inspirieren 💕" :
            language === "es" ? "Inspirar pequeños pero significativos actos de amor en la vida 💕" :
            language === "pt" ? "Inspirar pequenos mas significativos atos de amor na vida 💕" :
            language === "ru" ? "Вдохновлять на маленькие, но значимые поступки любви в жизни 💕" :
            language === "ar" ? "إلهام أعمال الحب الصغيرة ولكن ذات المعنى في الحياة 💕" :
            language === "hi" ? "जीवन में छोटे लेकिन सार्थक प्रेम के कार्यों को प्रेरित करें 💕" :
            "Inspire small but meaningful acts of love in life 💕"
    },
    {
      icon: Target,
      text: language === "vi" ? "Xây dựng một vòng tay lớn kết nối hàng triệu trái tim nhân ái 🤝" :
            language === "en" ? "Build a big embrace connecting millions of kind hearts 🤝" :
            language === "zh" ? "建立一个连接数百万颗善心的大拥抱 🤝" :
            language === "ja" ? "何百万もの優しい心をつなぐ大きな抱擁を作る 🤝" :
            language === "ko" ? "수백만 개의 친절한 마음을 연결하는 큰 포옹을 만드세요 🤝" :
            language === "th" ? "สร้างอ้อมกอดใหญ่เชื่อมต่อหัวใจที่ดีนับล้าน 🤝" :
            language === "fr" ? "Construire une grande étreinte connectant des millions de cœurs généreux 🤝" :
            language === "de" ? "Eine große Umarmung aufbauen, die Millionen freundlicher Herzen verbindet 🤝" :
            language === "es" ? "Construir un gran abrazo conectando millones de corazones bondadosos 🤝" :
            language === "pt" ? "Construir um grande abraço conectando milhões de corações bondosos 🤝" :
            language === "ru" ? "Создать большие объятия, соединяющие миллионы добрых сердец 🤝" :
            language === "ar" ? "بناء عناق كبير يربط ملايين القلوب الطيبة 🤝" :
            language === "hi" ? "लाखों दयालु दिलों को जोड़ने वाला एक बड़ा आलिंगन बनाएं 🤝" :
            "Build a big embrace connecting millions of kind hearts 🤝"
    },
  ];

  const howWeWorkItems = [
    {
      icon: Target,
      title: language === "vi" ? "Rõ Ràng Từ Trái Tim" : language === "en" ? "Clear From The Heart" : language === "zh" ? "心中清晰" : language === "ja" ? "心からの明確さ" : language === "ko" ? "마음에서 우러나온 명확함" : language === "th" ? "ชัดเจนจากใจ" : language === "fr" ? "Clair du cœur" : language === "de" ? "Klar vom Herzen" : language === "es" ? "Claro desde el corazón" : language === "pt" ? "Claro do coração" : language === "ru" ? "Ясно от сердца" : language === "ar" ? "واضح من القلب" : language === "hi" ? "दिल से स्पष्ट" : "Clear From The Heart",
      text: language === "vi" ? "Mỗi dự án là một câu chuyện thật, với mục tiêu rõ ràng để bạn yên tâm đồng hành" : language === "en" ? "Each project is a real story with clear goals so you can join with confidence" : language === "zh" ? "每个项目都是一个真实的故事，目标明确，让您放心参与" : language === "ja" ? "各プロジェクトは明確な目標を持つ実話で、安心して参加できます" : language === "ko" ? "각 프로젝트는 명확한 목표를 가진 실제 이야기로, 자신 있게 참여할 수 있습니다" : language === "th" ? "แต่ละโปรเจกต์เป็นเรื่องจริงที่มีเป้าหมายชัดเจน คุณจึงมั่นใจเข้าร่วมได้" : language === "fr" ? "Chaque projet est une vraie histoire avec des objectifs clairs pour vous joindre en confiance" : language === "de" ? "Jedes Projekt ist eine echte Geschichte mit klaren Zielen, damit Sie selbstbewusst mitmachen können" : language === "es" ? "Cada proyecto es una historia real con objetivos claros para que te unas con confianza" : language === "pt" ? "Cada projeto é uma história real com objetivos claros para você participar com confiança" : language === "ru" ? "Каждый проект — это реальная история с чёткими целями, чтобы вы могли присоединиться с уверенностью" : language === "ar" ? "كل مشروع هو قصة حقيقية بأهداف واضحة لتنضم بثقة" : language === "hi" ? "प्रत्येक परियोजना स्पष्ट लक्ष्यों के साथ एक वास्तविक कहानी है ताकि आप आत्मविश्वास से जुड़ सकें" : "Each project is a real story with clear goals so you can join with confidence"
    },
    {
      icon: FileCheck,
      title: language === "vi" ? "Chia Sẻ Mọi Bước Đi" : language === "en" ? "Share Every Step" : language === "zh" ? "分享每一步" : language === "ja" ? "すべてのステップを共有" : language === "ko" ? "모든 단계를 공유" : language === "th" ? "แบ่งปันทุกก้าว" : language === "fr" ? "Partager chaque étape" : language === "de" ? "Jeden Schritt teilen" : language === "es" ? "Compartir cada paso" : language === "pt" ? "Compartilhar cada passo" : language === "ru" ? "Делиться каждым шагом" : language === "ar" ? "مشاركة كل خطوة" : language === "hi" ? "हर कदम साझा करें" : "Share Every Step",
      text: language === "vi" ? "Bạn sẽ nhận được cập nhật chân thực về hành trình của từng đồng yêu thương" : language === "en" ? "You will receive authentic updates about the journey of every donation" : language === "zh" ? "您将收到关于每笔捐款旅程的真实更新" : language === "ja" ? "各寄付の旅についての本物のアップデートを受け取ります" : language === "ko" ? "모든 기부의 여정에 대한 진정한 업데이트를 받게 됩니다" : language === "th" ? "คุณจะได้รับการอัปเดตจริงเกี่ยวกับการเดินทางของทุกการบริจาค" : language === "fr" ? "Vous recevrez des mises à jour authentiques sur le parcours de chaque don" : language === "de" ? "Sie erhalten authentische Updates über die Reise jeder Spende" : language === "es" ? "Recibirás actualizaciones auténticas sobre el viaje de cada donación" : language === "pt" ? "Você receberá atualizações autênticas sobre a jornada de cada doação" : language === "ru" ? "Вы получите подлинные обновления о пути каждого пожертвования" : language === "ar" ? "ستتلقى تحديثات حقيقية عن رحلة كل تبرع" : language === "hi" ? "आपको हर दान की यात्रा के बारे में प्रामाणिक अपडेट मिलेंगे" : "You will receive authentic updates about the journey of every donation"
    },
    {
      icon: MessageCircleHeart,
      title: language === "vi" ? "Kể Chuyện Bằng Cả Trái Tim" : language === "en" ? "Stories From The Heart" : language === "zh" ? "用心讲故事" : language === "ja" ? "心からの物語" : language === "ko" ? "마음에서 우러나온 이야기" : language === "th" ? "เรื่องราวจากใจ" : language === "fr" ? "Histoires du cœur" : language === "de" ? "Geschichten aus dem Herzen" : language === "es" ? "Historias del corazón" : language === "pt" ? "Histórias do coração" : language === "ru" ? "Истории от сердца" : language === "ar" ? "قصص من القلب" : language === "hi" ? "दिल से कहानियां" : "Stories From The Heart",
      text: language === "vi" ? "Những câu chuyện thật, nụ cười thật, và niềm hạnh phúc thật từ người nhận" : language === "en" ? "Real stories, real smiles, and real happiness from recipients" : language === "zh" ? "来自接受者的真实故事、真实笑容和真实幸福" : language === "ja" ? "受け取る人からの本物の話、本物の笑顔、本物の幸せ" : language === "ko" ? "수혜자로부터의 진짜 이야기, 진짜 미소, 진짜 행복" : language === "th" ? "เรื่องจริง รอยยิ้มจริง และความสุขจริงจากผู้รับ" : language === "fr" ? "De vraies histoires, de vrais sourires et du vrai bonheur des bénéficiaires" : language === "de" ? "Echte Geschichten, echtes Lächeln und echtes Glück von Empfängern" : language === "es" ? "Historias reales, sonrisas reales y felicidad real de los beneficiarios" : language === "pt" ? "Histórias reais, sorrisos reais e felicidade real dos beneficiários" : language === "ru" ? "Реальные истории, реальные улыбки и реальное счастье от получателей" : language === "ar" ? "قصص حقيقية وابتسامات حقيقية وسعادة حقيقية من المستفيدين" : language === "hi" ? "प्राप्तकर्ताओं से असली कहानियां, असली मुस्कान और असली खुशी" : "Real stories, real smiles, and real happiness from recipients"
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50/50 via-rose-50/30 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-pink-200/30 to-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-rose-200/30 to-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-100/20 to-pink-100/20 rounded-full blur-3xl" />
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
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="text-rose-500 font-medium tracking-wide uppercase text-sm">{t("about.fromOurHeart")}</span>
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 bg-clip-text text-transparent mb-6">
            {t("about.title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("about.description")}
          </p>
        </motion.div>

        {/* Mission & Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Mission Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-rose-100/50 border border-rose-100/50 hover:shadow-xl hover:shadow-rose-200/50 transition-all duration-300"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-rose-600">{t("about.ourWish")}</h3>
            </motion.div>
            <div className="space-y-4">
              {missionItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-rose-50/80 to-pink-50/80 hover:from-rose-100/80 hover:to-pink-100/80 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <item.icon className="w-5 h-5 text-rose-500" />
                  </div>
                  <p className="text-foreground/80 font-medium pt-2">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-amber-100/50 border border-amber-100/50 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-amber-600">{t("about.ourDream")}</h3>
            </motion.div>
            <div className="space-y-4">
              {visionItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50/80 to-orange-50/80 hover:from-amber-100/80 hover:to-orange-100/80 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <item.icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-foreground/80 font-medium pt-2">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative Separator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-4 mb-16"
        >
          <Separator className="w-24 bg-gradient-to-r from-transparent to-rose-300" />
          <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
          <Sparkles className="w-5 h-5 text-amber-400" />
          <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
          <Separator className="w-24 bg-gradient-to-l from-transparent to-rose-300" />
        </motion.div>

        {/* How We Work Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {howWeWorkItems.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100/50 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100/0 to-amber-100/0 group-hover:from-rose-100/50 group-hover:to-amber-100/50 rounded-2xl transition-all duration-300" />
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">{item.title}</h4>
                <p className="text-muted-foreground">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 rounded-3xl p-10 md:p-14 border border-rose-200/50"
        >
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
              >
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
              </motion.div>
            ))}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {t("cta.ready")}
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg">
            {t("cta.thousandHearts")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/campaigns">
              <ParticleButton variant="default" size="lg" className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-200">
                <Heart className="w-5 h-5 mr-2 fill-current" />
                {t("cta.exploreCampaigns")}
              </ParticleButton>
            </Link>
            <Link to="/volunteer">
              <ParticleButton variant="outline" size="lg" className="border-2 border-amber-400 text-amber-600 hover:bg-amber-50">
                <HandHeart className="w-5 h-5 mr-2" />
                {t("cta.joinUs")}
              </ParticleButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}