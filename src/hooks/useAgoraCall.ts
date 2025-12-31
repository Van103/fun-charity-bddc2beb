import { useState, useRef, useCallback, useEffect } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  ILocalVideoTrack,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { supabase } from '@/integrations/supabase/client';

// Set Agora log level to reduce console noise
AgoraRTC.setLogLevel(3); // 0: DEBUG, 1: INFO, 2: WARNING, 3: ERROR, 4: NONE

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

  // Initialize Agora client
  const initClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      console.log('Agora client initialized');
    }
    return clientRef.current;
  }, []);

  // Get token from edge function
  const getToken = useCallback(async (channelName: string, uid: number) => {
    console.log('Fetching Agora token for channel:', channelName);
    
    const { data, error } = await supabase.functions.invoke('agora-token', {
      body: { channelName, uid, role: 1 }
    });

    if (error) {
      console.error('Error fetching token:', error);
      throw new Error('Failed to get Agora token');
    }

    console.log('Token received successfully');
    appIdRef.current = data.appId;
    return data.token;
  }, []);

  // Join channel
  const joinChannel = useCallback(async (
    channelName: string,
    uid: number,
    isVideoCall: boolean
  ) => {
    try {
      setCallStatus('connecting');
      setError(null);

      const client = initClient();
      const token = await getToken(channelName, uid);

      // Set up event listeners
      client.on('user-published', async (user, mediaType) => {
        console.log('Remote user published:', user.uid, mediaType);
        await client.subscribe(user, mediaType);
        
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
        
        onRemoteUserJoined?.(user);
      });

      client.on('user-unpublished', (user, mediaType) => {
        console.log('Remote user unpublished:', user.uid, mediaType);
        if (mediaType === 'video') {
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        }
      });

      client.on('user-left', (user) => {
        console.log('Remote user left:', user.uid);
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        onRemoteUserLeft?.(user);
      });

      // Join the channel
      await client.join(appIdRef.current, channelName, token, uid);
      console.log('Joined channel:', channelName);

      // Create and publish local tracks
      if (isVideoCall) {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;
        await client.publish([audioTrack, videoTrack]);
        console.log('Published audio and video tracks');
      } else {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrackRef.current = audioTrack;
        await client.publish([audioTrack]);
        console.log('Published audio track');
      }

      setCallStatus('active');
      
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error joining channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to join call');
      setCallStatus('error');
      throw err;
    }
  }, [initClient, getToken, onRemoteUserJoined, onRemoteUserLeft]);

  // Leave channel
  const leaveChannel = useCallback(async () => {
    console.log('Leaving channel...');
    
    // Stop call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    // Stop and close local tracks
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }

    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current.close();
      localVideoTrackRef.current = null;
    }

    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current.close();
      screenTrackRef.current = null;
    }

    // Leave the channel
    if (clientRef.current) {
      await clientRef.current.leave();
      console.log('Left channel');
    }

    // Reset state
    setRemoteUsers([]);
    setCallStatus('ended');
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);

    onCallEnded?.();
  }, [onCallEnded]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (localAudioTrackRef.current) {
      const newMuteState = !isMuted;
      await localAudioTrackRef.current.setEnabled(!newMuteState);
      setIsMuted(newMuteState);
      console.log('Mute toggled:', newMuteState);
    }
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (localVideoTrackRef.current) {
      const newVideoOffState = !isVideoOff;
      await localVideoTrackRef.current.setEnabled(!newVideoOffState);
      setIsVideoOff(newVideoOffState);
      console.log('Video toggled:', newVideoOffState);
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
        console.log('Screen sharing stopped');
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
        console.log('Screen sharing started');
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
      setError('Failed to toggle screen share');
    }
  }, [isScreenSharing]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (localVideoTrackRef.current) {
      const devices = await AgoraRTC.getCameras();
      if (devices.length > 1) {
        const currentDeviceId = localVideoTrackRef.current.getTrackLabel();
        const currentIndex = devices.findIndex(d => d.label === currentDeviceId);
        const nextIndex = (currentIndex + 1) % devices.length;
        await localVideoTrackRef.current.setDevice(devices[nextIndex].deviceId);
        console.log('Switched to camera:', devices[nextIndex].label);
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
