import { useState, useRef, useCallback, useEffect } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ILocalVideoTrack,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Set Agora log level to reduce console noise
AgoraRTC.setLogLevel(2); // 0: DEBUG, 1: INFO, 2: WARNING, 3: ERROR, 4: NONE

export type CallStatus = 'idle' | 'connecting' | 'ringing' | 'active' | 'ended' | 'error';

interface UseAgoraCallProps {
  onRemoteUserJoined?: (user: IAgoraRTCRemoteUser) => void;
  onRemoteUserLeft?: (user: IAgoraRTCRemoteUser) => void;
  onCallEnded?: () => void;
}

export const useAgoraCall = (props?: UseAgoraCallProps) => {
  const { onRemoteUserJoined, onRemoteUserLeft, onCallEnded } = props || {};

  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appIdRef = useRef<string>('');

  // Internal flags to prevent race conditions
  const isLeavingRef = useRef<boolean>(false);
  const isJoiningRef = useRef<boolean>(false);

  // Keep latest callbacks in refs so this hook stays stable across re-renders.
  // (Otherwise, cleanup effects may run on every render and trigger unexpected leave())
  const onRemoteUserJoinedRef = useRef<UseAgoraCallProps["onRemoteUserJoined"]>(onRemoteUserJoined);
  const onRemoteUserLeftRef = useRef<UseAgoraCallProps["onRemoteUserLeft"]>(onRemoteUserLeft);
  const onCallEndedRef = useRef<UseAgoraCallProps["onCallEnded"]>(onCallEnded);

  useEffect(() => {
    onRemoteUserJoinedRef.current = onRemoteUserJoined;
  }, [onRemoteUserJoined]);

  useEffect(() => {
    onRemoteUserLeftRef.current = onRemoteUserLeft;
  }, [onRemoteUserLeft]);

  useEffect(() => {
    onCallEndedRef.current = onCallEnded;
  }, [onCallEnded]);

  // Initialize Agora client
  const initClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      console.log('[Agora] Client initialized');
      
      // Add connection state listener
      clientRef.current.on('connection-state-change', (curState, prevState, reason) => {
        console.log('[Agora] Connection state changed:', prevState, '->', curState, 'reason:', reason);
        
        if (curState === 'DISCONNECTED') {
          if (reason === 'NETWORK_ERROR') {
            setError('Mất kết nối mạng. Vui lòng kiểm tra internet.');
            toast.error('Mất kết nối mạng');
          } else if (reason === 'SERVER_ERROR') {
            setError('Lỗi server. Vui lòng thử lại.');
            toast.error('Lỗi server Agora');
          }
        }
      });

      // Add exception listener
      clientRef.current.on('exception', (event) => {
        console.error('[Agora] Exception:', event.code, event.msg);
        // Only show toast for critical errors
        if (String(event.code) !== 'OPERATION_ABORTED' && event.msg !== 'cancel token canceled') {
          toast.error(`Lỗi cuộc gọi: ${event.msg}`);
        }
      });
    }
    return clientRef.current;
  }, []);

  // Vercel Token Server (đã hoạt động ổn định từ dự án FunProfile)
  const VERCEL_TOKEN_SERVER = "https://mkdir-agora-token-server.vercel.app/api/agora-token";

  // Get token from Vercel Token Server
  const getToken = useCallback(async (channelName: string) => {
    console.log('[Agora] Fetching token from Vercel server for channel:', channelName);
    
    const response = await fetch(VERCEL_TOKEN_SERVER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelName, uid: 0 }), // uid: 0 để Agora tự gán
    });

    if (!response.ok) {
      console.error('[Agora] Token server error:', response.status);
      throw new Error(`Token server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.token || !data.appId) {
      console.error('[Agora] Invalid token response:', data);
      throw new Error('Invalid token response');
    }

    console.log('[Agora] Token received successfully, appId:', data.appId?.substring(0, 8) + '...');
    appIdRef.current = data.appId;
    return data.token;
  }, []);

  // Join channel
  const joinChannel = useCallback(async (
    channelName: string,
    uid: number, // Giữ tham số để tương thích, nhưng sẽ dùng null khi join
    isVideoCall: boolean
  ) => {
    // Prevent double join
    if (isJoiningRef.current) {
      console.log('[Agora] Already joining, skipping...');
      return;
    }
    
    // CRITICAL: Reset leaving flag when starting a new join
    // This fixes the race condition where previous leave state blocks new calls
    isLeavingRef.current = false;
    isJoiningRef.current = true;
    
    try {
      console.log('[Agora] Joining channel:', channelName, 'isVideoCall:', isVideoCall);
      setCallStatus('connecting');
      setError(null);

      const client = initClient();
      const token = await getToken(channelName);

      // Remove existing listeners before adding new ones
      client.removeAllListeners('user-published');
      client.removeAllListeners('user-unpublished');
      client.removeAllListeners('user-left');

      // Set up event listeners
      client.on('user-published', async (user, mediaType) => {
        if (isLeavingRef.current) return;
        console.log('[Agora] Remote user published:', user.uid, mediaType);
        try {
          await client.subscribe(user, mediaType);
          console.log('[Agora] Subscribed to:', user.uid, mediaType);
          
          if (mediaType === 'video') {
            setRemoteUsers(prev => {
              const exists = prev.find(u => u.uid === user.uid);
              if (exists) return prev;
              return [...prev, user];
            });
          }
          
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
          
          onRemoteUserJoinedRef.current?.(user);
        } catch (subError) {
          if (!isLeavingRef.current) {
            console.error('[Agora] Failed to subscribe:', subError);
          }
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (isLeavingRef.current) return;
        console.log('[Agora] Remote user unpublished:', user.uid, mediaType);
        if (mediaType === 'video') {
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        }
      });

      client.on('user-left', (user) => {
        if (isLeavingRef.current) return;
        console.log('[Agora] Remote user left:', user.uid);
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        onRemoteUserLeftRef.current?.(user);
      });

      // Join the channel với uid = null để Agora tự gán (giống dự án FunProfile)
      console.log('[Agora] Calling client.join with appId:', appIdRef.current?.substring(0, 8) + '...');
      await client.join(appIdRef.current, channelName, token, null);
      console.log('[Agora] Successfully joined channel:', channelName);

      // Only check leave flag if it was set AFTER we started joining
      // This prevents race conditions from previous modal close events
      if (isLeavingRef.current && !isJoiningRef.current) {
        console.log('[Agora] Leave was requested during join, leaving now...');
        await client.leave();
        return;
      }

      // Create and publish local tracks
      try {
        if (isVideoCall) {
          console.log('[Agora] Creating microphone and camera tracks...');
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
            { encoderConfig: 'music_standard' },
            { encoderConfig: '720p_2' }
          );
          localAudioTrackRef.current = audioTrack;
          localVideoTrackRef.current = videoTrack;
          
          if (!isLeavingRef.current) {
            await client.publish([audioTrack, videoTrack]);
            console.log('[Agora] Published audio and video tracks');
          }
        } else {
          console.log('[Agora] Creating microphone track...');
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({ encoderConfig: 'music_standard' });
          localAudioTrackRef.current = audioTrack;
          
          if (!isLeavingRef.current) {
            await client.publish([audioTrack]);
            console.log('[Agora] Published audio track');
          }
        }
      } catch (mediaError) {
        console.error('[Agora] Failed to create/publish tracks:', mediaError);
        setError('Không thể truy cập camera/micro. Vui lòng kiểm tra quyền truy cập.');
        toast.error('Không thể truy cập camera hoặc micro');
        isJoiningRef.current = false;
        throw mediaError;
      }

      if (!isLeavingRef.current) {
        setCallStatus('active');
        toast.success('Đã kết nối cuộc gọi');
        
        // Start call timer
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }

      isJoiningRef.current = false;
    } catch (err) {
      isJoiningRef.current = false;
      console.error('[Agora] Error joining channel:', err);
      const errorMsg = err instanceof Error ? err.message : 'Không thể kết nối cuộc gọi';
      setError(errorMsg);
      setCallStatus('error');
      toast.error(errorMsg);
      throw err;
    }
  }, [initClient, getToken]);

  // Leave channel
  const leaveChannel = useCallback(async () => {
    // Prevent multiple leave calls, but reset joining flag
    if (isLeavingRef.current) {
      console.log('[Agora] Already leaving, skipping...');
      return;
    }
    
    // Set leaving flag and reset joining flag
    isLeavingRef.current = true;
    isJoiningRef.current = false;
    console.log('[Agora] Leaving channel...');
    
    // Stop call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    // Stop and close local tracks
    if (localAudioTrackRef.current) {
      try {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      } catch (e) {
        console.warn('[Agora] Error stopping audio track:', e);
      }
      localAudioTrackRef.current = null;
    }

    if (localVideoTrackRef.current) {
      try {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
      } catch (e) {
        console.warn('[Agora] Error stopping video track:', e);
      }
      localVideoTrackRef.current = null;
    }

    if (screenTrackRef.current) {
      try {
        screenTrackRef.current.stop();
        screenTrackRef.current.close();
      } catch (e) {
        console.warn('[Agora] Error stopping screen track:', e);
      }
      screenTrackRef.current = null;
    }

    // Leave the channel
    if (clientRef.current) {
      try {
        // Remove all listeners first
        clientRef.current.removeAllListeners('user-published');
        clientRef.current.removeAllListeners('user-unpublished');
        clientRef.current.removeAllListeners('user-left');
        
        // Only leave if connected
        const connectionState = clientRef.current.connectionState;
        if (connectionState === 'CONNECTED' || connectionState === 'CONNECTING') {
          await clientRef.current.leave();
          console.log('[Agora] Left channel successfully');
        } else {
          console.log('[Agora] Client not connected, skipping leave');
        }
      } catch (leaveErr) {
        console.warn('[Agora] Error leaving channel:', leaveErr);
      }
    }

    // Reset state
    setRemoteUsers([]);
    setCallStatus('ended');
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setError(null);
    
    // Reset joining flag
    isJoiningRef.current = false;

    onCallEndedRef.current?.();
  }, []);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (localAudioTrackRef.current) {
      const newMuteState = !isMuted;
      await localAudioTrackRef.current.setEnabled(!newMuteState);
      setIsMuted(newMuteState);
      console.log('[Agora] Mute toggled:', newMuteState);
    }
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (localVideoTrackRef.current) {
      const newVideoOffState = !isVideoOff;
      await localVideoTrackRef.current.setEnabled(!newVideoOffState);
      setIsVideoOff(newVideoOffState);
      console.log('[Agora] Video toggled:', newVideoOffState);
    }
  }, [isVideoOff]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenTrackRef.current) {
          await client.unpublish([screenTrackRef.current]);
          screenTrackRef.current.stop();
          screenTrackRef.current.close();
          screenTrackRef.current = null;
        }
        
        // Re-publish camera if available
        if (localVideoTrackRef.current) {
          await client.publish([localVideoTrackRef.current]);
        }
        
        setIsScreenSharing(false);
        console.log('[Agora] Screen sharing stopped');
      } else {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable');
        screenTrackRef.current = screenTrack as ILocalVideoTrack;
        
        // Unpublish camera first
        if (localVideoTrackRef.current) {
          await client.unpublish([localVideoTrackRef.current]);
        }
        
        await client.publish([screenTrackRef.current]);
        
        // Handle screen share stop from browser
        (screenTrackRef.current as any).on?.('track-ended', async () => {
          await toggleScreenShare();
        });
        
        setIsScreenSharing(true);
        console.log('[Agora] Screen sharing started');
      }
    } catch (err) {
      console.error('[Agora] Error toggling screen share:', err);
      setError('Không thể chia sẻ màn hình');
      toast.error('Không thể chia sẻ màn hình');
    }
  }, [isScreenSharing]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (localVideoTrackRef.current) {
      try {
        const devices = await AgoraRTC.getCameras();
        if (devices.length > 1) {
          const currentDeviceId = localVideoTrackRef.current.getTrackLabel();
          const currentIndex = devices.findIndex(d => d.label === currentDeviceId);
          const nextIndex = (currentIndex + 1) % devices.length;
          await localVideoTrackRef.current.setDevice(devices[nextIndex].deviceId);
          console.log('[Agora] Switched to camera:', devices[nextIndex].label);
        } else {
          toast.info('Chỉ có một camera');
        }
      } catch (err) {
        console.error('[Agora] Error switching camera:', err);
        toast.error('Không thể chuyển camera');
      }
    }
  }, []);

  // Play local video
  const playLocalVideo = useCallback((element: HTMLElement | string) => {
    if (isScreenSharing && screenTrackRef.current) {
      screenTrackRef.current.play(element);
    } else if (localVideoTrackRef.current) {
      localVideoTrackRef.current.play(element);
    }
  }, [isScreenSharing]);

  // Play remote video
  const playRemoteVideo = useCallback((user: IAgoraRTCRemoteUser, element: HTMLElement | string) => {
    if (user.videoTrack) {
      user.videoTrack.play(element);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      leaveChannel();
    };
  }, [leaveChannel]);

  return {
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
    localVideoTrack: localVideoTrackRef.current,
    localAudioTrack: localAudioTrackRef.current,
  };
};
