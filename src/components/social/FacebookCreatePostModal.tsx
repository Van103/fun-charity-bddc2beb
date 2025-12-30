import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Image,
  Video,
  X,
  Loader2,
  MapPin,
  UserPlus,
  Smile,
  ChevronDown,
  Globe,
  Lock,
  Users,
  MoreHorizontal,
  Sparkles,
  Type,
} from "lucide-react";
import { useCreateFeedPost } from "@/hooks/useFeedPosts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MentionSuggestions } from "./MentionSuggestions";
import { extractMentionIds } from "@/lib/formatContent";
import {
  formatBytesToMB,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  uploadFileWithProgress,
  UploadController,
  UploadProgress,
} from "@/lib/media";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableMediaItem } from "./SortableMediaItem";
import { cn } from "@/lib/utils";

interface FacebookCreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    user_id?: string;
  } | null;
  onPostCreated?: () => void;
}

interface MentionUser {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface MediaItem {
  id: string;
  file: File;
  preview: string;
  isVideo: boolean;
  uploadProgress?: UploadProgress | null;
}

type PrivacyOption = "public" | "friends" | "private";

const privacyOptions: Record<PrivacyOption, { label: string; icon: React.ElementType }> = {
  public: { label: "Công khai", icon: Globe },
  friends: { label: "Bạn bè", icon: Users },
  private: { label: "Chỉ mình tôi", icon: Lock },
};

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

const commonEmojis = ["😊", "❤️", "👍", "🎉", "🙏", "💪", "🌟", "✨", "💕", "😍", "🥰", "😢", "😂", "🤗", "💖", "🔥"];

export function FacebookCreatePostModal({
  open,
  onOpenChange,
  profile,
  onPostCreated,
}: FacebookCreatePostModalProps) {
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<PrivacyOption>("public");
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<MentionUser[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // AI Panel states
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiStyle, setAiStyle] = useState("thân thiện");
  const [aiImageStyle, setAiImageStyle] = useState("illustration");
  const [generateImage, setGenerateImage] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const uploadControllersRef = useRef<Map<string, UploadController>>(new Map());

  const { toast } = useToast();
  const createPost = useCreateFeedPost();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch friends for tagging
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ["tag-friends", tagSearchQuery],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (!friendships || friendships.length === 0) return [];

      const friendIds = friendships.map((f) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      let query = supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", friendIds);

      if (tagSearchQuery) {
        query = query.ilike("full_name", `%${tagSearchQuery}%`);
      }

      const { data: profiles } = await query.limit(10);
      return profiles || [];
    },
    enabled: showTagPicker,
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  // Handle drag end for reordering
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMediaItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const isVideo = type === "video" || file.type.startsWith("video/");
      const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      const maxSizeLabel = formatBytesToMB(limit);

      if (file.size > limit) {
        toast({
          title: "File quá lớn",
          description: `${file.name} vượt quá ${maxSizeLabel}`,
          variant: "destructive",
        });
        continue;
      }

      const itemId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const newItem: MediaItem = {
        id: itemId,
        file,
        preview: URL.createObjectURL(file),
        isVideo,
      };
      setMediaItems((prev) => [...prev, newItem]);
    }

    e.target.value = "";
  };

  const removeMedia = (id: string) => {
    const controller = uploadControllersRef.current.get(id);
    if (controller) {
      controller.abort();
      uploadControllersRef.current.delete(id);
    }

    setMediaItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const cancelUpload = (id: string) => {
    const controller = uploadControllersRef.current.get(id);
    if (controller) {
      controller.abort();
      uploadControllersRef.current.delete(id);
      setMediaItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, uploadProgress: null } : item))
      );
      toast({ title: "Đã hủy upload" });
    }
  };

  const uploadFiles = async (): Promise<string[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Bạn cần đăng nhập để đăng bài");

    // Get session for authenticated upload
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const uploadedUrls: string[] = [];

    for (const item of mediaItems) {
      const fileExt = item.file.name.split(".").pop() || "bin";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      try {
        const controller = uploadFileWithProgress(
          `${supabaseUrl}/storage/v1/object/post-images/${filePath}`,
          item.file,
          { 
            Authorization: `Bearer ${session.access_token}`, 
            "x-upsert": "true",
            "Content-Type": item.file.type || "application/octet-stream"
          },
          (progress) => {
            setMediaItems((prev) =>
              prev.map((m) => (m.id === item.id ? { ...m, uploadProgress: progress } : m))
            );
          }
        );

        uploadControllersRef.current.set(item.id, controller);
        await controller.promise;
        uploadControllersRef.current.delete(item.id);

        const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(filePath);
        uploadedUrls.push(urlData.publicUrl);
      } catch (error: any) {
        uploadControllersRef.current.delete(item.id);
        if (error.message === "Upload cancelled") continue;
        console.error("Upload error:", error);
        throw new Error(`Lỗi tải ${item.file.name}: ${error.message}`);
      }
    }

    return uploadedUrls;
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + emoji + content.slice(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setContent(content + emoji);
    }
    setShowEmojiPicker(false);
  };

  const selectTag = (user: MentionUser) => {
    // Check if already tagged
    if (mentionedUsers.some((u) => u.user_id === user.user_id)) {
      toast({ title: "Đã gắn thẻ", description: `${user.full_name} đã được gắn thẻ rồi` });
    } else {
      setMentionedUsers((prev) => [...prev, user]);
      // Also add mention to content
      const mentionText = `@[${user.full_name || "Người dùng"}](${user.user_id}) `;
      setContent((prev) => prev + mentionText);
    }
    setShowTagPicker(false);
    setTagSearchQuery("");
  };

  const removeTag = (userId: string) => {
    setMentionedUsers((prev) => prev.filter((u) => u.user_id !== userId));
  };

  const generateAIContent = async () => {
    setIsGeneratingAI(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Lỗi", description: "Vui lòng đăng nhập để sử dụng AI", variant: "destructive" });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-post-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          topic: aiTopic.trim() || content.trim() || undefined,
          style: aiStyle,
          imageStyle: generateImage ? aiImageStyle : undefined,
        }),
      });

      if (response.status === 429) {
        toast({ title: "Quá nhiều yêu cầu", description: "Vui lòng thử lại sau vài giây", variant: "destructive" });
        return;
      }
      if (response.status === 402) {
        toast({ title: "Hết credits", description: "Cần nạp thêm credits để sử dụng AI", variant: "destructive" });
        return;
      }
      if (!response.ok) {
        throw new Error("Không thể tạo nội dung AI");
      }

      const data = await response.json();
      if (data.content) {
        setContent(data.content);
      }
      
      // Add generated image to media items
      if (data.image && generateImage) {
        // Convert base64 to blob and add to media items
        const base64Data = data.image;
        if (base64Data.startsWith("data:image")) {
          const imageId = `ai-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          // Fetch base64 and convert to File
          const res = await fetch(base64Data);
          const blob = await res.blob();
          const file = new File([blob], `ai-generated-${Date.now()}.png`, { type: "image/png" });
          
          const newItem: MediaItem = {
            id: imageId,
            file,
            preview: base64Data,
            isVideo: false,
          };
          setMediaItems((prev) => [...prev, newItem]);
        }
      }
      
      toast({ title: "Đã tạo nội dung AI", description: "Bạn có thể chỉnh sửa trước khi đăng" });
      setShowAIPanel(false);
      setAiTopic("");
    } catch (error) {
      console.error("AI generation error:", error);
      toast({ title: "Lỗi", description: "Không thể tạo nội dung AI", variant: "destructive" });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const aiStyles = [
    { value: "thân thiện", label: "Thân thiện" },
    { value: "chuyên nghiệp", label: "Chuyên nghiệp" },
    { value: "cảm xúc", label: "Cảm xúc" },
    { value: "hài hước", label: "Hài hước" },
    { value: "truyền cảm hứng", label: "Truyền cảm hứng" },
  ];

  const aiImageStyles = [
    { value: "illustration", label: "Minh họa", icon: "🎨" },
    { value: "realistic", label: "Chân thực", icon: "📷" },
    { value: "cartoon", label: "Hoạt hình", icon: "🎭" },
    { value: "watercolor", label: "Màu nước", icon: "🖌️" },
    { value: "3d", label: "3D", icon: "💎" },
  ];

  const resetForm = () => {
    mediaItems.forEach((item) => {
      if (item.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setContent("");
    setMediaItems([]);
    setMentionedUsers([]);
    setLocation("");
    setShowLocationInput(false);
    setPrivacy("public");
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaItems.length === 0) {
      toast({
        title: "Nội dung trống",
        description: "Vui lòng nhập nội dung hoặc thêm hình ảnh / video",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      let mediaUrls: string[] = [];
      if (mediaItems.length > 0) {
        mediaUrls = await uploadFiles();
      }

      const postData = await createPost.mutateAsync({
        post_type: "story",
        content: content.trim(),
        media_urls: mediaUrls,
        location: location.trim() || undefined,
      });

      // Save mentions to post_mentions table
      if (mentionedUsers.length > 0 && postData?.id) {
        const mentionInserts = mentionedUsers.map((user) => ({
          post_id: postData.id,
          mentioned_user_id: user.user_id,
        }));
        await supabase.from("post_mentions").insert(mentionInserts);
      }

      resetForm();
      onOpenChange(false);
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = isUploading || createPost.isPending;
  const canSubmit = content.trim() || mediaItems.length > 0;
  const PrivacyIcon = privacyOptions[privacy].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border text-center relative">
          <DialogTitle className="text-xl font-bold">Tạo bài viết</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* User Info */}
          <div className="p-4 flex items-center gap-3">
            <Link to="/profile">
              <Avatar className="w-10 h-10 border-2 border-card">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(profile?.full_name || "U")} text-white`}>
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <p className="font-semibold text-foreground">{profile?.full_name || "Người dùng"}</p>
              {/* Privacy Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-md transition-colors">
                    <PrivacyIcon className="w-3 h-3" />
                    <span>{privacyOptions[privacy].label}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  {(Object.entries(privacyOptions) as [PrivacyOption, typeof privacyOptions[PrivacyOption]][]).map(
                    ([key, option]) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setPrivacy(key)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                            privacy === key ? "bg-primary/10 text-primary" : "hover:bg-muted"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </button>
                      );
                    }
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-4 pb-2">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${profile?.full_name || "Bạn"} ơi, bạn đang nghĩ gì thế?`}
              className="w-full min-h-[120px] resize-none bg-transparent text-foreground text-lg placeholder:text-muted-foreground focus:outline-none"
              disabled={isSubmitting}
            />

            {/* Tagged Users Display */}
            {mentionedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-sm text-muted-foreground">— cùng với</span>
                {mentionedUsers.map((user) => (
                  <span
                    key={user.user_id}
                    className="inline-flex items-center gap-1 text-sm text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full"
                  >
                    {user.full_name}
                    <button
                      onClick={() => removeTag(user.user_id)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Location Display */}
            {location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <MapPin className="w-4 h-4 text-destructive" />
                <span>tại</span>
                <span className="font-medium text-foreground">{location}</span>
                <button
                  onClick={() => {
                    setLocation("");
                    setShowLocationInput(false);
                  }}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Location Input */}
            {showLocationInput && !location && (
              <div className="mb-3">
                <Input
                  placeholder="Nhập địa điểm..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (location.trim()) setShowLocationInput(false);
                    }
                  }}
                  autoFocus
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Media Preview */}
          {mediaItems.length > 0 && (
            <div className="px-4 pb-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={mediaItems.map((item) => item.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 gap-2">
                    {mediaItems.map((item) => (
                      <SortableMediaItem
                        key={item.id}
                        id={item.id}
                        preview={item.preview}
                        isVideo={item.isVideo}
                        onRemove={() => removeMedia(item.id)}
                        onCancelUpload={item.uploadProgress ? () => cancelUpload(item.id) : undefined}
                        disabled={isSubmitting}
                        uploadProgress={item.uploadProgress}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* AI Generation Panel */}
          <AnimatePresence>
            {showAIPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-4 mb-3 border border-purple-500/30 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/5 to-pink-500/5"
              >
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <span className="font-semibold text-foreground">Tạo bài viết bằng AI</span>
                    </div>
                    <button
                      onClick={() => setShowAIPanel(false)}
                      className="p-1 hover:bg-muted rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Topic Input */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Chủ đề bài viết</label>
                    <Input
                      placeholder="Ví dụ: Giúp đỡ trẻ em vùng cao, Quyên góp sách..."
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  {/* Writing Style */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Phong cách viết</label>
                    <div className="flex flex-wrap gap-2">
                      {aiStyles.map((style) => (
                        <button
                          key={style.value}
                          onClick={() => setAiStyle(style.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm transition-colors",
                            aiStyle === style.value
                              ? "bg-purple-500 text-white"
                              : "bg-muted hover:bg-muted/80 text-foreground"
                          )}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Image Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">Tạo hình ảnh kèm theo</label>
                    <button
                      onClick={() => setGenerateImage(!generateImage)}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors",
                        generateImage ? "bg-purple-500" : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                          generateImage && "translate-x-5"
                        )}
                      />
                    </button>
                  </div>

                  {/* Image Style (only show if generateImage is true) */}
                  {generateImage && (
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Phong cách hình ảnh</label>
                      <div className="grid grid-cols-5 gap-2">
                        {aiImageStyles.map((style) => (
                          <button
                            key={style.value}
                            onClick={() => setAiImageStyle(style.value)}
                            className={cn(
                              "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                              aiImageStyle === style.value
                                ? "bg-purple-500/20 border border-purple-500"
                                : "bg-muted hover:bg-muted/80 border border-transparent"
                            )}
                          >
                            <span className="text-lg">{style.icon}</span>
                            <span className="text-xs text-foreground">{style.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  <Button
                    onClick={generateAIContent}
                    disabled={isGeneratingAI}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Tạo bài viết AI
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emoji/Font Size Row */}
          <div className="px-4 pb-3 flex items-center justify-between">
            <button className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              Aa
            </button>
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <button className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
                  <Smile className="w-6 h-6" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="end">
                <p className="text-sm font-medium mb-2">Chọn biểu tượng</p>
                <div className="grid grid-cols-8 gap-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="w-8 h-8 flex items-center justify-center text-xl hover:bg-muted rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Bar */}
          <div className="mx-4 mb-3 border border-border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Thêm vào bài viết của bạn</span>
              <div className="flex items-center gap-1">
                {/* Photo */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Ảnh/Video"
                >
                  <Image className="w-6 h-6 text-green-500" />
                </button>

                {/* Tag People */}
                <Popover open={showTagPicker} onOpenChange={setShowTagPicker}>
                  <PopoverTrigger asChild>
                    <button
                      disabled={isSubmitting}
                      className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Gắn thẻ người khác"
                    >
                      <UserPlus className="w-6 h-6 text-blue-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="end">
                    <div className="p-3 border-b border-border">
                      <Input
                        placeholder="Tìm kiếm bạn bè..."
                        value={tagSearchQuery}
                        onChange={(e) => setTagSearchQuery(e.target.value)}
                        className="text-sm"
                        autoFocus
                      />
                    </div>
                    <MentionSuggestions
                      users={friends}
                      isLoading={isLoadingFriends}
                      selectedIndex={selectedTagIndex}
                      onSelect={selectTag}
                    />
                  </PopoverContent>
                </Popover>

                {/* Emoji */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      disabled={isSubmitting}
                      className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Cảm xúc/Hoạt động"
                    >
                      <Smile className="w-6 h-6 text-yellow-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3" align="end">
                    <p className="text-sm font-medium mb-2">Bạn đang cảm thấy thế nào?</p>
                    <div className="grid grid-cols-8 gap-1">
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-xl hover:bg-muted rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Location */}
                <button
                  onClick={() => setShowLocationInput(true)}
                  disabled={isSubmitting}
                  className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Check in"
                >
                  <MapPin className="w-6 h-6 text-red-500" />
                </button>

                {/* GIF */}
                <button
                  disabled={isSubmitting}
                  className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
                  title="GIF"
                >
                  <span className="text-sm font-bold text-teal-500">GIF</span>
                </button>

                {/* AI Generate */}
                <button
                  onClick={() => setShowAIPanel(true)}
                  disabled={isSubmitting || isGeneratingAI}
                  className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Tạo bài viết bằng AI"
                >
                  {isGeneratingAI ? (
                    <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  )}
                </button>

                {/* More */}
                <button
                  disabled={isSubmitting}
                  className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Thêm"
                >
                  <MoreHorizontal className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, "image")}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, "video")}
          />
        </div>

        {/* Submit Button */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit}
            className={cn(
              "w-full h-10 font-semibold text-base",
              canSubmit
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang đăng...
              </>
            ) : (
              "Đăng"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
