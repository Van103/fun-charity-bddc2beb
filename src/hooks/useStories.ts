import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  text_overlay: string | null;
  text_position: { x: number; y: number; color: string } | null;
  filter: string | null;
  duration: number;
  view_count: number;
  created_at: string;
  expires_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface GroupedStory {
  user_id: string;
  userName: string;
  avatar: string | null;
  stories: Story[];
  hasNew: boolean;
}

export function useStories() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      // First get stories
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;
      if (!storiesData || storiesData.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(storiesData.map(s => s.user_id))];

      // Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      // Group stories by user
      const grouped: Record<string, GroupedStory> = {};
      
      for (const story of storiesData) {
        const profile = profilesMap.get(story.user_id);
        
        if (!grouped[story.user_id]) {
          grouped[story.user_id] = {
            user_id: story.user_id,
            userName: profile?.full_name || "Người dùng",
            avatar: profile?.avatar_url || null,
            stories: [],
            hasNew: true,
          };
        }
        
        grouped[story.user_id].stories.push({
          ...story,
          text_position: story.text_position as Story["text_position"],
          profile: profile ? {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          } : undefined,
        });
      }

      return Object.values(grouped);
    },
    refetchInterval: 30000,
  });
}

export function useLiveStreams() {
  return useQuery({
    queryKey: ["live-streams"],
    queryFn: async () => {
      // Get live streams
      const { data: liveData, error: liveError } = await supabase
        .from("feed_posts")
        .select("id, user_id, title, content, live_viewer_count, created_at")
        .eq("is_live_video", true)
        .eq("is_active", true)
        .order("live_viewer_count", { ascending: false });

      if (liveError) throw liveError;
      if (!liveData || liveData.length === 0) return [];

      // Get profiles for live streamers
      const userIds = [...new Set(liveData.map(s => s.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      return liveData.map(stream => ({
        ...stream,
        profile: profilesMap.get(stream.user_id) || null,
      }));
    },
    refetchInterval: 10000,
  });
}

export function useIncrementStoryView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      // Simple update without RPC
      const { error } = await supabase
        .from("stories")
        .update({ view_count: 1 }) // This will be replaced with actual increment
        .eq("id", storyId);
      if (error) console.error("View increment error:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}
