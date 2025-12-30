import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GroupedStory, Story } from "@/hooks/useStories";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface StoryViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyGroup: GroupedStory;
}

const FILTERS_CSS: Record<string, string> = {
  none: "",
  bright: "brightness(1.2)",
  warm: "sepia(0.3) saturate(1.3)",
  cool: "hue-rotate(20deg) saturate(0.9)",
  vintage: "sepia(0.5) contrast(1.1)",
  drama: "contrast(1.3) saturate(1.2)",
  bw: "grayscale(1)",
  fade: "saturate(0.8) brightness(1.1)",
};

export function StoryViewerModal({ open, onOpenChange, storyGroup }: StoryViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const currentStory = storyGroup.stories[currentIndex];
  const duration = currentStory?.media_type === "video" ? 15000 : (currentStory?.duration || 5) * 1000;

  const goToNext = useCallback(() => {
    if (currentIndex < storyGroup.stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onOpenChange(false);
    }
  }, [currentIndex, storyGroup.stories.length, onOpenChange]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  // Auto-advance timer
  useEffect(() => {
    if (!open || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / (duration / 100));
        if (next >= 100) {
          goToNext();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [open, isPaused, duration, goToNext]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === " ") {
        e.preventDefault();
        setIsPaused(!isPaused);
      }
      if (e.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goToNext, goToPrev, isPaused, onOpenChange]);

  const getFilterCSS = (filter: string | null) => {
    return filter ? FILTERS_CSS[filter] || "" : "";
  };

  if (!currentStory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-black border-none max-h-[95vh]">
        <DialogTitle className="sr-only">Xem Story của {storyGroup.userName}</DialogTitle>
        
        <div className="relative w-full aspect-[9/16] max-h-[90vh]">
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
            {storyGroup.stories.map((_, idx) => (
              <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                {storyGroup.avatar ? (
                  <img src={storyGroup.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                    {storyGroup.userName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{storyGroup.userName}</p>
                <p className="text-white/70 text-xs">
                  {formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true, locale: vi })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
              {currentStory.media_type === "video" && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Media Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStory.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {currentStory.media_type === "video" ? (
                <video
                  src={currentStory.media_url}
                  className="w-full h-full object-contain"
                  style={{ filter: getFilterCSS(currentStory.filter) }}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                />
              ) : (
                <img
                  src={currentStory.media_url}
                  alt=""
                  className="w-full h-full object-contain"
                  style={{ filter: getFilterCSS(currentStory.filter) }}
                />
              )}

              {/* Text Overlay */}
              {currentStory.text_overlay && currentStory.text_position && (
                <div
                  className="absolute px-4 py-2 text-2xl font-bold text-center"
                  style={{
                    left: `${currentStory.text_position.x}%`,
                    top: `${currentStory.text_position.y}%`,
                    transform: "translate(-50%, -50%)",
                    color: currentStory.text_position.color,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {currentStory.text_overlay}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Areas */}
          <div className="absolute inset-0 z-10 flex">
            <button
              onClick={goToPrev}
              className="flex-1 h-full focus:outline-none"
              disabled={currentIndex === 0}
            />
            <button
              onClick={goToNext}
              className="flex-1 h-full focus:outline-none"
            />
          </div>

          {/* Navigation Arrows (visible on hover) */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < storyGroup.stories.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* View count */}
          <div className="absolute bottom-4 left-4 z-20 text-white/70 text-sm">
            👁 {currentStory.view_count} lượt xem
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
