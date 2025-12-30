import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MentionUser {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface MentionSuggestionsProps {
  users: MentionUser[];
  isLoading: boolean;
  selectedIndex: number;
  onSelect: (user: MentionUser) => void;
}

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

export function MentionSuggestions({ 
  users, 
  isLoading, 
  selectedIndex, 
  onSelect 
}: MentionSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Đang tìm kiếm...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Không tìm thấy bạn bè nào
      </div>
    );
  }

  return (
    <div className="py-1 max-h-60 overflow-y-auto">
      {users.map((user, index) => {
        const displayName = user.full_name || "Người dùng";
        return (
          <motion.button
            key={user.user_id}
            type="button"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onSelect(user)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
              selectedIndex === index 
                ? "bg-primary/10" 
                : "hover:bg-muted/50"
            )}
          >
            <Avatar className="w-8 h-8 border border-border/50">
              <AvatarImage src={user.avatar_url || ""} />
              <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(displayName)} text-white text-xs font-medium`}>
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm truncate">
              {displayName}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
