import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Calendar, MapPin, FileText, Award, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LogActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityLogged?: () => void;
}

const activityCategories = [
  { id: "education", label: "Giáo dục", labelEn: "Education" },
  { id: "healthcare", label: "Y tế", labelEn: "Healthcare" },
  { id: "environment", label: "Môi trường", labelEn: "Environment" },
  { id: "community", label: "Cộng đồng", labelEn: "Community" },
  { id: "mentoring", label: "Hướng dẫn", labelEn: "Mentoring" },
  { id: "technology", label: "Công nghệ", labelEn: "Technology" },
  { id: "other", label: "Khác", labelEn: "Other" },
];

export function LogActivityModal({ open, onOpenChange, onActivityLogged }: LogActivityModalProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hours: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.hours || !formData.category) {
      toast({
        title: language === "vi" ? "Thiếu thông tin" : "Missing information",
        description: language === "vi" 
          ? "Vui lòng điền đầy đủ tiêu đề, số giờ và danh mục" 
          : "Please fill in title, hours and category",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: language === "vi" ? "Chưa đăng nhập" : "Not logged in",
          description: language === "vi" ? "Vui lòng đăng nhập để ghi nhận hoạt động" : "Please login to log activity",
          variant: "destructive",
        });
        return;
      }

      const hours = parseFloat(formData.hours);
      const points = Math.floor(hours * 10); // 10 points per hour

      // Insert reputation event for volunteer activity
      const { error } = await supabase.from("reputation_events").insert({
        user_id: user.id,
        event_type: "volunteer_activity",
        points,
        reference_type: formData.category,
      });

      if (error) throw error;

      // Update profile reputation score
      const { data: profile } = await supabase
        .from("profiles")
        .select("reputation_score")
        .eq("user_id", user.id)
        .single();

      await supabase
        .from("profiles")
        .update({ 
          reputation_score: (profile?.reputation_score || 0) + points 
        })
        .eq("user_id", user.id);

      toast({
        title: language === "vi" ? "Ghi nhận thành công!" : "Activity logged!",
        description: language === "vi" 
          ? `Bạn đã nhận được ${points} điểm đóng góp` 
          : `You earned ${points} impact points`,
      });

      setFormData({
        title: "",
        description: "",
        hours: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
        location: "",
      });
      
      onActivityLogged?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error logging activity:", error);
      toast({
        title: language === "vi" ? "Lỗi" : "Error",
        description: language === "vi" ? "Không thể ghi nhận hoạt động" : "Could not log activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            {language === "vi" ? "Ghi nhận hoạt động tình nguyện" : "Log Volunteer Activity"}
          </DialogTitle>
          <DialogDescription>
            {language === "vi" 
              ? "Ghi lại hoạt động tình nguyện của bạn để nhận điểm đóng góp" 
              : "Log your volunteer activity to earn impact points"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {language === "vi" ? "Tiêu đề hoạt động" : "Activity Title"} *
            </Label>
            <Input
              id="title"
              placeholder={language === "vi" ? "VD: Dạy học cho trẻ em vùng cao" : "E.g. Teaching children in highlands"}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {language === "vi" ? "Danh mục" : "Category"} *
            </Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger>
                <SelectValue placeholder={language === "vi" ? "Chọn danh mục" : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {activityCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {language === "vi" ? cat.label : cat.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hours and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {language === "vi" ? "Số giờ" : "Hours"} *
              </Label>
              <Input
                id="hours"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="0"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {language === "vi" ? "Ngày" : "Date"}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {language === "vi" ? "Địa điểm" : "Location"}
            </Label>
            <Input
              id="location"
              placeholder={language === "vi" ? "VD: Hà Giang, Việt Nam" : "E.g. Ha Giang, Vietnam"}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {language === "vi" ? "Mô tả chi tiết" : "Description"}
            </Label>
            <Textarea
              id="description"
              placeholder={language === "vi" ? "Mô tả hoạt động của bạn..." : "Describe your activity..."}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Points Preview */}
          {formData.hours && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-primary/10 border border-primary/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === "vi" ? "Điểm sẽ nhận được:" : "Points to earn:"}
                </span>
                <span className="text-lg font-bold text-primary">
                  +{Math.floor(parseFloat(formData.hours) * 10)} {language === "vi" ? "điểm" : "points"}
                </span>
              </div>
            </motion.div>
          )}

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "vi" ? "Đang gửi..." : "Submitting..."}
                </>
              ) : (
                language === "vi" ? "Ghi nhận" : "Log Activity"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
