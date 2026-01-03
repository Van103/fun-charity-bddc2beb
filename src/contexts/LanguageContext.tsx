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
