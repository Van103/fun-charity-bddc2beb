import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, UserPlus, Image, Smile } from "lucide-react";
import { FacebookCreatePostModal } from "./FacebookCreatePostModal";
import { LiveStreamModal } from "./LiveStreamModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGuestMode } from "@/contexts/GuestModeContext";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

// Feeling options like Facebook
const feelingOptions = [
  { emoji: "😊", label: "vui vẻ" },
  { emoji: "😢", label: "buồn" },
  { emoji: "😍", label: "đang yêu" },
  { emoji: "🙏", label: "biết ơn" },
  { emoji: "🎉", label: "phấn khích" },
  { emoji: "💪", label: "quyết tâm" },
  { emoji: "😔", label: "thất vọng" },
  { emoji: "🤗", label: "hạnh phúc" },
  { emoji: "😤", label: "tức giận" },
  { emoji: "🥰", label: "được yêu thương" },
  { emoji: "✨", label: "tuyệt vời" },
  { emoji: "💖", label: "biết ơn cuộc sống" },
];

export function CreatePostBox({ profile, onPostCreated }: CreatePostBoxProps) {
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [modalMode, setModalMode] = useState<'text' | 'media' | 'feeling'>('text');
  const [selectedFeeling, setSelectedFeeling] = useState<{ emoji: string; label: string } | null>(null);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const { t } = useLanguage();
  const { isGuest, requireAuth } = useGuestMode();

  const handleOpenTextModal = () => {
    setModalMode('text');
    setSelectedFeeling(null);
    setShowFacebookModal(true);
  };

  const handleOpenMediaModal = () => {
    setModalMode('media');
    setSelectedFeeling(null);
    setShowFacebookModal(true);
  };

  const handleSelectFeeling = (feeling: { emoji: string; label: string }) => {
    setModalMode('feeling');
    setSelectedFeeling(feeling);
    setShowFeelingPicker(false);
    setShowFacebookModal(true);
  };

  // If guest mode, show a prompt to register
  if (isGuest) {
    return (
      <div className="mobile-card overflow-hidden">
        <div className="p-4 sm:p-5 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Tham gia để chia sẻ
              </p>
              <p className="text-xs text-muted-foreground">
                Đăng ký tài khoản để đăng bài viết và tương tác
              </p>
            </div>
            <Button 
              onClick={() => requireAuth("Đăng ký để đăng bài viết và chia sẻ với cộng đồng")}
              className="mt-1"
              size="sm"
            >
              Đăng ký ngay
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mobile-card overflow-hidden">
        {/* Main input area - Simple like Facebook, mobile-optimized */}
        <div className="p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3 items-center">
            {/* User Avatar with gold ring - touch-friendly */}
            <Link to="/profile" className="p-0.5 rounded-full bg-gradient-to-br from-gold-champagne to-gold-light flex-shrink-0 touch-target no-tap-highlight">
              <Avatar className="w-10 h-10 sm:w-11 sm:h-11 border-2 border-card">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(profile?.full_name || "U")} text-white font-medium`}>
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            {/* Input button - opens Facebook modal, touch-friendly */}
            <button
              type="button"
              onClick={handleOpenTextModal}
              className="flex-1 bg-muted/30 border border-border rounded-full px-4 py-3 text-sm sm:text-base text-muted-foreground text-left hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all cursor-pointer touch-target no-tap-highlight"
            >
              {t("post.thinking")}
            </button>

            {/* Action Buttons Container */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Live Button - Red */}
              <button
                type="button"
                onClick={() => setShowLiveModal(true)}
                className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full transition-all shadow-md hover:shadow-lg touch-target no-tap-highlight"
                title="Phát trực tiếp"
              >
                <Video className="w-5 h-5" />
              </button>

              {/* Photo/Video Button - Green */}
              <button
                type="button"
                onClick={handleOpenMediaModal}
                className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full transition-all shadow-md hover:shadow-lg touch-target no-tap-highlight"
                title="Ảnh/Video"
              >
                <Image className="w-5 h-5" />
              </button>

              {/* Feeling/Emoji Button - Yellow/Amber */}
              <Popover open={showFeelingPicker} onOpenChange={setShowFeelingPicker}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white rounded-full transition-all shadow-md hover:shadow-lg touch-target no-tap-highlight"
                    title="Cảm xúc/Hoạt động"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-72 p-3 bg-card border border-border shadow-xl z-50" 
                  align="end"
                  sideOffset={8}
                >
                  <p className="text-sm font-medium text-foreground mb-3">Bạn đang cảm thấy thế nào?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {feelingOptions.map((feeling) => (
                      <button
                        key={feeling.label}
                        onClick={() => handleSelectFeeling(feeling)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/60 active:bg-muted transition-colors"
                      >
                        <span className="text-2xl">{feeling.emoji}</span>
                        <span className="text-xs text-muted-foreground truncate w-full text-center">
                          {feeling.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Facebook-style Create Post Modal */}
      <FacebookCreatePostModal
        open={showFacebookModal}
        onOpenChange={setShowFacebookModal}
        profile={profile}
        onPostCreated={onPostCreated}
        initialMode={modalMode}
        initialFeeling={selectedFeeling}
      />

      {/* Live Stream Modal */}
      <LiveStreamModal
        open={showLiveModal}
        onOpenChange={setShowLiveModal}
        profile={profile}
      />
    </>
  );
}
