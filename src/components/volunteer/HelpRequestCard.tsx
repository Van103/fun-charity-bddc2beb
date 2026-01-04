import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { HelpRequest, CATEGORY_OPTIONS, URGENCY_OPTIONS } from '@/hooks/useHelpRequests';
import { SKILL_OPTIONS } from '@/hooks/useVolunteerProfile';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  User,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface HelpRequestCardProps {
  request: HelpRequest;
  onApply?: () => void;
  onViewDetails?: () => void;
  showApplyButton?: boolean;
}

export const HelpRequestCard = ({
  request,
  onApply,
  onViewDetails,
  showApplyButton = true,
}: HelpRequestCardProps) => {
  const { language } = useLanguage();
  
  const category = CATEGORY_OPTIONS.find(c => c.id === request.category);
  const urgency = URGENCY_OPTIONS.find(u => u.id === request.urgency);
  const progress = (request.volunteers_matched / request.volunteers_needed) * 100;
  
  const getUrgencyColor = () => {
    switch (request.urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case 'open':
        return <Badge variant="outline" className="text-green-500 border-green-500">{language === 'vi' ? 'Đang mở' : 'Open'}</Badge>;
      case 'matching':
        return <Badge variant="secondary">{language === 'vi' ? 'Đang ghép' : 'Matching'}</Badge>;
      case 'in_progress':
        return <Badge variant="default">{language === 'vi' ? 'Đang thực hiện' : 'In Progress'}</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">{language === 'vi' ? 'Hoàn thành' : 'Completed'}</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all overflow-hidden">
        {/* Category Banner */}
        <div className={`h-2 bg-gradient-to-r ${category?.color || 'from-gray-400 to-gray-500'}`} />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${category?.color || 'from-gray-400 to-gray-500'} text-white text-xl`}>
                {category?.icon || '📋'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {request.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' ? category?.labelVi : category?.labelEn}
                </p>
              </div>
            </div>
            <Badge variant={getUrgencyColor() as any} className="shrink-0">
              {request.urgency === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {language === 'vi' ? urgency?.labelVi : urgency?.labelEn}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          {request.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {request.description}
            </p>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {request.location_name && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate">{request.location_name}</span>
              </div>
            )}
            {request.scheduled_date && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="truncate">
                  {new Date(request.scheduled_date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{request.estimated_duration_hours}h</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>{request.volunteers_matched}/{request.volunteers_needed}</span>
            </div>
          </div>

          {/* Skills */}
          {request.skills_required.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {request.skills_required.slice(0, 3).map(skillId => {
                const skill = SKILL_OPTIONS.find(s => s.id === skillId);
                return skill ? (
                  <Badge key={skillId} variant="outline" className="text-xs">
                    {skill.icon} {language === 'vi' ? skill.labelVi : skill.labelEn}
                  </Badge>
                ) : null;
              })}
              {request.skills_required.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{request.skills_required.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{language === 'vi' ? 'Tiến độ tuyển' : 'Recruitment progress'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Requester */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={request.requester?.avatar_url || ''} />
                <AvatarFallback>
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                {request.requester?.full_name || (language === 'vi' ? 'Ẩn danh' : 'Anonymous')}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(request.created_at), {
                addSuffix: true,
                locale: language === 'vi' ? vi : enUS,
              })}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-0 gap-2">
          {getStatusBadge()}
          <div className="flex-1" />
          {showApplyButton && request.status === 'open' && (
            <Button size="sm" onClick={onApply} className="gap-1">
              {language === 'vi' ? 'Đăng ký' : 'Apply'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          {onViewDetails && (
            <Button size="sm" variant="outline" onClick={onViewDetails}>
              {language === 'vi' ? 'Chi tiết' : 'Details'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};
