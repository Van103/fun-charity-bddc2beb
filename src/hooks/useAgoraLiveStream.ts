import { useState, useRef, useCallback, useEffect } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ILocalAudioTrack,
} from 'agora-rtc-sdk-ng';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Set Agora log level
AgoraRTC.setLogLevel(2);

export type LiveStreamStatus = 'idle' | 'connecting' | 'live' | 'watching' | 'ended' | 'error';
export type LiveStreamRole = 'host' | 'audience';

interface UseAgoraLiveStreamProps {
  role: LiveStreamRole;
  onRemoteStreamReceived?: (user: IAgoraRTCRemoteUser) => void;
  onRemoteStreamLeft?: () => void;
}

export const useAgoraLiveStream = (props: UseAgoraLiveStreamProps) => {
  const { role, onRemoteStreamReceived, onRemoteStreamLeft } = props;

  const [status, setStatus] = useState<LiveStreamStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [remoteUser, setRemoteUser] = useState<IAgoraRTCRemoteUser | null>(null);
  const [isSystemAudioEnabled, setIsSystemAudioEnabled] = useState(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const mixedAudioTrackRef = useRef<ILocalAudioTrack | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const systemAudioStreamRef = useRef<MediaStream | null>(null);
  const appIdRef = useRef<string>('');
  const channelNameRef = useRef<string>('');
  const isLeavingRef = useRef(false);
  const isJoiningRef = useRef(false);

  // Callback refs
  const onRemoteStreamReceivedRef = useRef(onRemoteStreamReceived);
  const onRemoteStreamLeftRef = useRef(onRemoteStreamLeft);

  useEffect(() => {
    onRemoteStreamReceivedRef.current = onRemoteStreamReceived;
  }, [onRemoteStreamReceived]);

  useEffect(() => {
    onRemoteStreamLeftRef.current = onRemoteStreamLeft;
  }, [onRemoteStreamLeft]);

  // Initialize Agora client based on role
  const initClient = useCallback(() => {
    if (!clientRef.current) {
      // Use 'live' mode for livestream with 'host' or 'audience' role
      clientRef.current = AgoraRTC.createClient({ 
        mode: 'live', 
        codec: 'vp8' 
      });
      
      console.log('[AgoraLive] Client initialized with role:', role);
      
      clientRef.current.on('connection-state-change', (curState, prevState, reason) => {
        console.log('[AgoraLive] Connection state:', prevState, '->', curState, reason);
        
        if (curState === 'DISCONNECTED' && reason === 'NETWORK_ERROR') {
          setError('Mất kết nối mạng');
          toast.error('Mất kết nối mạng');
        }
      });

      clientRef.current.on('exception', (event) => {
        console.error('[AgoraLive] Exception:', event.code, event.msg);
      });
    }
    return clientRef.current;
  }, [role]);

  // Get token from edge function
  const getToken = useCallback(async (channelName: string) => {
    console.log('[AgoraLive] Fetching token for channel:', channelName);
    
    const { data, error } = await supabase.functions.invoke('agora-token', {
      body: { channelName, uid: 0, role: role === 'host' ? 1 : 2 }
    });

    if (error) {
      console.error('[AgoraLive] Token error:', error);
      throw new Error(`Token error: ${error.message}`);
    }

    if (!data?.token || !data?.appId) {
      throw new Error('Invalid token response');
    }

    console.log('[AgoraLive] Token received');
    appIdRef.current = data.appId;
    return data.token;
  }, [role]);

  // Generate unique channel name
  const generateChannelName = useCallback(() => {
    return `live_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }, []);

  // Capture system audio using getDisplayMedia (desktop only)
  const captureSystemAudio = useCallback(async (): Promise<MediaStreamTrack | null> => {
    try {
      console.log('[AgoraLive] Requesting system audio capture...');
      
      // Request screen share with audio - this captures system audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Required by browser, but we'll stop it immediately
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } as MediaTrackConstraints,
      });

      // Stop video track immediately - we only need audio
      displayStream.getVideoTracks().forEach(track => track.stop());

      const audioTracks = displayStream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.warn('[AgoraLive] No system audio track captured - user may not have selected audio');
        toast.warning('Không capture được âm thanh hệ thống. Hãy chọn "Share audio" khi chia sẻ.');
        return null;
      }

      systemAudioStreamRef.current = displayStream;
      console.log('[AgoraLive] System audio captured successfully');
      return audioTracks[0];
    } catch (err) {
      console.error('[AgoraLive] Failed to capture system audio:', err);
      return null;
    }
  }, []);

  // Mix microphone and system audio using Web Audio API
  const mixAudioSources = useCallback((
    micTrack: MediaStreamTrack,
    systemTrack: MediaStreamTrack,
    micVolume: number = 1.0,
    systemVolume: number = 0.8
  ): MediaStreamTrack => {
    console.log('[AgoraLive] Mixing audio sources...');
    
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    // Create sources from tracks
    const micSource = audioContext.createMediaStreamSource(new MediaStream([micTrack]));
    const systemSource = audioContext.createMediaStreamSource(new MediaStream([systemTrack]));

    // Create gain nodes for volume control
    const micGain = audioContext.createGain();
    const systemGain = audioContext.createGain();
    micGain.gain.value = micVolume;
    systemGain.gain.value = systemVolume;

    // Create destination
    const destination = audioContext.createMediaStreamDestination();

    // Connect: source -> gain -> destination
    micSource.connect(micGain).connect(destination);
    systemSource.connect(systemGain).connect(destination);

    console.log('[AgoraLive] Audio sources mixed successfully');
    return destination.stream.getAudioTracks()[0];
  }, []);

  // Start broadcast (for host)
  const startBroadcast = useCallback(async (channelName?: string, enableSystemAudio?: boolean) => {
    if (role !== 'host') {
      console.error('[AgoraLive] Only host can start broadcast');
      return null;
    }

    if (isJoiningRef.current) {
      console.log('[AgoraLive] Already joining...');
      return null;
    }

    isLeavingRef.current = false;
    isJoiningRef.current = true;

    try {
      setStatus('connecting');
      setError(null);

      const client = initClient();
      const channel = channelName || generateChannelName();
      channelNameRef.current = channel;

      // Set client role to host
      await client.setClientRole('host');

      const token = await getToken(channel);

      // Set up listeners
      client.removeAllListeners('user-published');
      client.removeAllListeners('user-left');
      client.removeAllListeners('user-joined');

      // Track viewers
      client.on('user-joined', (user) => {
        console.log('[AgoraLive] Viewer joined:', user.uid);
        setViewerCount(prev => prev + 1);
      });

      client.on('user-left', (user) => {
        console.log('[AgoraLive] Viewer left:', user.uid);
        setViewerCount(prev => Math.max(0, prev - 1));
      });

      // Join channel
      await client.join(appIdRef.current, channel, token, null);
      console.log('[AgoraLive] Host joined channel:', channel);

      if (isLeavingRef.current) {
        await client.leave();
        return null;
      }

      // Create and publish tracks
      try {
        console.log('[AgoraLive] Creating media tracks...');
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          { encoderConfig: 'music_standard' },
          { encoderConfig: '720p_2' }
        );
        
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;

        let audioTrackToPublish: IMicrophoneAudioTrack | ILocalAudioTrack = audioTrack;

        // If system audio is enabled, capture and mix it
        if (enableSystemAudio) {
          const systemAudioTrack = await captureSystemAudio();
          
          if (systemAudioTrack) {
            // Get the raw mic track from Agora track
            const micMediaTrack = audioTrack.getMediaStreamTrack();
            
            // Mix mic + system audio
            const mixedTrack = mixAudioSources(micMediaTrack, systemAudioTrack);
            
            // Create custom Agora track from mixed audio
            const customAudioTrack = AgoraRTC.createCustomAudioTrack({
              mediaStreamTrack: mixedTrack,
            });
            
            mixedAudioTrackRef.current = customAudioTrack;
            audioTrackToPublish = customAudioTrack;
            setIsSystemAudioEnabled(true);
            console.log('[AgoraLive] Using mixed audio track (mic + system)');
          } else {
            console.log('[AgoraLive] System audio not available, using mic only');
          }
        }

        if (!isLeavingRef.current) {
          await client.publish([audioTrackToPublish, videoTrack]);
          console.log('[AgoraLive] Published tracks');
        }
      } catch (mediaError) {
        console.error('[AgoraLive] Media error:', mediaError);
        toast.error('Không thể truy cập camera/micro');
        throw mediaError;
      }

      setStatus('live');
      isJoiningRef.current = false;
      
      return channel;
    } catch (err) {
      isJoiningRef.current = false;
      console.error('[AgoraLive] Error starting broadcast:', err);
      setError(err instanceof Error ? err.message : 'Lỗi kết nối');
      setStatus('error');
      throw err;
    }
  }, [role, initClient, getToken, generateChannelName, captureSystemAudio, mixAudioSources]);

  // Join as audience (for viewers)
  const joinAsAudience = useCallback(async (channelName: string) => {
    if (role !== 'audience') {
      console.error('[AgoraLive] Only audience can join');
      return;
    }

    if (isJoiningRef.current || !channelName) {
      return;
    }

    isLeavingRef.current = false;
    isJoiningRef.current = true;

    try {
      setStatus('connecting');
      setError(null);

      const client = initClient();
      channelNameRef.current = channelName;

      // Set client role to audience
      await client.setClientRole('audience');

      const token = await getToken(channelName);

      // Set up listeners
      client.removeAllListeners('user-published');
      client.removeAllListeners('user-unpublished');
      client.removeAllListeners('user-left');

      client.on('user-published', async (user, mediaType) => {
        if (isLeavingRef.current) return;
        
        console.log('[AgoraLive] Host published:', user.uid, mediaType);
        
        try {
          await client.subscribe(user, mediaType);
          console.log('[AgoraLive] Subscribed to:', mediaType);
          
          if (mediaType === 'audio') {
            user.audioTrack?.play();
            console.log('[AgoraLive] Playing audio');
          }
          
          if (mediaType === 'video') {
            setRemoteUser(user);
            onRemoteStreamReceivedRef.current?.(user);
          }
        } catch (subError) {
          console.error('[AgoraLive] Subscribe error:', subError);
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        console.log('[AgoraLive] Host unpublished:', mediaType);
        if (mediaType === 'video') {
          setRemoteUser(null);
        }
      });

      client.on('user-left', (user) => {
        console.log('[AgoraLive] Host left');
        setRemoteUser(null);
        onRemoteStreamLeftRef.current?.();
        setStatus('ended');
        toast.info('Livestream đã kết thúc');
      });

      // Join channel
      await client.join(appIdRef.current, channelName, token, null);
      console.log('[AgoraLive] Audience joined channel:', channelName);

      setStatus('watching');
      isJoiningRef.current = false;
    } catch (err) {
      isJoiningRef.current = false;
      console.error('[AgoraLive] Error joining as audience:', err);
      setError(err instanceof Error ? err.message : 'Lỗi kết nối');
      setStatus('error');
    }
  }, [role, initClient, getToken]);

  // Leave channel
  const leave = useCallback(async () => {
    if (isLeavingRef.current) return;
    
    isLeavingRef.current = true;
    isJoiningRef.current = false;
    console.log('[AgoraLive] Leaving channel...');

    // Stop local tracks
    if (localAudioTrackRef.current) {
      try {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      } catch (e) {}
      localAudioTrackRef.current = null;
    }

    if (localVideoTrackRef.current) {
      try {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
      } catch (e) {}
      localVideoTrackRef.current = null;
    }

    // Stop mixed audio track
    if (mixedAudioTrackRef.current) {
      try {
        mixedAudioTrackRef.current.stop();
        mixedAudioTrackRef.current.close();
      } catch (e) {}
      mixedAudioTrackRef.current = null;
    }

    // Stop system audio stream
    if (systemAudioStreamRef.current) {
      try {
        systemAudioStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      systemAudioStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    // Leave channel
    if (clientRef.current) {
      try {
        clientRef.current.removeAllListeners();
        const state = clientRef.current.connectionState;
        if (state === 'CONNECTED' || state === 'CONNECTING') {
          await clientRef.current.leave();
        }
      } catch (e) {
        console.warn('[AgoraLive] Leave error:', e);
      }
    }

    // Reset state
    setRemoteUser(null);
    setStatus('ended');
    setViewerCount(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsSystemAudioEnabled(false);
    channelNameRef.current = '';
  }, []);

  // Toggle mute (host only)
  const toggleMute = useCallback(async () => {
    if (localAudioTrackRef.current) {
      const newState = !isMuted;
      await localAudioTrackRef.current.setEnabled(!newState);
      setIsMuted(newState);
    }
  }, [isMuted]);

  // Toggle video (host only)
  const toggleVideo = useCallback(async () => {
    if (localVideoTrackRef.current) {
      const newState = !isVideoOff;
      await localVideoTrackRef.current.setEnabled(!newState);
      setIsVideoOff(newState);
    }
  }, [isVideoOff]);

  // Play local video (host)
  const playLocalVideo = useCallback((element: HTMLElement | string) => {
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.play(element);
    }
  }, []);

  // Play remote video (audience)
  const playRemoteVideo = useCallback((element: HTMLElement | string) => {
    if (remoteUser?.videoTrack) {
      remoteUser.videoTrack.play(element);
    }
  }, [remoteUser]);

  // Get current channel name
  const getChannelName = useCallback(() => {
    return channelNameRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leave();
    };
  }, [leave]);

  return {
    status,
    isMuted,
    isVideoOff,
    isSystemAudioEnabled,
    viewerCount,
    error,
    remoteUser,
    startBroadcast,
    joinAsAudience,
    leave,
    toggleMute,
    toggleVideo,
    playLocalVideo,
    playRemoteVideo,
    getChannelName,
    localVideoTrack: localVideoTrackRef.current,
    localAudioTrack: localAudioTrackRef.current,
  };
};
