import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FacebookCreatePostModal } from "./FacebookCreatePostModal";

interface CreatePostBoxProps {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    user_id?: string;
  } | null;
  onPostCreated?: () => void;
}

// Soft gradient backgrounds for letter avatars
const getAvatarGradient = (name: string) => {
  const gradients = [
    "from-purple-soft to-purple-light",
    "from-gold-champagne to-gold-light",
    "from-pink-400 to-rose-300",
    "from-sky-400 to-blue-300",
  ];
  const index = (name?.charCodeAt(0) || 0) % gradients.length;
  return gradients[index];
};

export function CreatePostBox({ profile, onPostCreated }: CreatePostBoxProps) {
  const [showFacebookModal, setShowFacebookModal] = useState(false);

  return (
    <>
      <div className="glass-card overflow-hidden">
        {/* Main input area - Simple like Facebook */}
        <div className="p-4">
          <div className="flex gap-3 items-center">
            {/* User Avatar with gold ring - clickable to profile */}
            <Link to="/profile" className="p-0.5 rounded-full bg-gradient-to-br from-gold-champagne to-gold-light flex-shrink-0">
              <Avatar className="w-10 h-10 border-2 border-card">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(profile?.full_name || "U")} text-white font-medium`}>
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            {/* Input button - opens Facebook modal */}
            <button
              type="button"
              onClick={() => setShowFacebookModal(true)}
              className="flex-1 bg-muted/30 border border-border rounded-full px-4 py-2.5 text-sm text-muted-foreground text-left hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all cursor-pointer"
            >
              Bạn đang nghĩ gì?
            </button>
          </div>
        </div>
      </div>

      {/* Facebook-style Create Post Modal */}
      <FacebookCreatePostModal
        open={showFacebookModal}
        onOpenChange={setShowFacebookModal}
        profile={profile}
        onPostCreated={onPostCreated}
      />
    </>
  );
}
