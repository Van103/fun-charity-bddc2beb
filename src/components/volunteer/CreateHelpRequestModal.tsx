import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHelpRequests, CATEGORY_OPTIONS, URGENCY_OPTIONS, HelpRequestInput } from '@/hooks/useHelpRequests';
import { SKILL_OPTIONS } from '@/hooks/useVolunteerProfile';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Phone,
  AlertTriangle,
  Loader2,
  Plus,
} from 'lucide-react';

interface CreateHelpRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateHelpRequestModal = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateHelpRequestModalProps) => {
  const { language } = useLanguage();
  const { createRequest, creating } = useHelpRequests();

  const [formData, setFormData] = useState<HelpRequestInput>({
    title: '',
    description: '',
    category: '',
    urgency: 'medium',
    location_name: '',
    volunteers_needed: 1,
    skills_required: [],
    scheduled_date: '',
    estimated_duration_hours: 2,
    contact_name: '',
    contact_phone: '',
  });

  const toggleSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required?.includes(skillId)
        ? prev.skills_required.filter(s => s !== skillId)
        : [...(prev.skills_required || []), skillId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      return;
    }

    try {
      await createRequest({
        ...formData,
        scheduled_date: formData.scheduled_date 
          ? new Date(formData.scheduled_date).toISOString() 
          : null,
      });
      onOpenChange(false);
      onSuccess?.();
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        urgency: 'medium',
        location_name: '',
        volunteers_needed: 1,
        skills_required: [],
        scheduled_date: '',
        estimated_duration_hours: 2,
        contact_name: '',
        contact_phone: '',
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="w-5 h-5 text-primary" />
            {language === 'vi' ? 'Tạo yêu cầu trợ giúp' : 'Create Help Request'}
          </DialogTitle>
          <DialogDescription>
            {language === 'vi'
              ? 'Mô tả nhu cầu của bạn để tìm tình nguyện viên phù hợp'
              : 'Describe your needs to find matching volunteers'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              {language === 'vi' ? 'Tiêu đề *' : 'Title *'}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder={language === 'vi' 
                ? 'Ví dụ: Cần tình nguyện viên dạy học...' 
                : 'e.g., Need volunteers for teaching...'}
              required
            />
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Danh mục *' : 'Category *'}</Label>
              <Select
                value={formData.category}
                onValueChange={value => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'vi' ? 'Chọn danh mục' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{language === 'vi' ? cat.labelVi : cat.labelEn}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {language === 'vi' ? 'Mức độ khẩn cấp' : 'Urgency Level'}
              </Label>
              <Select
                value={formData.urgency}
                onValueChange={value => setFormData({ ...formData, urgency: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_OPTIONS.map(urg => (
                    <SelectItem key={urg.id} value={urg.id}>
                      {language === 'vi' ? urg.labelVi : urg.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {language === 'vi' ? 'Mô tả chi tiết' : 'Detailed Description'}
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder={language === 'vi'
                ? 'Mô tả chi tiết về nhu cầu của bạn, bao gồm thông tin về người thụ hưởng, hoàn cảnh, ...'
                : 'Describe your needs in detail, including beneficiary information, circumstances, ...'}
              rows={4}
            />
          </div>

          {/* Location & Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {language === 'vi' ? 'Địa điểm' : 'Location'}
              </Label>
              <Input
                value={formData.location_name || ''}
                onChange={e => setFormData({ ...formData, location_name: e.target.value })}
                placeholder={language === 'vi' ? 'Địa chỉ cụ thể...' : 'Specific address...'}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {language === 'vi' ? 'Ngày dự kiến' : 'Scheduled Date'}
              </Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_date || ''}
                onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>
          </div>

          {/* Volunteers & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {language === 'vi' ? 'Số tình nguyện viên cần' : 'Volunteers Needed'}
              </Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={formData.volunteers_needed}
                onChange={e => setFormData({ ...formData, volunteers_needed: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {language === 'vi' ? 'Thời gian ước tính (giờ)' : 'Estimated Duration (hours)'}
              </Label>
              <Input
                type="number"
                min={0.5}
                max={100}
                step={0.5}
                value={formData.estimated_duration_hours}
                onChange={e => setFormData({ ...formData, estimated_duration_hours: parseFloat(e.target.value) || 2 })}
              />
            </div>
          </div>

          {/* Skills Required */}
          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Kỹ năng cần thiết' : 'Skills Required'}</Label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map(skill => {
                const isSelected = formData.skills_required?.includes(skill.id);
                return (
                  <Badge
                    key={skill.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill.id)}
                  >
                    {skill.icon} {language === 'vi' ? skill.labelVi : skill.labelEn}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'vi' ? 'Tên liên hệ' : 'Contact Name'}</Label>
              <Input
                value={formData.contact_name || ''}
                onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder={language === 'vi' ? 'Họ và tên...' : 'Full name...'}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {language === 'vi' ? 'Số điện thoại' : 'Phone Number'}
              </Label>
              <Input
                value={formData.contact_phone || ''}
                onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+84 xxx xxx xxx"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button type="submit" className="flex-1" disabled={creating || !formData.title || !formData.category}>
              {creating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {language === 'vi' ? 'Tạo yêu cầu' : 'Create Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
