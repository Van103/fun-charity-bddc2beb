import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVolunteerMatches, VolunteerMatch } from '@/hooks/useVolunteerMatches';
import { CATEGORY_OPTIONS } from '@/hooks/useHelpRequests';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Star,
  Play,
  Square,
  User,
  MessageSquare,
  Loader2,
  Award,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export const MatchDashboard = () => {
  const { language } = useLanguage();
  const { matches, loading, updateMatchStatus, checkIn, checkOut } = useVolunteerMatches();
  const [activeTab, setActiveTab] = useState('pending');

  const pendingMatches = matches.filter(m => m.status === 'pending');
  const acceptedMatches = matches.filter(m => m.status === 'accepted');
  const completedMatches = matches.filter(m => m.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderMatchCard = (match: VolunteerMatch) => {
    const category = CATEGORY_OPTIONS.find(c => c.id === match.help_request?.category);
    const isCheckedIn = !!match.checked_in_at;
    
    return (
      <motion.div
        key={match.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        layout
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${category?.color || 'from-gray-400 to-gray-500'} text-white`}>
                  {category?.icon || '📋'}
                </div>
                <div>
                  <CardTitle className="text-base line-clamp-1">
                    {match.help_request?.title || 'N/A'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(match.status)}`} />
                    {match.status === 'pending' && (language === 'vi' ? 'Chờ xác nhận' : 'Pending')}
                    {match.status === 'accepted' && (language === 'vi' ? 'Đã chấp nhận' : 'Accepted')}
                    {match.status === 'completed' && (language === 'vi' ? 'Hoàn thành' : 'Completed')}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0">
                {language === 'vi' ? 'Điểm phù hợp' : 'Match Score'}: {match.match_score}%
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {match.help_request?.location_name && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="truncate">{match.help_request.location_name}</span>
                </div>
              )}
              {match.help_request?.scheduled_date && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    {format(new Date(match.help_request.scheduled_date), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>{match.help_request?.estimated_duration_hours || 2}h</span>
              </div>
              {match.requester && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="w-4 h-4 text-primary" />
                  <span className="truncate">{match.requester.full_name}</span>
                </div>
              )}
            </div>

            {/* Check-in/Check-out for accepted */}
            {match.status === 'accepted' && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                {isCheckedIn ? (
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {language === 'vi' ? 'Đã check-in lúc: ' : 'Checked in at: '}
                      </span>
                      <span className="font-medium">
                        {format(new Date(match.checked_in_at!), 'HH:mm dd/MM')}
                      </span>
                    </div>
                    <Button size="sm" variant="default" onClick={() => checkOut(match.id)}>
                      <Square className="w-4 h-4 mr-1" />
                      Check-out
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {language === 'vi' ? 'Sẵn sàng bắt đầu nhiệm vụ?' : 'Ready to start the task?'}
                    </span>
                    <Button size="sm" onClick={() => checkIn(match.id)}>
                      <Play className="w-4 h-4 mr-1" />
                      Check-in
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Hours logged for completed */}
            {match.status === 'completed' && match.hours_logged > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">
                    {language === 'vi' ? 'Đã hoàn thành' : 'Completed'}: {match.hours_logged.toFixed(1)}h
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+{Math.round(match.hours_logged * 10)} pts</span>
                </div>
              </div>
            )}

            {/* Contact info for accepted */}
            {match.status === 'accepted' && match.help_request?.contact_phone && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <div className="font-medium mb-1">{language === 'vi' ? 'Thông tin liên hệ' : 'Contact Info'}</div>
                <div className="text-muted-foreground">
                  {match.help_request.contact_name} - {match.help_request.contact_phone}
                </div>
              </div>
            )}

            {/* Actions for pending */}
            {match.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => updateMatchStatus(match.id, 'rejected')}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {language === 'vi' ? 'Từ chối' : 'Decline'}
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => updateMatchStatus(match.id, 'accepted')}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {language === 'vi' ? 'Chấp nhận' : 'Accept'}
                </Button>
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
              {language === 'vi' ? 'Được ghép ' : 'Matched '}
              {formatDistanceToNow(new Date(match.matched_at), {
                addSuffix: true,
                locale: language === 'vi' ? vi : enUS,
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500 text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{pendingMatches.length}</p>
              <p className="text-sm text-muted-foreground">{language === 'vi' ? 'Chờ xác nhận' : 'Pending'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{acceptedMatches.length}</p>
              <p className="text-sm text-muted-foreground">{language === 'vi' ? 'Đang thực hiện' : 'In Progress'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500 text-white">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{completedMatches.length}</p>
              <p className="text-sm text-muted-foreground">{language === 'vi' ? 'Hoàn thành' : 'Completed'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            {language === 'vi' ? 'Chờ xác nhận' : 'Pending'}
            {pendingMatches.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingMatches.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="gap-2">
            <Play className="w-4 h-4" />
            {language === 'vi' ? 'Đang thực hiện' : 'In Progress'}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            {language === 'vi' ? 'Hoàn thành' : 'Completed'}
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="pending" className="space-y-4 m-0">
            <AnimatePresence>
              {pendingMatches.length === 0 ? (
                <Card className="bg-muted/30">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {language === 'vi' 
                      ? 'Không có nhiệm vụ nào đang chờ xác nhận' 
                      : 'No pending matches'}
                  </CardContent>
                </Card>
              ) : (
                pendingMatches.map(renderMatchCard)
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4 m-0">
            <AnimatePresence>
              {acceptedMatches.length === 0 ? (
                <Card className="bg-muted/30">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {language === 'vi' 
                      ? 'Không có nhiệm vụ nào đang thực hiện' 
                      : 'No active matches'}
                  </CardContent>
                </Card>
              ) : (
                acceptedMatches.map(renderMatchCard)
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 m-0">
            <AnimatePresence>
              {completedMatches.length === 0 ? (
                <Card className="bg-muted/30">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {language === 'vi' 
                      ? 'Chưa hoàn thành nhiệm vụ nào' 
                      : 'No completed matches yet'}
                  </CardContent>
                </Card>
              ) : (
                completedMatches.map(renderMatchCard)
              )}
            </AnimatePresence>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
