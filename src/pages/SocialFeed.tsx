import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SwipeIndicator } from "@/components/layout/SwipeIndicator";
import { LeftSidebar } from "@/components/social/LeftSidebar";
import { RightSidebar } from "@/components/social/RightSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGuestMode } from "@/contexts/GuestModeContext";

import { FriendRequestsSection } from "@/components/social/FriendRequestsSection";
import { CreatePostBox } from "@/components/social/CreatePostBox";
import { SocialPostCard } from "@/components/social/SocialPostCard";
import { PostCardSkeletonList, PostCardSkeleton } from "@/components/social/PostCardSkeleton";
import { PullToRefresh } from "@/components/social/PullToRefresh";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { 
  useInfiniteFeedPosts, 
  useIntersectionObserver
} from "@/hooks/useFeedPosts";
import { useQueryClient } from "@tanstack/react-query";
import { useFriendRequestNotifications } from "@/hooks/useFriendNotifications";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  wallet_address: string | null;
}

export default function SocialFeed() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [highlightPostId, setHighlightPostId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { isGuest, isAuthenticated } = useGuestMode();

  // Get scrollToPostId from navigation state
  useEffect(() => {
    const state = location.state as { scrollToPostId?: string } | null;
    if (state?.scrollToPostId) {
      setHighlightPostId(state.scrollToPostId);
      // Clear the state after getting the ID
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  const { 
    posts, 
    isLoading: postsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteFeedPosts({});

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["infinite-feed-posts"] });
  }, [queryClient]);

  // Intersection observer callback for infinite scroll
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const loadMoreRef = useIntersectionObserver(loadMore, {
    rootMargin: "200px",
  });

  // Enable realtime friend notifications
  useFriendRequestNotifications(profile?.user_id || null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Allow guest mode users to view
        if (isGuest) {
          setProfileLoading(false);
          return;
        }
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-14 sm:pt-16 md:pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-secondary" />
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("social.pageTitle")}</title>
        <meta name="description" content={t("social.pageDesc")} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-12 sm:pt-14 md:pt-16 pb-20 md:pb-8">
          <div className="container mx-auto px-0 sm:px-2 md:px-4">
            <div className="flex gap-2 md:gap-4 lg:gap-6">
              {/* Left Sidebar - Hidden on mobile/tablet */}
              <div className="hidden lg:block h-[calc(100vh-5rem)] sticky top-16">
                <LeftSidebar profile={profile} />
              </div>

              {/* Main Feed - full width on mobile, edge-to-edge cards */}
              <div className="flex-1 w-full max-w-2xl mx-auto lg:mx-0">
                <PullToRefresh onRefresh={handleRefresh}>
                  <div className="space-y-2 sm:space-y-4">
                    <CreatePostBox profile={profile} />
                    
                    <FriendRequestsSection />
                    
                    {/* Posts Feed */}
                    <div className="space-y-2 sm:space-y-4">
                      {postsLoading ? (
                        <PostCardSkeletonList count={3} />
                      ) : posts && posts.length > 0 ? (
                        <>
                          {posts.map((post) => (
                            <SocialPostCard 
                              key={post.id} 
                              post={post} 
                              highlightPostId={highlightPostId}
                            />
                          ))}
                          
                          {/* Load More Trigger */}
                          <div ref={loadMoreRef} className="py-4">
                            {isFetchingNextPage && (
                              <PostCardSkeleton />
                            )}
                            {!hasNextPage && posts.length > 0 && (
                              <p className="text-center text-sm text-muted-foreground">
                                {t("social.allViewed")}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="mobile-card p-6 sm:p-12 text-center">
                          <p className="text-muted-foreground text-sm sm:text-base">
                            {t("social.noPosts")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </PullToRefresh>
              </div>

              {/* Right Sidebar - Hidden on mobile/tablet */}
              <div className="hidden xl:block h-[calc(100vh-5rem)] sticky top-16 overflow-y-auto scrollbar-purple pr-1">
                <RightSidebar />
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <MobileBottomNav />
        <SwipeIndicator />
      </div>
    </>
  );
}
