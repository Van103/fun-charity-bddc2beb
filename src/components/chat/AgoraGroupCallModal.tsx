import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Monitor,
  MonitorOff,
  RotateCcw,
  Users,
  Maximize2,
  Minimize2,
  Grid3X3,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgoraCall, CallStatus } from '@/hooks/useAgoraCall';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Participant {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface AgoraGroupCallModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  conversationName: string;
  participants: Participant[];
  callType: 'audio' | 'video';
  isIncoming?: boolean;
  callSessionId?: string;
  currentUserId: string;
  onCallEnded?: () => void;
}

export const AgoraGroupCallModal = ({
  open,
  onClose,
  conversationId,
  conversationName,
  participants,
  callType,
  isIncoming = false,
  callSessionId,
  currentUserId,
  onCallEnded,
}: AgoraGroupCallModalProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [internalCallStatus, setInternalCallStatus] = useState<CallStatus>('idle');
  const [viewMode, setViewMode] = useState<'grid' | 'spotlight'>('grid');
  const [spotlightUid, setSpotlightUid] = useState<number | null>(null);
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(callSessionId || '');

  const {
    callStatus,
    setCallStatus,
    isMuted,
    isVideoOff,
    isScreenSharing,
    remoteUsers,
    callDuration,
    error,
    joinChannel,
    leaveChannel,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    switchCamera,
    playLocalVideo,
    playRemoteVideo,
  } = useAgoraCall({
    onRemoteUserJoined: (user) => {
      console.log('[GroupCall] Remote user joined:', user.uid);
      toast.success('Thành viên mới tham gia cuộc gọi');
    },
    onRemoteUserLeft: (user) => {
      console.log('[GroupCall] Remote user left:', user.uid);
      toast.info('Một thành viên đã rời cuộc gọi');
    },
    onCallEnded: () => {
      onCallEnded?.();
    },
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getChannelName = useCallback(() => {
    return `group_${conversationId}_${Date.now()}`;
  }, [conversationId]);

  const createCallSession = useCallback(async (channelName: string) => {
    const { data, error } = await supabase
      .from('call_sessions')
      .insert({
        conversation_id: conversationId,
        caller_id: currentUserId,
        call_type: callType,
        status: 'pending',
        signaling_data: { 
          agora_channel: channelName,
          is_group: true,
          participants: participants.map(p => p.user_id)
        }
      })
      .select()
      .single();

    if (error) {
      console.error('[GroupCall] Error creating call session:', error);
      throw error;
    }

    sessionIdRef.current = data.id;
    return data;
  }, [conversationId, currentUserId, callType, participants]);

  const updateCallStatus = useCallback(async (status: string) => {
    if (!sessionIdRef.current) return;

    await supabase
      .from('call_sessions')
      .update({ 
        status,
        ...(status === 'ended' ? { ended_at: new Date().toISOString() } : {})
      })
      .eq('id', sessionIdRef.current);
  }, []);

  // Start group call
  const startCall = useCallback(async () => {
    try {
      setInternalCallStatus('ringing');
      setCallStatus('ringing');

      const channelName = getChannelName();
      await createCallSession(channelName);

      // uid = 0 để Agora tự gán (giống dự án FunProfile đang hoạt động)
      const uid = 0;
      
      await joinChannel(channelName, uid, callType === 'video');
      setInternalCallStatus('active');

      // Send notifications to all participants
      for (const participant of participants) {
        if (participant.user_id !== currentUserId) {
          await supabase.functions.invoke('send-push-notification', {
            body: {
              userId: participant.user_id,
              title: callType === 'video' ? '📹 Cuộc gọi nhóm video' : '📞 Cuộc gọi nhóm',
              body: `${conversationName}: Cuộc gọi nhóm đang diễn ra`,
              data: {
                type: 'incoming_call',
                callSessionId: sessionIdRef.current,
                callType,
                channelName,
                isGroup: true,
              }
            }
          });
        }
      }

      toast.success('Đã bắt đầu cuộc gọi nhóm');
    } catch (err) {
      console.error('[GroupCall] Error starting call:', err);
      setInternalCallStatus('error');
      toast.error('Không thể bắt đầu cuộc gọi');
    }
  }, [getChannelName, createCallSession, joinChannel, callType, currentUserId, participants, conversationName, setCallStatus]);

  // Answer incoming group call
  const answerCall = useCallback(async () => {
    try {
      setInternalCallStatus('connecting');

      const { data: session } = await supabase
        .from('call_sessions')
        .select('signaling_data')
        .eq('id', sessionIdRef.current)
        .single();

      const channelName = (session?.signaling_data as any)?.agora_channel;
      if (!channelName) throw new Error('No channel name found');

      // uid = 0 để Agora tự gán (giống dự án FunProfile đang hoạt động)
      const uid = 0;

      await updateCallStatus('active');
      await joinChannel(channelName, uid, callType === 'video');
      
      setInternalCallStatus('active');
      toast.success('Đã tham gia cuộc gọi nhóm');
    } catch (err) {
      console.error('[GroupCall] Error answering call:', err);
      setInternalCallStatus('error');
      toast.error('Không thể tham gia cuộc gọi');
    }
  }, [joinChannel, callType, currentUserId, updateCallStatus]);

  const endCall = useCallback(async () => {
    await updateCallStatus('ended');
    await leaveChannel();
    
    setInternalCallStatus('ended');
    onClose();
  }, [leaveChannel, updateCallStatus, onClose]);

  // Play local video
  useEffect(() => {
    if (localVideoRef.current && callType === 'video' && !isVideoOff) {
      playLocalVideo(localVideoRef.current);
    }
  }, [callStatus, playLocalVideo, callType, isScreenSharing, isVideoOff]);

  // Play remote videos
  useEffect(() => {
    remoteUsers.forEach(user => {
      const ref = remoteVideoRefs.current.get(user.uid as number);
      if (ref && user.videoTrack) {
        playRemoteVideo(user, ref);
      }
    });
  }, [remoteUsers, playRemoteVideo]);

  // Auto-start for outgoing calls
  useEffect(() => {
    if (open && !isIncoming && internalCallStatus === 'idle') {
      startCall();
    }
  }, [open, isIncoming, internalCallStatus, startCall]);

  // Set session id for incoming calls
  useEffect(() => {
    if (callSessionId) {
      sessionIdRef.current = callSessionId;
    }
  }, [callSessionId]);

  // Auto-hide controls
  useEffect(() => {
    if (internalCallStatus === 'active') {
      const resetTimer = () => {
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        setShowControls(true);
        controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
      };
      resetTimer();
      return () => {
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      };
    }
  }, [internalCallStatus]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  const setRemoteVideoRef = useCallback((uid: number, el: HTMLDivElement | null) => {
    if (el) {
      remoteVideoRefs.current.set(uid, el);
    } else {
      remoteVideoRefs.current.delete(uid);
    }
  }, []);

  const totalParticipants = remoteUsers.length + 1; // +1 for local user
  
  const getGridCols = () => {
    if (totalParticipants <= 1) return 'grid-cols-1';
    if (totalParticipants <= 2) return 'grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && endCall()}>
      <DialogContent 
        className={`${isFullscreen ? 'max-w-[100vw] h-[100vh] rounded-none' : 'max-w-4xl h-[85vh]'} p-0 overflow-hidden bg-gray-900 border-0`}
        onPointerMove={() => setShowControls(true)}
      >
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{conversationName}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          {totalParticipants} người tham gia
                        </Badge>
                        {internalCallStatus === 'active' && (
                          <span className="text-white/60 text-sm">
                            {formatDuration(callDuration)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => setViewMode(v => v === 'grid' ? 'spotlight' : 'grid')}
                    >
                      {viewMode === 'grid' ? <Square className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                      {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Grid */}
          <div className="flex-1 p-4 pt-20">
            {internalCallStatus === 'ringing' && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-12 h-12 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">{conversationName}</h3>
                  <p className="text-white/60">Đang chờ người tham gia...</p>
                </div>
              </div>
            )}

            {internalCallStatus === 'active' && viewMode === 'grid' && (
              <div className={`grid ${getGridCols()} gap-2 h-full`}>
                {/* Local video */}
                <div className="relative bg-gray-800 rounded-xl overflow-hidden">
                  {callType === 'video' && !isVideoOff ? (
                    <div ref={localVideoRef} className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Avatar className="w-20 h-20">
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                          Bạn
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-sm">
                    Bạn {isMuted && '🔇'}
                  </div>
                </div>

                {/* Remote videos */}
                {remoteUsers.map((user) => {
                  const participant = participants.find(p => {
                    const pUid = Math.abs(p.user_id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 10000000;
                    return pUid === user.uid;
                  });

                  return (
                    <div 
                      key={user.uid} 
                      className="relative bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                      onClick={() => {
                        setSpotlightUid(user.uid as number);
                        setViewMode('spotlight');
                      }}
                    >
                      {user.videoTrack ? (
                        <div 
                          ref={(el) => setRemoteVideoRef(user.uid as number, el)}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={participant?.avatar_url || ''} />
                            <AvatarFallback className="text-2xl bg-secondary">
                              {participant?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-sm">
                        {participant?.full_name || `User ${user.uid}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {internalCallStatus === 'active' && viewMode === 'spotlight' && (
              <div className="h-full flex flex-col gap-2">
                {/* Main spotlight */}
                <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden relative">
                  {spotlightUid ? (
                    (() => {
                      const user = remoteUsers.find(u => u.uid === spotlightUid);
                      if (user?.videoTrack) {
                        return (
                          <div 
                            ref={(el) => el && setRemoteVideoRef(spotlightUid, el)}
                            className="w-full h-full"
                          />
                        );
                      }
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <Avatar className="w-32 h-32">
                            <AvatarFallback className="text-4xl">?</AvatarFallback>
                          </Avatar>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/60">
                      Chọn một người để xem
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                <ScrollArea className="h-24">
                  <div className="flex gap-2 p-1">
                    {/* Local thumbnail */}
                    <div 
                      className={`w-20 h-20 rounded-lg bg-gray-800 flex-shrink-0 cursor-pointer ${spotlightUid === null ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSpotlightUid(null)}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>Bạn</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {remoteUsers.map(user => (
                      <div 
                        key={user.uid}
                        className={`w-20 h-20 rounded-lg bg-gray-800 flex-shrink-0 cursor-pointer ${spotlightUid === user.uid ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSpotlightUid(user.uid as number)}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {participants.find(p => {
                                const pUid = Math.abs(p.user_id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 10000000;
                                return pUid === user.uid;
                              })?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {internalCallStatus === 'error' && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-400 mb-4">{error || 'Đã xảy ra lỗi'}</p>
                  <Button onClick={onClose}>Đóng</Button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
              >
                {isIncoming && internalCallStatus === 'idle' ? (
                  <div className="flex justify-center gap-8">
                    <Button
                      size="lg"
                      variant="destructive"
                      className="rounded-full w-16 h-16"
                      onClick={onClose}
                    >
                      <PhoneOff className="w-6 h-6" />
                    </Button>
                    <Button
                      size="lg"
                      className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
                      onClick={answerCall}
                    >
                      <Phone className="w-6 h-6" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center gap-4">
                    <Button
                      size="lg"
                      variant={isMuted ? "destructive" : "secondary"}
                      className="rounded-full w-14 h-14"
                      onClick={toggleMute}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>

                    {callType === 'video' && (
                      <>
                        <Button
                          size="lg"
                          variant={isVideoOff ? "destructive" : "secondary"}
                          className="rounded-full w-14 h-14"
                          onClick={toggleVideo}
                        >
                          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </Button>

                        <Button
                          size="lg"
                          variant={isScreenSharing ? "default" : "secondary"}
                          className="rounded-full w-14 h-14"
                          onClick={toggleScreenShare}
                        >
                          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                        </Button>

                        <Button
                          size="lg"
                          variant="secondary"
                          className="rounded-full w-14 h-14"
                          onClick={switchCamera}
                        >
                          <RotateCcw className="w-5 h-5" />
                        </Button>
                      </>
                    )}

                    <Button
                      size="lg"
                      variant="destructive"
                      className="rounded-full w-14 h-14"
                      onClick={endCall}
                    >
                      <PhoneOff className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
