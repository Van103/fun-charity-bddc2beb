import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Search,
  Trash2,
  Edit,
  Plus,
  BookOpen,
  Sparkles,
  Filter,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  ChevronDown,
  FolderOpen,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  priority: number;
  is_active: boolean;
  source_file_name: string | null;
  source_file_url: string | null;
  chunk_index: number;
  total_chunks: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "general", label: "Chung" },
  { value: "charity", label: "Từ thiện" },
  { value: "crypto", label: "Crypto" },
  { value: "spiritual", label: "Tâm linh" },
  { value: "technical", label: "Kỹ thuật" },
  { value: "faq", label: "FAQ" },
];

export default function AdminAngelKnowledge() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [formKeywords, setFormKeywords] = useState("");
  const [formPriority, setFormPriority] = useState(0);

  // Check admin access
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data } = await supabase.rpc("is_admin", { _user_id: user.id });
      return data;
    },
  });

  useEffect(() => {
    if (!isCheckingAdmin && !isAdmin) {
      toast.error("Bạn không có quyền truy cập trang này");
      navigate("/");
    }
  }, [isAdmin, isCheckingAdmin, navigate]);

  // Fetch knowledge entries
  const { data: entries, isLoading: isLoadingEntries } = useQuery({
    queryKey: ["angel-knowledge", searchQuery, filterCategory, filterActive],
    queryFn: async () => {
      let query = supabase
        .from("angel_knowledge")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }
      if (filterCategory !== "all") {
        query = query.eq("category", filterCategory);
      }
      if (filterActive !== "all") {
        query = query.eq("is_active", filterActive === "active");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as KnowledgeEntry[];
    },
    enabled: !!isAdmin,
  });

  // Stats
  const stats = {
    total: entries?.length || 0,
    active: entries?.filter((e) => e.is_active).length || 0,
    categories: [...new Set(entries?.map((e) => e.category) || [])].length,
  };

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-document`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }
      return result;
    },
    onSuccess: (data) => {
      toast.success(`Đã xử lý thành công! Tạo ${data.chunks_created} entries.`);
      queryClient.invalidateQueries({ queryKey: ["angel-knowledge"] });
      resetForm();
      setIsUploadDialogOpen(false);
    },
    onError: (error: Error) => {
      if (error.message.includes("manual text entry")) {
        toast.info("File này cần nhập text thủ công. Vui lòng copy nội dung và sử dụng form nhập thủ công.");
      } else {
        toast.error(error.message);
      }
    },
  });

  // Manual entry mutation
  const manualEntryMutation = useMutation({
    mutationFn: async (entry: { title: string; content: string; category: string; keywords: string[]; priority: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("angel_knowledge")
        .insert({
          title: entry.title,
          content: entry.content,
          category: entry.category,
          keywords: entry.keywords,
          priority: entry.priority,
          uploaded_by: user?.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Đã thêm kiến thức mới!");
      queryClient.invalidateQueries({ queryKey: ["angel-knowledge"] });
      resetForm();
      setIsUploadDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (entry: Partial<KnowledgeEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from("angel_knowledge")
        .update({
          title: entry.title,
          content: entry.content,
          category: entry.category,
          keywords: entry.keywords,
          priority: entry.priority,
          is_active: entry.is_active,
        })
        .eq("id", entry.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Đã cập nhật!");
      queryClient.invalidateQueries({ queryKey: ["angel-knowledge"] });
      setIsEditDialogOpen(false);
      setSelectedEntry(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("angel_knowledge").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Đã xóa!");
      queryClient.invalidateQueries({ queryKey: ["angel-knowledge"] });
      setIsDeleteDialogOpen(false);
      setSelectedEntry(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("angel_knowledge")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["angel-knowledge"] });
    },
  });

  const resetForm = () => {
    setUploadFile(null);
    setManualTitle("");
    setManualContent("");
    setFormCategory("general");
    setFormKeywords("");
    setFormPriority(0);
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("category", formCategory);
    formData.append("keywords", formKeywords);
    formData.append("priority", formPriority.toString());

    try {
      await uploadMutation.mutateAsync(formData);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualEntry = async () => {
    if (!manualTitle.trim() || !manualContent.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    const keywords = formKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    await manualEntryMutation.mutateAsync({
      title: manualTitle,
      content: manualContent,
      category: formCategory,
      keywords,
      priority: formPriority,
    });
  };

  const handleEdit = (entry: KnowledgeEntry) => {
    setSelectedEntry(entry);
    setManualTitle(entry.title);
    setManualContent(entry.content);
    setFormCategory(entry.category);
    setFormKeywords(entry.keywords?.join(", ") || "");
    setFormPriority(entry.priority);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedEntry) return;

    const keywords = formKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    await updateMutation.mutateAsync({
      id: selectedEntry.id,
      title: manualTitle,
      content: manualContent,
      category: formCategory,
      keywords,
      priority: formPriority,
      is_active: selectedEntry.is_active,
    });
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Angel AI Knowledge Base
              </h1>
              <p className="text-muted-foreground">Quản lý kiến thức cho Angel AI</p>
            </div>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsUploadDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm Kiến Thức
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng Entries</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Sparkles className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đang Hoạt Động</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <FolderOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Danh Mục</p>
                  <p className="text-2xl font-bold">{stats.categories}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterActive} onValueChange={setFilterActive}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Đã tắt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Entries List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Danh Sách Kiến Thức
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEntries ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : entries?.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Chưa có kiến thức nào</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm kiến thức đầu tiên
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  <AnimatePresence>
                    {entries?.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-lg border ${
                          entry.is_active
                            ? "bg-card border-border"
                            : "bg-muted/50 border-muted opacity-60"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
                              <h3 className="font-semibold truncate flex-1">
                                {entry.title}
                              </h3>
                              <Badge variant="outline" className="shrink-0">
                                {CATEGORIES.find((c) => c.value === entry.category)?.label ||
                                  entry.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {entry.content}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {entry.keywords?.map((kw) => (
                                <Badge key={kw} variant="secondary" className="text-xs">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                            {entry.source_file_name && (
                              <p className="text-xs text-muted-foreground mt-2">
                                📎 {entry.source_file_name} (Chunk {entry.chunk_index + 1}/{entry.total_chunks})
                              </p>
                            )}
                          </div>
                          <div className="flex md:flex-col items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                toggleActiveMutation.mutate({
                                  id: entry.id,
                                  is_active: !entry.is_active,
                                })
                              }
                              title={entry.is_active ? "Tắt" : "Bật"}
                            >
                              {entry.is_active ? (
                                <ToggleRight className="w-5 h-5 text-green-500" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedEntry(entry);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm Kiến Thức Mới
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Nhập Thủ Công</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tiêu đề *</Label>
                <Input
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Nhập tiêu đề cho kiến thức..."
                />
              </div>
              <div className="space-y-2">
                <Label>Nội dung *</Label>
                <Textarea
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder="Nhập nội dung kiến thức..."
                  rows={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Độ ưu tiên (0-10)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={formPriority}
                    onChange={(e) => setFormPriority(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Từ khóa (phân cách bằng dấu phẩy)</Label>
                <Input
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="từ khóa 1, từ khóa 2, ..."
                />
              </div>
              <Button
                onClick={handleManualEntry}
                disabled={manualEntryMutation.isPending}
                className="w-full"
              >
                {manualEntryMutation.isPending ? (
                  <>Đang lưu...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu Kiến Thức
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {uploadFile ? uploadFile.name : "Kéo thả file hoặc click để chọn"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hỗ trợ: .txt, .md (PDF và DOCX cần nhập text thủ công)
                  </p>
                </label>
              </div>

              {uploadFile && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Danh mục</Label>
                      <Select value={formCategory} onValueChange={setFormCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Độ ưu tiên (0-10)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={formPriority}
                        onChange={(e) => setFormPriority(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Từ khóa (phân cách bằng dấu phẩy)</Label>
                    <Input
                      value={formKeywords}
                      onChange={(e) => setFormKeywords(e.target.value)}
                      placeholder="từ khóa 1, từ khóa 2, ..."
                    />
                  </div>
                  <Button
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>Đang xử lý...</>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload & Xử Lý File
                      </>
                    )}
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Chỉnh Sửa Kiến Thức
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tiêu đề *</Label>
              <Input
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Nội dung *</Label>
              <Textarea
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Độ ưu tiên (0-10)</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={formPriority}
                  onChange={(e) => setFormPriority(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Từ khóa (phân cách bằng dấu phẩy)</Label>
              <Input
                value={formKeywords}
                onChange={(e) => setFormKeywords(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Đang lưu..." : "Lưu Thay Đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa "{selectedEntry?.title}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedEntry && deleteMutation.mutate(selectedEntry.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
