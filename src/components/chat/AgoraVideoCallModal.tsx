import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  Volume2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgoraCall, CallStatus } from '@/hooks/useAgoraCall';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Messenger-like ringtone generator
class MessengerRingtone {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    this.audioContext = new AudioContext();
    this.playPattern();
  }

  private playPattern() {
    const playTone = () => {
      if (!this.audioContext || !this.isPlaying) return;

      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      this.oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      this.oscillator.frequency.setValueAtTime(480, this.audioContext.currentTime + 0.15);

      this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

      this.oscillator.start();
      this.oscillator.stop(this.audioContext.currentTime + 0.3);
    };

    playTone();
    this.intervalId = setInterval(playTone, 2000);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.oscillator) {
      try { this.oscillator.stop(); } catch {}
      this.oscillator = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Call end sound
class CallEndSound {
  play() {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(480, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(380, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  }
}

interface AgoraVideoCallModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  callType: 'audio' | 'video';
  isIncoming?: boolean;
  callSessionId?: string;
  currentUserId: string;
  onCallEnded?: () => void;
  autoAnswer?: boolean; // Auto answer when opening (e.g., from notification click)
}

export const AgoraVideoCallModal = ({
  open,
  onClose,
  conversationId,
  recipientId,
  recipientName,
  recipientAvatar,
  callType,
  isIncoming = false,
  callSessionId,
  currentUserId,
  onCallEnded,
  autoAnswer = false,
}: AgoraVideoCallModalProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [internalCallStatus, setInternalCallStatus] = useState<CallStatus>('idle');
  const [hasAutoAnswered, setHasAutoAnswered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const ringtoneRef = useRef<MessengerRingtone | null>(null);
  const callEndSoundRef = useRef<CallEndSound | null>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(callSessionId || '');
  const hasStartedCallRef = useRef<boolean>(false);
  const ringingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    callStatus,
    setCallStatus,
    isMuted,
    isVideoOff,
    isScreenSharing,
    remoteUsers,
    callDuration,
    error,
    networkQuality,
    joinChannel,
    leaveChannel,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    switchCamera,
    playLocalVideo,
    playRemoteVideo,
  } = useAgoraCall({
    onRemoteUserJoined: () => {
      console.log('Remote user joined - call connected');
      setInternalCallStatus('active');
      ringtoneRef.current?.stop();
      // Clear ringing timeout when someone answers
      if (ringingTimeoutRef.current) {
        clearTimeout(ringingTimeoutRef.current);
        ringingTimeoutRef.current = null;
      }
    },
    onRemoteUserLeft: () => {
      console.log('Remote user left');
    },
    onCallEnded: () => {
      callEndSoundRef.current?.play();
      onCallEnded?.();
    },
  });

  // Network quality label (0: unknown, 1: excellent, 2: good, 3: poor, 4: bad, 5: very bad, 6: disconnected)
  const getNetworkQualityInfo = (quality: number) => {
    switch (quality) {
      case 1: return { label: 'Tuyệt vời', color: 'bg-green-500' };
      case 2: return { label: 'Tốt', color: 'bg-green-400' };
      case 3: return { label: 'Trung bình', color: 'bg-yellow-500' };
      case 4: return { label: 'Yếu', color: 'bg-orange-500' };
      case 5: return { label: 'Rất yếu', color: 'bg-red-500' };
      case 6: return { label: 'Mất kết nối', color: 'bg-red-600' };
      default: return { label: 'Đang kiểm tra...', color: 'bg-gray-500' };
    }
  };

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate unique channel name
  const getChannelName = useCallback(() => {
    return `call_${conversationId}_${Date.now()}`;
  }, [conversationId]);

  // Create call session in database
  const createCallSession = useCallback(async (channelName: string) => {
    const { data, error } = await supabase
      .from('call_sessions')
      .insert({
        conversation_id: conversationId,
        caller_id: currentUserId,
        call_type: callType,
        status: 'pending',
        signaling_data: { agora_channel: channelName }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating call session:', error);
      throw error;
    }

    sessionIdRef.current = data.id;
    return data;
  }, [conversationId, currentUserId, callType]);

  // Update call session status - only use valid database statuses
  const updateCallStatus = useCallback(async (status: 'pending' | 'active' | 'ended' | 'declined') => {
    if (!sessionIdRef.current) {
      console.log('[AgoraVideoCallModal] No session ID, skipping status update');
      return;
    }

    try {
      const { error } = await supabase
        .from('call_sessions')
        .update({ 
          status,
          ...(status === 'ended' || status === 'declined' ? { ended_at: new Date().toISOString() } : {})
        })
        .eq('id', sessionIdRef.current);
      
      if (error) {
        console.error('[AgoraVideoCallModal] Error updating call status:', error);
      } else {
        console.log('[AgoraVideoCallModal] Updated call status to:', status);
      }
    } catch (err) {
      console.error('[AgoraVideoCallModal] Failed to update call status:', err);
    }
  }, []);

  // Mark call as missed/no_answer
  const markCallAsNoAnswer = useCallback(async () => {
    if (!sessionIdRef.current) return;
    
    try {
      // Update call session status to no_answer
      await supabase
        .from('call_sessions')
        .update({ status: 'no_answer', ended_at: new Date().toISOString() })
        .eq('id', sessionIdRef.current)
        .eq('status', 'pending');
      
      // Save missed call message to chat
      const callTypeLabel = callType === 'video' ? 'video' : 'thoại';
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: `📵 Cuộc gọi ${callTypeLabel} không có người trả lời`,
        is_read: false
      });
      
      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
        
      console.log('[AgoraVideoCallModal] Call marked as no_answer');
    } catch (error) {
      console.error('[AgoraVideoCallModal] Error marking call as no_answer:', error);
    }
  }, [callType, conversationId, currentUserId]);

  // Start outgoing call
  const startCall = useCallback(async () => {
    // Prevent double start
    if (hasStartedCallRef.current || isProcessing) {
      console.log('[AgoraVideoCallModal] Call already started or processing, skipping...');
      return;
    }
    
    hasStartedCallRef.current = true;
    setIsProcessing(true);
    
    try {
      setInternalCallStatus('ringing');
      setCallStatus('ringing');
      
      // Start ringtone
      ringtoneRef.current = new MessengerRingtone();
      ringtoneRef.current.start();

      const channelName = getChannelName();
      await createCallSession(channelName);

      // uid = 0 để Agora tự gán (giống dự án FunProfile đang hoạt động)
      const uid = 0;
      
      // Join Agora channel
      await joinChannel(channelName, uid, callType === 'video');
      
      // Send notification to recipient
      await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: recipientId,
          title: callType === 'video' ? '📹 Cuộc gọi video đến' : '📞 Cuộc gọi đến',
          body: `${recipientName} đang gọi cho bạn`,
          data: {
            type: 'incoming_call',
            callSessionId: sessionIdRef.current,
            callType,
            channelName,
          }
        }
      });

      // Set timeout for no answer - 30 seconds
      ringingTimeoutRef.current = setTimeout(async () => {
        // Only trigger if still ringing (no one answered)
        if (internalCallStatus === 'ringing' && remoteUsers.length === 0) {
          console.log('[AgoraVideoCallModal] Call timeout - no answer after 30 seconds');
          ringtoneRef.current?.stop();
          callEndSoundRef.current = new CallEndSound();
          callEndSoundRef.current.play();
          
          await markCallAsNoAnswer();
          await leaveChannel();
          
          setInternalCallStatus('ended');
          hasStartedCallRef.current = false;
          onCallEnded?.();
          onClose();
        }
      }, 30000);

      setIsProcessing(false);
    } catch (err) {
      console.error('Error starting call:', err);
      setInternalCallStatus('error');
      ringtoneRef.current?.stop();
      setIsProcessing(false);
      hasStartedCallRef.current = false;
    }
  }, [getChannelName, createCallSession, joinChannel, callType, currentUserId, recipientId, recipientName, setCallStatus, isProcessing, markCallAsNoAnswer, leaveChannel, internalCallStatus, remoteUsers.length, onCallEnded, onClose]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    // Prevent double answer
    if (isProcessing) {
      console.log('[AgoraVideoCallModal] Already processing, skipping answer...');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      setInternalCallStatus('connecting');
      ringtoneRef.current?.stop();

      // Use sessionIdRef.current, but also accept callSessionId prop as fallback
      const sessionId = sessionIdRef.current || callSessionId;
      console.log('Answering call with session ID:', sessionId);
      
      if (!sessionId) {
        throw new Error('No session ID available');
      }

      // Get channel name from call session
      const { data: session, error: sessionError } = await supabase
        .from('call_sessions')
        .select('signaling_data, status')
        .eq('id', sessionId)
        .maybeSingle();

      if (sessionError) {
        console.error('Error fetching call session:', sessionError);
        throw new Error('Không tìm thấy dữ liệu cuộc gọi');
      }

      if (!session) {
        throw new Error('Không tìm thấy dữ liệu cuộc gọi');
      }

      // Check if call is still valid
      if (session.status !== 'pending' && session.status !== 'active') {
        throw new Error(`Cuộc gọi đã kết thúc (${session.status})`);
      }

      const channelName = (session?.signaling_data as any)?.agora_channel;
      console.log('Channel name from session:', channelName);
      
      if (!channelName) {
        throw new Error('Không tìm thấy kênh cuộc gọi');
      }

      // uid = 0 để Agora tự gán (giống dự án FunProfile đang hoạt động)
      const uid = 0;
      console.log('Joining channel with uid:', uid);

      // Update session ref for future use
      sessionIdRef.current = sessionId;

      await updateCallStatus('active');
      await joinChannel(channelName, uid, callType === 'video');
      
      setInternalCallStatus('active');
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Error answering call:', err);
      setInternalCallStatus('error');
      toast.error(err.message || 'Không thể tham gia cuộc gọi');
      setIsProcessing(false);
    }
  }, [joinChannel, callType, currentUserId, updateCallStatus, callSessionId, isProcessing]);

  // End call
  const endCall = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    // Clear ringing timeout if exists
    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }
    
    ringtoneRef.current?.stop();
    callEndSoundRef.current = new CallEndSound();
    callEndSoundRef.current.play();

    await updateCallStatus('ended');
    await leaveChannel();
    
    setInternalCallStatus('ended');
    hasStartedCallRef.current = false;
    setIsProcessing(false);
    onClose();
  }, [leaveChannel, updateCallStatus, onClose, isProcessing]);

  // Decline incoming call
  const declineCall = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    ringtoneRef.current?.stop();
    await updateCallStatus('declined');
    setInternalCallStatus('ended');
    hasStartedCallRef.current = false;
    setIsProcessing(false);
    onClose();
  }, [updateCallStatus, onClose, isProcessing]);

  // Play video tracks when refs are available
  useEffect(() => {
    if (localVideoRef.current && callType === 'video') {
      playLocalVideo(localVideoRef.current);
    }
  }, [callStatus, playLocalVideo, callType, isScreenSharing]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteUsers.length > 0) {
      playRemoteVideo(remoteUsers[0], remoteVideoRef.current);
    }
  }, [remoteUsers, playRemoteVideo]);

  // Auto-start call for outgoing
  useEffect(() => {
    if (open && !isIncoming && internalCallStatus === 'idle' && !hasStartedCallRef.current) {
      startCall();
    }
  }, [open, isIncoming, internalCallStatus, startCall]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Clear ringing timeout
      if (ringingTimeoutRef.current) {
        clearTimeout(ringingTimeoutRef.current);
        ringingTimeoutRef.current = null;
      }
      setHasAutoAnswered(false);
      hasStartedCallRef.current = false;
      setIsProcessing(false);
      // Reset internal status for next call
      setTimeout(() => {
        setInternalCallStatus('idle');
      }, 100);
    }
  }, [open]);

  // Set session id for incoming calls
  useEffect(() => {
    if (callSessionId) {
      sessionIdRef.current = callSessionId;
      console.log('[AgoraVideoCallModal] Set sessionIdRef to:', callSessionId);
    }
  }, [callSessionId]);

  // Auto-answer for incoming calls when autoAnswer is true (e.g., user clicked from notification)
  useEffect(() => {
    if (open && isIncoming && autoAnswer && callSessionId && !hasAutoAnswered && internalCallStatus === 'idle') {
      console.log('[AgoraVideoCallModal] Auto-answering call:', callSessionId);
      setHasAutoAnswered(true);
      // Small delay to ensure sessionIdRef is set
      setTimeout(() => {
        answerCall();
      }, 300);
    }
  }, [open, isIncoming, autoAnswer, callSessionId, hasAutoAnswered, internalCallStatus, answerCall]);

  // Auto-hide controls
  useEffect(() => {
    if (internalCallStatus === 'active') {
      const resetTimer = () => {
        if (controlsTimerRef.current) {
          clearTimeout(controlsTimerRef.current);
        }
        setShowControls(true);
        controlsTimerRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      };

      resetTimer();
      
      return () => {
        if (controlsTimerRef.current) {
          clearTimeout(controlsTimerRef.current);
        }
      };
    }
  }, [internalCallStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ringtoneRef.current?.stop();
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      if (ringingTimeoutRef.current) {
        clearTimeout(ringingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && endCall()}>
      <DialogContent 
        className={`p-0 overflow-hidden ${isFullscreen ? 'fixed inset-0 max-w-none w-screen h-screen rounded-none' : 'max-w-2xl w-full aspect-video'}`}
        onMouseMove={() => setShowControls(true)}
      >
        {/* Video Container */}
        <div className="relative w-full h-full bg-black min-h-[400px]">
          {/* Remote Video (Full screen) */}
          {callType === 'video' && remoteUsers.length > 0 ? (
            <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full" />
          ) : (
            // Audio call or waiting state
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
              <motion.div
                animate={internalCallStatus === 'ringing' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Avatar className="w-32 h-32 border-4 border-white/20">
                  <AvatarImage src={recipientAvatar} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {recipientName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <h2 className="mt-6 text-2xl font-semibold text-white">{recipientName}</h2>
              
              <p className="mt-2 text-white/70">
                {internalCallStatus === 'ringing' && (isIncoming ? 'Cuộc gọi đến...' : 'Đang đổ chuông...')}
                {internalCallStatus === 'connecting' && 'Đang kết nối...'}
                {internalCallStatus === 'active' && formatDuration(callDuration)}
                {internalCallStatus === 'error' && 'Lỗi kết nối'}
              </p>

              {/* Pulse animation for ringing */}
              {internalCallStatus === 'ringing' && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-40 h-40 rounded-full border-2 border-white/30"
                      animate={{
                        scale: [1, 2],
                        opacity: [0.5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* Local Video (Picture-in-Picture) */}
          {callType === 'video' && internalCallStatus === 'active' && (
            <motion.div
              className="absolute bottom-24 right-4 w-32 h-48 md:w-40 md:h-56 rounded-lg overflow-hidden shadow-lg border-2 border-white/20"
              drag
              dragConstraints={{ top: 0, bottom: 0, left: -200, right: 0 }}
            >
              <div ref={localVideoRef} className="w-full h-full bg-gray-800" />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <VideoOff className="w-8 h-8 text-white/50" />
                </div>
              )}
            </motion.div>
          )}

          {/* Call Status with Network Quality */}
          {internalCallStatus === 'active' && (
            <div className="absolute top-4 left-4 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-white font-medium">{formatDuration(callDuration)}</span>
              </div>
              {/* Network Quality Indicator */}
              {networkQuality.downlink > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                  <div className={`w-2 h-2 rounded-full ${getNetworkQualityInfo(networkQuality.downlink).color}`} />
                  <span className="text-xs text-white/80">{getNetworkQualityInfo(networkQuality.downlink).label}</span>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
              >
                <div className="flex items-center justify-center gap-4">
                  {/* Incoming call: Answer & Decline buttons */}
                  {isIncoming && internalCallStatus === 'ringing' && (
                    <>
                      <Button
                        variant="destructive"
                        size="lg"
                        className="rounded-full w-14 h-14"
                        onClick={declineCall}
                      >
                        <PhoneOff className="w-6 h-6" />
                      </Button>
                      <Button
                        size="lg"
                        className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600"
                        onClick={answerCall}
                      >
                        <Phone className="w-6 h-6" />
                      </Button>
                    </>
                  )}

                  {/* Active call controls */}
                  {(internalCallStatus === 'active' || (internalCallStatus === 'ringing' && !isIncoming)) && (
                    <>
                      {/* Mute */}
                      <Button
                        variant={isMuted ? 'destructive' : 'secondary'}
                        size="lg"
                        className="rounded-full w-12 h-12"
                        onClick={toggleMute}
                      >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </Button>

                      {/* Video toggle (video calls only) */}
                      {callType === 'video' && (
                        <Button
                          variant={isVideoOff ? 'destructive' : 'secondary'}
                          size="lg"
                          className="rounded-full w-12 h-12"
                          onClick={toggleVideo}
                        >
                          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </Button>
                      )}

                      {/* Screen share (video calls only) */}
                      {callType === 'video' && (
                        <Button
                          variant={isScreenSharing ? 'default' : 'secondary'}
                          size="lg"
                          className="rounded-full w-12 h-12"
                          onClick={toggleScreenShare}
                        >
                          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                        </Button>
                      )}

                      {/* Switch camera (mobile) */}
                      {callType === 'video' && (
                        <Button
                          variant="secondary"
                          size="lg"
                          className="rounded-full w-12 h-12"
                          onClick={switchCamera}
                        >
                          <RotateCcw className="w-5 h-5" />
                        </Button>
                      )}

                      {/* Fullscreen toggle */}
                      <Button
                        variant="secondary"
                        size="lg"
                        className="rounded-full w-12 h-12"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                      </Button>

                      {/* End call */}
                      <Button
                        variant="destructive"
                        size="lg"
                        className="rounded-full w-14 h-14"
                        onClick={endCall}
                      >
                        <PhoneOff className="w-6 h-6" />
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error display */}
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-red-500/80 text-white text-sm">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgoraVideoCallModal;
