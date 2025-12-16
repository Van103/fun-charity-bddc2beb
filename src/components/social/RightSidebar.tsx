import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users,
  Cake,
  MessageCircle,
  Plus,
} from "lucide-react";

interface TopRanker {
  rank: number;
  name: string;
  location: string;
  amount: string;
  avatar?: string;
  verified?: boolean;
}

const topRankers: TopRanker[] = [
  { rank: 1, name: "Camly Duong", location: "Viet Nam", amount: "8B ₫", verified: true },
  { rank: 2, name: "Elon Musk", location: "South Africa", amount: "7B ₫" },
  { rank: 3, name: "Lê Minh Trí", location: "Viet Nam", amount: "2B ₫", verified: true },
  { rank: 4, name: "Diệu Ngọc", location: "Viet Nam", amount: "1B ₫" },
  { rank: 5, name: "Vinh Hào", location: "Viet Nam", amount: "1M ₫" },
  { rank: 6, name: "Trang Huyền", location: "Viet Nam", amount: "1M ₫" },
  { rank: 7, name: "Tinna Tinh", location: "Viet Nam", amount: "100M ₫" },
  { rank: 8, name: "Khôi Phan", location: "Viet Nam", amount: "1M ₫" },
  { rank: 9, name: "Thu Thanh Hoàng", location: "Viet Nam", amount: "1M ₫", verified: true },
  { rank: 10, name: "Nông Liên", location: "Viet Nam", amount: "1M ₫", verified: true },
];

// Rank badge colors
const getRankBadgeStyle = (rank: number) => {
  switch (rank) {
    case 1: return "bg-gradient-to-br from-gold-champagne to-gold-dark text-white";
    case 2: return "bg-gradient-to-br from-gray-300 to-gray-500 text-white";
    case 3: return "bg-gradient-to-br from-amber-600 to-amber-800 text-white";
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

const contacts = [
  "Lê Minh Trí",
  "Lê Huỳnh Như",
  "Diệu Ngọc",
  "Vinh Hào",
  "Mỹ Phương",
];

interface HonorStat {
  label: string;
  value: string;
  barWidth: number;
}

const honorStats: HonorStat[] = [
  { label: "TOP PROFILE", value: "1 1 1 1 1 1 1 1 1", barWidth: 100 },
  { label: "THU NHẬP", value: "9 9 9 9 9 9 9 9 9", barWidth: 95 },
  { label: "BÀI VIẾT", value: "9 9 9", barWidth: 40 },
  { label: "VIDEO", value: "9 9 9", barWidth: 40 },
  { label: "BẠN BÈ", value: "1 1 1 1 1 1 1 1 1", barWidth: 100 },
  { label: "SỐ NFT", value: "1 1 1 1 1 1 1 1 1", barWidth: 100 },
];

export function RightSidebar() {
  return (
    <aside className="w-80 shrink-0 space-y-4 sticky top-20">
      {/* Honor Board */}
      <div className="glass-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-light p-3">
          <h3 className="text-xs font-bold text-primary-foreground text-center tracking-wider">
            HONOR BOARD
          </h3>
        </div>
        <div className="p-3 space-y-2 bg-muted/20">
          {honorStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-16 shrink-0 font-medium">{stat.label}</span>
              <div className="flex-1 h-5 bg-muted/50 rounded overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-light flex items-center px-2"
                  style={{ width: `${stat.barWidth}%` }}
                >
                  <span className="text-[9px] font-mono text-primary-foreground tracking-widest font-bold">
                    {stat.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Ranking */}
      <div className="glass-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-light p-3">
          <h3 className="text-xs font-bold text-primary-foreground text-center tracking-wider">
            TOP RANKING
          </h3>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2 space-y-1">
            {topRankers.map((ranker) => (
              <div
                key={ranker.rank}
                className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              >
                {/* Rank badge with avatar */}
                <div className="relative">
                  <div className="p-0.5 rounded-full bg-gradient-to-br from-gold-champagne/50 to-gold-champagne/30">
                    <Avatar className="w-9 h-9 border-2 border-card">
                      <AvatarImage src={ranker.avatar} />
                      <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(ranker.name)} text-white text-xs font-medium`}>
                        {ranker.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm ${getRankBadgeStyle(ranker.rank)}`}>
                    #{ranker.rank}
                  </div>
                </div>
                <div className="flex-1 min-w-0 ml-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold truncate text-foreground">{ranker.name}</span>
                    {ranker.verified && (
                      <span className="text-primary text-[10px]">✓</span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{ranker.location}</span>
                </div>
                <span className="text-xs font-bold text-primary shrink-0">
                  {ranker.amount}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Birthdays */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cake className="w-4 h-4 text-gold-champagne" />
          <h3 className="text-sm font-semibold text-foreground">Sinh nhật</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Hôm nay là sinh nhật của <span className="font-medium text-foreground">Nhật Thống</span> và{" "}
          <span className="text-primary cursor-pointer hover:underline">6 người khác</span>
        </p>
      </div>

      {/* Contacts */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Người liên hệ</h3>
        </div>
        <div className="space-y-1">
          {contacts.map((name, index) => (
            <div 
              key={name}
              className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="p-0.5 rounded-full bg-gradient-to-br from-gold-champagne/30 to-transparent">
                <Avatar className="w-8 h-8 border border-border">
                  <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(name)} text-white text-xs`}>
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm text-foreground">{name}</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-success" />
            </div>
          ))}
        </div>
      </div>

      {/* Group Chats */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Cuộc trò chuyện nhóm</h3>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-purple-soft to-purple-light text-white text-xs">N</AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground">Nhóm Phụng Sự Mẹ Trái Đất</span>
          </div>
          <button className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/50 w-full text-left transition-colors">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">Thêm nhóm mới</span>
          </button>
        </div>
      </div>
    </aside>
  );
}