import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "vi" | "zh" | "ja" | "ko" | "th" | "fr" | "de" | "es" | "pt" | "ru" | "ar" | "hi";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "/flags/vi.png" },
  { code: "en", name: "English", nativeName: "English", flag: "/flags/en.png" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "/flags/zh.png" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "/flags/ja.png" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "/flags/ko.png" },
  { code: "th", name: "Thai", nativeName: "ภาษาไทย", flag: "/flags/th.png" },
  { code: "fr", name: "French", nativeName: "Français", flag: "/flags/fr.png" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "/flags/de.png" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "/flags/es.png" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "/flags/pt.png" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "/flags/ru.png" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "/flags/ar.png" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "/flags/hi.png" },
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

  // Honor Board Page
  "honorBoard.pageTitle": {
    en: "Honor Board", vi: "Bảng Vinh Danh", zh: "荣誉榜", ja: "栄誉の殿堂", ko: "명예의 전당",
    th: "เกียรติยศ", fr: "Tableau d'honneur", de: "Ehrentafel", es: "Cuadro de Honor",
    pt: "Quadro de Honra", ru: "Доска почета", ar: "لوحة الشرف", hi: "सम्मान बोर्ड"
  },
  "honorBoard.metaDescription": {
    en: "Honor Board - Recognizing top donors and volunteers who make a difference", vi: "Bảng Vinh Danh - Tôn vinh các nhà tài trợ và tình nguyện viên xuất sắc", zh: "荣誉榜 - 表彰杰出的捐赠者和志愿者", ja: "栄誉の殿堂 - 優れた寄付者とボランティアを称える", ko: "명예의 전당 - 우수 기부자와 봉사자 인정",
    th: "เกียรติยศ - ยกย่องผู้บริจาคและอาสาสมัครที่โดดเด่น", fr: "Tableau d'honneur - Reconnaître les meilleurs donateurs et bénévoles", de: "Ehrentafel - Anerkennung der besten Spender und Freiwilligen", es: "Cuadro de Honor - Reconociendo a los mejores donantes y voluntarios",
    pt: "Quadro de Honra - Reconhecendo os melhores doadores e voluntários", ru: "Доска почета - Признание лучших жертвователей и волонтеров", ar: "لوحة الشرف - تكريم أفضل المتبرعين والمتطوعين", hi: "सम्मान बोर्ड - शीर्ष दानदाताओं और स्वयंसेवकों को सम्मान"
  },
  "honorBoard.title": {
    en: "HONOR BOARD", vi: "BẢNG VINH DANH", zh: "荣誉榜", ja: "栄誉の殿堂", ko: "명예의 전당",
    th: "เกียรติยศ", fr: "TABLEAU D'HONNEUR", de: "EHRENTAFEL", es: "CUADRO DE HONOR",
    pt: "QUADRO DE HONRA", ru: "ДОСКА ПОЧЕТА", ar: "لوحة الشرف", hi: "सम्मान बोर्ड"
  },
  "honorBoard.subtitle": {
    en: "Celebrating our heroes who make the world a better place", vi: "Tôn vinh những anh hùng làm thế giới tốt đẹp hơn", zh: "表彰让世界更美好的英雄们", ja: "世界をより良い場所にする英雄たちを称える", ko: "세상을 더 나은 곳으로 만드는 영웅들을 기념합니다",
    th: "เฉลิมฉลองวีรบุรุษของเราที่ทำให้โลกน่าอยู่ขึ้น", fr: "Célébrer nos héros qui rendent le monde meilleur", de: "Unsere Helden feiern, die die Welt zu einem besseren Ort machen", es: "Celebrando a nuestros héroes que hacen del mundo un lugar mejor",
    pt: "Celebrando nossos heróis que tornam o mundo um lugar melhor", ru: "Чествуем наших героев, делающих мир лучше", ar: "نحتفل بأبطالنا الذين يجعلون العالم مكانًا أفضل", hi: "हमारे नायकों का जश्न जो दुनिया को बेहतर बनाते हैं"
  },
  "honorBoard.topDonors": {
    en: "Top Donors", vi: "Top Nhà Tài Trợ", zh: "顶级捐赠者", ja: "トップドナー", ko: "최고 기부자",
    th: "ผู้บริจาคสูงสุด", fr: "Meilleurs donateurs", de: "Top-Spender", es: "Mejores donantes",
    pt: "Principais doadores", ru: "Лучшие жертвователи", ar: "أفضل المتبرعين", hi: "शीर्ष दानदाता"
  },
  "honorBoard.donors": {
    en: "Donors", vi: "Nhà Tài Trợ", zh: "捐赠者", ja: "ドナー", ko: "기부자",
    th: "ผู้บริจาค", fr: "Donateurs", de: "Spender", es: "Donantes",
    pt: "Doadores", ru: "Жертвователи", ar: "المتبرعون", hi: "दानदाता"
  },
  "honorBoard.topVolunteers": {
    en: "Top Volunteers", vi: "Top Tình Nguyện Viên", zh: "顶级志愿者", ja: "トップボランティア", ko: "최고 봉사자",
    th: "อาสาสมัครสูงสุด", fr: "Meilleurs bénévoles", de: "Top-Freiwillige", es: "Mejores voluntarios",
    pt: "Principais voluntários", ru: "Лучшие волонтеры", ar: "أفضل المتطوعين", hi: "शीर्ष स्वयंसेवक"
  },
  "honorBoard.volunteers": {
    en: "Volunteers", vi: "Tình Nguyện", zh: "志愿者", ja: "ボランティア", ko: "봉사자",
    th: "อาสาสมัคร", fr: "Bénévoles", de: "Freiwillige", es: "Voluntarios",
    pt: "Voluntários", ru: "Волонтеры", ar: "المتطوعون", hi: "स्वयंसेवक"
  },
  "honorBoard.badgesTab": {
    en: "Badges & Achievements", vi: "Huy Hiệu & Thành Tích", zh: "徽章与成就", ja: "バッジと実績", ko: "배지 및 업적",
    th: "ตราและความสำเร็จ", fr: "Badges et réalisations", de: "Abzeichen & Erfolge", es: "Insignias y logros",
    pt: "Distintivos e conquistas", ru: "Значки и достижения", ar: "الشارات والإنجازات", hi: "बैज और उपलब्धियां"
  },
  "honorBoard.badges": {
    en: "Badges", vi: "Huy Hiệu", zh: "徽章", ja: "バッジ", ko: "배지",
    th: "ตรา", fr: "Badges", de: "Abzeichen", es: "Insignias",
    pt: "Distintivos", ru: "Значки", ar: "الشارات", hi: "बैज"
  },
  "honorBoard.hours": {
    en: "hours", vi: "giờ", zh: "小时", ja: "時間", ko: "시간",
    th: "ชั่วโมง", fr: "heures", de: "Stunden", es: "horas",
    pt: "horas", ru: "часов", ar: "ساعات", hi: "घंटे"
  },
  "honorBoard.hrs": {
    en: "hrs", vi: "giờ", zh: "时", ja: "時間", ko: "시간",
    th: "ชม.", fr: "h", de: "Std", es: "hrs",
    pt: "h", ru: "ч", ar: "س", hi: "घंटे"
  },
  "honorBoard.tasks": {
    en: "tasks", vi: "nhiệm vụ", zh: "任务", ja: "タスク", ko: "작업",
    th: "งาน", fr: "tâches", de: "Aufgaben", es: "tareas",
    pt: "tarefas", ru: "задач", ar: "مهام", hi: "कार्य"
  },
  "honorBoard.tasksCompleted": {
    en: "tasks completed", vi: "nhiệm vụ hoàn thành", zh: "已完成任务", ja: "完了タスク", ko: "완료된 작업",
    th: "งานที่เสร็จสิ้น", fr: "tâches terminées", de: "erledigte Aufgaben", es: "tareas completadas",
    pt: "tarefas concluídas", ru: "выполненных задач", ar: "مهام مكتملة", hi: "पूर्ण कार्य"
  },
  "honorBoard.noDonors": {
    en: "No donors yet. Be the first to donate!", vi: "Chưa có nhà tài trợ. Hãy là người đầu tiên quyên góp!", zh: "暂无捐赠者。成为第一个捐赠者！", ja: "まだドナーがいません。最初の寄付者になりましょう！", ko: "아직 기부자가 없습니다. 첫 번째 기부자가 되어주세요!",
    th: "ยังไม่มีผู้บริจาค มาเป็นคนแรกที่บริจาค!", fr: "Pas encore de donateurs. Soyez le premier à donner !", de: "Noch keine Spender. Seien Sie der Erste!", es: "Aún no hay donantes. ¡Sé el primero en donar!",
    pt: "Ainda não há doadores. Seja o primeiro a doar!", ru: "Пока нет жертвователей. Станьте первым!", ar: "لا يوجد متبرعون بعد. كن أول من يتبرع!", hi: "अभी तक कोई दानदाता नहीं। पहले दानदाता बनें!"
  },
  "honorBoard.noVolunteers": {
    en: "No volunteers yet. Join our mission!", vi: "Chưa có tình nguyện viên. Tham gia sứ mệnh của chúng tôi!", zh: "暂无志愿者。加入我们的使命！", ja: "まだボランティアがいません。私たちのミッションに参加してください！", ko: "아직 봉사자가 없습니다. 우리의 미션에 참여하세요!",
    th: "ยังไม่มีอาสาสมัคร มาร่วมภารกิจของเรา!", fr: "Pas encore de bénévoles. Rejoignez notre mission !", de: "Noch keine Freiwilligen. Schließen Sie sich unserer Mission an!", es: "Aún no hay voluntarios. ¡Únete a nuestra misión!",
    pt: "Ainda não há voluntários. Junte-se à nossa missão!", ru: "Пока нет волонтеров. Присоединяйтесь к нашей миссии!", ar: "لا يوجد متطوعون بعد. انضم إلى مهمتنا!", hi: "अभी तक कोई स्वयंसेवक नहीं। हमारे मिशन में शामिल हों!"
  },
  "nav.honorBoard": {
    en: "Honor Board", vi: "Bảng Vinh Danh", zh: "荣誉榜", ja: "栄誉の殿堂", ko: "명예의 전당",
    th: "เกียรติยศ", fr: "Tableau d'honneur", de: "Ehrentafel", es: "Cuadro de Honor",
    pt: "Quadro de Honra", ru: "Доска почета", ar: "لوحة الشرف", hi: "सम्मान बोर्ड"
  },
  "nav.trading": {
    en: "Trading", vi: "Giao dịch", zh: "交易", ja: "取引", ko: "거래",
    th: "การซื้อขาย", fr: "Trading", de: "Handel", es: "Comercio",
    pt: "Negociação", ru: "Торговля", ar: "التداول", hi: "व्यापार"
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
  "common.confirm": {
    en: "Confirm", vi: "Xác nhận", zh: "确认", ja: "確認", ko: "확인",
    th: "ยืนยัน", fr: "Confirmer", de: "Bestätigen", es: "Confirmar",
    pt: "Confirmar", ru: "Подтвердить", ar: "تأكيد", hi: "पुष्टि करें"
  },
  "common.submit": {
    en: "Submit", vi: "Gửi", zh: "提交", ja: "送信", ko: "제출",
    th: "ส่ง", fr: "Soumettre", de: "Absenden", es: "Enviar",
    pt: "Enviar", ru: "Отправить", ar: "إرسال", hi: "सबमिट करें"
  },
  "common.seeMore": {
    en: "See more", vi: "Xem thêm", zh: "查看更多", ja: "もっと見る", ko: "더 보기",
    th: "ดูเพิ่มเติม", fr: "Voir plus", de: "Mehr anzeigen", es: "Ver más",
    pt: "Ver mais", ru: "Показать больше", ar: "عرض المزيد", hi: "और देखें"
  },
  "common.seeLess": {
    en: "See less", vi: "Thu gọn", zh: "收起", ja: "折りたたむ", ko: "접기",
    th: "ดูน้อยลง", fr: "Voir moins", de: "Weniger anzeigen", es: "Ver menos",
    pt: "Ver menos", ru: "Показать меньше", ar: "عرض أقل", hi: "कम देखें"
  },
  "common.share": {
    en: "Share", vi: "Chia sẻ", zh: "分享", ja: "シェア", ko: "공유",
    th: "แชร์", fr: "Partager", de: "Teilen", es: "Compartir",
    pt: "Compartilhar", ru: "Поделиться", ar: "مشاركة", hi: "शेयर करें"
  },
  "common.comment": {
    en: "Comment", vi: "Bình luận", zh: "评论", ja: "コメント", ko: "댓글",
    th: "แสดงความคิดเห็น", fr: "Commenter", de: "Kommentieren", es: "Comentar",
    pt: "Comentar", ru: "Комментировать", ar: "تعليق", hi: "टिप्पणी करें"
  },
  "common.reply": {
    en: "Reply", vi: "Trả lời", zh: "回复", ja: "返信", ko: "답글",
    th: "ตอบกลับ", fr: "Répondre", de: "Antworten", es: "Responder",
    pt: "Responder", ru: "Ответить", ar: "رد", hi: "जवाब दें"
  },
  "common.send": {
    en: "Send", vi: "Gửi", zh: "发送", ja: "送信", ko: "보내기",
    th: "ส่ง", fr: "Envoyer", de: "Senden", es: "Enviar",
    pt: "Enviar", ru: "Отправить", ar: "إرسال", hi: "भेजें"
  },
  "common.viewAll": {
    en: "View All", vi: "Xem tất cả", zh: "查看全部", ja: "すべて表示", ko: "전체 보기",
    th: "ดูทั้งหมด", fr: "Voir tout", de: "Alle anzeigen", es: "Ver todo",
    pt: "Ver tudo", ru: "Посмотреть все", ar: "عرض الكل", hi: "सभी देखें"
  },
  "common.back": {
    en: "Back", vi: "Quay lại", zh: "返回", ja: "戻る", ko: "뒤로",
    th: "ย้อนกลับ", fr: "Retour", de: "Zurück", es: "Volver",
    pt: "Voltar", ru: "Назад", ar: "رجوع", hi: "वापस"
  },
  "common.next": {
    en: "Next", vi: "Tiếp theo", zh: "下一步", ja: "次へ", ko: "다음",
    th: "ถัดไป", fr: "Suivant", de: "Weiter", es: "Siguiente",
    pt: "Próximo", ru: "Далее", ar: "التالي", hi: "अगला"
  },
  "common.previous": {
    en: "Previous", vi: "Trước", zh: "上一步", ja: "前へ", ko: "이전",
    th: "ก่อนหน้า", fr: "Précédent", de: "Zurück", es: "Anterior",
    pt: "Anterior", ru: "Предыдущий", ar: "السابق", hi: "पिछला"
  },
  "common.success": {
    en: "Success", vi: "Thành công", zh: "成功", ja: "成功", ko: "성공",
    th: "สำเร็จ", fr: "Succès", de: "Erfolg", es: "Éxito",
    pt: "Sucesso", ru: "Успешно", ar: "نجاح", hi: "सफलता"
  },
  "common.warning": {
    en: "Warning", vi: "Cảnh báo", zh: "警告", ja: "警告", ko: "경고",
    th: "คำเตือน", fr: "Avertissement", de: "Warnung", es: "Advertencia",
    pt: "Aviso", ru: "Предупреждение", ar: "تحذير", hi: "चेतावनी"
  },
  "common.info": {
    en: "Info", vi: "Thông tin", zh: "信息", ja: "情報", ko: "정보",
    th: "ข้อมูล", fr: "Info", de: "Info", es: "Información",
    pt: "Informação", ru: "Информация", ar: "معلومات", hi: "जानकारी"
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
    en: "Gift", vi: "Tặng", zh: "送礼", ja: "ギフト", ko: "선물",
    th: "ของขวัญ", fr: "Cadeau", de: "Geschenk", es: "Regalo",
    pt: "Presente", ru: "Подарок", ar: "هدية", hi: "उपहार"
  },
  // Reactions
  "reaction.like": {
    en: "Like", vi: "Thích", zh: "赞", ja: "いいね", ko: "좋아요",
    th: "ถูกใจ", fr: "J'aime", de: "Gefällt mir", es: "Me gusta",
    pt: "Curtir", ru: "Нравится", ar: "أعجبني", hi: "पसंद"
  },
  "reaction.love": {
    en: "Love", vi: "Yêu thích", zh: "喜欢", ja: "大好き", ko: "사랑해요",
    th: "รัก", fr: "J'adore", de: "Liebe", es: "Me encanta",
    pt: "Amei", ru: "Люблю", ar: "أحب", hi: "प्यार"
  },
  "reaction.haha": {
    en: "Haha", vi: "Haha", zh: "哈哈", ja: "ウケる", ko: "ㅋㅋ",
    th: "ฮ่าฮ่า", fr: "Haha", de: "Haha", es: "Jaja",
    pt: "Haha", ru: "Ха-ха", ar: "هاها", hi: "हाहा"
  },
  "reaction.wow": {
    en: "Wow", vi: "Wow", zh: "哇", ja: "すごい", ko: "와우",
    th: "ว้าว", fr: "Waouh", de: "Wow", es: "Wow",
    pt: "Uau", ru: "Ого", ar: "واو", hi: "वाह"
  },
  "reaction.sad": {
    en: "Sad", vi: "Buồn", zh: "难过", ja: "悲しい", ko: "슬퍼요",
    th: "เศร้า", fr: "Triste", de: "Traurig", es: "Triste",
    pt: "Triste", ru: "Грустно", ar: "حزين", hi: "दुखी"
  },
  "reaction.angry": {
    en: "Angry", vi: "Phẫn nộ", zh: "愤怒", ja: "怒り", ko: "화나요",
    th: "โกรธ", fr: "En colère", de: "Wütend", es: "Enfadado",
    pt: "Irritado", ru: "Злость", ar: "غاضب", hi: "गुस्सा"
  },
  // Gift Modal
  "gift.title": {
    en: "Send Gift", vi: "Gửi quà tặng", zh: "发送礼物", ja: "ギフトを送る", ko: "선물 보내기",
    th: "ส่งของขวัญ", fr: "Envoyer un cadeau", de: "Geschenk senden", es: "Enviar regalo",
    pt: "Enviar presente", ru: "Отправить подарок", ar: "إرسال هدية", hi: "उपहार भेजें"
  },
  "gift.cryptoWallet": {
    en: "Crypto Wallet", vi: "Ví Crypto", zh: "加密钱包", ja: "暗号資産ウォレット", ko: "암호화폐 지갑",
    th: "กระเป๋าคริปโต", fr: "Portefeuille crypto", de: "Krypto-Wallet", es: "Billetera cripto",
    pt: "Carteira crypto", ru: "Крипто-кошелек", ar: "محفظة العملات المشفرة", hi: "क्रिप्टो वॉलेट"
  },
  "gift.creditCard": {
    en: "Credit Card", vi: "Thẻ tín dụng", zh: "信用卡", ja: "クレジットカード", ko: "신용카드",
    th: "บัตรเครดิต", fr: "Carte de crédit", de: "Kreditkarte", es: "Tarjeta de crédito",
    pt: "Cartão de crédito", ru: "Кредитная карта", ar: "بطاقة ائتمان", hi: "क्रेडिट कार्ड"
  },
  "gift.multiChain": {
    en: "Multi-chain", vi: "Đa chuỗi", zh: "多链", ja: "マルチチェーン", ko: "멀티체인",
    th: "หลายเครือข่าย", fr: "Multi-chaîne", de: "Multi-Chain", es: "Multi-cadena",
    pt: "Multi-cadeia", ru: "Мульти-чейн", ar: "متعدد السلاسل", hi: "मल्टी-चेन"
  },
  "gift.meal1": {
    en: "1 meal", vi: "1 bữa ăn", zh: "1顿饭", ja: "1食", ko: "1끼 식사",
    th: "1 มื้ออาหาร", fr: "1 repas", de: "1 Mahlzeit", es: "1 comida",
    pt: "1 refeição", ru: "1 прием пищи", ar: "وجبة واحدة", hi: "1 भोजन"
  },
  "gift.meal2": {
    en: "2 meals", vi: "2 bữa ăn", zh: "2顿饭", ja: "2食", ko: "2끼 식사",
    th: "2 มื้ออาหาร", fr: "2 repas", de: "2 Mahlzeiten", es: "2 comidas",
    pt: "2 refeições", ru: "2 приема пищи", ar: "وجبتان", hi: "2 भोजन"
  },
  "gift.schoolDay": {
    en: "1 school day", vi: "1 ngày học", zh: "1天学习", ja: "1日の学習", ko: "1일 학습",
    th: "1 วันเรียน", fr: "1 jour d'école", de: "1 Schultag", es: "1 día de escuela",
    pt: "1 dia de escola", ru: "1 учебный день", ar: "يوم دراسي واحد", hi: "1 स्कूल दिन"
  },
  "gift.weekBooks": {
    en: "1 week of books", vi: "1 tuần sách", zh: "1周的书籍", ja: "1週間の本", ko: "1주일 책",
    th: "หนังสือ 1 สัปดาห์", fr: "1 semaine de livres", de: "1 Woche Bücher", es: "1 semana de libros",
    pt: "1 semana de livros", ru: "1 неделя книг", ar: "أسبوع من الكتب", hi: "1 सप्ताह की किताबें"
  },
  "gift.monthStudy": {
    en: "1 month of study", vi: "1 tháng học", zh: "1个月学习", ja: "1ヶ月の学習", ko: "1개월 학습",
    th: "การเรียน 1 เดือน", fr: "1 mois d'études", de: "1 Monat Studium", es: "1 mes de estudio",
    pt: "1 mês de estudo", ru: "1 месяц обучения", ar: "شهر من الدراسة", hi: "1 महीने की पढ़ाई"
  },
  "gift.helpFamily": {
    en: "Help 1 family", vi: "Giúp 1 gia đình", zh: "帮助1个家庭", ja: "1家族を支援", ko: "1가정 지원",
    th: "ช่วย 1 ครอบครัว", fr: "Aider 1 famille", de: "1 Familie helfen", es: "Ayudar a 1 familia",
    pt: "Ajudar 1 família", ru: "Помочь 1 семье", ar: "مساعدة عائلة واحدة", hi: "1 परिवार की मदद"
  },
  "gift.canSupport": {
    en: "Can support", vi: "Có thể hỗ trợ", zh: "可以支持", ja: "サポート可能", ko: "지원 가능",
    th: "สามารถสนับสนุน", fr: "Peut soutenir", de: "Kann unterstützen", es: "Puede apoyar",
    pt: "Pode apoiar", ru: "Может поддержать", ar: "يمكن دعم", hi: "सहायता कर सकते हैं"
  },
  "gift.everyContribution": {
    en: "Every contribution matters", vi: "Mỗi đóng góp đều có ý nghĩa", zh: "每一份贡献都很重要", ja: "すべての貢献が重要です", ko: "모든 기여가 중요합니다",
    th: "ทุกการสนับสนุนมีความหมาย", fr: "Chaque contribution compte", de: "Jeder Beitrag zählt", es: "Cada contribución importa",
    pt: "Cada contribuição importa", ru: "Каждый вклад важен", ar: "كل مساهمة مهمة", hi: "हर योगदान मायने रखता है"
  },
  "gift.thankYou": {
    en: "Thank you!", vi: "Cảm ơn bạn!", zh: "谢谢你！", ja: "ありがとう！", ko: "감사합니다!",
    th: "ขอบคุณ!", fr: "Merci !", de: "Danke!", es: "¡Gracias!",
    pt: "Obrigado!", ru: "Спасибо!", ar: "شكراً!", hi: "धन्यवाद!"
  },
  "gift.positiveChange": {
    en: "Your contribution will bring positive change 💖", vi: "Đóng góp của bạn sẽ mang đến sự thay đổi tích cực 💖", zh: "您的贡献将带来积极的变化 💖", ja: "あなたの貢献はポジティブな変化をもたらします 💖", ko: "당신의 기여가 긍정적인 변화를 가져올 것입니다 💖",
    th: "การสนับสนุนของคุณจะนำมาซึ่งการเปลี่ยนแปลงที่ดี 💖", fr: "Votre contribution apportera un changement positif 💖", de: "Ihr Beitrag wird positive Veränderungen bewirken 💖", es: "Tu contribución traerá cambios positivos 💖",
    pt: "Sua contribuição trará mudanças positivas 💖", ru: "Ваш вклад принесет позитивные изменения 💖", ar: "مساهمتك ستجلب تغييراً إيجابياً 💖", hi: "आपका योगदान सकारात्मक बदलाव लाएगा 💖"
  },
  "gift.viewTransaction": {
    en: "View transaction", vi: "Xem giao dịch", zh: "查看交易", ja: "取引を見る", ko: "거래 보기",
    th: "ดูธุรกรรม", fr: "Voir la transaction", de: "Transaktion anzeigen", es: "Ver transacción",
    pt: "Ver transação", ru: "Посмотреть транзакцию", ar: "عرض المعاملة", hi: "लेनदेन देखें"
  },
  "gift.oneTime": {
    en: "One time", vi: "Một lần", zh: "一次性", ja: "1回", ko: "일회성",
    th: "ครั้งเดียว", fr: "Une fois", de: "Einmalig", es: "Una vez",
    pt: "Uma vez", ru: "Один раз", ar: "مرة واحدة", hi: "एक बार"
  },
  "gift.monthly": {
    en: "Monthly", vi: "Hàng tháng", zh: "每月", ja: "毎月", ko: "매월",
    th: "รายเดือน", fr: "Mensuel", de: "Monatlich", es: "Mensual",
    pt: "Mensal", ru: "Ежемесячно", ar: "شهرياً", hi: "मासिक"
  },
  "gift.selectAmount": {
    en: "Select amount", vi: "Chọn số tiền", zh: "选择金额", ja: "金額を選択", ko: "금액 선택",
    th: "เลือกจำนวนเงิน", fr: "Sélectionner le montant", de: "Betrag auswählen", es: "Seleccionar monto",
    pt: "Selecionar valor", ru: "Выберите сумму", ar: "اختر المبلغ", hi: "राशि चुनें"
  },
  "gift.enterOther": {
    en: "Enter other amount", vi: "Nhập số tiền khác", zh: "输入其他金额", ja: "他の金額を入力", ko: "다른 금액 입력",
    th: "ป้อนจำนวนอื่น", fr: "Entrer un autre montant", de: "Anderen Betrag eingeben", es: "Ingresar otro monto",
    pt: "Inserir outro valor", ru: "Введите другую сумму", ar: "أدخل مبلغاً آخر", hi: "अन्य राशि दर्ज करें"
  },
  "gift.paymentMethod": {
    en: "Payment method", vi: "Phương thức thanh toán", zh: "支付方式", ja: "支払い方法", ko: "결제 방법",
    th: "วิธีการชำระเงิน", fr: "Mode de paiement", de: "Zahlungsmethode", es: "Método de pago",
    pt: "Método de pagamento", ru: "Способ оплаты", ar: "طريقة الدفع", hi: "भुगतान विधि"
  },
  "gift.connectMetamask": {
    en: "Connect MetaMask", vi: "Kết nối MetaMask", zh: "连接 MetaMask", ja: "MetaMask を接続", ko: "MetaMask 연결",
    th: "เชื่อมต่อ MetaMask", fr: "Connecter MetaMask", de: "MetaMask verbinden", es: "Conectar MetaMask",
    pt: "Conectar MetaMask", ru: "Подключить MetaMask", ar: "ربط MetaMask", hi: "MetaMask कनेक्ट करें"
  },
  "gift.connected": {
    en: "Connected:", vi: "Đã kết nối:", zh: "已连接：", ja: "接続済み：", ko: "연결됨:",
    th: "เชื่อมต่อแล้ว:", fr: "Connecté :", de: "Verbunden:", es: "Conectado:",
    pt: "Conectado:", ru: "Подключено:", ar: "متصل:", hi: "जुड़ा हुआ:"
  },
  "gift.balance": {
    en: "Balance:", vi: "Số dư:", zh: "余额：", ja: "残高：", ko: "잔액:",
    th: "ยอดคงเหลือ:", fr: "Solde :", de: "Guthaben:", es: "Saldo:",
    pt: "Saldo:", ru: "Баланс:", ar: "الرصيد:", hi: "शेष:"
  },
  "gift.selectNetwork": {
    en: "Select blockchain network:", vi: "Chọn mạng blockchain:", zh: "选择区块链网络：", ja: "ブロックチェーンネットワークを選択：", ko: "블록체인 네트워크 선택:",
    th: "เลือกเครือข่ายบล็อกเชน:", fr: "Sélectionner le réseau blockchain :", de: "Blockchain-Netzwerk auswählen:", es: "Seleccionar red blockchain:",
    pt: "Selecionar rede blockchain:", ru: "Выберите сеть блокчейн:", ar: "اختر شبكة البلوكتشين:", hi: "ब्लॉकचेन नेटवर्क चुनें:"
  },
  "gift.donationAmount": {
    en: "Donation amount:", vi: "Số tiền đóng góp:", zh: "捐款金额：", ja: "寄付金額：", ko: "기부 금액:",
    th: "จำนวนเงินบริจาค:", fr: "Montant du don :", de: "Spendenbetrag:", es: "Monto de la donación:",
    pt: "Valor da doação:", ru: "Сумма пожертвования:", ar: "مبلغ التبرع:", hi: "दान राशि:"
  },
  "gift.recipientNoWallet": {
    en: "Recipient has not set up a crypto wallet", vi: "Người nhận chưa thiết lập ví crypto", zh: "收款人尚未设置加密钱包", ja: "受取人は暗号資産ウォレットを設定していません", ko: "수신자가 암호화폐 지갑을 설정하지 않았습니다",
    th: "ผู้รับยังไม่ได้ตั้งค่ากระเป๋าคริปโต", fr: "Le destinataire n'a pas configuré de portefeuille crypto", de: "Der Empfänger hat keine Krypto-Wallet eingerichtet", es: "El destinatario no ha configurado una billetera cripto",
    pt: "O destinatário não configurou uma carteira crypto", ru: "Получатель не настроил крипто-кошелек", ar: "لم يقم المستلم بإعداد محفظة العملات المشفرة", hi: "प्राप्तकर्ता ने क्रिप्टो वॉलेट सेटअप नहीं किया है"
  },
  "gift.messageOptional": {
    en: "Message (optional)", vi: "Lời nhắn (tùy chọn)", zh: "留言（可选）", ja: "メッセージ（任意）", ko: "메시지 (선택사항)",
    th: "ข้อความ (ไม่บังคับ)", fr: "Message (optionnel)", de: "Nachricht (optional)", es: "Mensaje (opcional)",
    pt: "Mensagem (opcional)", ru: "Сообщение (необязательно)", ar: "رسالة (اختياري)", hi: "संदेश (वैकल्पिक)"
  },
  "gift.writeBlessings": {
    en: "Write your blessings...", vi: "Viết lời chúc của bạn...", zh: "写下你的祝福...", ja: "祝福のメッセージを書く...", ko: "축하 메시지를 작성하세요...",
    th: "เขียนคำอวยพรของคุณ...", fr: "Écrivez vos vœux...", de: "Schreiben Sie Ihre Wünsche...", es: "Escribe tus bendiciones...",
    pt: "Escreva suas bênçãos...", ru: "Напишите ваши пожелания...", ar: "اكتب تمنياتك...", hi: "अपनी शुभकामनाएं लिखें..."
  },
  "gift.anonymous": {
    en: "Anonymous contribution", vi: "Đóng góp ẩn danh", zh: "匿名捐款", ja: "匿名での寄付", ko: "익명 기부",
    th: "การสนับสนุนแบบไม่ระบุตัวตน", fr: "Contribution anonyme", de: "Anonymer Beitrag", es: "Contribución anónima",
    pt: "Contribuição anônima", ru: "Анонимный вклад", ar: "مساهمة مجهولة", hi: "गुमनाम योगदान"
  },
  "gift.nameHidden": {
    en: "Your name will not be displayed", vi: "Tên của bạn sẽ không được hiển thị", zh: "您的姓名将不会显示", ja: "あなたの名前は表示されません", ko: "이름이 표시되지 않습니다",
    th: "ชื่อของคุณจะไม่แสดง", fr: "Votre nom ne sera pas affiché", de: "Ihr Name wird nicht angezeigt", es: "Tu nombre no se mostrará",
    pt: "Seu nome não será exibido", ru: "Ваше имя не будет отображаться", ar: "لن يتم عرض اسمك", hi: "आपका नाम प्रदर्शित नहीं होगा"
  },
  "gift.processing": {
    en: "Processing...", vi: "Đang xử lý...", zh: "处理中...", ja: "処理中...", ko: "처리 중...",
    th: "กำลังดำเนินการ...", fr: "Traitement...", de: "Verarbeitung...", es: "Procesando...",
    pt: "Processando...", ru: "Обработка...", ar: "جارٍ المعالجة...", hi: "प्रोसेसिंग..."
  },
  "gift.contribute": {
    en: "Contribute", vi: "Đóng góp", zh: "贡献", ja: "寄付する", ko: "기부하기",
    th: "สนับสนุน", fr: "Contribuer", de: "Beitragen", es: "Contribuir",
    pt: "Contribuir", ru: "Внести вклад", ar: "ساهم", hi: "योगदान करें"
  },
  "gift.perMonth": {
    en: "/month", vi: "/tháng", zh: "/月", ja: "/月", ko: "/월",
    th: "/เดือน", fr: "/mois", de: "/Monat", es: "/mes",
    pt: "/mês", ru: "/месяц", ar: "/شهر", hi: "/माह"
  },
  "gift.securedStripe": {
    en: "Payment secured by Stripe 🔒", vi: "Thanh toán được bảo mật qua Stripe 🔒", zh: "通过 Stripe 安全支付 🔒", ja: "Stripe による安全な支払い 🔒", ko: "Stripe로 안전하게 결제 🔒",
    th: "การชำระเงินปลอดภัยผ่าน Stripe 🔒", fr: "Paiement sécurisé par Stripe 🔒", de: "Zahlung gesichert durch Stripe 🔒", es: "Pago asegurado por Stripe 🔒",
    pt: "Pagamento seguro pelo Stripe 🔒", ru: "Платеж защищен Stripe 🔒", ar: "الدفع مؤمن عبر Stripe 🔒", hi: "Stripe द्वारा सुरक्षित भुगतान 🔒"
  },
  "gift.gasFees": {
    en: "Gas fees apply 🔒", vi: "Phí gas áp dụng 🔒", zh: "适用 Gas 费用 🔒", ja: "ガス料金が適用されます 🔒", ko: "가스 요금 적용 🔒",
    th: "มีค่าธรรมเนียม Gas 🔒", fr: "Frais de gas applicables 🔒", de: "Gas-Gebühren gelten 🔒", es: "Se aplican tarifas de gas 🔒",
    pt: "Taxas de gas aplicáveis 🔒", ru: "Применяются комиссии за газ 🔒", ar: "تطبق رسوم الغاز 🔒", hi: "गैस शुल्क लागू 🔒"
  },

  // ============ MESSAGES PAGE ============
  "messages.title": {
    en: "Messages", vi: "Tin nhắn", zh: "消息", ja: "メッセージ", ko: "메시지",
    th: "ข้อความ", fr: "Messages", de: "Nachrichten", es: "Mensajes",
    pt: "Mensagens", ru: "Сообщения", ar: "الرسائل", hi: "संदेश"
  },
  "messages.description": {
    en: "Chat with friends and communities", vi: "Trò chuyện với bạn bè và cộng đồng", zh: "与朋友和社区聊天", ja: "友達やコミュニティとチャット", ko: "친구 및 커뮤니티와 채팅",
    th: "แชทกับเพื่อนและชุมชน", fr: "Discutez avec vos amis et communautés", de: "Chatten Sie mit Freunden und Communities", es: "Chatea con amigos y comunidades",
    pt: "Converse com amigos e comunidades", ru: "Общайтесь с друзьями и сообществами", ar: "دردش مع الأصدقاء والمجتمعات", hi: "मित्रों और समुदायों के साथ चैट करें"
  },
  "messages.searchByName": {
    en: "Search by name...", vi: "Tìm kiếm theo tên...", zh: "按名称搜索...", ja: "名前で検索...", ko: "이름으로 검색...",
    th: "ค้นหาตามชื่อ...", fr: "Rechercher par nom...", de: "Nach Namen suchen...", es: "Buscar por nombre...",
    pt: "Pesquisar por nome...", ru: "Поиск по имени...", ar: "البحث بالاسم...", hi: "नाम से खोजें..."
  },
  "messages.all": {
    en: "All", vi: "Tất cả", zh: "全部", ja: "すべて", ko: "전체",
    th: "ทั้งหมด", fr: "Tous", de: "Alle", es: "Todos",
    pt: "Todos", ru: "Все", ar: "الكل", hi: "सभी"
  },
  "messages.unread": {
    en: "Unread", vi: "Chưa đọc", zh: "未读", ja: "未読", ko: "읽지 않음",
    th: "ยังไม่ได้อ่าน", fr: "Non lus", de: "Ungelesen", es: "No leídos",
    pt: "Não lidos", ru: "Непрочитанные", ar: "غير مقروءة", hi: "अपठित"
  },
  "messages.groups": {
    en: "Groups", vi: "Nhóm", zh: "群组", ja: "グループ", ko: "그룹",
    th: "กลุ่ม", fr: "Groupes", de: "Gruppen", es: "Grupos",
    pt: "Grupos", ru: "Группы", ar: "المجموعات", hi: "समूह"
  },
  "messages.calls": {
    en: "Calls", vi: "Cuộc gọi", zh: "通话", ja: "通話", ko: "통화",
    th: "การโทร", fr: "Appels", de: "Anrufe", es: "Llamadas",
    pt: "Chamadas", ru: "Звонки", ar: "المكالمات", hi: "कॉल"
  },
  "messages.noConversations": {
    en: "No conversations yet", vi: "Chưa có cuộc trò chuyện nào", zh: "暂无对话", ja: "会話がまだありません", ko: "대화가 없습니다",
    th: "ยังไม่มีการสนทนา", fr: "Aucune conversation", de: "Noch keine Gespräche", es: "Sin conversaciones",
    pt: "Nenhuma conversa ainda", ru: "Пока нет разговоров", ar: "لا توجد محادثات بعد", hi: "अभी कोई वार्तालाप नहीं"
  },
  "messages.searchStart": {
    en: "Search and start a new conversation", vi: "Tìm kiếm và bắt đầu cuộc trò chuyện mới", zh: "搜索并开始新对话", ja: "検索して新しい会話を始める", ko: "검색하고 새 대화 시작",
    th: "ค้นหาและเริ่มการสนทนาใหม่", fr: "Recherchez et démarrez une nouvelle conversation", de: "Suchen und neue Unterhaltung starten", es: "Busca e inicia una nueva conversación",
    pt: "Pesquise e inicie uma nova conversa", ru: "Найдите и начните новый разговор", ar: "ابحث وابدأ محادثة جديدة", hi: "खोजें और नई बातचीत शुरू करें"
  },
  "messages.selectConversation": {
    en: "Select a conversation to start chatting", vi: "Chọn một cuộc trò chuyện để bắt đầu chat", zh: "选择一个对话开始聊天", ja: "会話を選択してチャットを開始", ko: "채팅을 시작할 대화를 선택하세요",
    th: "เลือกการสนทนาเพื่อเริ่มแชท", fr: "Sélectionnez une conversation pour commencer à discuter", de: "Wählen Sie ein Gespräch, um zu chatten", es: "Selecciona una conversación para chatear",
    pt: "Selecione uma conversa para começar a conversar", ru: "Выберите разговор, чтобы начать общение", ar: "اختر محادثة لبدء الدردشة", hi: "चैट शुरू करने के लिए एक वार्तालाप चुनें"
  },
  "messages.typeMessage": {
    en: "Type a message...", vi: "Nhập tin nhắn...", zh: "输入消息...", ja: "メッセージを入力...", ko: "메시지 입력...",
    th: "พิมพ์ข้อความ...", fr: "Tapez un message...", de: "Nachricht eingeben...", es: "Escribe un mensaje...",
    pt: "Digite uma mensagem...", ru: "Введите сообщение...", ar: "اكتب رسالة...", hi: "संदेश टाइप करें..."
  },
  "messages.online": {
    en: "Online", vi: "Đang hoạt động", zh: "在线", ja: "オンライン", ko: "온라인",
    th: "ออนไลน์", fr: "En ligne", de: "Online", es: "En línea",
    pt: "Online", ru: "В сети", ar: "متصل", hi: "ऑनलाइन"
  },
  "messages.offline": {
    en: "Offline", vi: "Ngoại tuyến", zh: "离线", ja: "オフライン", ko: "오프라인",
    th: "ออฟไลน์", fr: "Hors ligne", de: "Offline", es: "Sin conexión",
    pt: "Offline", ru: "Не в сети", ar: "غير متصل", hi: "ऑफलाइन"
  },
  "messages.typing": {
    en: "is typing...", vi: "đang nhập...", zh: "正在输入...", ja: "入力中...", ko: "입력 중...",
    th: "กำลังพิมพ์...", fr: "écrit...", de: "tippt...", es: "escribiendo...",
    pt: "digitando...", ru: "печатает...", ar: "يكتب...", hi: "टाइप कर रहा है..."
  },
  "messages.deleteMessage": {
    en: "Delete message", vi: "Xóa tin nhắn", zh: "删除消息", ja: "メッセージを削除", ko: "메시지 삭제",
    th: "ลบข้อความ", fr: "Supprimer le message", de: "Nachricht löschen", es: "Eliminar mensaje",
    pt: "Excluir mensagem", ru: "Удалить сообщение", ar: "حذف الرسالة", hi: "संदेश हटाएं"
  },
  "messages.deleteConversation": {
    en: "Delete conversation", vi: "Xóa cuộc trò chuyện", zh: "删除对话", ja: "会話を削除", ko: "대화 삭제",
    th: "ลบการสนทนา", fr: "Supprimer la conversation", de: "Gespräch löschen", es: "Eliminar conversación",
    pt: "Excluir conversa", ru: "Удалить разговор", ar: "حذف المحادثة", hi: "वार्तालाप हटाएं"
  },
  "messages.createGroup": {
    en: "Create Group", vi: "Tạo nhóm", zh: "创建群组", ja: "グループを作成", ko: "그룹 만들기",
    th: "สร้างกลุ่ม", fr: "Créer un groupe", de: "Gruppe erstellen", es: "Crear grupo",
    pt: "Criar grupo", ru: "Создать группу", ar: "إنشاء مجموعة", hi: "समूह बनाएं"
  },
  "messages.videoCall": {
    en: "Video call", vi: "Gọi video", zh: "视频通话", ja: "ビデオ通話", ko: "영상 통화",
    th: "วิดีโอคอล", fr: "Appel vidéo", de: "Videoanruf", es: "Videollamada",
    pt: "Videochamada", ru: "Видеозвонок", ar: "مكالمة فيديو", hi: "वीडियो कॉल"
  },
  "messages.voiceCall": {
    en: "Voice call", vi: "Gọi thoại", zh: "语音通话", ja: "音声通話", ko: "음성 통화",
    th: "โทรเสียง", fr: "Appel vocal", de: "Sprachanruf", es: "Llamada de voz",
    pt: "Chamada de voz", ru: "Голосовой звонок", ar: "مكالمة صوتية", hi: "वॉयस कॉल"
  },
  "messages.mediaFiles": {
    en: "Media & Files", vi: "Phương tiện & Tệp", zh: "媒体与文件", ja: "メディアとファイル", ko: "미디어 및 파일",
    th: "สื่อและไฟล์", fr: "Médias et fichiers", de: "Medien & Dateien", es: "Medios y archivos",
    pt: "Mídia e arquivos", ru: "Медиа и файлы", ar: "الوسائط والملفات", hi: "मीडिया और फ़ाइलें"
  },
  "messages.privacy": {
    en: "Privacy & Safety", vi: "Quyền riêng tư & Bảo mật", zh: "隐私与安全", ja: "プライバシーとセキュリティ", ko: "개인정보 및 보안",
    th: "ความเป็นส่วนตัวและความปลอดภัย", fr: "Confidentialité et sécurité", de: "Datenschutz & Sicherheit", es: "Privacidad y seguridad",
    pt: "Privacidade e segurança", ru: "Конфиденциальность и безопасность", ar: "الخصوصية والأمان", hi: "गोपनीयता और सुरक्षा"
  },
  "messages.user": {
    en: "User", vi: "Người dùng", zh: "用户", ja: "ユーザー", ko: "사용자",
    th: "ผู้ใช้", fr: "Utilisateur", de: "Benutzer", es: "Usuario",
    pt: "Usuário", ru: "Пользователь", ar: "مستخدم", hi: "उपयोगकर्ता"
  },
  "messages.image": {
    en: "Image", vi: "Hình ảnh", zh: "图片", ja: "画像", ko: "이미지",
    th: "รูปภาพ", fr: "Image", de: "Bild", es: "Imagen",
    pt: "Imagem", ru: "Изображение", ar: "صورة", hi: "छवि"
  },
  "messages.video": {
    en: "Video", vi: "Video", zh: "视频", ja: "ビデオ", ko: "비디오",
    th: "วิดีโอ", fr: "Vidéo", de: "Video", es: "Video",
    pt: "Vídeo", ru: "Видео", ar: "فيديو", hi: "वीडियो"
  },
  "messages.callEnded": {
    en: "Call ended", vi: "Cuộc gọi đã kết thúc", zh: "通话结束", ja: "通話終了", ko: "통화 종료",
    th: "การโทรสิ้นสุดแล้ว", fr: "Appel terminé", de: "Anruf beendet", es: "Llamada finalizada",
    pt: "Chamada encerrada", ru: "Звонок завершен", ar: "انتهت المكالمة", hi: "कॉल समाप्त हुई"
  },
  "messages.callNotAvailable": {
    en: "Call not available", vi: "Cuộc gọi này không còn khả dụng", zh: "此通话不可用", ja: "通話が利用できません", ko: "통화를 사용할 수 없습니다",
    th: "ไม่สามารถโทรได้", fr: "Appel non disponible", de: "Anruf nicht verfügbar", es: "Llamada no disponible",
    pt: "Chamada não disponível", ru: "Звонок недоступен", ar: "المكالمة غير متاحة", hi: "कॉल उपलब्ध नहीं"
  },
  "messages.error": {
    en: "Error", vi: "Lỗi", zh: "错误", ja: "エラー", ko: "오류",
    th: "ข้อผิดพลาด", fr: "Erreur", de: "Fehler", es: "Error",
    pt: "Erro", ru: "Ошибка", ar: "خطأ", hi: "त्रुटि"
  },
  "messages.callNotFound": {
    en: "Call not found", vi: "Không tìm thấy cuộc gọi", zh: "未找到通话", ja: "通話が見つかりません", ko: "통화를 찾을 수 없습니다",
    th: "ไม่พบการโทร", fr: "Appel introuvable", de: "Anruf nicht gefunden", es: "Llamada no encontrada",
    pt: "Chamada não encontrada", ru: "Звонок не найден", ar: "لم يتم العثور على المكالمة", hi: "कॉल नहीं मिला"
  },
  "messages.muteNotifications": {
    en: "Mute notifications", vi: "Tắt thông báo", zh: "静音通知", ja: "通知をミュート", ko: "알림 음소거",
    th: "ปิดเสียงแจ้งเตือน", fr: "Couper les notifications", de: "Benachrichtigungen stummschalten", es: "Silenciar notificaciones",
    pt: "Silenciar notificações", ru: "Отключить уведомления", ar: "كتم الإشعارات", hi: "सूचनाएं म्यूट करें"
  },
  "messages.block": {
    en: "Block", vi: "Chặn", zh: "屏蔽", ja: "ブロック", ko: "차단",
    th: "บล็อก", fr: "Bloquer", de: "Blockieren", es: "Bloquear",
    pt: "Bloquear", ru: "Заблокировать", ar: "حظر", hi: "ब्लॉक करें"
  },
  "messages.report": {
    en: "Report", vi: "Báo cáo", zh: "举报", ja: "報告", ko: "신고",
    th: "รายงาน", fr: "Signaler", de: "Melden", es: "Reportar",
    pt: "Denunciar", ru: "Пожаловаться", ar: "إبلاغ", hi: "रिपोर्ट करें"
  },
  "messages.chats": {
    en: "Chats", vi: "Đoạn chat", zh: "聊天", ja: "チャット", ko: "채팅",
    th: "แชท", fr: "Discussions", de: "Chats", es: "Chats",
    pt: "Conversas", ru: "Чаты", ar: "المحادثات", hi: "चैट"
  },
  "messages.searchMessenger": {
    en: "Search on Messenger", vi: "Tìm kiếm trên Messenger", zh: "在Messenger上搜索", ja: "Messengerで検索", ko: "메신저에서 검색",
    th: "ค้นหาใน Messenger", fr: "Rechercher sur Messenger", de: "Auf Messenger suchen", es: "Buscar en Messenger",
    pt: "Pesquisar no Messenger", ru: "Поиск в Messenger", ar: "البحث في Messenger", hi: "Messenger में खोजें"
  },
  "messages.noUsersFound": {
    en: "No users found", vi: "Không tìm thấy người dùng", zh: "未找到用户", ja: "ユーザーが見つかりません", ko: "사용자를 찾을 수 없습니다",
    th: "ไม่พบผู้ใช้", fr: "Aucun utilisateur trouvé", de: "Keine Benutzer gefunden", es: "No se encontraron usuarios",
    pt: "Nenhum usuário encontrado", ru: "Пользователи не найдены", ar: "لم يتم العثور على مستخدمين", hi: "कोई उपयोगकर्ता नहीं मिला"
  },
  "messages.startConversation": {
    en: "Start a conversation", vi: "Bắt đầu trò chuyện", zh: "开始对话", ja: "会話を始める", ko: "대화 시작",
    th: "เริ่มการสนทนา", fr: "Démarrer une conversation", de: "Gespräch starten", es: "Iniciar conversación",
    pt: "Iniciar conversa", ru: "Начать разговор", ar: "بدء محادثة", hi: "बातचीत शुरू करें"
  },
  "messages.groupChat": {
    en: "Group chat", vi: "Nhóm chat", zh: "群聊", ja: "グループチャット", ko: "그룹 채팅",
    th: "แชทกลุ่ม", fr: "Discussion de groupe", de: "Gruppenchat", es: "Chat grupal",
    pt: "Chat em grupo", ru: "Групповой чат", ar: "دردشة جماعية", hi: "समूह चैट"
  },
  "messages.members": {
    en: "members", vi: "thành viên", zh: "成员", ja: "メンバー", ko: "멤버",
    th: "สมาชิก", fr: "membres", de: "Mitglieder", es: "miembros",
    pt: "membros", ru: "участников", ar: "أعضاء", hi: "सदस्य"
  },
  "messages.recentlyActive": {
    en: "Recently active", vi: "Hoạt động gần đây", zh: "最近活跃", ja: "最近アクティブ", ko: "최근 활동",
    th: "ใช้งานล่าสุด", fr: "Récemment actif", de: "Kürzlich aktiv", es: "Activo recientemente",
    pt: "Recentemente ativo", ru: "Недавно активен", ar: "نشط مؤخرًا", hi: "हाल ही में सक्रिय"
  },
  "messages.groupAudioCall": {
    en: "Group audio call", vi: "Gọi thoại nhóm", zh: "群组语音通话", ja: "グループ音声通話", ko: "그룹 음성 통화",
    th: "โทรเสียงกลุ่ม", fr: "Appel vocal de groupe", de: "Gruppenanruf", es: "Llamada grupal de voz",
    pt: "Chamada de voz em grupo", ru: "Групповой голосовой звонок", ar: "مكالمة صوتية جماعية", hi: "समूह ऑडियो कॉल"
  },
  "messages.groupVideoCall": {
    en: "Group video call", vi: "Gọi video nhóm", zh: "群组视频通话", ja: "グループビデオ通話", ko: "그룹 영상 통화",
    th: "วิดีโอคอลกลุ่ม", fr: "Appel vidéo de groupe", de: "Gruppenvideoanruf", es: "Videollamada grupal",
    pt: "Videochamada em grupo", ru: "Групповой видеозвонок", ar: "مكالمة فيديو جماعية", hi: "समूह वीडियो कॉल"
  },
  "messages.audioCall": {
    en: "Audio call", vi: "Gọi thoại", zh: "语音通话", ja: "音声通話", ko: "음성 통화",
    th: "โทรเสียง", fr: "Appel vocal", de: "Sprachanruf", es: "Llamada de voz",
    pt: "Chamada de voz", ru: "Голосовой звонок", ar: "مكالمة صوتية", hi: "ऑडियो कॉल"
  },
  "messages.conversationInfo": {
    en: "Conversation info", vi: "Thông tin cuộc trò chuyện", zh: "对话信息", ja: "会話情報", ko: "대화 정보",
    th: "ข้อมูลการสนทนา", fr: "Info conversation", de: "Gesprächsinfo", es: "Info de conversación",
    pt: "Info da conversa", ru: "Инфо разговора", ar: "معلومات المحادثة", hi: "वार्तालाप जानकारी"
  },
  "messages.encryptedMessages": {
    en: "Messages and calls are secured with end-to-end encryption", vi: "Tin nhắn và cuộc gọi được bảo mật bằng mã hóa đầu cuối", zh: "消息和通话通过端对端加密保护", ja: "メッセージと通話はエンドツーエンド暗号化で保護されています", ko: "메시지와 통화는 종단간 암호화로 보호됩니다",
    th: "ข้อความและการโทรได้รับการเข้ารหัสแบบ end-to-end", fr: "Messages et appels sécurisés par chiffrement de bout en bout", de: "Nachrichten und Anrufe sind durch Ende-zu-Ende-Verschlüsselung geschützt", es: "Mensajes y llamadas están cifrados de extremo a extremo",
    pt: "Mensagens e chamadas são protegidas por criptografia de ponta a ponta", ru: "Сообщения и звонки защищены сквозным шифрованием", ar: "الرسائل والمكالمات مؤمنة بالتشفير من طرف إلى طرف", hi: "संदेश और कॉल एंड-टू-एंड एन्क्रिप्शन से सुरक्षित हैं"
  },
  "messages.recallMessage": {
    en: "Recall message", vi: "Thu hồi tin nhắn", zh: "撤回消息", ja: "メッセージを取り消す", ko: "메시지 회수",
    th: "เรียกคืนข้อความ", fr: "Rappeler le message", de: "Nachricht zurückrufen", es: "Retirar mensaje",
    pt: "Cancelar mensagem", ru: "Отозвать сообщение", ar: "استرجاع الرسالة", hi: "संदेश वापस लें"
  },
  "messages.recalled": {
    en: "Recalled", vi: "Đã thu hồi", zh: "已撤回", ja: "取り消し済み", ko: "회수됨",
    th: "เรียกคืนแล้ว", fr: "Rappelé", de: "Zurückgerufen", es: "Retirado",
    pt: "Cancelado", ru: "Отозвано", ar: "تم الاسترجاع", hi: "वापस लिया गया"
  },
  "messages.recallSuccess": {
    en: "Message recalled successfully", vi: "Tin nhắn đã được thu hồi thành công", zh: "消息已成功撤回", ja: "メッセージが正常に取り消されました", ko: "메시지가 성공적으로 회수되었습니다",
    th: "เรียกคืนข้อความสำเร็จ", fr: "Message rappelé avec succès", de: "Nachricht erfolgreich zurückgerufen", es: "Mensaje retirado con éxito",
    pt: "Mensagem cancelada com sucesso", ru: "Сообщение успешно отозвано", ar: "تم استرجاع الرسالة بنجاح", hi: "संदेश सफलतापूर्वक वापस लिया गया"
  },
  "messages.recallFailed": {
    en: "Failed to recall message", vi: "Không thể thu hồi tin nhắn", zh: "撤回消息失败", ja: "メッセージの取り消しに失敗しました", ko: "메시지 회수 실패",
    th: "ไม่สามารถเรียกคืนข้อความได้", fr: "Échec du rappel du message", de: "Nachricht konnte nicht zurückgerufen werden", es: "Error al retirar mensaje",
    pt: "Falha ao cancelar mensagem", ru: "Не удалось отозвать сообщение", ar: "فشل استرجاع الرسالة", hi: "संदेश वापस लेने में विफल"
  },
  "messages.sendFailed": {
    en: "Failed to send message", vi: "Không thể gửi tin nhắn", zh: "发送消息失败", ja: "メッセージの送信に失敗しました", ko: "메시지 전송 실패",
    th: "ไม่สามารถส่งข้อความได้", fr: "Échec de l'envoi du message", de: "Nachricht konnte nicht gesendet werden", es: "Error al enviar mensaje",
    pt: "Falha ao enviar mensagem", ru: "Не удалось отправить сообщение", ar: "فشل إرسال الرسالة", hi: "संदेश भेजने में विफल"
  },
  "messages.fileTooLarge": {
    en: "File too large", vi: "File quá lớn", zh: "文件太大", ja: "ファイルが大きすぎます", ko: "파일이 너무 큽니다",
    th: "ไฟล์ใหญ่เกินไป", fr: "Fichier trop volumineux", de: "Datei zu groß", es: "Archivo demasiado grande",
    pt: "Arquivo muito grande", ru: "Файл слишком большой", ar: "الملف كبير جدًا", hi: "फ़ाइल बहुत बड़ी है"
  },
  "messages.fileSizeLimit": {
    en: "Please choose an image under 10MB", vi: "Vui lòng chọn ảnh dưới 10MB", zh: "请选择小于10MB的图片", ja: "10MB以下の画像を選択してください", ko: "10MB 이하의 이미지를 선택하세요",
    th: "กรุณาเลือกรูปภาพที่มีขนาดต่ำกว่า 10MB", fr: "Veuillez choisir une image de moins de 10 Mo", de: "Bitte wählen Sie ein Bild unter 10 MB", es: "Por favor seleccione una imagen menor a 10MB",
    pt: "Por favor escolha uma imagem com menos de 10MB", ru: "Пожалуйста, выберите изображение до 10 МБ", ar: "يرجى اختيار صورة أقل من 10 ميغابايت", hi: "कृपया 10MB से कम की छवि चुनें"
  },
  "messages.yourMessages": {
    en: "Your messages", vi: "Tin nhắn của bạn", zh: "您的消息", ja: "あなたのメッセージ", ko: "내 메시지",
    th: "ข้อความของคุณ", fr: "Vos messages", de: "Ihre Nachrichten", es: "Tus mensajes",
    pt: "Suas mensagens", ru: "Ваши сообщения", ar: "رسائلك", hi: "आपके संदेश"
  },
  "messages.profile": {
    en: "Profile", vi: "Trang cá nhân", zh: "个人资料", ja: "プロフィール", ko: "프로필",
    th: "โปรไฟล์", fr: "Profil", de: "Profil", es: "Perfil",
    pt: "Perfil", ru: "Профиль", ar: "الملف الشخصي", hi: "प्रोफाइल"
  },
  "messages.chatInfo": {
    en: "About this chat", vi: "Thông tin về đoạn chat", zh: "关于此聊天", ja: "このチャットについて", ko: "이 채팅 정보",
    th: "เกี่ยวกับแชทนี้", fr: "À propos de ce chat", de: "Über diesen Chat", es: "Acerca de este chat",
    pt: "Sobre este chat", ru: "Об этом чате", ar: "حول هذه المحادثة", hi: "इस चैट के बारे में"
  },
  "messages.conversationCreated": {
    en: "Conversation created", vi: "Cuộc trò chuyện được tạo", zh: "对话已创建", ja: "会話が作成されました", ko: "대화가 생성됨",
    th: "การสนทนาสร้างแล้ว", fr: "Conversation créée", de: "Gespräch erstellt", es: "Conversación creada",
    pt: "Conversa criada", ru: "Разговор создан", ar: "تم إنشاء المحادثة", hi: "वार्तालाप बनाया गया"
  },
  "messages.customizeChat": {
    en: "Customize chat", vi: "Tùy chỉnh đoạn chat", zh: "自定义聊天", ja: "チャットをカスタマイズ", ko: "채팅 사용자 정의",
    th: "ปรับแต่งแชท", fr: "Personnaliser le chat", de: "Chat anpassen", es: "Personalizar chat",
    pt: "Personalizar chat", ru: "Настроить чат", ar: "تخصيص المحادثة", hi: "चैट अनुकूलित करें"
  },
  "messages.changeTheme": {
    en: "Change theme", vi: "Đổi chủ đề", zh: "更改主题", ja: "テーマを変更", ko: "테마 변경",
    th: "เปลี่ยนธีม", fr: "Changer le thème", de: "Thema ändern", es: "Cambiar tema",
    pt: "Alterar tema", ru: "Изменить тему", ar: "تغيير السمة", hi: "थीम बदलें"
  },
  "messages.changeNickname": {
    en: "Change nickname", vi: "Đổi biệt danh", zh: "更改昵称", ja: "ニックネームを変更", ko: "닉네임 변경",
    th: "เปลี่ยนชื่อเล่น", fr: "Changer le surnom", de: "Spitzname ändern", es: "Cambiar apodo",
    pt: "Alterar apelido", ru: "Изменить никнейм", ar: "تغيير الاسم المستعار", hi: "उपनाम बदलें"
  },
  "messages.noFiles": {
    en: "No files yet", vi: "Chưa có file nào", zh: "暂无文件", ja: "まだファイルがありません", ko: "아직 파일이 없습니다",
    th: "ยังไม่มีไฟล์", fr: "Aucun fichier", de: "Noch keine Dateien", es: "Sin archivos",
    pt: "Nenhum arquivo ainda", ru: "Пока нет файлов", ar: "لا توجد ملفات بعد", hi: "अभी कोई फ़ाइल नहीं"
  },
  "messages.privacySupport": {
    en: "Privacy and support", vi: "Quyền riêng tư và hỗ trợ", zh: "隐私和支持", ja: "プライバシーとサポート", ko: "개인정보 및 지원",
    th: "ความเป็นส่วนตัวและการสนับสนุน", fr: "Confidentialité et assistance", de: "Datenschutz und Support", es: "Privacidad y soporte",
    pt: "Privacidade e suporte", ru: "Конфиденциальность и поддержка", ar: "الخصوصية والدعم", hi: "गोपनीयता और सहायता"
  },
  "messages.attachMedia": {
    en: "Attach image/video", vi: "Đính kèm ảnh/video", zh: "附加图片/视频", ja: "画像/動画を添付", ko: "이미지/비디오 첨부",
    th: "แนบรูปภาพ/วิดีโอ", fr: "Joindre image/vidéo", de: "Bild/Video anhängen", es: "Adjuntar imagen/video",
    pt: "Anexar imagem/vídeo", ru: "Прикрепить изображение/видео", ar: "إرفاق صورة/فيديو", hi: "छवि/वीडियो संलग्न करें"
  },
  "messages.sendImage": {
    en: "Send image", vi: "Gửi ảnh", zh: "发送图片", ja: "画像を送信", ko: "이미지 보내기",
    th: "ส่งรูปภาพ", fr: "Envoyer une image", de: "Bild senden", es: "Enviar imagen",
    pt: "Enviar imagem", ru: "Отправить изображение", ar: "إرسال صورة", hi: "छवि भेजें"
  },
  "messages.sendLike": {
    en: "Send like", vi: "Gửi like", zh: "发送赞", ja: "いいねを送信", ko: "좋아요 보내기",
    th: "ส่งไลค์", fr: "Envoyer j'aime", de: "Like senden", es: "Enviar me gusta",
    pt: "Enviar curtida", ru: "Отправить лайк", ar: "إرسال إعجاب", hi: "लाइक भेजें"
  },
  "messages.newConversation": {
    en: "New conversation", vi: "Tạo cuộc trò chuyện mới", zh: "新对话", ja: "新しい会話", ko: "새 대화",
    th: "การสนทนาใหม่", fr: "Nouvelle conversation", de: "Neues Gespräch", es: "Nueva conversación",
    pt: "Nova conversa", ru: "Новый разговор", ar: "محادثة جديدة", hi: "नई बातचीत"
  },

  // ============ FRIENDS PAGE ============
  "friends.title": {
    en: "Friends", vi: "Bạn bè", zh: "好友", ja: "友達", ko: "친구",
    th: "เพื่อน", fr: "Amis", de: "Freunde", es: "Amigos",
    pt: "Amigos", ru: "Друзья", ar: "الأصدقاء", hi: "मित्र"
  },
  "friends.description": {
    en: "Connect with the community and find new friends", vi: "Kết nối với cộng đồng và tìm kiếm bạn mới", zh: "与社区建立联系并结交新朋友", ja: "コミュニティとつながり、新しい友達を見つけよう", ko: "커뮤니티와 연결하고 새 친구를 찾으세요",
    th: "เชื่อมต่อกับชุมชนและค้นหาเพื่อนใหม่", fr: "Connectez-vous avec la communauté et trouvez de nouveaux amis", de: "Verbinde dich mit der Community und finde neue Freunde", es: "Conéctate con la comunidad y encuentra nuevos amigos",
    pt: "Conecte-se com a comunidade e encontre novos amigos", ru: "Связывайтесь с сообществом и находите новых друзей", ar: "تواصل مع المجتمع وابحث عن أصدقاء جدد", hi: "समुदाय से जुड़ें और नए मित्र खोजें"
  },
  "friends.searchPlaceholder": {
    en: "Search friends by name...", vi: "Tìm kiếm bạn bè theo tên...", zh: "按名称搜索好友...", ja: "名前で友達を検索...", ko: "이름으로 친구 검색...",
    th: "ค้นหาเพื่อนตามชื่อ...", fr: "Rechercher des amis par nom...", de: "Freunde nach Namen suchen...", es: "Buscar amigos por nombre...",
    pt: "Pesquisar amigos por nome...", ru: "Искать друзей по имени...", ar: "البحث عن أصدقاء بالاسم...", hi: "नाम से मित्र खोजें..."
  },
  "friends.search": {
    en: "Search", vi: "Tìm kiếm", zh: "搜索", ja: "検索", ko: "검색",
    th: "ค้นหา", fr: "Rechercher", de: "Suchen", es: "Buscar",
    pt: "Pesquisar", ru: "Поиск", ar: "بحث", hi: "खोजें"
  },
  "friends.searchResults": {
    en: "Search results", vi: "Kết quả tìm kiếm", zh: "搜索结果", ja: "検索結果", ko: "검색 결과",
    th: "ผลการค้นหา", fr: "Résultats de recherche", de: "Suchergebnisse", es: "Resultados de búsqueda",
    pt: "Resultados da pesquisa", ru: "Результаты поиска", ar: "نتائج البحث", hi: "खोज परिणाम"
  },
  "friends.addFriend": {
    en: "Add Friend", vi: "Kết bạn", zh: "添加好友", ja: "友達追加", ko: "친구 추가",
    th: "เพิ่มเพื่อน", fr: "Ajouter un ami", de: "Freund hinzufügen", es: "Agregar amigo",
    pt: "Adicionar amigo", ru: "Добавить в друзья", ar: "إضافة صديق", hi: "मित्र जोड़ें"
  },
  "friends.unfriend": {
    en: "Unfriend", vi: "Hủy kết bạn", zh: "删除好友", ja: "友達を削除", ko: "친구 삭제",
    th: "ยกเลิกเป็นเพื่อน", fr: "Supprimer ami", de: "Entfreunden", es: "Eliminar amigo",
    pt: "Desfazer amizade", ru: "Удалить из друзей", ar: "إلغاء الصداقة", hi: "अनफ्रेंड करें"
  },
  "friends.requests": {
    en: "Requests", vi: "Lời mời", zh: "好友请求", ja: "リクエスト", ko: "요청",
    th: "คำขอ", fr: "Demandes", de: "Anfragen", es: "Solicitudes",
    pt: "Solicitações", ru: "Запросы", ar: "الطلبات", hi: "अनुरोध"
  },
  "friends.sent": {
    en: "Sent", vi: "Đã gửi", zh: "已发送", ja: "送信済み", ko: "보냄",
    th: "ส่งแล้ว", fr: "Envoyées", de: "Gesendet", es: "Enviadas",
    pt: "Enviadas", ru: "Отправленные", ar: "مرسلة", hi: "भेजा गया"
  },
  "friends.suggestions": {
    en: "Suggestions", vi: "Gợi ý", zh: "推荐", ja: "おすすめ", ko: "추천",
    th: "แนะนำ", fr: "Suggestions", de: "Vorschläge", es: "Sugerencias",
    pt: "Sugestões", ru: "Рекомендации", ar: "اقتراحات", hi: "सुझाव"
  },
  "friends.noFriends": {
    en: "You don't have any friends yet", vi: "Bạn chưa có bạn bè nào", zh: "您还没有好友", ja: "まだ友達がいません", ko: "아직 친구가 없습니다",
    th: "คุณยังไม่มีเพื่อน", fr: "Vous n'avez pas encore d'amis", de: "Du hast noch keine Freunde", es: "Aún no tienes amigos",
    pt: "Você ainda não tem amigos", ru: "У вас пока нет друзей", ar: "ليس لديك أصدقاء بعد", hi: "आपका अभी कोई मित्र नहीं है"
  },
  "friends.noPendingRequests": {
    en: "No pending requests", vi: "Không có lời mời đang chờ", zh: "没有待处理的请求", ja: "保留中のリクエストはありません", ko: "대기 중인 요청 없음",
    th: "ไม่มีคำขอที่รอดำเนินการ", fr: "Aucune demande en attente", de: "Keine ausstehenden Anfragen", es: "Sin solicitudes pendientes",
    pt: "Nenhuma solicitação pendente", ru: "Нет ожидающих запросов", ar: "لا توجد طلبات معلقة", hi: "कोई लंबित अनुरोध नहीं"
  },
  "friends.noSentRequests": {
    en: "No sent requests", vi: "Không có lời mời đã gửi", zh: "没有已发送的请求", ja: "送信したリクエストはありません", ko: "보낸 요청 없음",
    th: "ไม่มีคำขอที่ส่งออก", fr: "Aucune demande envoyée", de: "Keine gesendeten Anfragen", es: "Sin solicitudes enviadas",
    pt: "Nenhuma solicitação enviada", ru: "Нет отправленных запросов", ar: "لا توجد طلبات مرسلة", hi: "कोई भेजा गया अनुरोध नहीं"
  },
  "friends.noSuggestions": {
    en: "No suggestions available", vi: "Không có gợi ý nào", zh: "没有可用的建议", ja: "おすすめはありません", ko: "추천 없음",
    th: "ไม่มีคำแนะนำ", fr: "Aucune suggestion disponible", de: "Keine Vorschläge verfügbar", es: "Sin sugerencias disponibles",
    pt: "Nenhuma sugestão disponível", ru: "Нет доступных рекомендаций", ar: "لا توجد اقتراحات متاحة", hi: "कोई सुझाव उपलब्ध नहीं"
  },
  "friends.accept": {
    en: "Accept", vi: "Chấp nhận", zh: "接受", ja: "承認", ko: "수락",
    th: "ยอมรับ", fr: "Accepter", de: "Akzeptieren", es: "Aceptar",
    pt: "Aceitar", ru: "Принять", ar: "قبول", hi: "स्वीकार करें"
  },
  "friends.decline": {
    en: "Decline", vi: "Từ chối", zh: "拒绝", ja: "拒否", ko: "거절",
    th: "ปฏิเสธ", fr: "Refuser", de: "Ablehnen", es: "Rechazar",
    pt: "Recusar", ru: "Отклонить", ar: "رفض", hi: "अस्वीकार करें"
  },
  "friends.cancel": {
    en: "Cancel", vi: "Hủy", zh: "取消", ja: "キャンセル", ko: "취소",
    th: "ยกเลิก", fr: "Annuler", de: "Abbrechen", es: "Cancelar",
    pt: "Cancelar", ru: "Отмена", ar: "إلغاء", hi: "रद्द करें"
  },
  "friends.sentRequest": {
    en: "Friend request sent", vi: "Đã gửi lời mời kết bạn", zh: "好友请求已发送", ja: "友達リクエストを送信しました", ko: "친구 요청이 전송되었습니다",
    th: "ส่งคำขอเป็นเพื่อนแล้ว", fr: "Demande d'ami envoyée", de: "Freundschaftsanfrage gesendet", es: "Solicitud de amistad enviada",
    pt: "Solicitação de amizade enviada", ru: "Запрос на добавление в друзья отправлен", ar: "تم إرسال طلب الصداقة", hi: "मित्र अनुरोध भेजा गया"
  },
  "friends.waitingResponse": {
    en: "Waiting for response", vi: "Đang chờ phản hồi", zh: "等待回复", ja: "返答待ち", ko: "응답 대기 중",
    th: "รอการตอบกลับ", fr: "En attente de réponse", de: "Warten auf Antwort", es: "Esperando respuesta",
    pt: "Aguardando resposta", ru: "Ожидание ответа", ar: "في انتظار الرد", hi: "प्रतिक्रिया की प्रतीक्षा में"
  },
  "friends.accepted": {
    en: "Friend request accepted", vi: "Đã chấp nhận lời mời", zh: "好友请求已接受", ja: "友達リクエストを承認しました", ko: "친구 요청이 수락되었습니다",
    th: "ยอมรับคำขอเป็นเพื่อนแล้ว", fr: "Demande d'ami acceptée", de: "Freundschaftsanfrage akzeptiert", es: "Solicitud de amistad aceptada",
    pt: "Solicitação de amizade aceita", ru: "Запрос на добавление в друзья принят", ar: "تم قبول طلب الصداقة", hi: "मित्र अनुरोध स्वीकार किया गया"
  },
  "friends.nowFriends": {
    en: "You are now friends", vi: "Các bạn đã trở thành bạn bè", zh: "你们现在是好友了", ja: "友達になりました", ko: "이제 친구가 되었습니다",
    th: "ตอนนี้คุณเป็นเพื่อนกันแล้ว", fr: "Vous êtes maintenant amis", de: "Ihr seid jetzt Freunde", es: "Ahora son amigos",
    pt: "Agora vocês são amigos", ru: "Теперь вы друзья", ar: "أصبحتما أصدقاء الآن", hi: "आप अब मित्र हैं"
  },
  "friends.rejected": {
    en: "Request declined", vi: "Đã từ chối lời mời", zh: "请求已拒绝", ja: "リクエストを拒否しました", ko: "요청이 거절되었습니다",
    th: "ปฏิเสธคำขอแล้ว", fr: "Demande refusée", de: "Anfrage abgelehnt", es: "Solicitud rechazada",
    pt: "Solicitação recusada", ru: "Запрос отклонен", ar: "تم رفض الطلب", hi: "अनुरोध अस्वीकार किया गया"
  },
  "friends.cancelled": {
    en: "Request cancelled", vi: "Đã hủy lời mời kết bạn", zh: "请求已取消", ja: "リクエストをキャンセルしました", ko: "요청이 취소되었습니다",
    th: "ยกเลิกคำขอแล้ว", fr: "Demande annulée", de: "Anfrage abgebrochen", es: "Solicitud cancelada",
    pt: "Solicitação cancelada", ru: "Запрос отменен", ar: "تم إلغاء الطلب", hi: "अनुरोध रद्द किया गया"
  },
  "friends.unfriended": {
    en: "Unfriended", vi: "Đã hủy kết bạn", zh: "已删除好友", ja: "友達を削除しました", ko: "친구 삭제됨",
    th: "ยกเลิกเป็นเพื่อนแล้ว", fr: "Ami supprimé", de: "Entfreundet", es: "Eliminado de amigos",
    pt: "Amizade desfeita", ru: "Удален из друзей", ar: "تم إلغاء الصداقة", hi: "अनफ्रेंड किया गया"
  },
  "friends.message": {
    en: "Message", vi: "Nhắn tin", zh: "发消息", ja: "メッセージ", ko: "메시지",
    th: "ส่งข้อความ", fr: "Message", de: "Nachricht", es: "Mensaje",
    pt: "Mensagem", ru: "Сообщение", ar: "رسالة", hi: "संदेश"
  },

  // ============ AUTH PAGE ============
  "auth.login": {
    en: "Log In", vi: "Đăng nhập", zh: "登录", ja: "ログイン", ko: "로그인",
    th: "เข้าสู่ระบบ", fr: "Connexion", de: "Anmelden", es: "Iniciar sesión",
    pt: "Entrar", ru: "Войти", ar: "تسجيل الدخول", hi: "लॉग इन करें"
  },
  "auth.signup": {
    en: "Sign Up", vi: "Đăng ký", zh: "注册", ja: "サインアップ", ko: "회원가입",
    th: "สมัครสมาชิก", fr: "S'inscrire", de: "Registrieren", es: "Registrarse",
    pt: "Cadastrar", ru: "Зарегистрироваться", ar: "إنشاء حساب", hi: "साइन अप करें"
  },
  "auth.email": {
    en: "Email", vi: "Email", zh: "电子邮箱", ja: "メールアドレス", ko: "이메일",
    th: "อีเมล", fr: "Email", de: "E-Mail", es: "Correo electrónico",
    pt: "E-mail", ru: "Электронная почта", ar: "البريد الإلكتروني", hi: "ईमेल"
  },
  "auth.password": {
    en: "Password", vi: "Mật khẩu", zh: "密码", ja: "パスワード", ko: "비밀번호",
    th: "รหัสผ่าน", fr: "Mot de passe", de: "Passwort", es: "Contraseña",
    pt: "Senha", ru: "Пароль", ar: "كلمة المرور", hi: "पासवर्ड"
  },
  "auth.confirmPassword": {
    en: "Confirm Password", vi: "Xác nhận mật khẩu", zh: "确认密码", ja: "パスワードを確認", ko: "비밀번호 확인",
    th: "ยืนยันรหัสผ่าน", fr: "Confirmer le mot de passe", de: "Passwort bestätigen", es: "Confirmar contraseña",
    pt: "Confirmar senha", ru: "Подтвердите пароль", ar: "تأكيد كلمة المرور", hi: "पासवर्ड की पुष्टि करें"
  },
  "auth.fullName": {
    en: "Full Name", vi: "Họ và tên", zh: "全名", ja: "氏名", ko: "성명",
    th: "ชื่อ-นามสกุล", fr: "Nom complet", de: "Vollständiger Name", es: "Nombre completo",
    pt: "Nome completo", ru: "Полное имя", ar: "الاسم الكامل", hi: "पूरा नाम"
  },
  "auth.forgotPassword": {
    en: "Forgot password?", vi: "Quên mật khẩu?", zh: "忘记密码？", ja: "パスワードをお忘れですか？", ko: "비밀번호를 잊으셨나요?",
    th: "ลืมรหัสผ่าน?", fr: "Mot de passe oublié ?", de: "Passwort vergessen?", es: "¿Olvidaste tu contraseña?",
    pt: "Esqueceu a senha?", ru: "Забыли пароль?", ar: "نسيت كلمة المرور؟", hi: "पासवर्ड भूल गए?"
  },
  "auth.noAccount": {
    en: "Don't have an account?", vi: "Chưa có tài khoản?", zh: "没有账户？", ja: "アカウントをお持ちでないですか？", ko: "계정이 없으신가요?",
    th: "ยังไม่มีบัญชี?", fr: "Pas encore de compte ?", de: "Kein Konto?", es: "¿No tienes cuenta?",
    pt: "Não tem uma conta?", ru: "Нет аккаунта?", ar: "ليس لديك حساب؟", hi: "खाता नहीं है?"
  },
  "auth.haveAccount": {
    en: "Already have an account?", vi: "Đã có tài khoản?", zh: "已有账户？", ja: "すでにアカウントをお持ちですか？", ko: "이미 계정이 있으신가요?",
    th: "มีบัญชีอยู่แล้ว?", fr: "Vous avez déjà un compte ?", de: "Bereits ein Konto?", es: "¿Ya tienes cuenta?",
    pt: "Já tem uma conta?", ru: "Уже есть аккаунт?", ar: "لديك حساب بالفعل؟", hi: "पहले से खाता है?"
  },
  "auth.orContinueWith": {
    en: "Or continue with", vi: "Hoặc tiếp tục với", zh: "或者使用以下方式继续", ja: "または次で続行", ko: "또는 계속하기",
    th: "หรือดำเนินการต่อด้วย", fr: "Ou continuer avec", de: "Oder weiter mit", es: "O continuar con",
    pt: "Ou continue com", ru: "Или продолжить с", ar: "أو تابع باستخدام", hi: "या इसके साथ जारी रखें"
  },
  "auth.loggingIn": {
    en: "Logging in...", vi: "Đang đăng nhập...", zh: "正在登录...", ja: "ログイン中...", ko: "로그인 중...",
    th: "กำลังเข้าสู่ระบบ...", fr: "Connexion en cours...", de: "Anmelden...", es: "Iniciando sesión...",
    pt: "Entrando...", ru: "Вход...", ar: "جارٍ تسجيل الدخول...", hi: "लॉग इन हो रहा है..."
  },
  "auth.signingUp": {
    en: "Signing up...", vi: "Đang đăng ký...", zh: "正在注册...", ja: "サインアップ中...", ko: "가입 중...",
    th: "กำลังสมัครสมาชิก...", fr: "Inscription en cours...", de: "Registrieren...", es: "Registrándose...",
    pt: "Cadastrando...", ru: "Регистрация...", ar: "جارٍ إنشاء الحساب...", hi: "साइन अप हो रहा है..."
  },
  "auth.loginSuccess": {
    en: "Login successful", vi: "Đăng nhập thành công", zh: "登录成功", ja: "ログイン成功", ko: "로그인 성공",
    th: "เข้าสู่ระบบสำเร็จ", fr: "Connexion réussie", de: "Anmeldung erfolgreich", es: "Inicio de sesión exitoso",
    pt: "Login bem-sucedido", ru: "Вход выполнен успешно", ar: "تم تسجيل الدخول بنجاح", hi: "लॉगिन सफल"
  },
  "auth.welcome": {
    en: "Welcome", vi: "Chào mừng", zh: "欢迎", ja: "ようこそ", ko: "환영합니다",
    th: "ยินดีต้อนรับ", fr: "Bienvenue", de: "Willkommen", es: "Bienvenido",
    pt: "Bem-vindo", ru: "Добро пожаловать", ar: "مرحباً", hi: "स्वागत है"
  },
  "auth.registrationSuccess": {
    en: "Registration successful", vi: "Đăng ký thành công", zh: "注册成功", ja: "登録成功", ko: "가입 성공",
    th: "ลงทะเบียนสำเร็จ", fr: "Inscription réussie", de: "Registrierung erfolgreich", es: "Registro exitoso",
    pt: "Cadastro bem-sucedido", ru: "Регистрация успешна", ar: "تم التسجيل بنجاح", hi: "पंजीकरण सफल"
  },
  "auth.checkEmail": {
    en: "Please check your email to verify your account", vi: "Vui lòng kiểm tra email để xác minh tài khoản", zh: "请检查您的邮箱以验证账户", ja: "メールを確認してアカウントを確認してください", ko: "계정 확인을 위해 이메일을 확인해주세요",
    th: "กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ", fr: "Veuillez vérifier votre e-mail pour vérifier votre compte", de: "Bitte überprüfen Sie Ihre E-Mail, um Ihr Konto zu verifizieren", es: "Por favor revisa tu correo para verificar tu cuenta",
    pt: "Por favor, verifique seu e-mail para confirmar sua conta", ru: "Пожалуйста, проверьте свою электронную почту для подтверждения аккаунта", ar: "يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك", hi: "कृपया अपना खाता सत्यापित करने के लिए अपना ईमेल जांचें"
  },
  "auth.loginError": {
    en: "Login failed", vi: "Đăng nhập thất bại", zh: "登录失败", ja: "ログインに失敗しました", ko: "로그인 실패",
    th: "เข้าสู่ระบบล้มเหลว", fr: "Échec de la connexion", de: "Anmeldung fehlgeschlagen", es: "Error de inicio de sesión",
    pt: "Falha no login", ru: "Ошибка входа", ar: "فشل تسجيل الدخول", hi: "लॉगिन विफल"
  },
  "auth.logout": {
    en: "Log Out", vi: "Đăng xuất", zh: "退出登录", ja: "ログアウト", ko: "로그아웃",
    th: "ออกจากระบบ", fr: "Déconnexion", de: "Abmelden", es: "Cerrar sesión",
    pt: "Sair", ru: "Выйти", ar: "تسجيل الخروج", hi: "लॉग आउट"
  },


  // ============ WALLET ============
  "wallet.title": {
    en: "Wallet", vi: "Ví", zh: "钱包", ja: "ウォレット", ko: "지갑",
    th: "กระเป๋าเงิน", fr: "Portefeuille", de: "Wallet", es: "Billetera",
    pt: "Carteira", ru: "Кошелек", ar: "المحفظة", hi: "वॉलेट"
  },
  "wallet.connected": {
    en: "Connected", vi: "Đã kết nối", zh: "已连接", ja: "接続済み", ko: "연결됨",
    th: "เชื่อมต่อแล้ว", fr: "Connecté", de: "Verbunden", es: "Conectado",
    pt: "Conectado", ru: "Подключено", ar: "متصل", hi: "जुड़ा हुआ"
  },
  "wallet.disconnect": {
    en: "Disconnect", vi: "Ngắt kết nối", zh: "断开连接", ja: "切断", ko: "연결 해제",
    th: "ยกเลิกการเชื่อมต่อ", fr: "Déconnecter", de: "Trennen", es: "Desconectar",
    pt: "Desconectar", ru: "Отключить", ar: "قطع الاتصال", hi: "डिस्कनेक्ट करें"
  },
  "wallet.balance": {
    en: "Balance", vi: "Số dư", zh: "余额", ja: "残高", ko: "잔액",
    th: "ยอดคงเหลือ", fr: "Solde", de: "Guthaben", es: "Saldo",
    pt: "Saldo", ru: "Баланс", ar: "الرصيد", hi: "शेष"
  },

  // ============ CAMPAIGNS ============
  "campaigns.title": {
    en: "Campaigns", vi: "Chiến dịch", zh: "活动", ja: "キャンペーン", ko: "캠페인",
    th: "แคมเปญ", fr: "Campagnes", de: "Kampagnen", es: "Campañas",
    pt: "Campanhas", ru: "Кампании", ar: "الحملات", hi: "अभियान"
  },
  "campaigns.description": {
    en: "Browse and support charitable campaigns", vi: "Duyệt và hỗ trợ các chiến dịch từ thiện", zh: "浏览并支持慈善活动", ja: "慈善キャンペーンを閲覧してサポート", ko: "자선 캠페인 검색 및 지원",
    th: "เรียกดูและสนับสนุนแคมเปญการกุศล", fr: "Parcourir et soutenir les campagnes caritatives", de: "Durchsuchen und unterstützen Sie Wohltätigkeitskampagnen", es: "Explora y apoya campañas benéficas",
    pt: "Navegue e apoie campanhas de caridade", ru: "Просматривайте и поддерживайте благотворительные кампании", ar: "تصفح وادعم الحملات الخيرية", hi: "चैरिटेबल अभियान ब्राउज़ करें और सपोर्ट करें"
  },
  "campaigns.create": {
    en: "Create Campaign", vi: "Tạo chiến dịch", zh: "创建活动", ja: "キャンペーンを作成", ko: "캠페인 만들기",
    th: "สร้างแคมเปญ", fr: "Créer une campagne", de: "Kampagne erstellen", es: "Crear campaña",
    pt: "Criar campanha", ru: "Создать кампанию", ar: "إنشاء حملة", hi: "अभियान बनाएं"
  },
  "campaigns.goal": {
    en: "Goal", vi: "Mục tiêu", zh: "目标", ja: "目標", ko: "목표",
    th: "เป้าหมาย", fr: "Objectif", de: "Ziel", es: "Meta",
    pt: "Meta", ru: "Цель", ar: "الهدف", hi: "लक्ष्य"
  },
  "campaigns.raised": {
    en: "Raised", vi: "Đã quyên góp", zh: "已筹集", ja: "集まった金額", ko: "모금액",
    th: "ระดมทุนได้", fr: "Collecté", de: "Gesammelt", es: "Recaudado",
    pt: "Arrecadado", ru: "Собрано", ar: "تم جمع", hi: "जुटाया गया"
  },
  "campaigns.donors": {
    en: "Donors", vi: "Người quyên góp", zh: "捐赠者", ja: "寄付者", ko: "기부자",
    th: "ผู้บริจาค", fr: "Donateurs", de: "Spender", es: "Donantes",
    pt: "Doadores", ru: "Жертвователи", ar: "المتبرعون", hi: "दानदाता"
  },
  "campaigns.daysLeft": {
    en: "days left", vi: "ngày còn lại", zh: "天剩余", ja: "日残り", ko: "일 남음",
    th: "วันที่เหลือ", fr: "jours restants", de: "Tage übrig", es: "días restantes",
    pt: "dias restantes", ru: "дней осталось", ar: "أيام متبقية", hi: "दिन बाकी"
  },
  "campaigns.active": {
    en: "Active", vi: "Đang hoạt động", zh: "进行中", ja: "アクティブ", ko: "진행 중",
    th: "กำลังดำเนินการ", fr: "Actif", de: "Aktiv", es: "Activo",
    pt: "Ativo", ru: "Активна", ar: "نشطة", hi: "सक्रिय"
  },
  "campaigns.completed": {
    en: "Completed", vi: "Hoàn thành", zh: "已完成", ja: "完了", ko: "완료",
    th: "เสร็จสิ้น", fr: "Terminé", de: "Abgeschlossen", es: "Completado",
    pt: "Concluído", ru: "Завершена", ar: "مكتملة", hi: "पूर्ण"
  },
  "campaigns.pending": {
    en: "Pending", vi: "Đang chờ", zh: "待审核", ja: "保留中", ko: "대기 중",
    th: "รอดำเนินการ", fr: "En attente", de: "Ausstehend", es: "Pendiente",
    pt: "Pendente", ru: "На рассмотрении", ar: "قيد الانتظار", hi: "लंबित"
  },

  // ============ PROFILE ============
  "profile.title": {
    en: "Profile", vi: "Hồ sơ", zh: "个人资料", ja: "プロフィール", ko: "프로필",
    th: "โปรไฟล์", fr: "Profil", de: "Profil", es: "Perfil",
    pt: "Perfil", ru: "Профиль", ar: "الملف الشخصي", hi: "प्रोफ़ाइल"
  },
  "profile.editProfile": {
    en: "Edit Profile", vi: "Chỉnh sửa hồ sơ", zh: "编辑资料", ja: "プロフィールを編集", ko: "프로필 편집",
    th: "แก้ไขโปรไฟล์", fr: "Modifier le profil", de: "Profil bearbeiten", es: "Editar perfil",
    pt: "Editar perfil", ru: "Редактировать профиль", ar: "تعديل الملف الشخصي", hi: "प्रोफ़ाइल संपादित करें"
  },
  "profile.bio": {
    en: "Bio", vi: "Giới thiệu", zh: "简介", ja: "自己紹介", ko: "소개",
    th: "ประวัติ", fr: "Bio", de: "Biografie", es: "Biografía",
    pt: "Bio", ru: "О себе", ar: "نبذة", hi: "परिचय"
  },
  "profile.posts": {
    en: "Posts", vi: "Bài viết", zh: "帖子", ja: "投稿", ko: "게시물",
    th: "โพสต์", fr: "Publications", de: "Beiträge", es: "Publicaciones",
    pt: "Publicações", ru: "Публикации", ar: "المنشورات", hi: "पोस्ट"
  },
  "profile.photos": {
    en: "Photos", vi: "Ảnh", zh: "照片", ja: "写真", ko: "사진",
    th: "รูปภาพ", fr: "Photos", de: "Fotos", es: "Fotos",
    pt: "Fotos", ru: "Фотографии", ar: "الصور", hi: "तस्वीरें"
  },
  "profile.videos": {
    en: "Videos", vi: "Video", zh: "视频", ja: "動画", ko: "동영상",
    th: "วิดีโอ", fr: "Vidéos", de: "Videos", es: "Videos",
    pt: "Vídeos", ru: "Видео", ar: "مقاطع الفيديو", hi: "वीडियो"
  },
  "profile.about": {
    en: "About", vi: "Giới thiệu", zh: "关于", ja: "概要", ko: "소개",
    th: "เกี่ยวกับ", fr: "À propos", de: "Über", es: "Acerca de",
    pt: "Sobre", ru: "О себе", ar: "حول", hi: "के बारे में"
  },

  // ============ NOTIFICATIONS ============
  "notifications.title": {
    en: "Notifications", vi: "Thông báo", zh: "通知", ja: "通知", ko: "알림",
    th: "การแจ้งเตือน", fr: "Notifications", de: "Benachrichtigungen", es: "Notificaciones",
    pt: "Notificações", ru: "Уведомления", ar: "الإشعارات", hi: "सूचनाएं"
  },
  "notifications.noNotifications": {
    en: "No notifications", vi: "Không có thông báo", zh: "没有通知", ja: "通知はありません", ko: "알림 없음",
    th: "ไม่มีการแจ้งเตือน", fr: "Aucune notification", de: "Keine Benachrichtigungen", es: "Sin notificaciones",
    pt: "Sem notificações", ru: "Нет уведомлений", ar: "لا توجد إشعارات", hi: "कोई सूचना नहीं"
  },
  "notifications.markAllRead": {
    en: "Mark all as read", vi: "Đánh dấu tất cả đã đọc", zh: "全部标为已读", ja: "すべて既読にする", ko: "모두 읽음으로 표시",
    th: "ทำเครื่องหมายว่าอ่านทั้งหมด", fr: "Tout marquer comme lu", de: "Alle als gelesen markieren", es: "Marcar todo como leído",
    pt: "Marcar tudo como lido", ru: "Отметить все как прочитанное", ar: "تحديد الكل كمقروء", hi: "सभी को पढ़ा हुआ चिह्नित करें"
  },

  // ============ SETTINGS ============
  "settings.title": {
    en: "Settings", vi: "Cài đặt", zh: "设置", ja: "設定", ko: "설정",
    th: "การตั้งค่า", fr: "Paramètres", de: "Einstellungen", es: "Configuración",
    pt: "Configurações", ru: "Настройки", ar: "الإعدادات", hi: "सेटिंग्स"
  },
  "settings.account": {
    en: "Account", vi: "Tài khoản", zh: "账户", ja: "アカウント", ko: "계정",
    th: "บัญชี", fr: "Compte", de: "Konto", es: "Cuenta",
    pt: "Conta", ru: "Аккаунт", ar: "الحساب", hi: "खाता"
  },
  "settings.privacy": {
    en: "Privacy", vi: "Quyền riêng tư", zh: "隐私", ja: "プライバシー", ko: "개인정보",
    th: "ความเป็นส่วนตัว", fr: "Confidentialité", de: "Datenschutz", es: "Privacidad",
    pt: "Privacidade", ru: "Конфиденциальность", ar: "الخصوصية", hi: "गोपनीयता"
  },
  "settings.security": {
    en: "Security", vi: "Bảo mật", zh: "安全", ja: "セキュリティ", ko: "보안",
    th: "ความปลอดภัย", fr: "Sécurité", de: "Sicherheit", es: "Seguridad",
    pt: "Segurança", ru: "Безопасность", ar: "الأمان", hi: "सुरक्षा"
  },
  "settings.notifications": {
    en: "Notifications", vi: "Thông báo", zh: "通知", ja: "通知", ko: "알림",
    th: "การแจ้งเตือน", fr: "Notifications", de: "Benachrichtigungen", es: "Notificaciones",
    pt: "Notificações", ru: "Уведомления", ar: "الإشعارات", hi: "सूचनाएं"
  },
  "settings.appearance": {
    en: "Appearance", vi: "Giao diện", zh: "外观", ja: "外観", ko: "외관",
    th: "รูปลักษณ์", fr: "Apparence", de: "Erscheinungsbild", es: "Apariencia",
    pt: "Aparência", ru: "Внешний вид", ar: "المظهر", hi: "दिखावट"
  },

  // Note: Additional messages keys were consolidated with earlier messages section

  // ============ DASHBOARD PAGE ============
  "dashboard.title": {
    en: "Impact Dashboard", vi: "Bảng Điều Khiển Tác Động", zh: "影响力仪表板", ja: "インパクトダッシュボード", ko: "영향력 대시보드",
    th: "แดชบอร์ดผลกระทบ", fr: "Tableau de bord d'impact", de: "Wirkungsdashboard", es: "Panel de impacto",
    pt: "Painel de impacto", ru: "Панель воздействия", ar: "لوحة التأثير", hi: "प्रभाव डैशबोर्ड"
  },
  "dashboard.liveOverview": {
    en: "Live Overview", vi: "Tổng Quan Trực Tiếp", zh: "实时概览", ja: "ライブ概要", ko: "실시간 개요",
    th: "ภาพรวมแบบเรียลไทม์", fr: "Aperçu en direct", de: "Live-Übersicht", es: "Vista en vivo",
    pt: "Visão ao vivo", ru: "Обзор в реальном времени", ar: "نظرة عامة مباشرة", hi: "लाइव अवलोकन"
  },
  "dashboard.description": {
    en: "Real-time transparency of global charitable impact", vi: "Minh bạch real-time về tác động từ thiện toàn cầu", zh: "全球慈善影响的实时透明度", ja: "世界的な慈善活動の影響をリアルタイムで透明化", ko: "글로벌 자선 영향력의 실시간 투명성",
    th: "ความโปร่งใสแบบเรียลไทม์ของผลกระทบการกุศลทั่วโลก", fr: "Transparence en temps réel de l'impact caritatif mondial", de: "Echtzeit-Transparenz globaler wohltätiger Wirkung", es: "Transparencia en tiempo real del impacto benéfico global",
    pt: "Transparência em tempo real do impacto beneficente global", ru: "Прозрачность глобального благотворительного воздействия в реальном времени", ar: "الشفافية الفورية للتأثير الخيري العالمي", hi: "वैश्विक धर्मार्थ प्रभाव की वास्तविक समय पारदर्शिता"
  },
  "dashboard.totalDonations": {
    en: "Total Donations", vi: "Tổng Quyên Góp", zh: "捐款总额", ja: "寄付総額", ko: "총 기부금",
    th: "ยอดบริจาคทั้งหมด", fr: "Dons totaux", de: "Gesamtspenden", es: "Donaciones totales",
    pt: "Doações totais", ru: "Общие пожертвования", ar: "إجمالي التبرعات", hi: "कुल दान"
  },
  "dashboard.activeCampaigns": {
    en: "Active Campaigns", vi: "Chiến Dịch Hoạt Động", zh: "活跃活动", ja: "アクティブなキャンペーン", ko: "활성 캠페인",
    th: "แคมเปญที่ใช้งานอยู่", fr: "Campagnes actives", de: "Aktive Kampagnen", es: "Campañas activas",
    pt: "Campanhas ativas", ru: "Активные кампании", ar: "الحملات النشطة", hi: "सक्रिय अभियान"
  },
  "dashboard.totalDonors": {
    en: "Total Donors", vi: "Tổng Nhà Hảo Tâm", zh: "捐赠者总数", ja: "寄付者総数", ko: "총 기부자",
    th: "ผู้บริจาคทั้งหมด", fr: "Donateurs totaux", de: "Gesamtzahl Spender", es: "Donantes totales",
    pt: "Doadores totais", ru: "Всего доноров", ar: "إجمالي المتبرعين", hi: "कुल दानकर्ता"
  },
  "dashboard.countriesReached": {
    en: "Countries Reached", vi: "Quốc Gia Tiếp Cận", zh: "覆盖国家", ja: "到達国", ko: "도달 국가",
    th: "ประเทศที่เข้าถึง", fr: "Pays atteints", de: "Erreichte Länder", es: "Países alcanzados",
    pt: "Países alcançados", ru: "Охваченные страны", ar: "الدول التي تم الوصول إليها", hi: "पहुंचे देश"
  },
  "dashboard.donationTrend": {
    en: "Donation Trend", vi: "Xu Hướng Quyên Góp", zh: "捐款趋势", ja: "寄付傾向", ko: "기부 추세",
    th: "แนวโน้มการบริจาค", fr: "Tendance des dons", de: "Spendentrend", es: "Tendencia de donaciones",
    pt: "Tendência de doações", ru: "Тенденция пожертвований", ar: "اتجاه التبرعات", hi: "दान की प्रवृत्ति"
  },
  "dashboard.monthlyDonationsOverTime": {
    en: "Monthly donations over time", vi: "Quyên góp hàng tháng theo thời gian", zh: "月度捐款趋势", ja: "月別寄付の推移", ko: "월별 기부금 추이",
    th: "การบริจาครายเดือนตามเวลา", fr: "Dons mensuels au fil du temps", de: "Monatliche Spenden im Zeitverlauf", es: "Donaciones mensuales a lo largo del tiempo",
    pt: "Doações mensais ao longo do tempo", ru: "Ежемесячные пожертвования за время", ar: "التبرعات الشهرية عبر الوقت", hi: "समय के साथ मासिक दान"
  },
  "dashboard.thisMonth": {
    en: "this month", vi: "tháng này", zh: "本月", ja: "今月", ko: "이번 달",
    th: "เดือนนี้", fr: "ce mois-ci", de: "diesen Monat", es: "este mes",
    pt: "este mês", ru: "в этом месяце", ar: "هذا الشهر", hi: "इस महीने"
  },
  "dashboard.impactByCategory": {
    en: "Impact by Category", vi: "Tác Động Theo Danh Mục", zh: "按类别划分的影响", ja: "カテゴリー別インパクト", ko: "카테고리별 영향력",
    th: "ผลกระทบตามหมวดหมู่", fr: "Impact par catégorie", de: "Wirkung nach Kategorie", es: "Impacto por categoría",
    pt: "Impacto por categoria", ru: "Воздействие по категориям", ar: "التأثير حسب الفئة", hi: "श्रेणी के अनुसार प्रभाव"
  },
  "dashboard.cleanWater": {
    en: "Clean Water", vi: "Nước Sạch", zh: "清洁水源", ja: "清潔な水", ko: "깨끗한 물",
    th: "น้ำสะอาด", fr: "Eau propre", de: "Sauberes Wasser", es: "Agua limpia",
    pt: "Água limpa", ru: "Чистая вода", ar: "المياه النظيفة", hi: "स्वच्छ पानी"
  },
  "dashboard.education": {
    en: "Education", vi: "Giáo Dục", zh: "教育", ja: "教育", ko: "교육",
    th: "การศึกษา", fr: "Éducation", de: "Bildung", es: "Educación",
    pt: "Educação", ru: "Образование", ar: "التعليم", hi: "शिक्षा"
  },
  "dashboard.food": {
    en: "Food", vi: "Lương Thực", zh: "食物", ja: "食料", ko: "식량",
    th: "อาหาร", fr: "Nourriture", de: "Nahrung", es: "Alimentos",
    pt: "Comida", ru: "Еда", ar: "الطعام", hi: "भोजन"
  },
  "dashboard.healthcare": {
    en: "Healthcare", vi: "Y Tế", zh: "医疗保健", ja: "医療", ko: "의료",
    th: "การดูแลสุขภาพ", fr: "Santé", de: "Gesundheit", es: "Salud",
    pt: "Saúde", ru: "Здравоохранение", ar: "الرعاية الصحية", hi: "स्वास्थ्य सेवा"
  },
  "dashboard.other": {
    en: "Other", vi: "Khác", zh: "其他", ja: "その他", ko: "기타",
    th: "อื่นๆ", fr: "Autre", de: "Andere", es: "Otro",
    pt: "Outro", ru: "Другое", ar: "أخرى", hi: "अन्य"
  },
  "dashboard.liveActivity": {
    en: "Live Activity", vi: "Hoạt Động Trực Tiếp", zh: "实时活动", ja: "ライブアクティビティ", ko: "실시간 활동",
    th: "กิจกรรมแบบเรียลไทม์", fr: "Activité en direct", de: "Live-Aktivität", es: "Actividad en vivo",
    pt: "Atividade ao vivo", ru: "Активность в реальном времени", ar: "النشاط المباشر", hi: "लाइव गतिविधि"
  },
  "dashboard.donatedTo": {
    en: "donated to", vi: "đã quyên góp cho", zh: "捐赠给", ja: "に寄付しました", ko: "에 기부했습니다",
    th: "บริจาคให้", fr: "a fait un don à", de: "hat gespendet für", es: "donó a",
    pt: "doou para", ru: "пожертвовал на", ar: "تبرع لـ", hi: "को दान दिया"
  },
  "dashboard.reached": {
    en: "reached", vi: "đạt", zh: "达到", ja: "達成", ko: "달성",
    th: "ถึง", fr: "atteint", de: "erreicht", es: "alcanzó",
    pt: "atingiu", ru: "достигнуто", ar: "وصلت", hi: "पहुंचा"
  },
  "dashboard.newCampaign": {
    en: "New campaign", vi: "Chiến dịch mới", zh: "新活动", ja: "新しいキャンペーン", ko: "새 캠페인",
    th: "แคมเปญใหม่", fr: "Nouvelle campagne", de: "Neue Kampagne", es: "Nueva campaña",
    pt: "Nova campanha", ru: "Новая кампания", ar: "حملة جديدة", hi: "नया अभियान"
  },
  "dashboard.justLaunched": {
    en: "just launched", vi: "vừa ra mắt", zh: "刚刚启动", ja: "開始しました", ko: "방금 시작",
    th: "เพิ่งเปิดตัว", fr: "vient d'être lancée", de: "gerade gestartet", es: "recién lanzada",
    pt: "acabou de lançar", ru: "только что запущена", ar: "تم إطلاقها للتو", hi: "अभी लॉन्च हुआ"
  },
  "dashboard.topDonors": {
    en: "Top Donors", vi: "Top Nhà Hảo Tâm", zh: "顶级捐赠者", ja: "トップドナー", ko: "최고 기부자",
    th: "ผู้บริจาคยอดเยี่ยม", fr: "Meilleurs donateurs", de: "Top-Spender", es: "Principales donantes",
    pt: "Principais doadores", ru: "Лучшие доноры", ar: "أفضل المتبرعين", hi: "शीर्ष दानकर्ता"
  },
  "dashboard.leaderboard": {
    en: "Leaderboard", vi: "Bảng Xếp Hạng", zh: "排行榜", ja: "リーダーボード", ko: "리더보드",
    th: "กระดานผู้นำ", fr: "Classement", de: "Rangliste", es: "Tabla de clasificación",
    pt: "Classificação", ru: "Таблица лидеров", ar: "لوحة المتصدرين", hi: "लीडरबोर्ड"
  },
  "dashboard.campaignsCount": {
    en: "campaigns", vi: "chiến dịch", zh: "活动", ja: "キャンペーン", ko: "캠페인",
    th: "แคมเปญ", fr: "campagnes", de: "Kampagnen", es: "campañas",
    pt: "campanhas", ru: "кампаний", ar: "حملات", hi: "अभियान"
  },
  "dashboard.diamond": {
    en: "Diamond", vi: "Kim Cương", zh: "钻石", ja: "ダイヤモンド", ko: "다이아몬드",
    th: "เพชร", fr: "Diamant", de: "Diamant", es: "Diamante",
    pt: "Diamante", ru: "Бриллиант", ar: "ماسي", hi: "हीरा"
  },
  "dashboard.corporateHero": {
    en: "Corporate Hero", vi: "Anh Hùng DN", zh: "企业英雄", ja: "企業ヒーロー", ko: "기업 영웅",
    th: "ฮีโร่องค์กร", fr: "Héros d'entreprise", de: "Unternehmensheld", es: "Héroe corporativo",
    pt: "Herói corporativo", ru: "Корпоративный герой", ar: "بطل الشركة", hi: "कॉर्पोरेट हीरो"
  },
  "dashboard.platinum": {
    en: "Platinum", vi: "Bạch Kim", zh: "铂金", ja: "プラチナ", ko: "플래티넘",
    th: "แพลทินัม", fr: "Platine", de: "Platin", es: "Platino",
    pt: "Platina", ru: "Платина", ar: "بلاتيني", hi: "प्लैटिनम"
  },
  "dashboard.gold": {
    en: "Gold", vi: "Vàng", zh: "金", ja: "ゴールド", ko: "골드",
    th: "ทอง", fr: "Or", de: "Gold", es: "Oro",
    pt: "Ouro", ru: "Золото", ar: "ذهبي", hi: "गोल्ड"
  },
  "dashboard.anonymous": {
    en: "Anonymous", vi: "Ẩn Danh", zh: "匿名", ja: "匿名", ko: "익명",
    th: "ไม่ระบุชื่อ", fr: "Anonyme", de: "Anonym", es: "Anónimo",
    pt: "Anônimo", ru: "Анонимный", ar: "مجهول", hi: "गुमनाम"
  },

  // ============ ADDITIONAL CAMPAIGNS KEYS ============
  "campaigns.makeAnImpact": {
    en: "Make an Impact", vi: "Tạo Tác Động", zh: "创造影响", ja: "インパクトを与える", ko: "영향력 만들기",
    th: "สร้างผลกระทบ", fr: "Faire un impact", de: "Etwas bewirken", es: "Crear impacto",
    pt: "Causar impacto", ru: "Оказать влияние", ar: "أحدث تأثيراً", hi: "प्रभाव डालें"
  },
  "campaigns.discover": {
    en: "Discover Campaigns", vi: "Khám Phá Chiến Dịch", zh: "发现活动", ja: "キャンペーンを発見", ko: "캠페인 발견",
    th: "ค้นพบแคมเปญ", fr: "Découvrir les campagnes", de: "Kampagnen entdecken", es: "Descubrir campañas",
    pt: "Descobrir campanhas", ru: "Откройте кампании", ar: "اكتشف الحملات", hi: "अभियान खोजें"
  },
  "campaigns.verified": {
    en: "Verified", vi: "Đã xác minh", zh: "已验证", ja: "確認済み", ko: "인증됨",
    th: "ตรวจสอบแล้ว", fr: "Vérifié", de: "Verifiziert", es: "Verificado",
    pt: "Verificado", ru: "Проверено", ar: "موثق", hi: "सत्यापित"
  },
  "campaigns.featured": {
    en: "Featured", vi: "Nổi bật", zh: "精选", ja: "注目", ko: "추천",
    th: "แนะนำ", fr: "En vedette", de: "Empfohlen", es: "Destacado",
    pt: "Destaque", ru: "Рекомендуемый", ar: "مميز", hi: "विशेष"
  },
  "campaigns.urgent": {
    en: "Urgent", vi: "Khẩn cấp", zh: "紧急", ja: "緊急", ko: "긴급",
    th: "เร่งด่วน", fr: "Urgent", de: "Dringend", es: "Urgente",
    pt: "Urgente", ru: "Срочно", ar: "عاجل", hi: "तत्काल"
  },
  "campaigns.donateNow": {
    en: "Donate Now", vi: "Quyên Góp Ngay", zh: "立即捐赠", ja: "今すぐ寄付", ko: "지금 기부",
    th: "บริจาคเลย", fr: "Faire un don", de: "Jetzt spenden", es: "Donar ahora",
    pt: "Doar agora", ru: "Пожертвовать сейчас", ar: "تبرع الآن", hi: "अभी दान करें"
  },
  "campaigns.viewDetails": {
    en: "View Details", vi: "Xem Chi Tiết", zh: "查看详情", ja: "詳細を見る", ko: "상세 보기",
    th: "ดูรายละเอียด", fr: "Voir les détails", de: "Details anzeigen", es: "Ver detalles",
    pt: "Ver detalhes", ru: "Подробнее", ar: "عرض التفاصيل", hi: "विवरण देखें"
  },
  "campaigns.filterAll": {
    en: "All Categories", vi: "Tất cả danh mục", zh: "所有类别", ja: "すべてのカテゴリー", ko: "모든 카테고리",
    th: "ทุกหมวดหมู่", fr: "Toutes les catégories", de: "Alle Kategorien", es: "Todas las categorías",
    pt: "Todas as categorias", ru: "Все категории", ar: "جميع الفئات", hi: "सभी श्रेणियां"
  },
  "campaigns.noCampaigns": {
    en: "No campaigns found", vi: "Không tìm thấy chiến dịch", zh: "未找到活动", ja: "キャンペーンが見つかりません", ko: "캠페인을 찾을 수 없음",
    th: "ไม่พบแคมเปญ", fr: "Aucune campagne trouvée", de: "Keine Kampagnen gefunden", es: "No se encontraron campañas",
    pt: "Nenhuma campanha encontrada", ru: "Кампании не найдены", ar: "لم يتم العثور على حملات", hi: "कोई अभियान नहीं मिला"
  },
  "campaigns.loadMore": {
    en: "Load More", vi: "Tải thêm", zh: "加载更多", ja: "もっと読み込む", ko: "더 보기",
    th: "โหลดเพิ่มเติม", fr: "Charger plus", de: "Mehr laden", es: "Cargar más",
    pt: "Carregar mais", ru: "Загрузить еще", ar: "تحميل المزيد", hi: "और लोड करें"
  },

  // Auth Page
  "auth.joinFunCharity": {
    en: "Join FUN Charity", vi: "Tham Gia FUN Charity", zh: "加入FUN慈善", ja: "FUN Charityに参加", ko: "FUN Charity 가입",
    th: "เข้าร่วม FUN Charity", fr: "Rejoindre FUN Charity", de: "FUN Charity beitreten", es: "Únete a FUN Charity",
    pt: "Junte-se ao FUN Charity", ru: "Присоединиться к FUN Charity", ar: "انضم إلى FUN Charity", hi: "FUN Charity से जुड़ें"
  },
  "auth.welcomeBack": {
    en: "Welcome Back", vi: "Chào Mừng Trở Lại", zh: "欢迎回来", ja: "おかえりなさい", ko: "다시 오신 것을 환영합니다",
    th: "ยินดีต้อนรับกลับ", fr: "Bienvenue", de: "Willkommen zurück", es: "Bienvenido de vuelta",
    pt: "Bem-vindo de volta", ru: "С возвращением", ar: "مرحبًا بعودتك", hi: "वापसी पर स्वागत है"
  },
  "auth.createAccount": {
    en: "Create Account", vi: "Tạo Tài Khoản", zh: "创建账户", ja: "アカウント作成", ko: "계정 만들기",
    th: "สร้างบัญชี", fr: "Créer un compte", de: "Konto erstellen", es: "Crear cuenta",
    pt: "Criar conta", ru: "Создать аккаунт", ar: "إنشاء حساب", hi: "खाता बनाएं"
  },
  "auth.loginSubtitle": {
    en: "Sign in to continue your impact journey", vi: "Đăng nhập để tiếp tục hành trình tạo tác động", zh: "登录以继续您的影响之旅", ja: "インパクトの旅を続けるためにログイン", ko: "영향력 여정을 계속하려면 로그인하세요",
    th: "เข้าสู่ระบบเพื่อเดินทางสร้างผลกระทบ", fr: "Connectez-vous pour continuer votre parcours d'impact", de: "Melden Sie sich an, um Ihre Wirkungsreise fortzusetzen", es: "Inicia sesión para continuar tu viaje de impacto",
    pt: "Entre para continuar sua jornada de impacto", ru: "Войдите, чтобы продолжить свой путь влияния", ar: "سجل الدخول لمتابعة رحلة التأثير", hi: "अपनी प्रभाव यात्रा जारी रखने के लिए साइन इन करें"
  },
  "auth.signupSubtitle": {
    en: "Start making a transparent difference today", vi: "Bắt đầu tạo sự khác biệt minh bạch ngay hôm nay", zh: "今天开始创造透明的改变", ja: "今日から透明な変化を始めましょう", ko: "오늘부터 투명한 변화를 만들어보세요",
    th: "เริ่มสร้างความแตกต่างอย่างโปร่งใสวันนี้", fr: "Commencez à faire une différence transparente aujourd'hui", de: "Beginnen Sie heute, einen transparenten Unterschied zu machen", es: "Comienza a marcar una diferencia transparente hoy",
    pt: "Comece a fazer uma diferença transparente hoje", ru: "Начните создавать прозрачные изменения сегодня", ar: "ابدأ في إحداث فرق شفاف اليوم", hi: "आज ही पारदर्शी बदलाव लाना शुरू करें"
  },
  "auth.joinAsRole": {
    en: "I want to join as", vi: "Tôi muốn tham gia với vai trò", zh: "我想以...身份加入", ja: "私は...として参加したい", ko: "나는...로 참여하고 싶습니다",
    th: "ฉันต้องการเข้าร่วมในฐานะ", fr: "Je veux rejoindre en tant que", de: "Ich möchte beitreten als", es: "Quiero unirme como",
    pt: "Eu quero participar como", ru: "Я хочу присоединиться как", ar: "أريد الانضمام كـ", hi: "मैं इस रूप में शामिल होना चाहता हूं"
  },
  "auth.donor": {
    en: "Donor", vi: "Nhà Hảo Tâm", zh: "捐赠者", ja: "寄付者", ko: "기부자",
    th: "ผู้บริจาค", fr: "Donateur", de: "Spender", es: "Donante",
    pt: "Doador", ru: "Донор", ar: "متبرع", hi: "दाता"
  },
  "auth.volunteer": {
    en: "Volunteer", vi: "Tình Nguyện", zh: "志愿者", ja: "ボランティア", ko: "자원봉사자",
    th: "อาสาสมัคร", fr: "Bénévole", de: "Freiwilliger", es: "Voluntario",
    pt: "Voluntário", ru: "Волонтер", ar: "متطوع", hi: "स्वयंसेवक"
  },
  "auth.organization": {
    en: "Organization", vi: "Tổ Chức", zh: "组织", ja: "組織", ko: "조직",
    th: "องค์กร", fr: "Organisation", de: "Organisation", es: "Organización",
    pt: "Organização", ru: "Организация", ar: "منظمة", hi: "संगठन"
  },
  "auth.forgotPasswordTitle": {
    en: "Forgot Password", vi: "Quên Mật Khẩu", zh: "忘记密码", ja: "パスワードを忘れた", ko: "비밀번호 찾기",
    th: "ลืมรหัสผ่าน", fr: "Mot de passe oublié", de: "Passwort vergessen", es: "Olvidé mi contraseña",
    pt: "Esqueci a senha", ru: "Забыл пароль", ar: "نسيت كلمة المرور", hi: "पासवर्ड भूल गए"
  },
  "auth.resetEmailSent": {
    en: "Check your inbox to reset your password", vi: "Kiểm tra hộp thư của bạn để đặt lại mật khẩu", zh: "请检查您的收件箱以重置密码", ja: "パスワードリセットのためにメールを確認してください", ko: "비밀번호 재설정을 위해 이메일을 확인하세요",
    th: "ตรวจสอบกล่องจดหมายเพื่อรีเซ็ตรหัสผ่าน", fr: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe", de: "Überprüfen Sie Ihren Posteingang, um Ihr Passwort zurückzusetzen", es: "Revisa tu bandeja de entrada para restablecer tu contraseña",
    pt: "Verifique sua caixa de entrada para redefinir sua senha", ru: "Проверьте почту для сброса пароля", ar: "تحقق من بريدك الوارد لإعادة تعيين كلمة المرور", hi: "अपना पासवर्ड रीसेट करने के लिए अपना इनबॉक्स जांचें"
  },
  "auth.enterEmailForReset": {
    en: "Enter your email to receive a password reset link", vi: "Nhập email để nhận link đặt lại mật khẩu", zh: "输入邮箱以接收密码重置链接", ja: "パスワードリセットリンクを受け取るためにメールを入力", ko: "비밀번호 재설정 링크를 받을 이메일을 입력하세요",
    th: "ป้อนอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน", fr: "Entrez votre e-mail pour recevoir un lien de réinitialisation", de: "Geben Sie Ihre E-Mail ein, um einen Link zum Zurücksetzen zu erhalten", es: "Ingresa tu correo para recibir un enlace de restablecimiento",
    pt: "Digite seu e-mail para receber um link de redefinição", ru: "Введите email для получения ссылки сброса", ar: "أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين", hi: "पासवर्ड रीसेट लिंक प्राप्त करने के लिए ईमेल दर्ज करें"
  },
  "auth.sendResetLink": {
    en: "Send Reset Link", vi: "Gửi Link Đặt Lại", zh: "发送重置链接", ja: "リセットリンクを送信", ko: "재설정 링크 보내기",
    th: "ส่งลิงก์รีเซ็ต", fr: "Envoyer le lien de réinitialisation", de: "Link zum Zurücksetzen senden", es: "Enviar enlace de restablecimiento",
    pt: "Enviar link de redefinição", ru: "Отправить ссылку сброса", ar: "إرسال رابط إعادة التعيين", hi: "रीसेट लिंक भेजें"
  },
  "auth.backToLogin": {
    en: "Back to Login", vi: "Quay lại Đăng Nhập", zh: "返回登录", ja: "ログインに戻る", ko: "로그인으로 돌아가기",
    th: "กลับไปเข้าสู่ระบบ", fr: "Retour à la connexion", de: "Zurück zur Anmeldung", es: "Volver al inicio de sesión",
    pt: "Voltar ao login", ru: "Вернуться к входу", ar: "العودة إلى تسجيل الدخول", hi: "लॉगिन पर वापस जाएं"
  },
  "auth.backToHome": {
    en: "Back to Home", vi: "Về Trang Chủ", zh: "返回首页", ja: "ホームに戻る", ko: "홈으로 돌아가기",
    th: "กลับหน้าแรก", fr: "Retour à l'accueil", de: "Zurück zur Startseite", es: "Volver al inicio",
    pt: "Voltar ao início", ru: "На главную", ar: "العودة للرئيسية", hi: "होम पर वापस जाएं"
  },
  "auth.organizationName": {
    en: "Organization Name", vi: "Tên Tổ Chức", zh: "组织名称", ja: "組織名", ko: "조직명",
    th: "ชื่อองค์กร", fr: "Nom de l'organisation", de: "Organisationsname", es: "Nombre de la organización",
    pt: "Nome da organização", ru: "Название организации", ar: "اسم المنظمة", hi: "संगठन का नाम"
  },
  "auth.namePlaceholder": {
    en: "Your full name", vi: "Họ và tên của bạn", zh: "您的全名", ja: "あなたのフルネーム", ko: "귀하의 성명",
    th: "ชื่อ-นามสกุลของคุณ", fr: "Votre nom complet", de: "Ihr vollständiger Name", es: "Tu nombre completo",
    pt: "Seu nome completo", ru: "Ваше полное имя", ar: "اسمك الكامل", hi: "आपका पूरा नाम"
  },
  "auth.orgPlaceholder": {
    en: "Organization name", vi: "Tên tổ chức", zh: "组织名称", ja: "組織名", ko: "조직명",
    th: "ชื่อองค์กร", fr: "Nom de l'organisation", de: "Organisationsname", es: "Nombre de la organización",
    pt: "Nome da organização", ru: "Название организации", ar: "اسم المنظمة", hi: "संगठन का नाम"
  },
  "auth.kycRequirement": {
    en: "KYC Requirement", vi: "Yêu Cầu KYC", zh: "KYC要求", ja: "KYC要件", ko: "KYC 요구사항",
    th: "ข้อกำหนด KYC", fr: "Exigence KYC", de: "KYC-Anforderung", es: "Requisito KYC",
    pt: "Requisito KYC", ru: "Требование KYC", ar: "متطلبات KYC", hi: "KYC आवश्यकता"
  },
  "auth.kycDescription": {
    en: "NGOs need to complete KYC verification to launch campaigns. You will be guided after registration.", vi: "Các tổ chức NGO cần hoàn thành xác minh KYC để khởi chạy chiến dịch. Bạn sẽ được hướng dẫn sau khi đăng ký.", zh: "NGO需要完成KYC验证才能发起活动。注册后将为您提供指导。", ja: "NGOはキャンペーンを開始するためにKYC認証を完了する必要があります。登録後にガイドされます。", ko: "NGO는 캠페인을 시작하려면 KYC 인증을 완료해야 합니다. 등록 후 안내됩니다.",
    th: "องค์กร NGO ต้องดำเนินการยืนยัน KYC เพื่อเริ่มแคมเปญ คุณจะได้รับคำแนะนำหลังจากลงทะเบียน", fr: "Les ONG doivent compléter la vérification KYC pour lancer des campagnes. Vous serez guidé après l'inscription.", de: "NGOs müssen die KYC-Verifizierung abschließen, um Kampagnen zu starten. Sie werden nach der Registrierung angeleitet.", es: "Las ONG deben completar la verificación KYC para lanzar campañas. Será guiado después del registro.",
    pt: "ONGs precisam completar a verificação KYC para lançar campanhas. Você será orientado após o registro.", ru: "НКО должны пройти KYC-верификацию для запуска кампаний. Вас направят после регистрации.", ar: "تحتاج المنظمات غير الحكومية إلى إكمال التحقق KYC لإطلاق الحملات. سيتم توجيهك بعد التسجيل.", hi: "NGO को अभियान शुरू करने के लिए KYC सत्यापन पूरा करना होगा। पंजीकरण के बाद आपका मार्गदर्शन किया जाएगा।"
  },
  "auth.loginWithGoogle": {
    en: "Sign in with Google", vi: "Đăng nhập với Google", zh: "使用Google登录", ja: "Googleでサインイン", ko: "Google로 로그인",
    th: "เข้าสู่ระบบด้วย Google", fr: "Se connecter avec Google", de: "Mit Google anmelden", es: "Iniciar sesión con Google",
    pt: "Entrar com Google", ru: "Войти через Google", ar: "تسجيل الدخول باستخدام Google", hi: "Google से साइन इन करें"
  },
  "auth.connectWallet": {
    en: "Connect Wallet", vi: "Kết Nối Ví", zh: "连接钱包", ja: "ウォレットを接続", ko: "지갑 연결",
    th: "เชื่อมต่อวอลเล็ต", fr: "Connecter le portefeuille", de: "Wallet verbinden", es: "Conectar billetera",
    pt: "Conectar carteira", ru: "Подключить кошелек", ar: "ربط المحفظة", hi: "वॉलेट कनेक्ट करें"
  },
  "auth.walletSupport": {
    en: "Supports MetaMask, WalletConnect and many other wallets", vi: "Hỗ trợ MetaMask, WalletConnect và nhiều ví khác", zh: "支持MetaMask、WalletConnect和许多其他钱包", ja: "MetaMask、WalletConnectおよび他の多くのウォレットをサポート", ko: "MetaMask, WalletConnect 및 기타 많은 지갑 지원",
    th: "รองรับ MetaMask, WalletConnect และวอลเล็ตอื่นๆ", fr: "Prend en charge MetaMask, WalletConnect et de nombreux autres portefeuilles", de: "Unterstützt MetaMask, WalletConnect und viele andere Wallets", es: "Compatible con MetaMask, WalletConnect y muchas otras billeteras",
    pt: "Suporta MetaMask, WalletConnect e muitas outras carteiras", ru: "Поддерживает MetaMask, WalletConnect и многие другие кошельки", ar: "يدعم MetaMask و WalletConnect والعديد من المحافظ الأخرى", hi: "MetaMask, WalletConnect और कई अन्य वॉलेट का समर्थन करता है"
  },
  "auth.tagline": {
    en: "Charity is light. Transparency is gold.", vi: "Từ thiện là ánh sáng. Minh bạch là vàng.", zh: "慈善是光明。透明是金。", ja: "慈善は光。透明性は金。", ko: "자선은 빛입니다. 투명성은 금입니다.",
    th: "การกุศลคือแสงสว่าง ความโปร่งใสคือทอง", fr: "La charité est lumière. La transparence est d'or.", de: "Wohltätigkeit ist Licht. Transparenz ist Gold.", es: "La caridad es luz. La transparencia es oro.",
    pt: "Caridade é luz. Transparência é ouro.", ru: "Благотворительность - это свет. Прозрачность - это золото.", ar: "الخير نور. الشفافية ذهب.", hi: "दान प्रकाश है। पारदर्शिता सोना है।"
  },
  "auth.processing": {
    en: "Processing...", vi: "Đang xử lý...", zh: "处理中...", ja: "処理中...", ko: "처리 중...",
    th: "กำลังดำเนินการ...", fr: "Traitement...", de: "Verarbeitung...", es: "Procesando...",
    pt: "Processando...", ru: "Обработка...", ar: "جاري المعالجة...", hi: "प्रोसेसिंग..."
  },
  "auth.sending": {
    en: "Sending...", vi: "Đang gửi...", zh: "发送中...", ja: "送信中...", ko: "전송 중...",
    th: "กำลังส่ง...", fr: "Envoi...", de: "Senden...", es: "Enviando...",
    pt: "Enviando...", ru: "Отправка...", ar: "جاري الإرسال...", hi: "भेज रहा है..."
  },
  "auth.error": {
    en: "Error", vi: "Lỗi", zh: "错误", ja: "エラー", ko: "오류",
    th: "ข้อผิดพลาด", fr: "Erreur", de: "Fehler", es: "Error",
    pt: "Erro", ru: "Ошибка", ar: "خطأ", hi: "त्रुटि"
  },
  "auth.enterEmail": {
    en: "Please enter your email", vi: "Vui lòng nhập email của bạn", zh: "请输入您的邮箱", ja: "メールアドレスを入力してください", ko: "이메일을 입력하세요",
    th: "กรุณากรอกอีเมลของคุณ", fr: "Veuillez entrer votre e-mail", de: "Bitte geben Sie Ihre E-Mail ein", es: "Por favor ingresa tu correo",
    pt: "Por favor, insira seu e-mail", ru: "Пожалуйста, введите email", ar: "يرجى إدخال بريدك الإلكتروني", hi: "कृपया अपना ईमेल दर्ज करें"
  },
  "auth.sendEmailError": {
    en: "An error occurred while sending the email. Please try again.", vi: "Đã xảy ra lỗi khi gửi email. Vui lòng thử lại.", zh: "发送邮件时出错。请重试。", ja: "メール送信中にエラーが発生しました。もう一度お試しください。", ko: "이메일을 보내는 중 오류가 발생했습니다. 다시 시도해 주세요.",
    th: "เกิดข้อผิดพลาดขณะส่งอีเมล กรุณาลองใหม่", fr: "Une erreur s'est produite lors de l'envoi de l'e-mail. Veuillez réessayer.", de: "Beim Senden der E-Mail ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.", es: "Ocurrió un error al enviar el correo. Por favor, inténtalo de nuevo.",
    pt: "Ocorreu um erro ao enviar o e-mail. Por favor, tente novamente.", ru: "Произошла ошибка при отправке письма. Попробуйте снова.", ar: "حدث خطأ أثناء إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.", hi: "ईमेल भेजते समय त्रुटि हुई। कृपया पुनः प्रयास करें।"
  },
  "auth.emailSent": {
    en: "Email sent!", vi: "Email đã được gửi!", zh: "邮件已发送！", ja: "メールが送信されました！", ko: "이메일이 전송되었습니다!",
    th: "ส่งอีเมลแล้ว!", fr: "E-mail envoyé !", de: "E-Mail gesendet!", es: "¡Correo enviado!",
    pt: "E-mail enviado!", ru: "Письмо отправлено!", ar: "تم إرسال البريد الإلكتروني!", hi: "ईमेल भेजा गया!"
  },
  "auth.checkInbox": {
    en: "Please check your inbox to reset your password.", vi: "Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu.", zh: "请检查您的收件箱以重置密码。", ja: "パスワードをリセットするためにメールを確認してください。", ko: "비밀번호를 재설정하려면 이메일을 확인하세요.",
    th: "กรุณาตรวจสอบกล่องจดหมายเพื่อรีเซ็ตรหัสผ่าน", fr: "Veuillez vérifier votre boîte de réception pour réinitialiser votre mot de passe.", de: "Bitte überprüfen Sie Ihren Posteingang, um Ihr Passwort zurückzusetzen.", es: "Por favor revisa tu bandeja de entrada para restablecer tu contraseña.",
    pt: "Por favor, verifique sua caixa de entrada para redefinir sua senha.", ru: "Проверьте почту для сброса пароля.", ar: "يرجى التحقق من بريدك الوارد لإعادة تعيين كلمة المرور.", hi: "कृपया अपना पासवर्ड रीसेट करने के लिए अपना इनबॉक्स जांचें।"
  },
  "auth.googleLoginFailed": {
    en: "Unable to sign in with Google. Please try again.", vi: "Không thể đăng nhập bằng Google. Vui lòng thử lại.", zh: "无法使用Google登录。请重试。", ja: "Googleでログインできません。もう一度お試しください。", ko: "Google로 로그인할 수 없습니다. 다시 시도해 주세요.",
    th: "ไม่สามารถเข้าสู่ระบบด้วย Google กรุณาลองใหม่", fr: "Impossible de se connecter avec Google. Veuillez réessayer.", de: "Anmeldung mit Google nicht möglich. Bitte versuchen Sie es erneut.", es: "No se puede iniciar sesión con Google. Por favor, inténtalo de nuevo.",
    pt: "Não foi possível entrar com o Google. Por favor, tente novamente.", ru: "Не удалось войти через Google. Попробуйте снова.", ar: "تعذر تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى.", hi: "Google से साइन इन नहीं हो सका। कृपया पुनः प्रयास करें।"
  },
  "auth.validationError": {
    en: "Validation Error", vi: "Lỗi xác thực", zh: "验证错误", ja: "検証エラー", ko: "유효성 검사 오류",
    th: "ข้อผิดพลาดในการตรวจสอบ", fr: "Erreur de validation", de: "Validierungsfehler", es: "Error de validación",
    pt: "Erro de validação", ru: "Ошибка проверки", ar: "خطأ في التحقق", hi: "सत्यापन त्रुटि"
  },
  "auth.invalidData": {
    en: "Invalid data", vi: "Dữ liệu không hợp lệ", zh: "无效数据", ja: "無効なデータ", ko: "잘못된 데이터",
    th: "ข้อมูลไม่ถูกต้อง", fr: "Données invalides", de: "Ungültige Daten", es: "Datos inválidos",
    pt: "Dados inválidos", ru: "Недопустимые данные", ar: "بيانات غير صالحة", hi: "अमान्य डेटा"
  },
  "auth.invalidCredentials": {
    en: "Incorrect email or password", vi: "Email hoặc mật khẩu không chính xác", zh: "邮箱或密码不正确", ja: "メールまたはパスワードが正しくありません", ko: "이메일 또는 비밀번호가 올바르지 않습니다",
    th: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", fr: "E-mail ou mot de passe incorrect", de: "Falsche E-Mail oder falsches Passwort", es: "Correo electrónico o contraseña incorrectos",
    pt: "E-mail ou senha incorretos", ru: "Неверный email или пароль", ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة", hi: "गलत ईमेल या पासवर्ड"
  },
  "auth.confirmEmail": {
    en: "Please confirm your email before logging in", vi: "Vui lòng xác nhận email của bạn trước khi đăng nhập", zh: "请在登录前确认您的邮箱", ja: "ログインする前にメールを確認してください", ko: "로그인하기 전에 이메일을 확인하세요",
    th: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ", fr: "Veuillez confirmer votre e-mail avant de vous connecter", de: "Bitte bestätigen Sie Ihre E-Mail, bevor Sie sich anmelden", es: "Por favor confirma tu correo antes de iniciar sesión",
    pt: "Por favor, confirme seu e-mail antes de fazer login", ru: "Подтвердите email перед входом", ar: "يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول", hi: "लॉगिन करने से पहले कृपया अपना ईमेल कन्फर्म करें"
  },
  "auth.loginFailed": {
    en: "Login Failed", vi: "Đăng nhập thất bại", zh: "登录失败", ja: "ログイン失敗", ko: "로그인 실패",
    th: "เข้าสู่ระบบล้มเหลว", fr: "Échec de la connexion", de: "Anmeldung fehlgeschlagen", es: "Inicio de sesión fallido",
    pt: "Falha no login", ru: "Ошибка входа", ar: "فشل تسجيل الدخول", hi: "लॉगिन विफल"
  },
  "auth.welcomeBackMessage": {
    en: "Welcome back to FUN Charity!", vi: "Chào mừng bạn trở lại FUN Charity!", zh: "欢迎回到FUN慈善！", ja: "FUN Charityへおかえりなさい！", ko: "FUN Charity에 다시 오신 것을 환영합니다!",
    th: "ยินดีต้อนรับกลับสู่ FUN Charity!", fr: "Bienvenue à nouveau sur FUN Charity !", de: "Willkommen zurück bei FUN Charity!", es: "¡Bienvenido de vuelta a FUN Charity!",
    pt: "Bem-vindo de volta ao FUN Charity!", ru: "Добро пожаловать обратно в FUN Charity!", ar: "مرحبًا بعودتك إلى FUN Charity!", hi: "FUN Charity में आपका फिर से स्वागत है!"
  },
  "auth.signupError": {
    en: "An error occurred while signing up", vi: "Đã xảy ra lỗi khi đăng ký", zh: "注册时出错", ja: "サインアップ中にエラーが発生しました", ko: "가입 중 오류가 발생했습니다",
    th: "เกิดข้อผิดพลาดขณะลงทะเบียน", fr: "Une erreur s'est produite lors de l'inscription", de: "Bei der Registrierung ist ein Fehler aufgetreten", es: "Ocurrió un error al registrarse",
    pt: "Ocorreu um erro ao se cadastrar", ru: "Произошла ошибка при регистрации", ar: "حدث خطأ أثناء التسجيل", hi: "साइन अप करते समय त्रुटि हुई"
  },
  "auth.emailInUse": {
    en: "This email is already in use. Please log in or use a different email.", vi: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.", zh: "此邮箱已被使用。请登录或使用其他邮箱。", ja: "このメールは既に使用されています。ログインするか、別のメールを使用してください。", ko: "이 이메일은 이미 사용 중입니다. 로그인하거나 다른 이메일을 사용하세요.",
    th: "อีเมลนี้ถูกใช้แล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น", fr: "Cet e-mail est déjà utilisé. Veuillez vous connecter ou utiliser un autre e-mail.", de: "Diese E-Mail wird bereits verwendet. Bitte melden Sie sich an oder verwenden Sie eine andere E-Mail.", es: "Este correo ya está en uso. Por favor inicia sesión o usa otro correo.",
    pt: "Este e-mail já está em uso. Por favor, faça login ou use outro e-mail.", ru: "Этот email уже используется. Войдите или используйте другой email.", ar: "هذا البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر.", hi: "यह ईमेल पहले से उपयोग में है। कृपया लॉगिन करें या दूसरा ईमेल उपयोग करें।"
  },
  "auth.weakPassword": {
    en: "Invalid password. Please use a stronger password.", vi: "Mật khẩu không hợp lệ. Vui lòng sử dụng mật khẩu mạnh hơn.", zh: "密码无效。请使用更强的密码。", ja: "パスワードが無効です。より強力なパスワードを使用してください。", ko: "비밀번호가 유효하지 않습니다. 더 강력한 비밀번호를 사용하세요.",
    th: "รหัสผ่านไม่ถูกต้อง กรุณาใช้รหัสผ่านที่แข็งแกร่งกว่า", fr: "Mot de passe invalide. Veuillez utiliser un mot de passe plus fort.", de: "Ungültiges Passwort. Bitte verwenden Sie ein stärkeres Passwort.", es: "Contraseña inválida. Por favor usa una contraseña más fuerte.",
    pt: "Senha inválida. Por favor, use uma senha mais forte.", ru: "Недопустимый пароль. Используйте более надежный пароль.", ar: "كلمة المرور غير صالحة. يرجى استخدام كلمة مرور أقوى.", hi: "अमान्य पासवर्ड। कृपया एक मजबूत पासवर्ड का उपयोग करें।"
  },
  "auth.signupFailed": {
    en: "Registration Failed", vi: "Đăng ký thất bại", zh: "注册失败", ja: "登録失敗", ko: "가입 실패",
    th: "การลงทะเบียนล้มเหลว", fr: "Échec de l'inscription", de: "Registrierung fehlgeschlagen", es: "Registro fallido",
    pt: "Falha no cadastro", ru: "Ошибка регистрации", ar: "فشل التسجيل", hi: "पंजीकरण विफल"
  },
  "auth.verificationSent": {
    en: "We have sent a verification email to your address.", vi: "Chúng tôi đã gửi email xác thực đến địa chỉ của bạn.", zh: "我们已向您的地址发送了验证邮件。", ja: "確認メールをお送りしました。", ko: "인증 이메일을 보냈습니다.",
    th: "เราได้ส่งอีเมลยืนยันไปยังที่อยู่ของคุณแล้ว", fr: "Nous avons envoyé un e-mail de vérification à votre adresse.", de: "Wir haben eine Bestätigungs-E-Mail an Ihre Adresse gesendet.", es: "Hemos enviado un correo de verificación a tu dirección.",
    pt: "Enviamos um e-mail de verificação para seu endereço.", ru: "Мы отправили письмо для подтверждения.", ar: "لقد أرسلنا بريد تحقق إلى عنوانك.", hi: "हमने आपके पते पर एक सत्यापन ईमेल भेजा है।"
  },
  "auth.signupSuccess": {
    en: "Registration Successful!", vi: "Đăng ký thành công!", zh: "注册成功！", ja: "登録成功！", ko: "가입 성공!",
    th: "ลงทะเบียนสำเร็จ!", fr: "Inscription réussie !", de: "Registrierung erfolgreich!", es: "¡Registro exitoso!",
    pt: "Cadastro bem-sucedido!", ru: "Регистрация успешна!", ar: "تم التسجيل بنجاح!", hi: "पंजीकरण सफल!"
  },
  "auth.welcomeToFUN": {
    en: "Welcome to FUN Charity!", vi: "Chào mừng đến với FUN Charity!", zh: "欢迎来到FUN慈善！", ja: "FUN Charityへようこそ！", ko: "FUN Charity에 오신 것을 환영합니다!",
    th: "ยินดีต้อนรับสู่ FUN Charity!", fr: "Bienvenue sur FUN Charity !", de: "Willkommen bei FUN Charity!", es: "¡Bienvenido a FUN Charity!",
    pt: "Bem-vindo ao FUN Charity!", ru: "Добро пожаловать в FUN Charity!", ar: "مرحبًا بك في FUN Charity!", hi: "FUN Charity में आपका स्वागत है!"
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
