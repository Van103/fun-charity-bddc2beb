import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "vi" | "zh" | "ja" | "ko" | "th" | "fr" | "de" | "es" | "pt" | "ru" | "ar" | "hi";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "th", name: "Thai", nativeName: "ภาษาไทย", flag: "🇹🇭" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
];

interface TranslationValue {
  en: string;
  vi: string;
  zh: string;
  ja: string;
  ko: string;
  th: string;
  fr: string;
  de: string;
  es: string;
  pt: string;
  ru: string;
  ar: string;
  hi: string;
}

interface Translations {
  [key: string]: TranslationValue;
}

// Core translations - all 13 languages
export const translations: Translations = {
  // Navigation
  "nav.home": {
    en: "Home", vi: "Trang chủ", zh: "首页", ja: "ホーム", ko: "홈",
    th: "หน้าแรก", fr: "Accueil", de: "Startseite", es: "Inicio",
    pt: "Início", ru: "Главная", ar: "الرئيسية", hi: "होम"
  },
  "nav.campaigns": {
    en: "Campaigns", vi: "Chiến dịch", zh: "活动", ja: "キャンペーン", ko: "캠페인",
    th: "แคมเปญ", fr: "Campagnes", de: "Kampagnen", es: "Campañas",
    pt: "Campanhas", ru: "Кампании", ar: "الحملات", hi: "अभियान"
  },
  "nav.myCampaigns": {
    en: "My Campaigns", vi: "Chiến dịch của tôi", zh: "我的活动", ja: "マイキャンペーン", ko: "내 캠페인",
    th: "แคมเปญของฉัน", fr: "Mes campagnes", de: "Meine Kampagnen", es: "Mis campañas",
    pt: "Minhas campanhas", ru: "Мои кампании", ar: "حملاتي", hi: "मेरे अभियान"
  },
  "nav.needsMap": {
    en: "Needs Map", vi: "Bản đồ nhu cầu", zh: "需求地图", ja: "ニーズマップ", ko: "필요 지도",
    th: "แผนที่ความต้องการ", fr: "Carte des besoins", de: "Bedarfskarte", es: "Mapa de necesidades",
    pt: "Mapa de necessidades", ru: "Карта потребностей", ar: "خريطة الاحتياجات", hi: "आवश्यकता मानचित्र"
  },
  "nav.overview": {
    en: "Overview", vi: "Tổng quan", zh: "概述", ja: "概要", ko: "개요",
    th: "ภาพรวม", fr: "Aperçu", de: "Übersicht", es: "Resumen",
    pt: "Visão geral", ru: "Обзор", ar: "نظرة عامة", hi: "अवलोकन"
  },
  "nav.platform": {
    en: "Platform", vi: "Nền tảng", zh: "平台", ja: "プラットフォーム", ko: "플랫폼",
    th: "แพลตฟอร์ม", fr: "Plateforme", de: "Plattform", es: "Plataforma",
    pt: "Plataforma", ru: "Платформа", ar: "المنصة", hi: "प्लेटफ़ॉर्म"
  },
  "nav.reviews": {
    en: "Reviews", vi: "Đánh giá", zh: "评论", ja: "レビュー", ko: "리뷰",
    th: "รีวิว", fr: "Avis", de: "Bewertungen", es: "Reseñas",
    pt: "Avaliações", ru: "Отзывы", ar: "المراجعات", hi: "समीक्षाएं"
  },
  "nav.profiles": {
    en: "Profiles", vi: "Hồ sơ", zh: "个人资料", ja: "プロフィール", ko: "프로필",
    th: "โปรไฟล์", fr: "Profils", de: "Profile", es: "Perfiles",
    pt: "Perfis", ru: "Профили", ar: "الملفات الشخصية", hi: "प्रोफाइल"
  },
  "nav.communityProfiles": {
    en: "Community Profiles", vi: "Hồ sơ cộng đồng", zh: "社区资料", ja: "コミュニティプロフィール", ko: "커뮤니티 프로필",
    th: "โปรไฟล์ชุมชน", fr: "Profils communautaires", de: "Community-Profile", es: "Perfiles de la comunidad",
    pt: "Perfis da comunidade", ru: "Профили сообщества", ar: "ملفات المجتمع", hi: "समुदाय प्रोफाइल"
  },
  "nav.messages": {
    en: "Messages", vi: "Tin nhắn", zh: "消息", ja: "メッセージ", ko: "메시지",
    th: "ข้อความ", fr: "Messages", de: "Nachrichten", es: "Mensajes",
    pt: "Mensagens", ru: "Сообщения", ar: "الرسائل", hi: "संदेश"
  },
  "nav.search": {
    en: "Search on FUN Charity", vi: "Tìm kiếm trên FUN Charity", zh: "在FUN慈善上搜索", ja: "FUN Charityで検索", ko: "FUN Charity에서 검색",
    th: "ค้นหาใน FUN Charity", fr: "Rechercher sur FUN Charity", de: "Suche auf FUN Charity", es: "Buscar en FUN Charity",
    pt: "Pesquisar no FUN Charity", ru: "Поиск в FUN Charity", ar: "البحث في FUN Charity", hi: "FUN Charity पर खोजें"
  },
  "nav.community": {
    en: "Community", vi: "Cộng đồng", zh: "社区", ja: "コミュニティ", ko: "커뮤니티",
    th: "ชุมชน", fr: "Communauté", de: "Gemeinschaft", es: "Comunidad",
    pt: "Comunidade", ru: "Сообщество", ar: "المجتمع", hi: "समुदाय"
  },
  "nav.activity": {
    en: "Activity", vi: "Hoạt động", zh: "活动", ja: "アクティビティ", ko: "활동",
    th: "กิจกรรม", fr: "Activité", de: "Aktivität", es: "Actividad",
    pt: "Atividade", ru: "Активность", ar: "النشاط", hi: "गतिविधि"
  },
  "user.viewProfile": {
    en: "View Profile", vi: "Xem hồ sơ", zh: "查看资料", ja: "プロフィールを見る", ko: "프로필 보기",
    th: "ดูโปรไฟล์", fr: "Voir le profil", de: "Profil anzeigen", es: "Ver perfil",
    pt: "Ver perfil", ru: "Посмотреть профиль", ar: "عرض الملف الشخصي", hi: "प्रोफ़ाइल देखें"
  },
  "settings.language": {
    en: "Language", vi: "Ngôn ngữ", zh: "语言", ja: "言語", ko: "언어",
    th: "ภาษา", fr: "Langue", de: "Sprache", es: "Idioma",
    pt: "Idioma", ru: "Язык", ar: "اللغة", hi: "भाषा"
  },
  "settings.cursor": {
    en: "Cursor", vi: "Con trỏ", zh: "光标", ja: "カーソル", ko: "커서",
    th: "เคอร์เซอร์", fr: "Curseur", de: "Cursor", es: "Cursor",
    pt: "Cursor", ru: "Курсор", ar: "المؤشر", hi: "कर्सर"
  },

  // Left Sidebar
  "sidebar.ecosystem": {
    en: "F.U. Ecosystem Platforms", vi: "Các Platform F.U. Ecosystem", zh: "F.U. 生态系统平台", ja: "F.U. エコシステムプラットフォーム", ko: "F.U. 생태계 플랫폼",
    th: "แพลตฟอร์ม F.U. Ecosystem", fr: "Plateformes de l'écosystème F.U.", de: "F.U. Ökosystem-Plattformen", es: "Plataformas del ecosistema F.U.",
    pt: "Plataformas do ecossistema F.U.", ru: "Платформы экосистемы F.U.", ar: "منصات نظام F.U. البيئي", hi: "F.U. इकोसिस्टम प्लेटफॉर्म"
  },
  "sidebar.comingSoon": {
    en: "Coming soon", vi: "Sắp ra mắt", zh: "即将推出", ja: "近日公開", ko: "곧 출시",
    th: "เร็วๆ นี้", fr: "Bientôt disponible", de: "Demnächst", es: "Próximamente",
    pt: "Em breve", ru: "Скоро", ar: "قريباً", hi: "जल्द आ रहा है"
  },
  "sidebar.shortcuts": {
    en: "Your shortcuts", vi: "Lối tắt của bạn", zh: "您的快捷方式", ja: "ショートカット", ko: "바로가기",
    th: "ทางลัดของคุณ", fr: "Vos raccourcis", de: "Ihre Verknüpfungen", es: "Tus accesos directos",
    pt: "Seus atalhos", ru: "Ваши ярлыки", ar: "اختصاراتك", hi: "आपके शॉर्टकट"
  },
  "sidebar.edit": {
    en: "Edit", vi: "Chỉnh sửa", zh: "编辑", ja: "編集", ko: "편집",
    th: "แก้ไข", fr: "Modifier", de: "Bearbeiten", es: "Editar",
    pt: "Editar", ru: "Редактировать", ar: "تعديل", hi: "संपादित करें"
  },
  "sidebar.users": {
    en: "Users", vi: "Người dùng", zh: "用户", ja: "ユーザー", ko: "사용자",
    th: "ผู้ใช้", fr: "Utilisateurs", de: "Benutzer", es: "Usuarios",
    pt: "Usuários", ru: "Пользователи", ar: "المستخدمون", hi: "उपयोगकर्ता"
  },

  // Menu items
  "menu.profile": {
    en: "Fun Profile", vi: "Fun Profile", zh: "Fun Profile", ja: "Fun Profile", ko: "Fun Profile",
    th: "Fun Profile", fr: "Fun Profile", de: "Fun Profile", es: "Fun Profile",
    pt: "Fun Profile", ru: "Fun Profile", ar: "Fun Profile", hi: "Fun Profile"
  },
  "menu.farm": {
    en: "Fun Farm", vi: "Fun Farm", zh: "Fun Farm", ja: "Fun Farm", ko: "Fun Farm",
    th: "Fun Farm", fr: "Fun Farm", de: "Fun Farm", es: "Fun Farm",
    pt: "Fun Farm", ru: "Fun Farm", ar: "Fun Farm", hi: "Fun Farm"
  },
  "menu.planet": {
    en: "Fun Planet", vi: "Fun Planet", zh: "Fun Planet", ja: "Fun Planet", ko: "Fun Planet",
    th: "Fun Planet", fr: "Fun Planet", de: "Fun Planet", es: "Fun Planet",
    pt: "Fun Planet", ru: "Fun Planet", ar: "Fun Planet", hi: "Fun Planet"
  },
  "menu.play": {
    en: "Fun Play", vi: "Fun Play", zh: "Fun Play", ja: "Fun Play", ko: "Fun Play",
    th: "Fun Play", fr: "Fun Play", de: "Fun Play", es: "Fun Play",
    pt: "Fun Play", ru: "Fun Play", ar: "Fun Play", hi: "Fun Play"
  },
  "menu.chat": {
    en: "Fun Chat", vi: "Fun Chat", zh: "Fun Chat", ja: "Fun Chat", ko: "Fun Chat",
    th: "Fun Chat", fr: "Fun Chat", de: "Fun Chat", es: "Fun Chat",
    pt: "Fun Chat", ru: "Fun Chat", ar: "Fun Chat", hi: "Fun Chat"
  },
  "menu.academy": {
    en: "Fun Academy", vi: "Fun Academy", zh: "Fun Academy", ja: "Fun Academy", ko: "Fun Academy",
    th: "Fun Academy", fr: "Fun Academy", de: "Fun Academy", es: "Fun Academy",
    pt: "Fun Academy", ru: "Fun Academy", ar: "Fun Academy", hi: "Fun Academy"
  },
  "menu.trading": {
    en: "Fun Trading", vi: "Fun Trading", zh: "Fun Trading", ja: "Fun Trading", ko: "Fun Trading",
    th: "Fun Trading", fr: "Fun Trading", de: "Fun Trading", es: "Fun Trading",
    pt: "Fun Trading", ru: "Fun Trading", ar: "Fun Trading", hi: "Fun Trading"
  },
  "menu.investment": {
    en: "Fun Investment", vi: "Fun Investment", zh: "Fun Investment", ja: "Fun Investment", ko: "Fun Investment",
    th: "Fun Investment", fr: "Fun Investment", de: "Fun Investment", es: "Fun Investment",
    pt: "Fun Investment", ru: "Fun Investment", ar: "Fun Investment", hi: "Fun Investment"
  },
  "menu.life": {
    en: "Fun Life", vi: "Fun Life", zh: "Fun Life", ja: "Fun Life", ko: "Fun Life",
    th: "Fun Life", fr: "Fun Life", de: "Fun Life", es: "Fun Life",
    pt: "Fun Life", ru: "Fun Life", ar: "Fun Life", hi: "Fun Life"
  },
  "menu.legal": {
    en: "Fun Legal", vi: "Fun Legal", zh: "Fun Legal", ja: "Fun Legal", ko: "Fun Legal",
    th: "Fun Legal", fr: "Fun Legal", de: "Fun Legal", es: "Fun Legal",
    pt: "Fun Legal", ru: "Fun Legal", ar: "Fun Legal", hi: "Fun Legal"
  },

  // Right Sidebar - Honor Board
  "honor.title": {
    en: "RECOGNITION", vi: "BẢNG VINH DANH", zh: "荣誉榜", ja: "表彰", ko: "인정",
    th: "เกียรติยศ", fr: "RECONNAISSANCE", de: "ANERKENNUNG", es: "RECONOCIMIENTO",
    pt: "RECONHECIMENTO", ru: "ПРИЗНАНИЕ", ar: "التقدير", hi: "मान्यता"
  },
  "honor.topProfile": {
    en: "Total Featured Profiles", vi: "Hồ Sơ Nổi Bật", zh: "精选资料总数", ja: "注目プロフィール総数", ko: "주요 프로필 총계",
    th: "โปรไฟล์เด่นทั้งหมด", fr: "Profils en vedette", de: "Empfohlene Profile", es: "Perfiles destacados",
    pt: "Perfis em destaque", ru: "Избранные профили", ar: "الملفات المميزة", hi: "विशेष प्रोफाइल"
  },
  "honor.earnings": {
    en: "Total Income", vi: "Thu Nhập", zh: "总收入", ja: "総収入", ko: "총 수입",
    th: "รายได้ทั้งหมด", fr: "Revenu total", de: "Gesamteinkommen", es: "Ingresos totales",
    pt: "Renda total", ru: "Общий доход", ar: "إجمالي الدخل", hi: "कुल आय"
  },
  "honor.posts": {
    en: "Total Posts", vi: "Bài Viết", zh: "帖子总数", ja: "投稿総数", ko: "총 게시물",
    th: "โพสต์ทั้งหมด", fr: "Total des publications", de: "Beiträge gesamt", es: "Total de publicaciones",
    pt: "Total de postagens", ru: "Всего публикаций", ar: "إجمالي المنشورات", hi: "कुल पोस्ट"
  },
  "honor.videos": {
    en: "Total Videos", vi: "Video", zh: "视频总数", ja: "動画総数", ko: "총 동영상",
    th: "วิดีโอทั้งหมด", fr: "Total des vidéos", de: "Videos gesamt", es: "Total de videos",
    pt: "Total de vídeos", ru: "Всего видео", ar: "إجمالي الفيديوهات", hi: "कुल वीडियो"
  },
  "honor.friends": {
    en: "Total Friends", vi: "Bạn Bè", zh: "好友总数", ja: "友達総数", ko: "총 친구",
    th: "เพื่อนทั้งหมด", fr: "Total des amis", de: "Freunde gesamt", es: "Total de amigos",
    pt: "Total de amigos", ru: "Всего друзей", ar: "إجمالي الأصدقاء", hi: "कुल मित्र"
  },
  "honor.nftCount": {
    en: "Total NFTs", vi: "Số Lượng NFT", zh: "NFT总数", ja: "NFT総数", ko: "총 NFT",
    th: "NFT ทั้งหมด", fr: "Total des NFT", de: "NFTs gesamt", es: "Total de NFT",
    pt: "Total de NFTs", ru: "Всего NFT", ar: "إجمالي NFT", hi: "कुल NFT"
  },
  "ranking.title": {
    en: "TOP RANKING", vi: "XẾP HẠNG", zh: "排行榜", ja: "ランキング", ko: "랭킹",
    th: "อันดับสูงสุด", fr: "CLASSEMENT", de: "RANGLISTE", es: "CLASIFICACIÓN",
    pt: "CLASSIFICAÇÃO", ru: "РЕЙТИНГ", ar: "الترتيب", hi: "शीर्ष रैंकिंग"
  },
  "birthday.title": {
    en: "Birthdays", vi: "Sinh nhật", zh: "生日", ja: "誕生日", ko: "생일",
    th: "วันเกิด", fr: "Anniversaires", de: "Geburtstage", es: "Cumpleaños",
    pt: "Aniversários", ru: "Дни рождения", ar: "أعياد الميلاد", hi: "जन्मदिन"
  },
  "birthday.today": {
    en: "Today is the birthday of", vi: "Hôm nay là sinh nhật của", zh: "今天是...的生日", ja: "今日は...の誕生日です", ko: "오늘은...의 생일입니다",
    th: "วันนี้เป็นวันเกิดของ", fr: "C'est l'anniversaire de", de: "Heute ist der Geburtstag von", es: "Hoy es el cumpleaños de",
    pt: "Hoje é o aniversário de", ru: "Сегодня день рождения", ar: "اليوم عيد ميلاد", hi: "आज का जन्मदिन है"
  },
  "birthday.others": {
    en: "others", vi: "người khác", zh: "其他人", ja: "他の人", ko: "다른 사람들",
    th: "คนอื่นๆ", fr: "autres", de: "andere", es: "otros",
    pt: "outros", ru: "других", ar: "آخرون", hi: "अन्य"
  },
  "contacts.title": {
    en: "Contacts", vi: "Người liên hệ", zh: "联系人", ja: "連絡先", ko: "연락처",
    th: "ผู้ติดต่อ", fr: "Contacts", de: "Kontakte", es: "Contactos",
    pt: "Contatos", ru: "Контакты", ar: "جهات الاتصال", hi: "संपर्क"
  },
  "groups.title": {
    en: "Group Chats", vi: "Cuộc trò chuyện nhóm", zh: "群聊", ja: "グループチャット", ko: "그룹 채팅",
    th: "แชทกลุ่ม", fr: "Discussions de groupe", de: "Gruppenchats", es: "Chats grupales",
    pt: "Conversas em grupo", ru: "Групповые чаты", ar: "المحادثات الجماعية", hi: "समूह चैट"
  },
  "groups.add": {
    en: "Add new group", vi: "Thêm nhóm mới", zh: "添加新群组", ja: "新しいグループを追加", ko: "새 그룹 추가",
    th: "เพิ่มกลุ่มใหม่", fr: "Ajouter un nouveau groupe", de: "Neue Gruppe hinzufügen", es: "Agregar nuevo grupo",
    pt: "Adicionar novo grupo", ru: "Добавить новую группу", ar: "إضافة مجموعة جديدة", hi: "नया समूह जोड़ें"
  },
  "groups.earth": {
    en: "Mother Earth Service Group", vi: "Nhóm Phụng Sự Mẹ Trái Đất", zh: "地球母亲服务组", ja: "地球奉仕グループ", ko: "지구 봉사 그룹",
    th: "กลุ่มรับใช้แม่พระธรณี", fr: "Groupe de service Mère Terre", de: "Mutter-Erde-Dienstgruppe", es: "Grupo de servicio Madre Tierra",
    pt: "Grupo de Serviço Mãe Terra", ru: "Группа служения Матери-Земле", ar: "مجموعة خدمة الأرض الأم", hi: "मदर अर्थ सेवा समूह"
  },

  // Create Post
  "post.thinking": {
    en: "What's on your mind?", vi: "Bạn đang nghĩ gì?", zh: "你在想什么？", ja: "何を考えていますか？", ko: "무슨 생각을 하고 계세요?",
    th: "คุณกำลังคิดอะไรอยู่?", fr: "À quoi pensez-vous ?", de: "Was denkst du gerade?", es: "¿Qué estás pensando?",
    pt: "No que você está pensando?", ru: "О чем вы думаете?", ar: "بماذا تفكر؟", hi: "आप क्या सोच रहे हैं?"
  },
  "post.photo": {
    en: "Photo", vi: "Ảnh", zh: "照片", ja: "写真", ko: "사진",
    th: "รูปภาพ", fr: "Photo", de: "Foto", es: "Foto",
    pt: "Foto", ru: "Фото", ar: "صورة", hi: "फ़ोटो"
  },
  "post.video": {
    en: "Video", vi: "Video", zh: "视频", ja: "動画", ko: "동영상",
    th: "วิดีโอ", fr: "Vidéo", de: "Video", es: "Video",
    pt: "Vídeo", ru: "Видео", ar: "فيديو", hi: "वीडियो"
  },
  "post.ai": {
    en: "AI", vi: "AI", zh: "AI", ja: "AI", ko: "AI",
    th: "AI", fr: "IA", de: "KI", es: "IA",
    pt: "IA", ru: "ИИ", ar: "الذكاء الاصطناعي", hi: "AI"
  },
  "post.submit": {
    en: "POST", vi: "ĐĂNG", zh: "发布", ja: "投稿", ko: "게시",
    th: "โพสต์", fr: "PUBLIER", de: "POSTEN", es: "PUBLICAR",
    pt: "PUBLICAR", ru: "ОПУБЛИКОВАТЬ", ar: "نشر", hi: "पोस्ट करें"
  },
  "post.comment": {
    en: "Comment", vi: "Bình luận", zh: "评论", ja: "コメント", ko: "댓글",
    th: "แสดงความคิดเห็น", fr: "Commenter", de: "Kommentieren", es: "Comentar",
    pt: "Comentar", ru: "Комментарий", ar: "تعليق", hi: "टिप्पणी"
  },
  "post.comments": {
    en: "comments", vi: "bình luận", zh: "条评论", ja: "件のコメント", ko: "개의 댓글",
    th: "ความคิดเห็น", fr: "commentaires", de: "Kommentare", es: "comentarios",
    pt: "comentários", ru: "комментариев", ar: "تعليقات", hi: "टिप्पणियां"
  },
  "post.people": {
    en: "people", vi: "người", zh: "人", ja: "人", ko: "명",
    th: "คน", fr: "personnes", de: "Personen", es: "personas",
    pt: "pessoas", ru: "человек", ar: "أشخاص", hi: "लोग"
  },
  "post.shares": {
    en: "shares", vi: "chia sẻ", zh: "次分享", ja: "件のシェア", ko: "회 공유",
    th: "แชร์", fr: "partages", de: "Mal geteilt", es: "compartidos",
    pt: "compartilhamentos", ru: "репостов", ar: "مشاركات", hi: "शेयर"
  },
  "post.at": {
    en: "at", vi: "tại", zh: "在", ja: "で", ko: "에서",
    th: "ที่", fr: "à", de: "in", es: "en",
    pt: "em", ru: "в", ar: "في", hi: "पर"
  },

  // AI Content Generation
  "ai.title": {
    en: "Enjoy AI - Auto Generate Content", vi: "Enjoy AI - Tạo nội dung tự động", zh: "Enjoy AI - 自动生成内容", ja: "Enjoy AI - コンテンツ自動生成", ko: "Enjoy AI - 콘텐츠 자동 생성",
    th: "Enjoy AI - สร้างเนื้อหาอัตโนมัติ", fr: "Enjoy AI - Génération automatique de contenu", de: "Enjoy AI - Inhalte automatisch generieren", es: "Enjoy AI - Generación automática de contenido",
    pt: "Enjoy AI - Geração automática de conteúdo", ru: "Enjoy AI - Автоматическая генерация контента", ar: "Enjoy AI - إنشاء محتوى تلقائي", hi: "Enjoy AI - स्वचालित सामग्री निर्माण"
  },
  "ai.topic": {
    en: "Topic you want to write about (optional)", vi: "Chủ đề bạn muốn viết về (tùy chọn)", zh: "您想写的主题（可选）", ja: "書きたいトピック（任意）", ko: "작성하고 싶은 주제 (선택사항)",
    th: "หัวข้อที่คุณต้องการเขียน (ไม่บังคับ)", fr: "Sujet sur lequel vous voulez écrire (optionnel)", de: "Thema, über das Sie schreiben möchten (optional)", es: "Tema sobre el que quieres escribir (opcional)",
    pt: "Assunto sobre o qual você quer escrever (opcional)", ru: "Тема, о которой вы хотите написать (необязательно)", ar: "الموضوع الذي تريد الكتابة عنه (اختياري)", hi: "जिस विषय पर आप लिखना चाहते हैं (वैकल्पिक)"
  },
  "ai.placeholder": {
    en: "e.g., Help highland children, protect the environment...", vi: "Ví dụ: Giúp đỡ trẻ em vùng cao, bảo vệ môi trường...", zh: "例如：帮助山区儿童，保护环境...", ja: "例：高地の子供たちを助ける、環境を守る...", ko: "예: 고지대 어린이 돕기, 환경 보호...",
    th: "เช่น ช่วยเหลือเด็กบนพื้นที่สูง ปกป้องสิ่งแวดล้อม...", fr: "ex: Aider les enfants des montagnes, protéger l'environnement...", de: "z.B. Kindern im Hochland helfen, die Umwelt schützen...", es: "ej: Ayudar a niños de las montañas, proteger el medio ambiente...",
    pt: "ex: Ajudar crianças das montanhas, proteger o meio ambiente...", ru: "например: Помочь детям горных районов, защитить окружающую среду...", ar: "مثال: مساعدة أطفال المرتفعات، حماية البيئة...", hi: "उदा: पहाड़ी बच्चों की मदद, पर्यावरण की रक्षा..."
  },
  "ai.empty": {
    en: "Leave empty for AI to create charity content", vi: "Để trống để AI tự tạo nội dung về hoạt động từ thiện", zh: "留空让AI创建慈善内容", ja: "空欄のままにすると、AIが慈善コンテンツを作成します", ko: "비워두면 AI가 자선 콘텐츠를 생성합니다",
    th: "เว้นว่างเพื่อให้ AI สร้างเนื้อหาการกุศล", fr: "Laissez vide pour que l'IA crée du contenu caritatif", de: "Leer lassen, damit die KI Wohltätigkeitsinhalte erstellt", es: "Dejar vacío para que la IA cree contenido benéfico",
    pt: "Deixe vazio para a IA criar conteúdo de caridade", ru: "Оставьте пустым, чтобы ИИ создал благотворительный контент", ar: "اتركه فارغاً ليقوم الذكاء الاصطناعي بإنشاء محتوى خيري", hi: "AI को चैरिटी सामग्री बनाने के लिए खाली छोड़ें"
  },
  "ai.generate": {
    en: "Generate with AI", vi: "Tạo nội dung với AI", zh: "用AI生成", ja: "AIで生成", ko: "AI로 생성",
    th: "สร้างด้วย AI", fr: "Générer avec l'IA", de: "Mit KI generieren", es: "Generar con IA",
    pt: "Gerar com IA", ru: "Сгенерировать с помощью ИИ", ar: "إنشاء باستخدام الذكاء الاصطناعي", hi: "AI से बनाएं"
  },
  "ai.generating": {
    en: "Generating content...", vi: "Đang tạo nội dung...", zh: "正在生成内容...", ja: "コンテンツを生成中...", ko: "콘텐츠 생성 중...",
    th: "กำลังสร้างเนื้อหา...", fr: "Génération du contenu...", de: "Inhalt wird generiert...", es: "Generando contenido...",
    pt: "Gerando conteúdo...", ru: "Генерация контента...", ar: "جارٍ إنشاء المحتوى...", hi: "सामग्री बनाई जा रही है..."
  },
  "ai.retry": {
    en: "Retry", vi: "Thử lại", zh: "重试", ja: "再試行", ko: "다시 시도",
    th: "ลองอีกครั้ง", fr: "Réessayer", de: "Erneut versuchen", es: "Reintentar",
    pt: "Tentar novamente", ru: "Повторить", ar: "إعادة المحاولة", hi: "पुनः प्रयास करें"
  },
  "ai.success": {
    en: "Content created successfully!", vi: "Tạo nội dung thành công!", zh: "内容创建成功！", ja: "コンテンツの作成に成功しました！", ko: "콘텐츠가 성공적으로 생성되었습니다!",
    th: "สร้างเนื้อหาสำเร็จ!", fr: "Contenu créé avec succès !", de: "Inhalt erfolgreich erstellt!", es: "¡Contenido creado con éxito!",
    pt: "Conteúdo criado com sucesso!", ru: "Контент успешно создан!", ar: "تم إنشاء المحتوى بنجاح!", hi: "सामग्री सफलतापूर्वक बनाई गई!"
  },
  "ai.successDesc": {
    en: "AI has created content for you. You can edit before posting.", vi: "AI đã tạo nội dung cho bạn. Bạn có thể chỉnh sửa trước khi đăng.", zh: "AI已为您创建内容。您可以在发布前编辑。", ja: "AIがコンテンツを作成しました。投稿前に編集できます。", ko: "AI가 콘텐츠를 생성했습니다. 게시 전에 편집할 수 있습니다.",
    th: "AI ได้สร้างเนื้อหาให้คุณแล้ว คุณสามารถแก้ไขก่อนโพสต์ได้", fr: "L'IA a créé du contenu pour vous. Vous pouvez le modifier avant de publier.", de: "Die KI hat Inhalte für Sie erstellt. Sie können vor dem Posten bearbeiten.", es: "La IA ha creado contenido para ti. Puedes editarlo antes de publicar.",
    pt: "A IA criou conteúdo para você. Você pode editar antes de publicar.", ru: "ИИ создал контент для вас. Вы можете отредактировать перед публикацией.", ar: "لقد أنشأ الذكاء الاصطناعي محتوى لك. يمكنك التعديل قبل النشر.", hi: "AI ने आपके लिए सामग्री बनाई है। आप पोस्ट करने से पहले संपादित कर सकते हैं।"
  },
  "ai.successWithImage": {
    en: "AI has created content and image for you. You can edit before posting.", vi: "AI đã tạo nội dung và hình ảnh cho bạn. Bạn có thể chỉnh sửa trước khi đăng.", zh: "AI已为您创建内容和图片。您可以在发布前编辑。", ja: "AIがコンテンツと画像を作成しました。投稿前に編集できます。", ko: "AI가 콘텐츠와 이미지를 생성했습니다. 게시 전에 편집할 수 있습니다.",
    th: "AI ได้สร้างเนื้อหาและรูปภาพให้คุณแล้ว คุณสามารถแก้ไขก่อนโพสต์ได้", fr: "L'IA a créé du contenu et une image pour vous. Vous pouvez modifier avant de publier.", de: "Die KI hat Inhalte und Bilder für Sie erstellt. Sie können vor dem Posten bearbeiten.", es: "La IA ha creado contenido e imagen para ti. Puedes editarlo antes de publicar.",
    pt: "A IA criou conteúdo e imagem para você. Você pode editar antes de publicar.", ru: "ИИ создал контент и изображение для вас. Вы можете отредактировать перед публикацией.", ar: "لقد أنشأ الذكاء الاصطناعي محتوى وصورة لك. يمكنك التعديل قبل النشر.", hi: "AI ने आपके लिए सामग्री और छवि बनाई है। आप पोस्ट करने से पहले संपादित कर सकते हैं।"
  },
  "ai.error": {
    en: "Content generation error", vi: "Lỗi tạo nội dung", zh: "内容生成错误", ja: "コンテンツ生成エラー", ko: "콘텐츠 생성 오류",
    th: "ข้อผิดพลาดในการสร้างเนื้อหา", fr: "Erreur de génération de contenu", de: "Fehler bei der Inhaltserstellung", es: "Error de generación de contenido",
    pt: "Erro na geração de conteúdo", ru: "Ошибка генерации контента", ar: "خطأ في إنشاء المحتوى", hi: "सामग्री निर्माण त्रुटि"
  },
  "ai.errorGeneric": {
    en: "Could not generate content. Please try again.", vi: "Không thể tạo nội dung. Vui lòng thử lại.", zh: "无法生成内容。请重试。", ja: "コンテンツを生成できませんでした。もう一度お試しください。", ko: "콘텐츠를 생성할 수 없습니다. 다시 시도해 주세요.",
    th: "ไม่สามารถสร้างเนื้อหาได้ โปรดลองอีกครั้ง", fr: "Impossible de générer le contenu. Veuillez réessayer.", de: "Inhalt konnte nicht generiert werden. Bitte versuchen Sie es erneut.", es: "No se pudo generar el contenido. Por favor, inténtalo de nuevo.",
    pt: "Não foi possível gerar o conteúdo. Por favor, tente novamente.", ru: "Не удалось сгенерировать контент. Пожалуйста, попробуйте снова.", ar: "تعذر إنشاء المحتوى. يرجى المحاولة مرة أخرى.", hi: "सामग्री नहीं बनाई जा सकी। कृपया पुनः प्रयास करें।"
  },
  "ai.errorRateLimit": {
    en: "Too many requests. Please wait a moment and try again.", vi: "Quá nhiều yêu cầu. Vui lòng đợi một lát và thử lại.", zh: "请求过多。请稍候再试。", ja: "リクエストが多すぎます。しばらくしてから再試行してください。", ko: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    th: "คำขอมากเกินไป โปรดรอสักครู่แล้วลองอีกครั้ง", fr: "Trop de demandes. Veuillez attendre un moment et réessayer.", de: "Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.", es: "Demasiadas solicitudes. Por favor, espera un momento e inténtalo de nuevo.",
    pt: "Muitas solicitações. Por favor, aguarde um momento e tente novamente.", ru: "Слишком много запросов. Пожалуйста, подождите немного и попробуйте снова.", ar: "طلبات كثيرة جداً. يرجى الانتظار لحظة والمحاولة مرة أخرى.", hi: "बहुत सारे अनुरोध। कृपया थोड़ी देर प्रतीक्षा करें और पुनः प्रयास करें।"
  },
  "ai.errorPayment": {
    en: "Need to add more credits to use AI.", vi: "Cần nạp thêm credits để sử dụng AI.", zh: "需要添加更多积分才能使用AI。", ja: "AIを使用するにはクレジットを追加する必要があります。", ko: "AI를 사용하려면 크레딧을 추가해야 합니다.",
    th: "ต้องเพิ่มเครดิตเพิ่มเติมเพื่อใช้ AI", fr: "Besoin d'ajouter plus de crédits pour utiliser l'IA.", de: "Sie müssen mehr Credits hinzufügen, um die KI zu nutzen.", es: "Necesitas agregar más créditos para usar la IA.",
    pt: "Precisa adicionar mais créditos para usar a IA.", ru: "Необходимо добавить больше кредитов для использования ИИ.", ar: "تحتاج إلى إضافة المزيد من الرصيد لاستخدام الذكاء الاصطناعي.", hi: "AI का उपयोग करने के लिए अधिक क्रेडिट जोड़ने की आवश्यकता है।"
  },
  "ai.errorServer": {
    en: "Server error. Please try again later.", vi: "Lỗi máy chủ. Vui lòng thử lại sau.", zh: "服务器错误。请稍后再试。", ja: "サーバーエラー。後でもう一度お試しください。", ko: "서버 오류. 나중에 다시 시도해 주세요.",
    th: "ข้อผิดพลาดของเซิร์ฟเวอร์ โปรดลองอีกครั้งในภายหลัง", fr: "Erreur du serveur. Veuillez réessayer plus tard.", de: "Serverfehler. Bitte versuchen Sie es später erneut.", es: "Error del servidor. Por favor, inténtalo más tarde.",
    pt: "Erro do servidor. Por favor, tente novamente mais tarde.", ru: "Ошибка сервера. Пожалуйста, попробуйте позже.", ar: "خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.", hi: "सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।"
  },

  // Search
  "search.searching": {
    en: "Searching...", vi: "Đang tìm kiếm...", zh: "搜索中...", ja: "検索中...", ko: "검색 중...",
    th: "กำลังค้นหา...", fr: "Recherche en cours...", de: "Suche läuft...", es: "Buscando...",
    pt: "Pesquisando...", ru: "Поиск...", ar: "جارٍ البحث...", hi: "खोज रहा है..."
  },
  "search.noResults": {
    en: "No results found", vi: "Không tìm thấy kết quả", zh: "未找到结果", ja: "結果が見つかりません", ko: "결과를 찾을 수 없습니다",
    th: "ไม่พบผลลัพธ์", fr: "Aucun résultat trouvé", de: "Keine Ergebnisse gefunden", es: "No se encontraron resultados",
    pt: "Nenhum resultado encontrado", ru: "Результаты не найдены", ar: "لم يتم العثور على نتائج", hi: "कोई परिणाम नहीं मिला"
  },
  "search.user": {
    en: "User", vi: "Người dùng", zh: "用户", ja: "ユーザー", ko: "사용자",
    th: "ผู้ใช้", fr: "Utilisateur", de: "Benutzer", es: "Usuario",
    pt: "Usuário", ru: "Пользователь", ar: "مستخدم", hi: "उपयोगकर्ता"
  },

  // Common
  "common.loading": {
    en: "Loading...", vi: "Đang tải...", zh: "加载中...", ja: "読み込み中...", ko: "로딩 중...",
    th: "กำลังโหลด...", fr: "Chargement...", de: "Wird geladen...", es: "Cargando...",
    pt: "Carregando...", ru: "Загрузка...", ar: "جارٍ التحميل...", hi: "लोड हो रहा है..."
  },
  "common.error": {
    en: "Error", vi: "Lỗi", zh: "错误", ja: "エラー", ko: "오류",
    th: "ข้อผิดพลาด", fr: "Erreur", de: "Fehler", es: "Error",
    pt: "Erro", ru: "Ошибка", ar: "خطأ", hi: "त्रुटि"
  },
  "common.cancel": {
    en: "Cancel", vi: "Hủy", zh: "取消", ja: "キャンセル", ko: "취소",
    th: "ยกเลิก", fr: "Annuler", de: "Abbrechen", es: "Cancelar",
    pt: "Cancelar", ru: "Отмена", ar: "إلغاء", hi: "रद्द करें"
  },
  "common.save": {
    en: "Save", vi: "Lưu", zh: "保存", ja: "保存", ko: "저장",
    th: "บันทึก", fr: "Enregistrer", de: "Speichern", es: "Guardar",
    pt: "Salvar", ru: "Сохранить", ar: "حفظ", hi: "सहेजें"
  },
  "common.delete": {
    en: "Delete", vi: "Xóa", zh: "删除", ja: "削除", ko: "삭제",
    th: "ลบ", fr: "Supprimer", de: "Löschen", es: "Eliminar",
    pt: "Excluir", ru: "Удалить", ar: "حذف", hi: "हटाएं"
  },
  "common.edit": {
    en: "Edit", vi: "Chỉnh sửa", zh: "编辑", ja: "編集", ko: "편집",
    th: "แก้ไข", fr: "Modifier", de: "Bearbeiten", es: "Editar",
    pt: "Editar", ru: "Редактировать", ar: "تعديل", hi: "संपादित करें"
  },
  "common.close": {
    en: "Close", vi: "Đóng", zh: "关闭", ja: "閉じる", ko: "닫기",
    th: "ปิด", fr: "Fermer", de: "Schließen", es: "Cerrar",
    pt: "Fechar", ru: "Закрыть", ar: "إغلاق", hi: "बंद करें"
  },
  "common.settings": {
    en: "Interface Settings", vi: "Cài đặt giao diện", zh: "界面设置", ja: "インターフェース設定", ko: "인터페이스 설정",
    th: "การตั้งค่าอินเทอร์เฟซ", fr: "Paramètres de l'interface", de: "Oberflächeneinstellungen", es: "Configuración de interfaz",
    pt: "Configurações de interface", ru: "Настройки интерфейса", ar: "إعدادات الواجهة", hi: "इंटरफ़ेस सेटिंग्स"
  },
  "common.login": {
    en: "Login", vi: "Đăng Nhập", zh: "登录", ja: "ログイン", ko: "로그인",
    th: "เข้าสู่ระบบ", fr: "Connexion", de: "Anmelden", es: "Iniciar sesión",
    pt: "Entrar", ru: "Войти", ar: "تسجيل الدخول", hi: "लॉगिन"
  },
  "common.donate": {
    en: "Donate", vi: "Quyên Góp", zh: "捐赠", ja: "寄付", ko: "기부",
    th: "บริจาค", fr: "Faire un don", de: "Spenden", es: "Donar",
    pt: "Doar", ru: "Пожертвовать", ar: "تبرع", hi: "दान करें"
  },
  "common.connectWallet": {
    en: "Connect Wallet", vi: "Kết nối ví", zh: "连接钱包", ja: "ウォレットを接続", ko: "지갑 연결",
    th: "เชื่อมต่อกระเป๋าเงิน", fr: "Connecter le portefeuille", de: "Wallet verbinden", es: "Conectar billetera",
    pt: "Conectar carteira", ru: "Подключить кошелек", ar: "ربط المحفظة", hi: "वॉलेट कनेक्ट करें"
  },
  "common.walletPrefix": {
    en: "Wallet:", vi: "Ví:", zh: "钱包：", ja: "ウォレット：", ko: "지갑:",
    th: "กระเป๋าเงิน:", fr: "Portefeuille :", de: "Wallet:", es: "Billetera:",
    pt: "Carteira:", ru: "Кошелек:", ar: "المحفظة:", hi: "वॉलेट:"
  },

  // User menu
  "user.profile": {
    en: "Personal Profile", vi: "Hồ sơ cá nhân", zh: "个人资料", ja: "個人プロフィール", ko: "개인 프로필",
    th: "โปรไฟล์ส่วนตัว", fr: "Profil personnel", de: "Persönliches Profil", es: "Perfil personal",
    pt: "Perfil pessoal", ru: "Личный профиль", ar: "الملف الشخصي", hi: "व्यक्तिगत प्रोफ़ाइल"
  },
  "user.wallet": {
    en: "Show Wallet", vi: "Thể hiện ví", zh: "显示钱包", ja: "ウォレットを表示", ko: "지갑 표시",
    th: "แสดงกระเป๋าเงิน", fr: "Afficher le portefeuille", de: "Wallet anzeigen", es: "Mostrar billetera",
    pt: "Mostrar carteira", ru: "Показать кошелек", ar: "عرض المحفظة", hi: "वॉलेट दिखाएं"
  },
  "user.logout": {
    en: "Logout", vi: "Đăng xuất", zh: "退出登录", ja: "ログアウト", ko: "로그아웃",
    th: "ออกจากระบบ", fr: "Déconnexion", de: "Abmelden", es: "Cerrar sesión",
    pt: "Sair", ru: "Выйти", ar: "تسجيل الخروج", hi: "लॉगआउट"
  },

  // Hero Section
  "hero.badge": {
    en: "Transparent Charity Platform 💛", vi: "Nền Tảng Từ Thiện Minh Bạch 💛", zh: "透明慈善平台 💛", ja: "透明なチャリティプラットフォーム 💛", ko: "투명한 자선 플랫폼 💛",
    th: "แพลตฟอร์มการกุศลที่โปร่งใส 💛", fr: "Plateforme Caritative Transparente 💛", de: "Transparente Wohltätigkeitsplattform 💛", es: "Plataforma Benéfica Transparente 💛",
    pt: "Plataforma de Caridade Transparente 💛", ru: "Прозрачная благотворительная платформа 💛", ar: "منصة خيرية شفافة 💛", hi: "पारदर्शी दान मंच 💛"
  },
  "hero.quote": {
    en: "Where every heart is recognized, every help is pure and touches the soul.", vi: "Nơi mỗi tấm lòng đều được ghi nhận, mỗi sự giúp đỡ đều trong sáng và chạm đến trái tim.", zh: "每一颗心都被铭记，每一份帮助都纯粹而触动灵魂。", ja: "すべての心が認められ、すべての助けが純粋で魂に触れる場所。", ko: "모든 마음이 인정받고, 모든 도움이 순수하며 영혼에 닿는 곳.",
    th: "ที่ซึ่งทุกหัวใจได้รับการยอมรับ ทุกความช่วยเหลือบริสุทธิ์และสัมผัสจิตวิญญาณ", fr: "Où chaque cœur est reconnu, chaque aide est pure et touche l'âme.", de: "Wo jedes Herz anerkannt wird, jede Hilfe rein ist und die Seele berührt.", es: "Donde cada corazón es reconocido, cada ayuda es pura y toca el alma.",
    pt: "Onde cada coração é reconhecido, cada ajuda é pura e toca a alma.", ru: "Где каждое сердце признано, каждая помощь чиста и трогает душу.", ar: "حيث يُعترف بكل قلب، وكل مساعدة نقية وتلامس الروح.", hi: "जहां हर दिल को पहचाना जाता है, हर मदद शुद्ध है और आत्मा को छूती है।"
  },
  "hero.slogan": {
    en: "💖 Giving is happiness. Transparency is trust. 💖", vi: "💖 Cho đi là hạnh phúc. Minh bạch là niềm tin. 💖", zh: "💖 给予就是幸福。透明就是信任。💖", ja: "💖 与えることは幸せ。透明性は信頼。💖", ko: "💖 나눔은 행복입니다. 투명성은 신뢰입니다. 💖",
    th: "💖 การให้คือความสุข ความโปร่งใสคือความไว้วางใจ 💖", fr: "💖 Donner c'est le bonheur. La transparence c'est la confiance. 💖", de: "💖 Geben ist Glück. Transparenz ist Vertrauen. 💖", es: "💖 Dar es felicidad. Transparencia es confianza. 💖",
    pt: "💖 Dar é felicidade. Transparência é confiança. 💖", ru: "💖 Давать — это счастье. Прозрачность — это доверие. 💖", ar: "💖 العطاء سعادة. الشفافية ثقة. 💖", hi: "💖 देना खुशी है। पारदर्शिता विश्वास है। 💖"
  },
  "hero.spreadLove": {
    en: "Spread Love", vi: "Lan Tỏa Yêu Thương", zh: "传播爱心", ja: "愛を広げる", ko: "사랑을 나누다",
    th: "เผยแพร่ความรัก", fr: "Répandre l'amour", de: "Liebe verbreiten", es: "Difundir amor",
    pt: "Espalhar amor", ru: "Распространяйте любовь", ar: "انشر الحب", hi: "प्यार फैलाएं"
  },
  "hero.signUpLogin": {
    en: "Sign Up / Login", vi: "Đăng Ký / Đăng Nhập", zh: "注册 / 登录", ja: "登録 / ログイン", ko: "가입 / 로그인",
    th: "สมัคร / เข้าสู่ระบบ", fr: "S'inscrire / Connexion", de: "Registrieren / Anmelden", es: "Registrarse / Iniciar sesión",
    pt: "Cadastrar / Entrar", ru: "Регистрация / Вход", ar: "التسجيل / الدخول", hi: "साइन अप / लॉगिन"
  },
  "hero.pillar1Title": {
    en: "💞 Love Connection", vi: "💞 Kết Nối Yêu Thương", zh: "💞 爱心连接", ja: "💞 愛のつながり", ko: "💞 사랑의 연결",
    th: "💞 เชื่อมต่อด้วยความรัก", fr: "💞 Connexion d'amour", de: "💞 Liebesverbindung", es: "💞 Conexión de amor",
    pt: "💞 Conexão de amor", ru: "💞 Связь любви", ar: "💞 ربط المحبة", hi: "💞 प्रेम का संबंध"
  },
  "hero.pillar1Desc": {
    en: "We connect kind hearts with those in need – instantly, warmly", vi: "Mình kết nối những tấm lòng nhân ái với những hoàn cảnh cần giúp đỡ – tức thì, ấm áp", zh: "我们将善心与需要帮助的人连接起来 – 即时、温暖", ja: "私たちは優しい心を必要とする人々とつなげます – 即座に、温かく", ko: "우리는 따뜻한 마음을 도움이 필요한 사람들과 연결합니다 – 즉시, 따뜻하게",
    th: "เราเชื่อมต่อหัวใจที่ดีกับผู้ที่ต้องการความช่วยเหลือ – ทันที อบอุ่น", fr: "Nous connectons les cœurs généreux avec ceux qui en ont besoin – instantanément, chaleureusement", de: "Wir verbinden freundliche Herzen mit Bedürftigen – sofort, herzlich", es: "Conectamos corazones bondadosos con quienes lo necesitan – instantáneamente, cálidamente",
    pt: "Conectamos corações bondosos com quem precisa – instantaneamente, acolhedoramente", ru: "Мы связываем добрые сердца с нуждающимися – мгновенно, тепло", ar: "نربط القلوب الطيبة بمن يحتاجون – فورياً، بدفء", hi: "हम दयालु दिलों को जरूरतमंदों से जोड़ते हैं – तुरंत, गर्मजोशी से"
  },
  "hero.pillar2Title": {
    en: "🤝 Sharing Community", vi: "🤝 Cộng Đồng Chia Sẻ", zh: "🤝 分享社区", ja: "🤝 共有コミュニティ", ko: "🤝 나눔 커뮤니티",
    th: "🤝 ชุมชนแห่งการแบ่งปัน", fr: "🤝 Communauté de partage", de: "🤝 Teilen-Gemeinschaft", es: "🤝 Comunidad de compartir",
    pt: "🤝 Comunidade de compartilhamento", ru: "🤝 Сообщество обмена", ar: "🤝 مجتمع المشاركة", hi: "🤝 साझा करने का समुदाय"
  },
  "hero.pillar2Desc": {
    en: "Share together, encourage and spread beautiful stories every day", vi: "Cùng nhau chia sẻ, động viên và lan tỏa những câu chuyện đẹp mỗi ngày", zh: "一起分享、鼓励并每天传播美丽的故事", ja: "一緒に共有し、励まし、毎日美しい物語を広めましょう", ko: "함께 나누고, 격려하고, 매일 아름다운 이야기를 전파합니다",
    th: "แบ่งปันด้วยกัน ให้กำลังใจ และเผยแพร่เรื่องราวดีๆ ทุกวัน", fr: "Partageons ensemble, encourageons et répandons de belles histoires chaque jour", de: "Gemeinsam teilen, ermutigen und jeden Tag schöne Geschichten verbreiten", es: "Compartir juntos, animar y difundir historias hermosas cada día",
    pt: "Compartilhar juntos, encorajar e espalhar histórias bonitas todos os dias", ru: "Делимся вместе, вдохновляем и распространяем красивые истории каждый день", ar: "نتشارك معاً، نشجع وننشر القصص الجميلة كل يوم", hi: "साथ मिलकर साझा करें, प्रोत्साहित करें और हर दिन सुंदर कहानियां फैलाएं"
  },
  "hero.pillar3Title": {
    en: "✨ Absolute Transparency", vi: "✨ Minh Bạch Tuyệt Đối", zh: "✨ 绝对透明", ja: "✨ 完全な透明性", ko: "✨ 완전한 투명성",
    th: "✨ ความโปร่งใสอย่างแท้จริง", fr: "✨ Transparence absolue", de: "✨ Absolute Transparenz", es: "✨ Transparencia absoluta",
    pt: "✨ Transparência absoluta", ru: "✨ Абсолютная прозрачность", ar: "✨ شفافية مطلقة", hi: "✨ पूर्ण पारदर्शिता"
  },
  "hero.pillar3Desc": {
    en: "Every penny is recorded clearly – you feel secure, recipients feel warm", vi: "Mọi đồng tiền đều được ghi nhận rõ ràng – bạn yên tâm, người nhận được ấm lòng", zh: "每一分钱都清晰记录 – 您安心，受助者温暖", ja: "すべてのお金は明確に記録されます – あなたは安心、受け取る人は温かい", ko: "모든 금액이 명확하게 기록됩니다 – 당신은 안심, 받는 사람은 따뜻함",
    th: "ทุกบาททุกสตางค์ถูกบันทึกอย่างชัดเจน – คุณมั่นใจ ผู้รับอบอุ่นใจ", fr: "Chaque centime est enregistré clairement – vous êtes en sécurité, les bénéficiaires sont réchauffés", de: "Jeder Cent wird klar aufgezeichnet – Sie fühlen sich sicher, Empfänger fühlen sich warm", es: "Cada centavo se registra claramente – te sientes seguro, los receptores se sienten cálidos",
    pt: "Cada centavo é registrado claramente – você se sente seguro, os destinatários se sentem acolhidos", ru: "Каждая копейка четко записывается – вы спокойны, получатели чувствуют тепло", ar: "كل قرش مسجل بوضوح – تشعر بالأمان، والمستفيدون يشعرون بالدفء", hi: "हर पैसे को स्पष्ट रूप से दर्ज किया जाता है – आप सुरक्षित महसूस करते हैं, प्राप्तकर्ता गर्माहट महसूस करते हैं"
  },
  "hero.stat1": {
    en: "Love Spread", vi: "Yêu Thương Lan Tỏa", zh: "爱心传播", ja: "愛の広がり", ko: "사랑 확산",
    th: "ความรักแผ่ขยาย", fr: "Amour répandu", de: "Liebe verbreitet", es: "Amor difundido",
    pt: "Amor espalhado", ru: "Распространённая любовь", ar: "الحب المنتشر", hi: "प्यार फैला"
  },
  "hero.stat2": {
    en: "Dreams Fulfilled", vi: "Ước Mơ Được Chắp Cánh", zh: "梦想实现", ja: "夢の実現", ko: "꿈 실현",
    th: "ความฝันที่เป็นจริง", fr: "Rêves réalisés", de: "Träume erfüllt", es: "Sueños cumplidos",
    pt: "Sonhos realizados", ru: "Мечты исполнены", ar: "تحقيق الأحلام", hi: "सपने पूरे हुए"
  },
  "hero.stat3": {
    en: "Golden Hearts", vi: "Tấm Lòng Vàng", zh: "金心", ja: "ゴールデンハート", ko: "황금 마음",
    th: "หัวใจทอง", fr: "Cœurs d'or", de: "Goldene Herzen", es: "Corazones de oro",
    pt: "Corações de ouro", ru: "Золотые сердца", ar: "قلوب ذهبية", hi: "सुनहरे दिल"
  },
  "hero.stat4": {
    en: "Countries Connected", vi: "Quốc Gia Kết Nối", zh: "连接国家", ja: "接続された国", ko: "연결된 국가",
    th: "ประเทศที่เชื่อมต่อ", fr: "Pays connectés", de: "Verbundene Länder", es: "Países conectados",
    pt: "Países conectados", ru: "Связанные страны", ar: "الدول المتصلة", hi: "जुड़े देश"
  },

  // About Section
  "about.fromOurHeart": {
    en: "From Our Heart", vi: "Từ Trái Tim Chúng Mình", zh: "来自我们的心", ja: "私たちの心から", ko: "우리 마음에서",
    th: "จากใจเรา", fr: "De notre cœur", de: "Von unserem Herzen", es: "Desde nuestro corazón",
    pt: "Do nosso coração", ru: "От нашего сердца", ar: "من قلوبنا", hi: "हमारे दिल से"
  },
  "about.title": {
    en: "About Fun Charity", vi: "Về Fun Charity", zh: "关于Fun Charity", ja: "Fun Charityについて", ko: "Fun Charity 소개",
    th: "เกี่ยวกับ Fun Charity", fr: "À propos de Fun Charity", de: "Über Fun Charity", es: "Sobre Fun Charity",
    pt: "Sobre Fun Charity", ru: "О Fun Charity", ar: "عن Fun Charity", hi: "Fun Charity के बारे में"
  },
  "about.description": {
    en: "Fun Charity is the home of loving hearts — where humanity, joy and happiness are shared. We believe that when you give from the heart, you not only help others but also receive true happiness. Every small action can create miracles! ✨", 
    vi: "Fun Charity là ngôi nhà của những trái tim yêu thương — nơi tình người, niềm vui và hạnh phúc được sẻ chia. Chúng mình tin rằng khi cho đi bằng cả trái tim, bạn không chỉ giúp đỡ người khác mà còn nhận lại niềm hạnh phúc thật sự. Mỗi hành động nhỏ đều có thể tạo nên điều kỳ diệu! ✨", 
    zh: "Fun Charity是爱心之家——在这里，人性、欢乐和幸福得以分享。我们相信，当你用心给予时，你不仅帮助他人，也获得真正的幸福。每一个小行动都能创造奇迹！✨", 
    ja: "Fun Charityは愛する心の家です — 人間性、喜び、幸せが分かち合われる場所。心から与えると、他の人を助けるだけでなく、本当の幸せを受け取ることができると信じています。すべての小さな行動が奇跡を起こすことができます！✨", 
    ko: "Fun Charity는 사랑하는 마음의 집입니다 — 인류애, 기쁨, 행복이 나눠지는 곳. 마음에서 우러나와 베풀 때, 다른 사람을 도울 뿐만 아니라 진정한 행복도 받게 된다고 믿습니다. 모든 작은 행동이 기적을 만들 수 있습니다! ✨",
    th: "Fun Charity คือบ้านของหัวใจที่เปี่ยมด้วยความรัก — ที่ซึ่งความเป็นมนุษย์ ความสุข และความเบิกบานถูกแบ่งปัน เราเชื่อว่าเมื่อคุณให้จากใจ คุณไม่เพียงช่วยเหลือผู้อื่น แต่ยังได้รับความสุขที่แท้จริง ทุกการกระทำเล็กๆ สามารถสร้างปาฏิหาริย์ได้! ✨", 
    fr: "Fun Charity est le foyer des cœurs aimants — où l'humanité, la joie et le bonheur sont partagés. Nous croyons que lorsque vous donnez du fond du cœur, vous n'aidez pas seulement les autres mais recevez aussi le vrai bonheur. Chaque petite action peut créer des miracles ! ✨", 
    de: "Fun Charity ist das Zuhause liebender Herzen — wo Menschlichkeit, Freude und Glück geteilt werden. Wir glauben, dass wenn Sie von Herzen geben, Sie nicht nur anderen helfen, sondern auch wahres Glück empfangen. Jede kleine Handlung kann Wunder bewirken! ✨", 
    es: "Fun Charity es el hogar de corazones amorosos — donde la humanidad, la alegría y la felicidad se comparten. Creemos que cuando das desde el corazón, no solo ayudas a otros sino que también recibes verdadera felicidad. ¡Cada pequeña acción puede crear milagros! ✨",
    pt: "Fun Charity é o lar dos corações amorosos — onde humanidade, alegria e felicidade são compartilhados. Acreditamos que quando você dá do coração, não apenas ajuda outros, mas também recebe verdadeira felicidade. Cada pequena ação pode criar milagres! ✨", 
    ru: "Fun Charity — это дом любящих сердец — где человечность, радость и счастье разделяются. Мы верим, что когда вы отдаете от сердца, вы не только помогаете другим, но и получаете настоящее счастье. Каждое маленькое действие может творить чудеса! ✨", 
    ar: "Fun Charity هو بيت القلوب المحبة — حيث يتم مشاركة الإنسانية والفرح والسعادة. نؤمن أنه عندما تعطي من قلبك، فأنت لا تساعد الآخرين فحسب، بل تتلقى السعادة الحقيقية أيضاً. كل عمل صغير يمكن أن يخلق المعجزات! ✨", 
    hi: "Fun Charity प्यार करने वाले दिलों का घर है — जहां मानवता, खुशी और सुख साझा किए जाते हैं। हम मानते हैं कि जब आप दिल से देते हैं, तो आप न केवल दूसरों की मदद करते हैं बल्कि सच्ची खुशी भी पाते हैं। हर छोटा कार्य चमत्कार पैदा कर सकता है! ✨"
  },
  "about.ourWish": {
    en: "Our Wish", vi: "Chúng Mình Mong Muốn", zh: "我们的愿望", ja: "私たちの願い", ko: "우리의 소망",
    th: "ความปรารถนาของเรา", fr: "Notre souhait", de: "Unser Wunsch", es: "Nuestro deseo",
    pt: "Nosso desejo", ru: "Наше желание", ar: "أمنيتنا", hi: "हमारी इच्छा"
  },
  "about.ourDream": {
    en: "Our Dream", vi: "Ước Mơ Của Chúng Mình", zh: "我们的梦想", ja: "私たちの夢", ko: "우리의 꿈",
    th: "ความฝันของเรา", fr: "Notre rêve", de: "Unser Traum", es: "Nuestro sueño",
    pt: "Nosso sonho", ru: "Наша мечта", ar: "حلمنا", hi: "हमारा सपना"
  },

  // CTA Section
  "cta.wantToShare": {
    en: "Want to Share? 💕", vi: "Bạn Muốn Sẻ Chia? 💕", zh: "想要分享？💕", ja: "シェアしたいですか？💕", ko: "나누고 싶으세요? 💕",
    th: "อยากแบ่งปันไหม? 💕", fr: "Vous voulez partager ? 💕", de: "Möchten Sie teilen? 💕", es: "¿Quieres compartir? 💕",
    pt: "Quer compartilhar? 💕", ru: "Хотите поделиться? 💕", ar: "تريد المشاركة؟ 💕", hi: "साझा करना चाहते हैं? 💕"
  },
  "cta.shareDesc": {
    en: "Send love and see every smile created. Receive joy and cute badges!", vi: "Gửi đi yêu thương và xem từng nụ cười được tạo ra. Nhận lại niềm vui và huy hiệu dễ thương!", zh: "送出爱心，看到每一个微笑被创造。收获快乐和可爱的徽章！", ja: "愛を送り、作られた笑顔を見てください。喜びとかわいいバッジを受け取りましょう！", ko: "사랑을 보내고 만들어진 모든 미소를 보세요. 기쁨과 귀여운 배지를 받으세요!",
    th: "ส่งความรักและเห็นทุกรอยยิ้มที่สร้างขึ้น รับความสุขและป้ายน่ารัก!", fr: "Envoyez de l'amour et voyez chaque sourire créé. Recevez de la joie et des badges mignons !", de: "Senden Sie Liebe und sehen Sie jedes Lächeln, das entsteht. Erhalten Sie Freude und süße Abzeichen!", es: "Envía amor y ve cada sonrisa creada. ¡Recibe alegría e insignias lindas!",
    pt: "Envie amor e veja cada sorriso criado. Receba alegria e distintivos fofos!", ru: "Отправляйте любовь и смотрите на каждую созданную улыбку. Получайте радость и милые значки!", ar: "أرسل الحب وشاهد كل ابتسامة تُصنع. احصل على الفرح والشارات اللطيفة!", hi: "प्यार भेजें और बनाई गई हर मुस्कान देखें। खुशी और प्यारे बैज पाएं!"
  },
  "cta.startGiving": {
    en: "Start Giving", vi: "Bắt Đầu Cho Đi", zh: "开始给予", ja: "与え始める", ko: "나눔 시작하기",
    th: "เริ่มต้นให้", fr: "Commencer à donner", de: "Anfangen zu geben", es: "Empezar a dar",
    pt: "Começar a dar", ru: "Начать давать", ar: "ابدأ العطاء", hi: "देना शुरू करें"
  },
  "cta.haveTime": {
    en: "Have Time? ✨", vi: "Bạn Có Thời Gian? ✨", zh: "有时间吗？✨", ja: "時間がありますか？✨", ko: "시간이 있으세요? ✨",
    th: "มีเวลาไหม? ✨", fr: "Vous avez du temps ? ✨", de: "Haben Sie Zeit? ✨", es: "¿Tienes tiempo? ✨",
    pt: "Tem tempo? ✨", ru: "Есть время? ✨", ar: "لديك وقت؟ ✨", hi: "समय है? ✨"
  },
  "cta.volunteerDesc": {
    en: "Volunteer with us! Learn new things, make new friends and create beautiful memories.", vi: "Cùng mình làm tình nguyện nhé! Học thêm điều mới, có thêm bạn bè và tạo kỷ niệm đẹp.", zh: "和我们一起做志愿者！学习新事物，结交新朋友，创造美好回忆。", ja: "私たちと一緒にボランティアしましょう！新しいことを学び、新しい友達を作り、美しい思い出を作りましょう。", ko: "우리와 함께 자원봉사하세요! 새로운 것을 배우고, 새 친구를 사귀고, 아름다운 추억을 만드세요.",
    th: "มาเป็นอาสาสมัครกับเรา! เรียนรู้สิ่งใหม่ หาเพื่อนใหม่ และสร้างความทรงจำที่สวยงาม", fr: "Faites du bénévolat avec nous ! Apprenez de nouvelles choses, faites-vous de nouveaux amis et créez de beaux souvenirs.", de: "Werden Sie Freiwilliger bei uns! Lernen Sie neue Dinge, finden Sie neue Freunde und schaffen Sie schöne Erinnerungen.", es: "¡Sé voluntario con nosotros! Aprende cosas nuevas, haz nuevos amigos y crea hermosos recuerdos.",
    pt: "Seja voluntário conosco! Aprenda coisas novas, faça novos amigos e crie belas memórias.", ru: "Станьте волонтером вместе с нами! Узнавайте новое, заводите новых друзей и создавайте прекрасные воспоминания.", ar: "تطوع معنا! تعلم أشياء جديدة، كوّن صداقات جديدة واصنع ذكريات جميلة.", hi: "हमारे साथ स्वयंसेवक बनें! नई चीजें सीखें, नए दोस्त बनाएं और सुंदर यादें बनाएं।"
  },
  "cta.joinUs": {
    en: "Join Us", vi: "Tham Gia Cùng Mình", zh: "加入我们", ja: "参加する", ko: "함께하기",
    th: "เข้าร่วมกับเรา", fr: "Rejoignez-nous", de: "Machen Sie mit", es: "Únete a nosotros",
    pt: "Junte-se a nós", ru: "Присоединяйтесь к нам", ar: "انضم إلينا", hi: "हमसे जुड़ें"
  },
  "cta.areOrganization": {
    en: "Are You an Organization? 🏢", vi: "Bạn Là Tổ Chức? 🏢", zh: "您是组织吗？🏢", ja: "あなたは組織ですか？🏢", ko: "조직이세요? 🏢",
    th: "คุณเป็นองค์กรหรือไม่? 🏢", fr: "Êtes-vous une organisation ? 🏢", de: "Sind Sie eine Organisation? 🏢", es: "¿Eres una organización? 🏢",
    pt: "Você é uma organização? 🏢", ru: "Вы организация? 🏢", ar: "هل أنت منظمة؟ 🏢", hi: "क्या आप एक संगठन हैं? 🏢"
  },
  "cta.orgDesc": {
    en: "Create campaigns, build trust with the community. Together we spread greater love!", vi: "Tạo chiến dịch, xây dựng niềm tin với cộng đồng. Cùng nhau lan tỏa yêu thương lớn hơn!", zh: "创建活动，与社区建立信任。一起传播更大的爱！", ja: "キャンペーンを作成し、コミュニティとの信頼を築きましょう。一緒により大きな愛を広げましょう！", ko: "캠페인을 만들고 커뮤니티와 신뢰를 구축하세요. 함께 더 큰 사랑을 전파합시다!",
    th: "สร้างแคมเปญ สร้างความไว้วางใจกับชุมชน ร่วมกันเผยแพร่ความรักที่ยิ่งใหญ่กว่า!", fr: "Créez des campagnes, établissez la confiance avec la communauté. Ensemble, répandons un amour plus grand !", de: "Erstellen Sie Kampagnen, bauen Sie Vertrauen in der Gemeinschaft auf. Zusammen verbreiten wir größere Liebe!", es: "Crea campañas, construye confianza con la comunidad. ¡Juntos difundimos un amor mayor!",
    pt: "Crie campanhas, construa confiança com a comunidade. Juntos espalhamos um amor maior!", ru: "Создавайте кампании, стройте доверие с сообществом. Вместе мы распространяем большую любовь!", ar: "أنشئ حملات، ابنِ الثقة مع المجتمع. معاً ننشر حباً أكبر!", hi: "अभियान बनाएं, समुदाय के साथ विश्वास बनाएं। साथ मिलकर हम बड़ा प्यार फैलाते हैं!"
  },
  "cta.registerNow": {
    en: "Register Now", vi: "Đăng Ký Ngay", zh: "立即注册", ja: "今すぐ登録", ko: "지금 등록",
    th: "ลงทะเบียนเลย", fr: "S'inscrire maintenant", de: "Jetzt registrieren", es: "Regístrate ahora",
    pt: "Cadastre-se agora", ru: "Зарегистрироваться сейчас", ar: "سجل الآن", hi: "अभी पंजीकरण करें"
  },
  "cta.ready": {
    en: "Hey, Ready to Spread Love? 💖", vi: "Bạn Ơi, Sẵn Sàng Lan Tỏa Yêu Thương Chưa? 💖", zh: "嘿，准备好传播爱了吗？💖", ja: "ねえ、愛を広げる準備はできましたか？💖", ko: "준비됐나요, 사랑을 나눌? 💖",
    th: "เฮ้ พร้อมเผยแพร่ความรักหรือยัง? 💖", fr: "Hé, prêt à répandre l'amour ? 💖", de: "Hey, bereit Liebe zu verbreiten? 💖", es: "Oye, ¿listo para difundir amor? 💖",
    pt: "Ei, pronto para espalhar amor? 💖", ru: "Эй, готовы распространять любовь? 💖", ar: "مرحباً، مستعد لنشر الحب؟ 💖", hi: "अरे, प्यार फैलाने के लिए तैयार? 💖"
  },
  "cta.thousandHearts": {
    en: "Thousands of warm hearts are waiting for you! Together, we will create miracles every day.", vi: "Hàng nghìn trái tim ấm áp đang chờ đón bạn! Cùng nhau, chúng ta sẽ tạo nên những điều kỳ diệu mỗi ngày.", zh: "成千上万颗温暖的心在等着你！我们一起，每天创造奇迹。", ja: "何千もの温かい心があなたを待っています！一緒に、毎日奇跡を起こしましょう。", ko: "수천 개의 따뜻한 마음이 당신을 기다리고 있습니다! 함께, 우리는 매일 기적을 만들 것입니다.",
    th: "หัวใจอบอุ่นหลายพันดวงกำลังรอคุณอยู่! ด้วยกัน เราจะสร้างปาฏิหาริย์ทุกวัน", fr: "Des milliers de cœurs chaleureux vous attendent ! Ensemble, nous créerons des miracles chaque jour.", de: "Tausende warme Herzen warten auf Sie! Zusammen werden wir jeden Tag Wunder schaffen.", es: "¡Miles de corazones cálidos te esperan! Juntos, crearemos milagros cada día.",
    pt: "Milhares de corações calorosos estão esperando por você! Juntos, criaremos milagres todos os dias.", ru: "Тысячи теплых сердец ждут вас! Вместе мы будем творить чудеса каждый день.", ar: "آلاف القلوب الدافئة تنتظرك! معاً، سنصنع المعجزات كل يوم.", hi: "हजारों गर्मजोशी भरे दिल आपका इंतजार कर रहे हैं! साथ मिलकर, हम हर दिन चमत्कार करेंगे।"
  },
  "cta.givingIsReceiving": {
    en: "Giving is receiving. Loving is happiness. ✨", vi: "Cho đi là nhận lại. Yêu thương là hạnh phúc. ✨", zh: "给予就是获得。爱就是幸福。✨", ja: "与えることは受け取ること。愛することは幸せ。✨", ko: "나눔은 받는 것입니다. 사랑은 행복입니다. ✨",
    th: "การให้คือการรับ รักคือความสุข ✨", fr: "Donner c'est recevoir. Aimer c'est le bonheur. ✨", de: "Geben ist Empfangen. Lieben ist Glück. ✨", es: "Dar es recibir. Amar es felicidad. ✨",
    pt: "Dar é receber. Amar é felicidade. ✨", ru: "Давать — значит получать. Любить — значит быть счастливым. ✨", ar: "العطاء هو الأخذ. الحب هو السعادة. ✨", hi: "देना पाना है। प्यार करना खुशी है। ✨"
  },
  "cta.exploreCampaigns": {
    en: "Explore Campaigns", vi: "Khám Phá Chiến Dịch", zh: "探索活动", ja: "キャンペーンを探す", ko: "캠페인 탐색",
    th: "สำรวจแคมเปญ", fr: "Explorer les campagnes", de: "Kampagnen erkunden", es: "Explorar campañas",
    pt: "Explorar campanhas", ru: "Изучить кампании", ar: "استكشف الحملات", hi: "अभियान देखें"
  },
  "cta.connectWallet": {
    en: "Connect Wallet", vi: "Kết Nối Ví", zh: "连接钱包", ja: "ウォレットを接続", ko: "지갑 연결",
    th: "เชื่อมต่อกระเป๋าเงิน", fr: "Connecter le portefeuille", de: "Wallet verbinden", es: "Conectar billetera",
    pt: "Conectar carteira", ru: "Подключить кошелек", ar: "ربط المحفظة", hi: "वॉलेट कनेक्ट करें"
  },

  // Footer
  "footer.platform": {
    en: "Platform 🏠", vi: "Nền Tảng 🏠", zh: "平台 🏠", ja: "プラットフォーム 🏠", ko: "플랫폼 🏠",
    th: "แพลตฟอร์ม 🏠", fr: "Plateforme 🏠", de: "Plattform 🏠", es: "Plataforma 🏠",
    pt: "Plataforma 🏠", ru: "Платформа 🏠", ar: "المنصة 🏠", hi: "प्लेटफॉर्म 🏠"
  },
  "footer.community": {
    en: "Community 💞", vi: "Cộng Đồng 💞", zh: "社区 💞", ja: "コミュニティ 💞", ko: "커뮤니티 💞",
    th: "ชุมชน 💞", fr: "Communauté 💞", de: "Gemeinschaft 💞", es: "Comunidad 💞",
    pt: "Comunidade 💞", ru: "Сообщество 💞", ar: "المجتمع 💞", hi: "समुदाय 💞"
  },
  "footer.support": {
    en: "Support 📚", vi: "Hỗ Trợ 📚", zh: "支持 📚", ja: "サポート 📚", ko: "지원 📚",
    th: "การสนับสนุน 📚", fr: "Support 📚", de: "Unterstützung 📚", es: "Soporte 📚",
    pt: "Suporte 📚", ru: "Поддержка 📚", ar: "الدعم 📚", hi: "सहायता 📚"
  },
  "footer.legal": {
    en: "Legal 📋", vi: "Pháp Lý 📋", zh: "法律 📋", ja: "法的事項 📋", ko: "법적 사항 📋",
    th: "กฎหมาย 📋", fr: "Légal 📋", de: "Rechtliches 📋", es: "Legal 📋",
    pt: "Jurídico 📋", ru: "Юридическая информация 📋", ar: "قانوني 📋", hi: "कानूनी 📋"
  },
  "footer.aboutUs": {
    en: "About Us", vi: "Giới Thiệu Về Mình", zh: "关于我们", ja: "私たちについて", ko: "우리 소개",
    th: "เกี่ยวกับเรา", fr: "À propos de nous", de: "Über uns", es: "Sobre nosotros",
    pt: "Sobre nós", ru: "О нас", ar: "معلومات عنا", hi: "हमारे बारे में"
  },
  "footer.charityCampaigns": {
    en: "Charity Campaigns", vi: "Chiến Dịch Từ Thiện", zh: "慈善活动", ja: "チャリティキャンペーン", ko: "자선 캠페인",
    th: "แคมเปญการกุศล", fr: "Campagnes caritatives", de: "Wohltätigkeitskampagnen", es: "Campañas benéficas",
    pt: "Campanhas de caridade", ru: "Благотворительные кампании", ar: "حملات خيرية", hi: "दान अभियान"
  },
  "footer.needsMap": {
    en: "Needs Map", vi: "Bản Đồ Nhu Cầu", zh: "需求地图", ja: "ニーズマップ", ko: "필요 지도",
    th: "แผนที่ความต้องการ", fr: "Carte des besoins", de: "Bedarfskarte", es: "Mapa de necesidades",
    pt: "Mapa de necessidades", ru: "Карта потребностей", ar: "خريطة الاحتياجات", hi: "आवश्यकता मानचित्र"
  },
  "footer.activityOverview": {
    en: "Activity Overview", vi: "Tổng Quan Hoạt Động", zh: "活动概览", ja: "活動概要", ko: "활동 개요",
    th: "ภาพรวมกิจกรรม", fr: "Aperçu des activités", de: "Aktivitätsübersicht", es: "Resumen de actividad",
    pt: "Visão geral de atividades", ru: "Обзор активности", ar: "نظرة عامة على النشاط", hi: "गतिविधि अवलोकन"
  },
  "footer.forDonors": {
    en: "For Donors", vi: "Dành Cho Nhà Hảo Tâm", zh: "致捐赠者", ja: "寄付者の方へ", ko: "기부자를 위한",
    th: "สำหรับผู้บริจาค", fr: "Pour les donateurs", de: "Für Spender", es: "Para donantes",
    pt: "Para doadores", ru: "Для доноров", ar: "للمتبرعين", hi: "दानदाताओं के लिए"
  },
  "footer.forVolunteers": {
    en: "For Volunteers", vi: "Dành Cho Tình Nguyện Viên", zh: "致志愿者", ja: "ボランティアの方へ", ko: "자원봉사자를 위한",
    th: "สำหรับอาสาสมัคร", fr: "Pour les bénévoles", de: "Für Freiwillige", es: "Para voluntarios",
    pt: "Para voluntários", ru: "Для волонтеров", ar: "للمتطوعين", hi: "स्वयंसेवकों के लिए"
  },
  "footer.forOrganizations": {
    en: "For Organizations", vi: "Dành Cho Tổ Chức", zh: "致组织", ja: "組織の方へ", ko: "조직을 위한",
    th: "สำหรับองค์กร", fr: "Pour les organisations", de: "Für Organisationen", es: "Para organizaciones",
    pt: "Para organizações", ru: "Для организаций", ar: "للمنظمات", hi: "संगठनों के लिए"
  },
  "footer.leaderboard": {
    en: "Leaderboard", vi: "Bảng Vinh Danh", zh: "排行榜", ja: "リーダーボード", ko: "리더보드",
    th: "กระดานผู้นำ", fr: "Classement", de: "Bestenliste", es: "Tabla de clasificación",
    pt: "Classificação", ru: "Таблица лидеров", ar: "لوحة المتصدرين", hi: "लीडरबोर्ड"
  },
  "footer.userGuide": {
    en: "User Guide", vi: "Hướng Dẫn Sử Dụng", zh: "用户指南", ja: "ユーザーガイド", ko: "사용자 가이드",
    th: "คู่มือผู้ใช้", fr: "Guide de l'utilisateur", de: "Benutzerhandbuch", es: "Guía del usuario",
    pt: "Guia do usuário", ru: "Руководство пользователя", ar: "دليل المستخدم", hi: "उपयोगकर्ता गाइड"
  },
  "footer.blockchainTransparency": {
    en: "Blockchain Transparency", vi: "Minh Bạch Blockchain", zh: "区块链透明度", ja: "ブロックチェーンの透明性", ko: "블록체인 투명성",
    th: "ความโปร่งใสบล็อกเชน", fr: "Transparence Blockchain", de: "Blockchain-Transparenz", es: "Transparencia Blockchain",
    pt: "Transparência Blockchain", ru: "Прозрачность блокчейна", ar: "شفافية البلوكتشين", hi: "ब्लॉकचेन पारदर्शिता"
  },
  "footer.blog": {
    en: "Blog", vi: "Blog Chia Sẻ", zh: "博客", ja: "ブログ", ko: "블로그",
    th: "บล็อก", fr: "Blog", de: "Blog", es: "Blog",
    pt: "Blog", ru: "Блог", ar: "المدونة", hi: "ब्लॉग"
  },
  "footer.contactSupport": {
    en: "Contact Support", vi: "Liên Hệ Hỗ Trợ", zh: "联系支持", ja: "サポートに連絡", ko: "지원 문의",
    th: "ติดต่อฝ่ายสนับสนุน", fr: "Contacter le support", de: "Support kontaktieren", es: "Contactar soporte",
    pt: "Contatar suporte", ru: "Связаться с поддержкой", ar: "اتصل بالدعم", hi: "सहायता से संपर्क करें"
  },
  "footer.privacyPolicy": {
    en: "Privacy Policy", vi: "Chính Sách Bảo Mật", zh: "隐私政策", ja: "プライバシーポリシー", ko: "개인정보 보호정책",
    th: "นโยบายความเป็นส่วนตัว", fr: "Politique de confidentialité", de: "Datenschutzrichtlinie", es: "Política de privacidad",
    pt: "Política de privacidade", ru: "Политика конфиденциальности", ar: "سياسة الخصوصية", hi: "गोपनीयता नीति"
  },
  "footer.terms": {
    en: "Terms of Use", vi: "Điều Khoản Sử Dụng", zh: "使用条款", ja: "利用規約", ko: "이용약관",
    th: "ข้อกำหนดการใช้งาน", fr: "Conditions d'utilisation", de: "Nutzungsbedingungen", es: "Términos de uso",
    pt: "Termos de uso", ru: "Условия использования", ar: "شروط الاستخدام", hi: "उपयोग की शर्तें"
  },
  "footer.kycRegulations": {
    en: "KYC Regulations", vi: "Quy Định KYC", zh: "KYC规定", ja: "KYC規則", ko: "KYC 규정",
    th: "ระเบียบ KYC", fr: "Réglementations KYC", de: "KYC-Vorschriften", es: "Regulaciones KYC",
    pt: "Regulamentos KYC", ru: "Правила KYC", ar: "لوائح KYC", hi: "KYC नियम"
  },
  "footer.slogan": {
    en: "💛 Giving is happiness. Transparency is trust.", vi: "💛 Cho đi là hạnh phúc. Minh bạch là niềm tin.", zh: "💛 给予就是幸福。透明就是信任。", ja: "💛 与えることは幸せ。透明性は信頼。", ko: "💛 나눔은 행복입니다. 투명성은 신뢰입니다.",
    th: "💛 การให้คือความสุข ความโปร่งใสคือความไว้วางใจ", fr: "💛 Donner c'est le bonheur. La transparence c'est la confiance.", de: "💛 Geben ist Glück. Transparenz ist Vertrauen.", es: "💛 Dar es felicidad. Transparencia es confianza.",
    pt: "💛 Dar é felicidade. Transparência é confiança.", ru: "💛 Давать — это счастье. Прозрачность — это доверие.", ar: "💛 العطاء سعادة. الشفافية ثقة.", hi: "💛 देना खुशी है। पारदर्शिता विश्वास है।"
  },
  "footer.tagline": {
    en: "FUN Charity – Where every heart is recognized, every help is pure and touches the soul.", vi: "FUN Charity – Nơi mỗi tấm lòng đều được ghi nhận, mỗi sự giúp đỡ đều trong sáng và chạm đến trái tim.", zh: "FUN Charity – 每一颗心都被铭记，每一份帮助都纯粹而触动灵魂。", ja: "FUN Charity – すべての心が認められ、すべての助けが純粋で魂に触れる場所。", ko: "FUN Charity – 모든 마음이 인정받고, 모든 도움이 순수하며 영혼에 닿는 곳.",
    th: "FUN Charity – ที่ซึ่งทุกหัวใจได้รับการยอมรับ ทุกความช่วยเหลือบริสุทธิ์และสัมผัสจิตวิญญาณ", fr: "FUN Charity – Où chaque cœur est reconnu, chaque aide est pure et touche l'âme.", de: "FUN Charity – Wo jedes Herz anerkannt wird, jede Hilfe rein ist und die Seele berührt.", es: "FUN Charity – Donde cada corazón es reconocido, cada ayuda es pura y toca el alma.",
    pt: "FUN Charity – Onde cada coração é reconhecido, cada ajuda é pura e toca a alma.", ru: "FUN Charity – Где каждое сердце признано, каждая помощь чиста и трогает душу.", ar: "FUN Charity – حيث يُعترف بكل قلب، وكل مساعدة نقية وتلامس الروح.", hi: "FUN Charity – जहां हर दिल को पहचाना जाता है, हर मदद शुद्ध है और आत्मा को छूती है।"
  },
  "footer.builtWith": {
    en: "Built with love and blockchain technology.", vi: "Được xây dựng với tình yêu và công nghệ blockchain.", zh: "用爱和区块链技术构建。", ja: "愛とブロックチェーン技術で構築。", ko: "사랑과 블록체인 기술로 구축.",
    th: "สร้างด้วยความรักและเทคโนโลยีบล็อกเชน", fr: "Construit avec amour et technologie blockchain.", de: "Mit Liebe und Blockchain-Technologie gebaut.", es: "Construido con amor y tecnología blockchain.",
    pt: "Construído com amor e tecnologia blockchain.", ru: "Создано с любовью и технологией блокчейн.", ar: "بُني بالحب وتقنية البلوكتشين.", hi: "प्यार और ब्लॉकचेन तकनीक से बनाया गया।"
  },
"footer.transparency100": {
    en: "✨ 100% Transparent • Love Spreading • Community Connected", vi: "✨ Minh Bạch 100% • Yêu Thương Lan Tỏa • Cộng Đồng Kết Nối", zh: "✨ 100%透明 • 爱心传播 • 社区连接", ja: "✨ 100%透明 • 愛の広がり • コミュニティ接続", ko: "✨ 100% 투명 • 사랑 확산 • 커뮤니티 연결",
    th: "✨ โปร่งใส 100% • ความรักแผ่ขยาย • ชุมชนเชื่อมต่อ", fr: "✨ 100% Transparent • Amour répandu • Communauté connectée", de: "✨ 100% Transparent • Liebe verbreiten • Gemeinschaft verbunden", es: "✨ 100% Transparente • Amor difundido • Comunidad conectada",
    pt: "✨ 100% Transparente • Amor espalhado • Comunidade conectada", ru: "✨ 100% Прозрачность • Любовь распространяется • Сообщество связано", ar: "✨ شفافية 100% • نشر الحب • مجتمع متصل", hi: "✨ 100% पारदर्शी • प्यार फैलाना • समुदाय जुड़ा"
  },

  // Social Feed Page
  "social.pageTitle": {
    en: "News Feed - FUN Charity", vi: "Bảng Tin - FUN Charity", zh: "新闻动态 - FUN Charity", ja: "ニュースフィード - FUN Charity", ko: "뉴스 피드 - FUN Charity",
    th: "ฟีดข่าว - FUN Charity", fr: "Fil d'actualité - FUN Charity", de: "Neuigkeiten - FUN Charity", es: "Noticias - FUN Charity",
    pt: "Feed de Notícias - FUN Charity", ru: "Лента новостей - FUN Charity", ar: "آخر الأخبار - FUN Charity", hi: "न्यूज़ फ़ीड - FUN Charity"
  },
  "social.pageDesc": {
    en: "View social feed, connect with transparent charity community on FUN Charity", vi: "Xem bảng tin xã hội, kết nối với cộng đồng từ thiện minh bạch trên FUN Charity", zh: "查看社交动态，与FUN Charity上的透明慈善社区建立联系", ja: "ソーシャルフィードを見て、FUN Charityの透明な慈善コミュニティとつながる", ko: "소셜 피드 보기, FUN Charity의 투명한 자선 커뮤니티와 연결",
    th: "ดูฟีดสังคม เชื่อมต่อกับชุมชนการกุศลที่โปร่งใสบน FUN Charity", fr: "Voir le fil social, se connecter avec la communauté caritative transparente sur FUN Charity", de: "Social Feed ansehen, mit der transparenten Wohltätigkeitsgemeinschaft auf FUN Charity verbinden", es: "Ver el feed social, conectar con la comunidad benéfica transparente en FUN Charity",
    pt: "Ver feed social, conectar-se com a comunidade de caridade transparente no FUN Charity", ru: "Смотреть социальную ленту, связаться с прозрачным благотворительным сообществом на FUN Charity", ar: "عرض الموجز الاجتماعي، والتواصل مع مجتمع الأعمال الخيرية الشفاف على FUN Charity", hi: "सोशल फ़ीड देखें, FUN Charity पर पारदर्शी चैरिटी समुदाय से जुड़ें"
  },
  "social.allViewed": {
    en: "You've seen all posts 🎉", vi: "Bạn đã xem hết tất cả bài viết 🎉", zh: "您已看完所有帖子 🎉", ja: "すべての投稿を見ました 🎉", ko: "모든 게시물을 확인했습니다 🎉",
    th: "คุณดูโพสต์ทั้งหมดแล้ว 🎉", fr: "Vous avez vu tous les posts 🎉", de: "Sie haben alle Beiträge gesehen 🎉", es: "Has visto todas las publicaciones 🎉",
    pt: "Você viu todas as postagens 🎉", ru: "Вы просмотрели все публикации 🎉", ar: "لقد شاهدت جميع المنشورات 🎉", hi: "आपने सभी पोस्ट देख लिए हैं 🎉"
  },
  "social.noPosts": {
    en: "No posts yet. Be the first to share!", vi: "Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!", zh: "还没有帖子。成为第一个分享的人！", ja: "まだ投稿がありません。最初に共有しましょう！", ko: "아직 게시물이 없습니다. 첫 번째로 공유하세요!",
    th: "ยังไม่มีโพสต์ มาเป็นคนแรกที่แชร์!", fr: "Pas encore de posts. Soyez le premier à partager !", de: "Noch keine Beiträge. Seien Sie der Erste, der teilt!", es: "Aún no hay publicaciones. ¡Sé el primero en compartir!",
    pt: "Nenhuma postagem ainda. Seja o primeiro a compartilhar!", ru: "Пока нет публикаций. Будьте первым, кто поделится!", ar: "لا توجد منشورات بعد. كن أول من يشارك!", hi: "अभी तक कोई पोस्ट नहीं। पहले शेयर करने वाले बनें!"
  },
  "social.noFriends": {
    en: "No friends yet", vi: "Chưa có bạn bè", zh: "还没有好友", ja: "まだ友達がいません", ko: "아직 친구가 없습니다",
    th: "ยังไม่มีเพื่อน", fr: "Pas encore d'amis", de: "Noch keine Freunde", es: "Aún no hay amigos",
    pt: "Nenhum amigo ainda", ru: "Пока нет друзей", ar: "لا يوجد أصدقاء بعد", hi: "अभी तक कोई दोस्त नहीं"
  },
  "social.noGroups": {
    en: "No group chats", vi: "Chưa có nhóm chat", zh: "没有群聊", ja: "グループチャットがありません", ko: "그룹 채팅이 없습니다",
    th: "ไม่มีแชทกลุ่ม", fr: "Pas de discussions de groupe", de: "Keine Gruppenchats", es: "Sin chats grupales",
    pt: "Sem conversas em grupo", ru: "Нет групповых чатов", ar: "لا توجد محادثات جماعية", hi: "कोई ग्रुप चैट नहीं"
  },
  "social.user": {
    en: "User", vi: "Người dùng", zh: "用户", ja: "ユーザー", ko: "사용자",
    th: "ผู้ใช้", fr: "Utilisateur", de: "Benutzer", es: "Usuario",
    pt: "Usuário", ru: "Пользователь", ar: "مستخدم", hi: "उपयोगकर्ता"
  },
  "social.members": {
    en: "members", vi: "thành viên", zh: "成员", ja: "メンバー", ko: "멤버",
    th: "สมาชิก", fr: "membres", de: "Mitglieder", es: "miembros",
    pt: "membros", ru: "участников", ar: "أعضاء", hi: "सदस्य"
  },
  "social.groupChat": {
    en: "Group chat", vi: "Nhóm chat", zh: "群聊", ja: "グループチャット", ko: "그룹 채팅",
    th: "แชทกลุ่ม", fr: "Discussion de groupe", de: "Gruppenchat", es: "Chat grupal",
    pt: "Conversa em grupo", ru: "Групповой чат", ar: "محادثة جماعية", hi: "ग्रुप चैट"
  },
  "social.with": {
    en: "with", vi: "cùng với", zh: "与", ja: "と一緒に", ko: "함께",
    th: "กับ", fr: "avec", de: "mit", es: "con",
    pt: "com", ru: "вместе с", ar: "مع", hi: "के साथ"
  },
  "social.andOthers": {
    en: "and {count} others", vi: "và {count} người khác", zh: "和其他{count}人", ja: "と他{count}人", ko: "및 {count}명",
    th: "และอีก {count} คน", fr: "et {count} autres", de: "und {count} andere", es: "y {count} más",
    pt: "e mais {count}", ru: "и ещё {count}", ar: "و{count} آخرون", hi: "और {count} अन्य"
  },
  "social.wasLive": {
    en: "Was live", vi: "Đã phát trực tiếp", zh: "曾直播", ja: "ライブ配信しました", ko: "라이브 방송함",
    th: "เคยถ่ายทอดสด", fr: "Était en direct", de: "War live", es: "Estuvo en vivo",
    pt: "Estava ao vivo", ru: "Был в эфире", ar: "كان مباشراً", hi: "लाइव था"
  },
  "social.deletePost": {
    en: "Delete post", vi: "Xóa bài", zh: "删除帖子", ja: "投稿を削除", ko: "게시물 삭제",
    th: "ลบโพสต์", fr: "Supprimer le post", de: "Beitrag löschen", es: "Eliminar publicación",
    pt: "Excluir postagem", ru: "Удалить пост", ar: "حذف المنشور", hi: "पोस्ट हटाएं"
  },
  "social.deleted": {
    en: "Post deleted", vi: "Đã xóa bài viết", zh: "帖子已删除", ja: "投稿が削除されました", ko: "게시물이 삭제되었습니다",
    th: "ลบโพสต์แล้ว", fr: "Post supprimé", de: "Beitrag gelöscht", es: "Publicación eliminada",
    pt: "Postagem excluída", ru: "Пост удалён", ar: "تم حذف المنشور", hi: "पोस्ट हटा दी गई"
  },
  "social.deleteError": {
    en: "Cannot delete post", vi: "Không thể xóa bài viết", zh: "无法删除帖子", ja: "投稿を削除できません", ko: "게시물을 삭제할 수 없습니다",
    th: "ไม่สามารถลบโพสต์ได้", fr: "Impossible de supprimer le post", de: "Beitrag kann nicht gelöscht werden", es: "No se puede eliminar la publicación",
    pt: "Não foi possível excluir a postagem", ru: "Не удалось удалить пост", ar: "لا يمكن حذف المنشور", hi: "पोस्ट नहीं हटाई जा सकती"
  },
  "social.confirmDelete": {
    en: "Are you sure you want to delete this post? This action cannot be undone.", vi: "Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.", zh: "您确定要删除这篇帖子吗？此操作无法撤消。", ja: "この投稿を削除してもよろしいですか？この操作は元に戻せません。", ko: "이 게시물을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.",
    th: "คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้? การดำเนินการนี้ไม่สามารถเลิกทำได้", fr: "Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible.", de: "Sind Sie sicher, dass Sie diesen Beitrag löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.", es: "¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.",
    pt: "Tem certeza de que deseja excluir esta postagem? Esta ação não pode ser desfeita.", ru: "Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.", ar: "هل أنت متأكد أنك تريد حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.", hi: "क्या आप वाकई इस पोस्ट को हटाना चाहते हैं? इस क्रिया को पूर्ववत नहीं किया जा सकता।"
  },
  "social.share": {
    en: "Share", vi: "Chia sẻ", zh: "分享", ja: "シェア", ko: "공유",
    th: "แชร์", fr: "Partager", de: "Teilen", es: "Compartir",
    pt: "Compartilhar", ru: "Поделиться", ar: "مشاركة", hi: "शेयर करें"
  },
  "social.gift": {
    en: "Gift", vi: "Tặng quà", zh: "送礼", ja: "ギフト", ko: "선물",
    th: "ของขวัญ", fr: "Cadeau", de: "Geschenk", es: "Regalo",
    pt: "Presente", ru: "Подарок", ar: "هدية", hi: "उपहार"
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("app-language");
    return (stored as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
