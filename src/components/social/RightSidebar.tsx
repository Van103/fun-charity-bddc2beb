import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHonorStats, useTopRankers } from "@/hooks/useHonorStats";
import { AnimatedStatItem } from "./AnimatedStatItem";
import { useOnlineContacts, useGroupChats } from "@/hooks/useFriendshipData";
import { Link } from "react-router-dom";
import { 
  Users,
  Cake,
  MessageCircle,
  Plus,
  Loader2,
} from "lucide-react";

// Rank badge colors
const getRankBadgeStyle = (rank: number) => {
  switch (rank) {
    case 1: return "bg-gradient-to-br from-yellow-300 via-gold-champagne to-yellow-500 text-white glow-gold";
    case 2: return "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 text-gray-800 glow-silver";
    case 3: return "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white glow-bronze";
    default: return "bg-muted text-foreground";
  }
};

// Avatar gradient colors
const getAvatarGradient = (name: string) => {
  const gradients = [
    "from-purple-soft to-purple-light",
    "from-gold-champagne to-gold-light",
    "from-pink-400 to-rose-300",
    "from-sky-400 to-blue-300",
    "from-emerald-400 to-teal-300",
  ];
  const index = (name?.charCodeAt(0) || 0) % gradients.length;
  return gradients[index];
};

// Format currency for display
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B ₫`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ₫`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ₫`;
  }
  return `${amount} ₫`;
};

// Mock data for testing scroll
const mockRankers = [
  { rank: 1, name: "Nguyễn Văn An", avatar: "", amount: 125000000, verified: true },
  { rank: 2, name: "Trần Thị Bình", avatar: "", amount: 98500000, verified: true },
  { rank: 3, name: "Lê Hoàng Cường", avatar: "", amount: 87200000, verified: false },
  { rank: 4, name: "Phạm Minh Đức", avatar: "", amount: 76400000, verified: true },
  { rank: 5, name: "Hoàng Thị Em", avatar: "", amount: 65800000, verified: false },
  { rank: 6, name: "Vũ Quang Phú", avatar: "", amount: 54300000, verified: true },
  { rank: 7, name: "Đặng Thu Giang", avatar: "", amount: 48900000, verified: false },
  { rank: 8, name: "Bùi Văn Hải", avatar: "", amount: 42100000, verified: true },
  { rank: 9, name: "Ngô Thị Uyên", avatar: "", amount: 38700000, verified: false },
  { rank: 10, name: "Đỗ Minh Khang", avatar: "", amount: 35200000, verified: true },
  { rank: 11, name: "Trương Thị Lan", avatar: "", amount: 31500000, verified: false },
  { rank: 12, name: "Lý Văn Minh", avatar: "", amount: 28900000, verified: true },
  { rank: 13, name: "Cao Thị Ngọc", avatar: "", amount: 25400000, verified: false },
  { rank: 14, name: "Phan Quốc Oai", avatar: "", amount: 22800000, verified: true },
  { rank: 15, name: "Mai Thị Phương", avatar: "", amount: 19600000, verified: false },
  { rank: 16, name: "Hồ Văn Quân", avatar: "", amount: 17200000, verified: true },
  { rank: 17, name: "Đinh Thị Rồng", avatar: "", amount: 15800000, verified: false },
  { rank: 18, name: "Tạ Minh Sơn", avatar: "", amount: 14100000, verified: true },
  { rank: 19, name: "Lưu Thị Tâm", avatar: "", amount: 12500000, verified: false },
  { rank: 20, name: "Võ Văn Uy", avatar: "", amount: 10800000, verified: true },
];

export function RightSidebar() {
  const { t } = useLanguage();
  const { data: stats, isLoading: statsLoading } = useHonorStats();
  const { data: topRankers = [], isLoading: rankersLoading } = useTopRankers();
  const { contacts, isLoading: contactsLoading } = useOnlineContacts();
  const { groups, isLoading: groupsLoading } = useGroupChats();

  // Combine real data with mock data for testing
  const displayRankers = topRankers.length > 0 ? topRankers : mockRankers;

  const honorStats = [
    { labelKey: "honor.topProfile", value: stats?.topProfiles || 0 },
    { labelKey: "honor.earnings", value: stats?.totalEarnings || 0, isCurrency: true },
    { labelKey: "honor.posts", value: stats?.totalPosts || 0 },
    { labelKey: "honor.videos", value: stats?.videosCount || 0 },
    { labelKey: "honor.friends", value: stats?.friendsCount || 0 },
    { labelKey: "honor.nftCount", value: stats?.nftCount || 0 },
  ];

  return (
    <aside className="w-80 shrink-0 space-y-4">
      {/* Honor Board */}
      <div className="rounded-2xl overflow-hidden relative golden-border-glow">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/sidebar-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-purple-900/30" />
        
        <Link to="/honor-board" className="relative block border-b border-yellow-400/40 bg-gradient-to-r from-purple-900/60 via-purple-800/70 to-purple-900/60 hover:from-purple-800/70 hover:via-purple-700/80 hover:to-purple-800/70 transition-all">
          <h3 className="py-3 px-2 font-extrabold text-center tracking-widest drop-shadow-lg w-full" style={{ color: '#FFD700', fontSize: '20px' }}>
            <span className="animate-sparkle inline-block">✨</span> {t("honor.title")} <span className="animate-sparkle-delay inline-block">✨</span>
          </h3>
        </Link>
        <div className="relative p-3 space-y-2">
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
            </div>
          ) : (
            honorStats.map((stat) => (
              <AnimatedStatItem
                key={stat.labelKey}
                labelKey={stat.labelKey}
                value={stat.value}
                isCurrency={stat.isCurrency}
              />
            ))
          )}
        </div>
      </div>

      {/* Top Ranking */}
      <div className="rounded-2xl overflow-hidden relative golden-border-glow">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/sidebar-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-purple-900/30" />
        
        <Link to="/honor-board" className="relative block border-b border-yellow-400/40 bg-gradient-to-r from-purple-900/60 via-purple-800/70 to-purple-900/60 hover:from-purple-800/70 hover:via-purple-700/80 hover:to-purple-800/70 transition-all">
          <h3 className="py-3 px-2 font-extrabold text-center tracking-widest drop-shadow-lg w-full" style={{ color: '#FFD700', fontSize: '20px' }}>
            <span className="animate-sparkle inline-block">👑</span> {t("ranking.title")} <span className="animate-sparkle-delay inline-block">👑</span>
          </h3>
        </Link>
        <div className="ranking-scroll-container h-[500px] overflow-y-auto relative p-3 space-y-2.5">
          {rankersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
            </div>
          ) : (
            displayRankers.map((ranker) => (
              <div
                key={ranker.rank}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/90 cursor-pointer transition-all hover:bg-white/95 hover:shadow-md"
                style={{ 
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.15)',
                  border: '1px solid rgba(124, 58, 237, 0.2)'
                }}
              >
                {/* Rank badge with avatar */}
                <div className="relative">
                  <div className="p-0.5 rounded-full bg-gradient-to-br from-purple-300/60 to-pink-200/30">
                    <Avatar className="w-9 h-9 border border-purple-300/50">
                      <AvatarImage src={ranker.avatar} />
                      <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(ranker.name)} text-white font-medium`} style={{ fontSize: '14px' }}>
                        {ranker.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm ${getRankBadgeStyle(ranker.rank)}`} style={{ fontSize: '10px' }}>
                    {ranker.rank}
                  </div>
                </div>
                <div className="flex-1 min-w-0 ml-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold truncate" style={{ color: '#4C1D95', fontSize: '14px' }}>{ranker.name}</span>
                    {ranker.verified && (
                      <span style={{ color: '#7C3AED', fontSize: '11px' }}>✓</span>
                    )}
                  </div>
                </div>
                <span className="font-bold shrink-0 whitespace-nowrap" style={{ color: '#7C3AED', fontSize: '14px' }}>
                  {formatCurrency(ranker.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contacts - Real Friends Data */}
      <div className="glass-card p-4 hover-luxury-glow">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t("contacts.title")}</h3>
        </div>
        <div className="space-y-1">
          {contactsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t("social.noFriends")}
            </p>
          ) : (
            contacts.map((contact) => (
              <Link 
                key={contact.user_id}
                to={`/user/${contact.user_id}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="p-0.5 rounded-full bg-gradient-to-br from-gold-champagne/30 to-transparent">
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={contact.avatar_url || undefined} />
                    <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(contact.full_name || "")} text-white text-xs`}>
                      {contact.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-sm text-foreground truncate">{contact.full_name || t("social.user")}</span>
                <div className="ml-auto w-2 h-2 rounded-full bg-success" />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Group Chats - Real Data */}
      <div className="glass-card p-4 hover-luxury-glow">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t("groups.title")}</h3>
        </div>
        <div className="space-y-1">
          {groupsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : groups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              {t("social.noGroups")}
            </p>
          ) : (
            groups.map((group) => (
              <Link 
                key={group.id}
                to={`/messages?conversation=${group.id}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-purple-soft to-purple-light text-white text-xs">
                    {group.name?.charAt(0) || "G"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground truncate block">{group.name || t("social.groupChat")}</span>
                  <span className="text-xs text-muted-foreground">{group.participant_count} {t("social.members")}</span>
                </div>
              </Link>
            ))
          )}
          <Link 
            to="/messages"
            className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/50 w-full text-left transition-colors"
          >
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">{t("groups.add")}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
