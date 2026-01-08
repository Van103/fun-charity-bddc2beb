import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileImageLightboxProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  type: "avatar" | "cover";
  userName?: string | null;
}

export function ProfileImageLightbox({ 
  imageUrl, 
  isOpen, 
  onClose, 
  type,
  userName 
}: ProfileImageLightboxProps) {
  const [scale, setScale] = useState(1);

  const handleClose = () => {
    setScale(1);
    onClose();
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.5, 4));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.5, 1));
  const toggleZoom = () => {
    if (scale === 1) setScale(2);
    else setScale(1);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${type}-${userName || "profile"}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          onClick={handleClose}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Zoom controls */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8"
            onClick={zoomOut}
            disabled={scale <= 1}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-white text-sm min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8"
            onClick={zoomIn}
            disabled={scale >= 4}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Download button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-50 text-white hover:bg-white/20"
          onClick={handleDownload}
          title="Tải xuống"
        >
          <Download className="w-5 h-5" />
        </Button>

        {/* Title */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 rounded-full px-4 py-2">
          <span className="text-white text-sm">
            {type === "avatar" ? "Ảnh đại diện" : "Ảnh bìa"} {userName && `của ${userName}`}
          </span>
        </div>

        {/* Main image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: scale,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={toggleZoom}
          className={`${type === "avatar" ? "max-w-[90vw] max-h-[85vh]" : "max-w-[95vw] max-h-[90vh]"}`}
          style={{ cursor: scale > 1 ? "zoom-out" : "zoom-in" }}
        >
          <img
            src={imageUrl}
            alt={type === "avatar" ? "Ảnh đại diện" : "Ảnh bìa"}
            className={`object-contain select-none ${
              type === "avatar" 
                ? "max-w-full max-h-[85vh] rounded-full shadow-2xl ring-4 ring-white/20" 
                : "max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            }`}
            draggable={false}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
