import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVideoAutoplayOptions {
  threshold?: number; // 0.5 = 50% visible
  rootMargin?: string;
}

interface VideoRef {
  id: string;
  element: HTMLVideoElement;
  isVisible: boolean;
  visibilityRatio: number;
}

// Global state to track mute preference and active video
let globalMuted = true;
let globalMuteListeners: Set<(muted: boolean) => void> = new Set();

export const useGlobalMute = () => {
  const [isMuted, setIsMuted] = useState(globalMuted);

  useEffect(() => {
    const listener = (muted: boolean) => setIsMuted(muted);
    globalMuteListeners.add(listener);
    return () => {
      globalMuteListeners.delete(listener);
    };
  }, []);

  const toggleMute = useCallback(() => {
    globalMuted = !globalMuted;
    globalMuteListeners.forEach(listener => listener(globalMuted));
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    globalMuted = muted;
    globalMuteListeners.forEach(listener => listener(muted));
  }, []);

  return { isMuted, toggleMute, setMuted };
};

export const useVideoAutoplay = (options: UseVideoAutoplayOptions = {}) => {
  const { threshold = 0.6, rootMargin = '0px' } = options;
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const videoRefsMap = useRef<Map<string, VideoRef>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Create Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        let maxVisibility = 0;
        let mostVisibleId: string | null = null;

        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-video-id');
          if (!id) return;

          const videoRef = videoRefsMap.current.get(id);
          if (videoRef) {
            videoRef.isVisible = entry.isIntersecting;
            videoRef.visibilityRatio = entry.intersectionRatio;
          }
        });

        // Find the most visible video
        videoRefsMap.current.forEach((ref, id) => {
          if (ref.isVisible && ref.visibilityRatio > maxVisibility) {
            maxVisibility = ref.visibilityRatio;
            mostVisibleId = id;
          }
        });

        // Only update if visibility meets threshold
        if (maxVisibility >= threshold) {
          setActiveVideoId(mostVisibleId);
        } else {
          setActiveVideoId(null);
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
        rootMargin,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  // Register a video element
  const registerVideo = useCallback((id: string, element: HTMLVideoElement) => {
    if (!element || !observerRef.current) return;

    element.setAttribute('data-video-id', id);
    
    videoRefsMap.current.set(id, {
      id,
      element,
      isVisible: false,
      visibilityRatio: 0,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.unobserve(element);
      }
      videoRefsMap.current.delete(id);
    };
  }, []);

  // Unregister a video element
  const unregisterVideo = useCallback((id: string) => {
    const ref = videoRefsMap.current.get(id);
    if (ref && observerRef.current) {
      observerRef.current.unobserve(ref.element);
      videoRefsMap.current.delete(id);
    }
  }, []);

  // Play/Pause videos based on active video
  useEffect(() => {
    videoRefsMap.current.forEach((ref, id) => {
      if (id === activeVideoId) {
        // Play the active video
        ref.element.play().catch(() => {
          // Autoplay failed, likely due to browser policy
          console.log('Autoplay prevented for video:', id);
        });
      } else {
        // Pause all other videos
        ref.element.pause();
      }
    });
  }, [activeVideoId]);

  return {
    activeVideoId,
    registerVideo,
    unregisterVideo,
  };
};

// Hook for individual video cards
export const useVideoInView = (
  videoId: string,
  activeVideoId: string | null,
  onVisibilityChange?: (isActive: boolean) => void
) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isMuted, toggleMute, setMuted } = useGlobalMute();

  const isActive = activeVideoId === videoId;

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (isActive) {
      video.muted = isMuted;
      video.play().catch(() => {
        // Autoplay blocked - keep muted and try again
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      });
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }

    onVisibilityChange?.(isActive);
  }, [isActive, isMuted, onVisibilityChange, setMuted]);

  // Update mute state when global mute changes
  useEffect(() => {
    if (videoRef.current && isActive) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, isActive]);

  const handleToggleMute = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  const handleTogglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  return {
    videoRef,
    isActive,
    isPlaying,
    isMuted,
    toggleMute: handleToggleMute,
    togglePlay: handleTogglePlay,
  };
};
