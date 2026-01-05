import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useCallback, useRef } from "react";

export type FeedPostType = "need" | "supply" | "update" | "story";
export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export interface FeedPost {
  id: string;
  user_id: string;
  campaign_id: string | null;
  post_type: FeedPostType;
  title: string | null;
  content: string | null;
  media_urls: string[];
  location: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  urgency: UrgencyLevel;
  target_amount: number;
  fulfilled_amount: number;
  beneficiaries_count: number;
  estimated_delivery: string | null;
  required_skills: string[] | null;
  offered_skills: string[] | null;
  is_active: boolean;
  is_matched: boolean;
  matched_with_id: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    reputation_score: number | null;
    is_verified: boolean | null;
  };
  campaigns?: {
    title: string;
    cover_image_url: string | null;
  };
  reactions_count?: number;
  comments_count?: number;
  user_reaction?: string | null;
}

export interface CreateFeedPostInput {
  post_type: FeedPostType;
  title?: string;
  content?: string | null;
  media_urls?: string[];
  location?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  urgency?: UrgencyLevel;
  target_amount?: number;
  beneficiaries_count?: number;
  estimated_delivery?: string;
  required_skills?: string[];
  offered_skills?: string[];
  campaign_id?: string;
  expires_at?: string;
  shared_post_id?: string;
  is_live_video?: boolean;
  live_viewer_count?: number;
}

export interface FeedFilters {
  postType?: FeedPostType;
  category?: string;
  location?: string;
  search?: string;
}

const PAGE_SIZE = 10;

// Helper function to fetch posts with profiles
async function fetchPostsWithData(posts: any[]): Promise<FeedPost[]> {
  const postsWithData = await Promise.all(
    posts.map(async (post) => {
      const [profileResult, reactionsResult, commentsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, avatar_url, reputation_score, is_verified")
          .eq("user_id", post.user_id)
          .maybeSingle(),
        supabase
          .from("feed_reactions")
          .select("id", { count: "exact" })
          .eq("feed_post_id", post.id),
        supabase
          .from("feed_comments")
          .select("id", { count: "exact" })
          .eq("feed_post_id", post.id),
      ]);

      return {
        ...post,
        media_urls: (post.media_urls as string[]) || [],
        profiles: profileResult.data || undefined,
        reactions_count: reactionsResult.count || 0,
        comments_count: commentsResult.count || 0,
      } as FeedPost;
    })
  );

  return postsWithData;
}

// Infinite scroll hook
export function useInfiniteFeedPosts(filters?: FeedFilters) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["feed-posts-infinite", filters],
    queryFn: async ({ pageParam = 0 }) => {
      let baseQuery = supabase
        .from("feed_posts")
        .select("*")
        .eq("is_active", true)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (filters?.postType) {
        baseQuery = baseQuery.eq("post_type", filters.postType);
      }
      
      if (filters?.category) {
        baseQuery = baseQuery.eq("category", filters.category as any);
      }
      
      if (filters?.location) {
        baseQuery = baseQuery.ilike("location", `%${filters.location}%`);
      }
      
      if (filters?.search) {
        baseQuery = baseQuery.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await baseQuery;

      if (error) throw error;
      
      const postsWithData = await fetchPostsWithData(data || []);

      return {
        posts: postsWithData,
        nextPage: data && data.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("feed-posts-infinite-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feed_posts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["feed-posts-infinite"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const allPosts = query.data?.pages.flatMap((page) => page.posts) || [];

  return {
    ...query,
    posts: allPosts,
  };
}

// Intersection Observer hook for infinite scroll
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [callback, options]);

  return targetRef;
}

// Original hook for backward compatibility
export function useFeedPosts(filters?: FeedFilters) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["feed-posts", filters],
    queryFn: async () => {
      let baseQuery = supabase
        .from("feed_posts")
        .select("*")
        .eq("is_active", true)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(50);

      if (filters?.postType) {
        baseQuery = baseQuery.eq("post_type", filters.postType);
      }
      
      if (filters?.category) {
        baseQuery = baseQuery.eq("category", filters.category as any);
      }
      
      if (filters?.location) {
        baseQuery = baseQuery.ilike("location", `%${filters.location}%`);
      }
      
      if (filters?.search) {
        baseQuery = baseQuery.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await baseQuery;

      if (error) throw error;
      
      return await fetchPostsWithData(data || []);
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("feed-posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feed_posts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

// Cute success messages - FUN Charity Hub style
const SUCCESS_MESSAGES = [
  { title: "Yayyy! 💖✨", description: "Bài của bạn siêu ấm áp và tràn đầy yêu thương luôn á!" },
  { title: "Ôi dễ thương quá trời! 🌟", description: "Cộng đồng FUN Charity đang chờ bài này lắm nè!" },
  { title: "Hoàn hảo luôn! 😍", description: "Cha vũ trụ cũng mỉm cười với bài đăng này rồi á! Đăng thôi!" },
  { title: "Bài xinh xắn lung linh! 🥰", description: "Cảm ơn bạn đã lan tỏa năng lượng tốt đẹp nhé!" },
  { title: "Tuyệt vời lắm nha! 💕", description: "Năng lượng yêu thương đang lan tỏa khắp cộng đồng rồi!" },
  { title: "Chuẩn luôn bạn ơi! 🌈", description: "Bài viết đẹp lắm, gia đình FUN Charity cảm ơn bạn nha!" },
];

// Soft warning messages - still warm and loving
const SOFT_WARNING_MESSAGES = [
  { title: "Ủa khoan khoan bé ơi 🥺", description: "Có vài từ hơi mạnh mẽ quá, mình chỉnh nhẹ cho dịu dàng hơn nhé? Cộng đồng mình thích năng lượng tích cực lắm á 💕" },
  { title: "Bài hay lắm mà... 🌈", description: "Có chút xíu không hợp với vibe yêu thương của FUN Charity nè! Bạn sửa tí xíu thôi là đăng liền á!" },
  { title: "Chúng mình muốn giữ không gian thật sạch đẹp 🥰", description: "Bạn chỉnh lại chút cho dễ thương hơn được không?" },
  { title: "Ôi có chút năng lượng chưa tích cực lắm á 🙏", description: "Mình cùng chỉnh để lan tỏa yêu thương nhiều hơn nhé!" },
];

// Hard rejection messages - still gentle, no judgment
const HARD_REJECTION_MESSAGES = [
  { title: "Bài này chưa phù hợp lắm nè 💔", description: "Gia đình lớn FUN Charity mình thích năng lượng tích cực hơn! Bạn thử viết lại nhé, tụi mình luôn chờ bạn á!" },
  { title: "Chúng mình muốn mọi người đều vui vẻ ở đây 🫶", description: "Nội dung này chưa ổn lắm, bạn chỉnh lại nha!" },
  { title: "Hmm... mình cần điều chỉnh chút nha 💕", description: "Để không gian này luôn ấm áp, bạn thử viết theo cách khác nhé!" },
];

// Helper to get random message
const getRandomMessage = (messages: typeof SUCCESS_MESSAGES) => {
  return messages[Math.floor(Math.random() * messages.length)];
};

export function useCreateFeedPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateFeedPostInput) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("No session");

      // Check content with AI moderation before saving
      const contentToCheck = {
        text: [input.title, input.content].filter(Boolean).join(" "),
        imageUrls: input.media_urls || [],
        userId: userData.user.id,
      };

      console.log("🔍 Starting AI moderation check:", contentToCheck);

      // Determine moderation status based on AI result
      let moderationStatus = "approved"; // Default to approved, only change if AI says otherwise
      
      // Only check if there's content
      if (contentToCheck.text || contentToCheck.imageUrls.length > 0) {
        try {
          console.log("📡 Calling moderation API...");
          const moderationResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/content-moderation`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionData.session.access_token}`,
              },
              body: JSON.stringify(contentToCheck),
            }
          );

          console.log("📬 Moderation response status:", moderationResponse.status);

          if (moderationResponse.ok) {
            const moderationResult = await moderationResponse.json();
            console.log("📋 Moderation result:", JSON.stringify(moderationResult, null, 2));
            
            // Handle different moderation decisions
            if (moderationResult.decision === "HARD_VIOLATION") {
              console.log("🚫 HARD_VIOLATION detected - blocking post");
              // Delete uploaded media for hard violations
              if (input.media_urls && input.media_urls.length > 0) {
                const filePaths = input.media_urls
                  .map(url => {
                    const match = url.match(/post-images\/(.+)$/);
                    return match ? match[1] : null;
                  })
                  .filter(Boolean) as string[];
                
                if (filePaths.length > 0) {
                  await supabase.storage.from("post-images").remove(filePaths);
                }
              }
              
              const msg = getRandomMessage(HARD_REJECTION_MESSAGES);
              throw new Error(`HARD_VIOLATION::${msg.title}::${msg.description}`);
            }
            
            if (moderationResult.decision === "SOFT_VIOLATION") {
              console.log("⚠️ SOFT_VIOLATION detected - asking user to revise");
              // Delete uploaded media for soft violations too
              if (input.media_urls && input.media_urls.length > 0) {
                const filePaths = input.media_urls
                  .map(url => {
                    const match = url.match(/post-images\/(.+)$/);
                    return match ? match[1] : null;
                  })
                  .filter(Boolean) as string[];
                
                if (filePaths.length > 0) {
                  await supabase.storage.from("post-images").remove(filePaths);
                }
              }
              
              const msg = getRandomMessage(SOFT_WARNING_MESSAGES);
              throw new Error(`SOFT_VIOLATION::${msg.title}::${msg.description}`);
            }
            
            // SAFE content - keep as approved (already set as default)
            if (moderationResult.decision === "SAFE") {
              console.log("✅ Content is SAFE - auto-approving");
              moderationStatus = "approved";
            }
          } else {
            console.error("❌ Moderation API error:", moderationResponse.status, await moderationResponse.text());
            // Keep as approved if moderation fails - don't block users
          }
        } catch (moderationError) {
          // If it's our custom error (violations), rethrow it
          if (moderationError instanceof Error && 
              (moderationError.message.includes("HARD_VIOLATION") || moderationError.message.includes("SOFT_VIOLATION"))) {
            throw moderationError;
          }
          // Otherwise log and continue with auto-approve
          console.error("⚠️ Moderation check failed, auto-approving:", moderationError);
        }
      } else {
        console.log("📝 No content to check - auto-approving");
      }

      console.log("📊 Final moderation status:", moderationStatus);

      const insertData: Record<string, any> = {
        user_id: userData.user.id,
        post_type: input.post_type,
        title: input.title || null,
        content: input.content || null,
        media_urls: input.media_urls || [],
        location: input.location || null,
        region: input.region || null,
        category: input.category as any || null,
        urgency: input.urgency || "medium",
        target_amount: input.target_amount || 0,
        beneficiaries_count: input.beneficiaries_count || 0,
        campaign_id: input.campaign_id || null,
        moderation_status: moderationStatus, // Auto-set based on AI decision
      };

      // Add shared_post_id if provided
      if (input.shared_post_id) {
        insertData.shared_post_id = input.shared_post_id;
      }

      // Add live video fields if provided
      if (input.is_live_video) {
        insertData.is_live_video = input.is_live_video;
        insertData.live_viewer_count = input.live_viewer_count || 0;
      }

      const { data, error } = await supabase
        .from("feed_posts")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts-infinite"] });
      const msg = getRandomMessage(SUCCESS_MESSAGES);
      toast({
        title: msg.title,
        description: msg.description,
      });
    },
    onError: (error) => {
      const errorMsg = error.message;
      
      // Parse our custom error format: TYPE::TITLE::DESCRIPTION
      if (errorMsg.includes("HARD_VIOLATION::") || errorMsg.includes("SOFT_VIOLATION::")) {
        const parts = errorMsg.split("::");
        toast({
          title: parts[1] || "Ôi... 💔",
          description: parts[2] || "Nội dung chưa phù hợp lắm nha!",
          variant: errorMsg.includes("HARD") ? "destructive" : "default",
        });
      } else {
        // Generic error
        toast({
          title: "Có lỗi xảy ra rồi 😢",
          description: "Bạn thử lại nhé, tụi mình luôn ở đây!",
          variant: "destructive",
        });
      }
    },
  });
}

export function useFeedReaction(postId: string) {
  const queryClient = useQueryClient();

  const addReaction = useMutation({
    mutationFn: async (reactionType: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Remove existing reaction first
      await supabase
        .from("feed_reactions")
        .delete()
        .eq("feed_post_id", postId)
        .eq("user_id", user.user.id);

      // Add new reaction
      const { error } = await supabase
        .from("feed_reactions")
        .insert({
          feed_post_id: postId,
          user_id: user.user.id,
          reaction_type: reactionType,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
  });

  const removeReaction = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("feed_reactions")
        .delete()
        .eq("feed_post_id", postId)
        .eq("user_id", user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
  });

  return { addReaction, removeReaction };
}

export function useFeedMatches(needPostId?: string) {
  return useQuery({
    queryKey: ["feed-matches", needPostId],
    queryFn: async () => {
      if (!needPostId) return [];

      // Get user session token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/matching-engine`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: "find_matches",
            need_post_id: needPostId,
            limit: 5,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to find matches");
      }

      const data = await response.json();
      return data.matches || [];
    },
    enabled: !!needPostId,
  });
}
