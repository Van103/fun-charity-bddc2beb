import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  X, 
  Upload, 
  Type, 
  Palette, 
  Image as ImageIcon,
  Video,
  Sparkles,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStoryCreated?: () => void;
}

const FILTERS = [
  { name: "Không", value: "none", css: "" },
  { name: "Sáng", value: "bright", css: "brightness(1.2)" },
  { name: "Ấm", value: "warm", css: "sepia(0.3) saturate(1.3)" },
  { name: "Lạnh", value: "cool", css: "hue-rotate(20deg) saturate(0.9)" },
  { name: "Vintage", value: "vintage", css: "sepia(0.5) contrast(1.1)" },
  { name: "Drama", value: "drama", css: "contrast(1.3) saturate(1.2)" },
  { name: "B&W", value: "bw", css: "grayscale(1)" },
  { name: "Fade", value: "fade", css: "saturate(0.8) brightness(1.1)" },
];

const TEXT_COLORS = [
  "#FFFFFF", "#000000", "#FF6B6B", "#4ECDC4", 
  "#FFE66D", "#A855F7", "#3B82F6", "#10B981"
];

export function CreateStoryModal({ open, onOpenChange, onStoryCreated }: CreateStoryModalProps) {
  const [phase, setPhase] = useState<"upload" | "edit">("upload");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [textOverlay, setTextOverlay] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [showTextInput, setShowTextInput] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setPhase("edit");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setPhase("edit");
  }, []);

  const getCurrentFilter = () => {
    return FILTERS.find(f => f.value === selectedFilter)?.css || "";
  };

  const handlePublish = async () => {
    if (!mediaFile) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vui lòng đăng nhập để tạo story");
        return;
      }

      // Upload media to storage
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("stories")
        .upload(fileName, mediaFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("stories")
        .getPublicUrl(fileName);

      // Create story record
      const { error: insertError } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          media_url: urlData.publicUrl,
          media_type: mediaType,
          text_overlay: textOverlay || null,
          text_position: textOverlay ? { x: textPosition.x, y: textPosition.y, color: textColor } : null,
          filter: selectedFilter !== "none" ? selectedFilter : null,
        });

      if (insertError) throw insertError;

      toast.success("Story đã được đăng!");
      onStoryCreated?.();
      handleClose();
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Không thể đăng story");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setPhase("upload");
    setMediaFile(null);
    setMediaPreview("");
    setSelectedFilter("none");
    setTextOverlay("");
    setTextColor("#FFFFFF");
    setShowTextInput(false);
    setShowFilters(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-border max-h-[90vh]">
        <DialogTitle className="sr-only">Tạo Story</DialogTitle>
        
        <AnimatePresence mode="wait">
          {phase === "upload" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Tạo tin mới</h2>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="text-foreground font-medium mb-2">Kéo thả hoặc nhấn để tải lên</p>
                <p className="text-sm text-muted-foreground">Hỗ trợ ảnh và video</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Quick Options */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-4 h-4" />
                  Ảnh
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Video className="w-4 h-4" />
                  Video
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-[80vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Button variant="ghost" size="sm" onClick={() => setPhase("upload")}>
                  Quay lại
                </Button>
                <h2 className="font-semibold text-foreground">Chỉnh sửa</h2>
                <Button 
                  size="sm" 
                  onClick={handlePublish}
                  disabled={isUploading}
                  className="gap-1"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Đăng
                    </>
                  )}
                </Button>
              </div>

              {/* Preview Area */}
              <div className="flex-1 relative bg-black overflow-hidden">
                {mediaType === "image" ? (
                  <img
                    src={mediaPreview}
                    alt="Story preview"
                    className="w-full h-full object-contain"
                    style={{ filter: getCurrentFilter() }}
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="w-full h-full object-contain"
                    style={{ filter: getCurrentFilter() }}
                    controls
                    autoPlay
                    muted
                    loop
                  />
                )}

                {/* Text Overlay */}
                {textOverlay && (
                  <div
                    className="absolute px-4 py-2 text-2xl font-bold text-center drop-shadow-lg pointer-events-none"
                    style={{
                      left: `${textPosition.x}%`,
                      top: `${textPosition.y}%`,
                      transform: "translate(-50%, -50%)",
                      color: textColor,
                      textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    {textOverlay}
                  </div>
                )}
              </div>

              {/* Tools */}
              <div className="p-4 border-t border-border bg-card">
                {/* Text Input */}
                <AnimatePresence>
                  {showTextInput && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <Textarea
                        value={textOverlay}
                        onChange={(e) => setTextOverlay(e.target.value)}
                        placeholder="Nhập văn bản..."
                        className="mb-2 resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        {TEXT_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setTextColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              textColor === color ? "border-primary scale-110" : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filter Selection */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {FILTERS.map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => setSelectedFilter(filter.value)}
                            className={`shrink-0 p-2 rounded-lg border-2 transition-all ${
                              selectedFilter === filter.value
                                ? "border-primary bg-primary/10"
                                : "border-transparent bg-muted"
                            }`}
                          >
                            <div 
                              className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 mb-1"
                              style={{ filter: filter.css }}
                            />
                            <span className="text-xs text-foreground">{filter.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tool Buttons */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant={showTextInput ? "default" : "outline"}
                    size="icon"
                    className="rounded-full"
                    onClick={() => {
                      setShowTextInput(!showTextInput);
                      setShowFilters(false);
                    }}
                  >
                    <Type className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={showFilters ? "default" : "outline"}
                    size="icon"
                    className="rounded-full"
                    onClick={() => {
                      setShowFilters(!showFilters);
                      setShowTextInput(false);
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
