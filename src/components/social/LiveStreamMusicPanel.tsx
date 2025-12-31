import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sparkles,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MusicTrack {
  id: string;
  name: string;
  category: string;
  emoji: string;
  // In a real app, these would be actual audio URLs
  duration: string;
}

interface SoundEffect {
  id: string;
  name: string;
  emoji: string;
}

const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'chill-1', name: 'Chill Vibes', category: 'Thư giãn', emoji: '🎵', duration: '3:24' },
  { id: 'happy-1', name: 'Happy Day', category: 'Vui vẻ', emoji: '☀️', duration: '2:45' },
  { id: 'energetic-1', name: 'Energy Boost', category: 'Năng động', emoji: '⚡', duration: '3:10' },
  { id: 'romantic-1', name: 'Love Story', category: 'Lãng mạn', emoji: '💕', duration: '4:02' },
  { id: 'gaming-1', name: 'Game Time', category: 'Gaming', emoji: '🎮', duration: '2:58' },
  { id: 'study-1', name: 'Focus Mode', category: 'Tập trung', emoji: '📚', duration: '5:00' },
  { id: 'party-1', name: 'Party Night', category: 'Tiệc tùng', emoji: '🎉', duration: '3:35' },
  { id: 'nature-1', name: 'Nature Sounds', category: 'Thiên nhiên', emoji: '🌿', duration: '4:20' },
];

const SOUND_EFFECTS: SoundEffect[] = [
  { id: 'applause', name: 'Vỗ tay', emoji: '👏' },
  { id: 'cheers', name: 'Hoan hô', emoji: '🎊' },
  { id: 'laugh', name: 'Cười', emoji: '😂' },
  { id: 'wow', name: 'Wow!', emoji: '😮' },
  { id: 'heart', name: 'Yêu thích', emoji: '❤️' },
  { id: 'horn', name: 'Còi', emoji: '📯' },
  { id: 'bell', name: 'Chuông', emoji: '🔔' },
  { id: 'drum', name: 'Trống', emoji: '🥁' },
  { id: 'whistle', name: 'Huýt sáo', emoji: '📣' },
  { id: 'magic', name: 'Phép thuật', emoji: '✨' },
];

interface LiveStreamMusicPanelProps {
  open: boolean;
  onClose: () => void;
}

export function LiveStreamMusicPanel({ open, onClose }: LiveStreamMusicPanelProps) {
  const [activeTab, setActiveTab] = useState<'music' | 'effects'>('music');
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [playingEffects, setPlayingEffects] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Simulate playing a track
  const playTrack = (trackId: string) => {
    if (currentTrack === trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(trackId);
      setIsPlaying(true);
    }
  };

  // Play sound effect
  const playSoundEffect = (effectId: string) => {
    setPlayingEffects(prev => [...prev, effectId]);
    // Simulate effect duration
    setTimeout(() => {
      setPlayingEffects(prev => prev.filter(id => id !== effectId));
    }, 1500);
  };

  const currentTrackInfo = MUSIC_TRACKS.find(t => t.id === currentTrack);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-24 left-4 right-20 bg-black/90 backdrop-blur-md rounded-2xl overflow-hidden z-40"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('music')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'music' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Music className="w-4 h-4" />
                Nhạc nền
              </button>
              <button
                onClick={() => setActiveTab('effects')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'effects' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Hiệu ứng
              </button>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3">
            {activeTab === 'music' && (
              <>
                {/* Current playing */}
                {currentTrack && (
                  <div className="mb-3 p-3 bg-primary/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{currentTrackInfo?.name}</p>
                        <p className="text-white/60 text-xs">{currentTrackInfo?.category}</p>
                      </div>
                      <span className="text-2xl">{currentTrackInfo?.emoji}</span>
                    </div>
                    
                    {/* Volume control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white/70 hover:text-white"
                      >
                        {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={([v]) => {
                          setVolume(v);
                          setIsMuted(false);
                        }}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-white/60 text-xs w-8">{isMuted ? 0 : volume}%</span>
                    </div>
                  </div>
                )}

                {/* Track list */}
                <ScrollArea className="h-40">
                  <div className="space-y-1">
                    {MUSIC_TRACKS.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => playTrack(track.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                          currentTrack === track.id 
                            ? 'bg-primary/30' 
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xl">{track.emoji}</span>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-white text-sm font-medium truncate">{track.name}</p>
                          <p className="text-white/50 text-xs">{track.category} • {track.duration}</p>
                        </div>
                        {currentTrack === track.id && isPlaying && (
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map(i => (
                              <motion.div
                                key={i}
                                className="w-0.5 bg-primary rounded-full"
                                animate={{
                                  height: [8, 16, 8],
                                }}
                                transition={{
                                  duration: 0.5,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}

            {activeTab === 'effects' && (
              <div className="grid grid-cols-5 gap-2">
                {SOUND_EFFECTS.map((effect) => {
                  const isPlaying = playingEffects.includes(effect.id);
                  return (
                    <motion.button
                      key={effect.id}
                      onClick={() => playSoundEffect(effect.id)}
                      whileTap={{ scale: 0.9 }}
                      animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                        isPlaying 
                          ? 'bg-primary/30 ring-2 ring-primary' 
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <span className="text-2xl">{effect.emoji}</span>
                      <span className="text-white/70 text-[10px] truncate w-full text-center">{effect.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
