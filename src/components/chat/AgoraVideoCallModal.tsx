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
}: AgoraVideoCallModalProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [internalCallStatus, setInternalCallStatus] = useState<CallStatus>('idle');
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const ringtoneRef = useRef<MessengerRingtone | null>(null);
  const callEndSoundRef = useRef<CallEndSound | null>(null);
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
    onRemoteUserJoined: () => {
      console.log('Remote user joined - call connected');
      setInternalCallStatus('active');
      ringtoneRef.current?.stop();
    },
    onRemoteUserLeft: () => {
      console.log('Remote user left');
    },
    onCallEnded: () => {
      callEndSoundRef.current?.play();
      onCallEnded?.();
    },
  });

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

  // Update call session status
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

  // Start outgoing call
  const startCall = useCallback(async () => {
    try {
      setInternalCallStatus('ringing');
      setCallStatus('ringing');
      
      // Start ringtone
      ringtoneRef.current = new MessengerRingtone();
      ringtoneRef.current.start();

      const channelName = getChannelName();
      await createCallSession(channelName);

      // Generate uid from current user id
      const uid = Math.abs(currentUserId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 10000000;
      
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

    } catch (err) {
      console.error('Error starting call:', err);
      setInternalCallStatus('error');
      ringtoneRef.current?.stop();
    }
  }, [getChannelName, createCallSession, joinChannel, callType, currentUserId, recipientId, recipientName, setCallStatus]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    try {
      setInternalCallStatus('connecting');
      ringtoneRef.current?.stop();

      // Get channel name from call session
      const { data: session } = await supabase
        .from('call_sessions')
        .select('signaling_data')
        .eq('id', sessionIdRef.current)
        .single();

      const channelName = (session?.signaling_data as any)?.agora_channel;
      if (!channelName) throw new Error('No channel name found');

      // Generate uid
      const uid = Math.abs(currentUserId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 10000000;

      await updateCallStatus('active');
      await joinChannel(channelName, uid, callType === 'video');
      
      setInternalCallStatus('active');
    } catch (err) {
      console.error('Error answering call:', err);
      setInternalCallStatus('error');
    }
  }, [joinChannel, callType, currentUserId, updateCallStatus]);

  // End call
  const endCall = useCallback(async () => {
    ringtoneRef.current?.stop();
    callEndSoundRef.current = new CallEndSound();
    callEndSoundRef.current.play();

    await updateCallStatus('ended');
    await leaveChannel();
    
    setInternalCallStatus('ended');
    onClose();
  }, [leaveChannel, updateCallStatus, onClose]);

  // Decline incoming call
  const declineCall = useCallback(async () => {
    ringtoneRef.current?.stop();
    await updateCallStatus('declined');
    setInternalCallStatus('ended');
    onClose();
  }, [updateCallStatus, onClose]);

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

          {/* Call Status */}
          {internalCallStatus === 'active' && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-white font-medium">{formatDuration(callDuration)}</span>
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
