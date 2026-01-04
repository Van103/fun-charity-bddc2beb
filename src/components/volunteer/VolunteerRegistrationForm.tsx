import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  useVolunteerProfile, 
  SKILL_OPTIONS, 
  WEEKDAY_OPTIONS, 
  TIME_SLOT_OPTIONS,
  VolunteerProfileInput 
} from '@/hooks/useVolunteerProfile';
import { 
  MapPin, 
  Clock, 
  Award, 
  Phone, 
  User, 
  Save,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface VolunteerRegistrationFormProps {
  onSuccess?: () => void;
}

export const VolunteerRegistrationForm = ({ onSuccess }: VolunteerRegistrationFormProps) => {
  const { language } = useLanguage();
  const { profile, loading, saving, createOrUpdateProfile } = useVolunteerProfile();
  
  const [formData, setFormData] = useState<VolunteerProfileInput>({
    skills: [],
    availability: { weekdays: [], timeSlots: [] },
    location_name: '',
    service_radius_km: 10,
    experience_level: 'beginner',
    certifications: [],
    bio: '',
    phone: '',
    is_available: true,
  });
  
  const [newCertification, setNewCertification] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        skills: profile.skills || [],
        availability: profile.availability || { weekdays: [], timeSlots: [] },
        location_name: profile.location_name || '',
        service_radius_km: profile.service_radius_km || 10,
        experience_level: profile.experience_level || 'beginner',
        certifications: profile.certifications || [],
        bio: profile.bio || '',
        phone: profile.phone || '',
        is_available: profile.is_available,
      });
    }
  }, [profile]);

  const toggleSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.includes(skillId)
        ? prev.skills.filter(s => s !== skillId)
        : [...(prev.skills || []), skillId],
    }));
  };

  const toggleWeekday = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability!,
        weekdays: prev.availability?.weekdays.includes(day)
          ? prev.availability.weekdays.filter(d => d !== day)
          : [...(prev.availability?.weekdays || []), day],
      },
    }));
  };

  const toggleTimeSlot = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability!,
        timeSlots: prev.availability?.timeSlots.includes(slot)
          ? prev.availability.timeSlots.filter(s => s !== slot)
          : [...(prev.availability?.timeSlots || []), slot],
      },
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()],
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter(c => c !== cert),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrUpdateProfile(formData);
      onSuccess?.();
    } catch (error) {
      // Error handled in hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {language === 'vi' ? 'Thông tin cơ bản' : 'Basic Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="w-4 h-4 inline mr-1" />
                {language === 'vi' ? 'Số điện thoại' : 'Phone Number'}
              </Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+84 xxx xxx xxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="w-4 h-4 inline mr-1" />
                {language === 'vi' ? 'Địa điểm' : 'Location'}
              </Label>
              <Input
                id="location"
                value={formData.location_name || ''}
                onChange={e => setFormData({ ...formData, location_name: e.target.value })}
                placeholder={language === 'vi' ? 'TP. Hồ Chí Minh' : 'Ho Chi Minh City'}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">
              {language === 'vi' ? 'Giới thiệu bản thân' : 'About Yourself'}
            </Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder={language === 'vi' 
                ? 'Chia sẻ đôi điều về bạn và động lực tham gia tình nguyện...' 
                : 'Share something about yourself and your motivation to volunteer...'}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{language === 'vi' ? 'Bán kính hoạt động' : 'Service Radius'}: {formData.service_radius_km} km</Label>
            <Slider
              value={[formData.service_radius_km || 10]}
              onValueChange={([value]) => setFormData({ ...formData, service_radius_km: value })}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="available" className="cursor-pointer">
              {language === 'vi' ? 'Sẵn sàng nhận nhiệm vụ' : 'Available for tasks'}
            </Label>
            <Switch
              id="available"
              checked={formData.is_available}
              onCheckedChange={checked => setFormData({ ...formData, is_available: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            {language === 'vi' ? 'Kỹ năng của bạn' : 'Your Skills'}
          </CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Chọn các kỹ năng bạn có thể đóng góp' 
              : 'Select skills you can contribute'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map(skill => {
              const isSelected = formData.skills?.includes(skill.id);
              return (
                <motion.button
                  key={skill.id}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSkill(skill.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span>{skill.icon}</span>
                  <span>{language === 'vi' ? skill.labelVi : skill.labelEn}</span>
                  {isSelected && <CheckCircle className="w-4 h-4" />}
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {language === 'vi' ? 'Lịch rảnh' : 'Availability'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">{language === 'vi' ? 'Ngày trong tuần' : 'Days of Week'}</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_OPTIONS.map(day => {
                const isSelected = formData.availability?.weekdays.includes(day.id);
                return (
                  <Badge
                    key={day.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() => toggleWeekday(day.id)}
                  >
                    {language === 'vi' ? day.labelVi : day.labelEn}
                  </Badge>
                );
              })}
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block">{language === 'vi' ? 'Khung giờ' : 'Time Slots'}</Label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOT_OPTIONS.map(slot => {
                const isSelected = formData.availability?.timeSlots.includes(slot.id);
                return (
                  <Badge
                    key={slot.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() => toggleTimeSlot(slot.id)}
                  >
                    {language === 'vi' ? slot.labelVi : slot.labelEn}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>{language === 'vi' ? 'Chứng chỉ' : 'Certifications'}</CardTitle>
          <CardDescription>
            {language === 'vi' 
              ? 'Thêm các chứng chỉ bạn có (sơ cấp cứu, bằng lái, ...)' 
              : 'Add your certifications (first aid, driver license, ...)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input
              value={newCertification}
              onChange={e => setNewCertification(e.target.value)}
              placeholder={language === 'vi' ? 'Tên chứng chỉ...' : 'Certification name...'}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCertification())}
            />
            <Button type="button" onClick={addCertification} variant="outline">
              {language === 'vi' ? 'Thêm' : 'Add'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.certifications?.map(cert => (
              <Badge key={cert} variant="secondary" className="gap-1">
                {cert}
                <button
                  type="button"
                  onClick={() => removeCertification(cert)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience Level */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>{language === 'vi' ? 'Mức độ kinh nghiệm' : 'Experience Level'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[
              { id: 'beginner', labelVi: 'Mới bắt đầu', labelEn: 'Beginner' },
              { id: 'intermediate', labelVi: 'Có kinh nghiệm', labelEn: 'Intermediate' },
              { id: 'expert', labelVi: 'Chuyên gia', labelEn: 'Expert' },
            ].map(level => (
              <Button
                key={level.id}
                type="button"
                variant={formData.experience_level === level.id ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, experience_level: level.id as any })}
              >
                {language === 'vi' ? level.labelVi : level.labelEn}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" className="w-full" size="lg" disabled={saving}>
        {saving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {profile 
          ? (language === 'vi' ? 'Cập nhật hồ sơ' : 'Update Profile')
          : (language === 'vi' ? 'Đăng ký tình nguyện viên' : 'Register as Volunteer')}
      </Button>
    </form>
  );
};
