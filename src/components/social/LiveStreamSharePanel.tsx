import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  X, 
  Copy, 
  Facebook, 
  MessageCircle, 
  Link2,
  QrCode,
  Mail,
  Send
} from "lucide-react";
import { useState } from "react";

interface LiveStreamSharePanelProps {
  open: boolean;
  onClose: () => void;
  streamTitle: string;
  streamId?: string;
}

// SVG icons for social platforms
const ZaloIcon = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6">
    <path fill="#0068ff" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"/>
    <path fill="#fff" d="M33.5,18h-7v-2h7V18z M33.5,20v2h-7v-2H33.5z M14.5,16h7v2h-7V16z M14.5,20h7v2h-7V20z M14.5,24h7v2h-7V24z M14.5,28h7v2h-7V28z M26.5,24h7v2h-7V24z M26.5,28h7v2h-7V28z M26.5,32h7v2h-7V32z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6">
    <path fill="#29b6f6" d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z"/>
    <path fill="#fff" d="M33.95,15l-3.746,19.126c0,0-0.161,0.874-1.245,0.874c-0.576,0-0.873-0.274-0.873-0.274l-8.114-6.733 l-3.97-2.001l-5.095-1.355c0,0-0.907-0.262-0.907-1.012c0-0.625,0.933-0.923,0.933-0.923l21.316-8.468 c-0.001-0.001,0.651-0.235,1.126-0.234C33.667,14,34,14.125,34,14.5C34,14.75,33.95,15,33.95,15z"/>
    <path fill="#b0bec5" d="M23,30.505l-3.426,3.374c0,0-0.149,0.115-0.348,0.12c-0.069,0.002-0.143-0.009-0.219-0.043 l0.964-5.965L23,30.505z"/>
    <path fill="#cfd8dc" d="M29.897,18.196c-0.169-0.22-0.481-0.26-0.701-0.093L16,26c0,0,2.106,5.892,2.427,6.912 c0.322,1.021,0.58,1.045,0.58,1.045l0.964-5.965l9.832-9.096C30.023,18.729,30.064,18.416,29.897,18.196z"/>
  </svg>
);

const MessengerIcon = () => (
  <svg viewBox="0 0 48 48" className="w-6 h-6">
    <radialGradient id="messenger_grad" cx="11.087" cy="7.022" r="47.612" gradientTransform="matrix(1 0 0 -1 0 50)" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#1292ff"/>
      <stop offset=".079" stopColor="#2982ff"/>
      <stop offset=".23" stopColor="#4e69ff"/>
      <stop offset=".351" stopColor="#6958ff"/>
      <stop offset=".428" stopColor="#7350ff"/>
      <stop offset=".5" stopColor="#8a4fef"/>
      <stop offset=".677" stopColor="#ac4fdb"/>
      <stop offset=".749" stopColor="#c055d4"/>
      <stop offset="1" stopColor="#e35acd"/>
    </radialGradient>
    <path fill="url(#messenger_grad)" d="M24,4C12.954,4,4,12.954,4,24c0,6.104,2.727,11.582,7.032,15.262 c0.26,0.222,0.418,0.547,0.418,0.895l0.003,2.81c0.002,0.681,0.714,1.119,1.322,0.812l3.138-1.58 c0.269-0.136,0.577-0.159,0.865-0.067C18.755,42.704,21.317,43,24,43c11.046,0,20-8.954,20-20S35.046,4,24,4z"/>
    <path fill="#fff" d="M11.669,28.923l5.979-9.481c0.95-1.507,3.007-1.883,4.447-0.813l4.753,3.565 c0.435,0.326,1.029,0.325,1.462-0.002l6.422-4.872c0.857-0.65,1.977,0.397,1.391,1.301l-5.979,9.481 c-0.95,1.507-3.007,1.883-4.447,0.813l-4.753-3.565c-0.435-0.326-1.029-0.325-1.462,0.002l-6.422,4.872 C12.203,30.872,11.083,29.825,11.669,28.923z"/>
  </svg>
);

const SHARE_PLATFORMS = [
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: Facebook, 
    color: 'bg-[#1877F2] hover:bg-[#1864D9]',
    shareUrl: (url: string, title: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`
  },
  { 
    id: 'messenger', 
    name: 'Messenger', 
    customIcon: MessengerIcon,
    color: 'bg-gradient-to-r from-[#00C6FF] to-[#0078FF] hover:opacity-90',
    shareUrl: (url: string) => `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`
  },
  { 
    id: 'zalo', 
    name: 'Zalo', 
    customIcon: ZaloIcon,
    color: 'bg-[#0068FF] hover:bg-[#0055D4]',
    shareUrl: (url: string, title: string) => `https://zalo.me/share?link=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  { 
    id: 'telegram', 
    name: 'Telegram', 
    customIcon: TelegramIcon,
    color: 'bg-[#0088CC] hover:bg-[#006699]',
    shareUrl: (url: string, title: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  { 
    id: 'email', 
    name: 'Email', 
    icon: Mail, 
    color: 'bg-gray-600 hover:bg-gray-700',
    shareUrl: (url: string, title: string) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Xem livestream: ${url}`)}`
  },
];

export function LiveStreamSharePanel({ open, onClose, streamTitle, streamId }: LiveStreamSharePanelProps) {
  const [copied, setCopied] = useState(false);
  
  // Generate share URL (in real app, this would be a real URL)
  const shareUrl = streamId 
    ? `${window.location.origin}/live/${streamId}` 
    : window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Đã sao chép liên kết!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Không thể sao chép liên kết');
    }
  };

  const handleShare = (platform: typeof SHARE_PLATFORMS[0]) => {
    const url = platform.shareUrl(shareUrl, streamTitle || 'Live Stream');
    window.open(url, '_blank', 'width=600,height=400');
    toast.success(`Đang mở ${platform.name}...`);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: streamTitle || 'Live Stream',
          text: `Xem livestream: ${streamTitle}`,
          url: shareUrl,
        });
        toast.success('Đã chia sẻ thành công!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Không thể chia sẻ');
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-28 right-4 z-40 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Chia sẻ Live Stream</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Share platforms */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {SHARE_PLATFORMS.map((platform) => (
                <motion.button
                  key={platform.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(platform)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl ${platform.color} text-white transition-all`}
                >
                  {platform.customIcon ? (
                    <platform.customIcon />
                  ) : platform.icon ? (
                    <platform.icon className="w-6 h-6" />
                  ) : null}
                  <span className="text-[10px] font-medium">{platform.name}</span>
                </motion.button>
              ))}
            </div>

            {/* QR Code button */}
            <button
              onClick={() => toast.info('Tính năng QR Code đang được phát triển')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Mã QR</p>
                <p className="text-xs text-muted-foreground">Quét để xem livestream</p>
              </div>
            </button>

            {/* Copy link */}
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 text-xs bg-muted/50"
              />
              <Button
                size="icon"
                variant={copied ? "default" : "outline"}
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? <span className="text-xs">✓</span> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {/* Native share button (mobile) */}
            {'share' in navigator && (
              <Button
                onClick={handleNativeShare}
                className="w-full gap-2"
                variant="outline"
              >
                <Send className="w-4 h-4" />
                Chia sẻ khác
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
