import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, UserPlus, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MutualFriend {
  user_id: string;
  avatar_url?: string;
  full_name?: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  userName: string;
  avatar?: string;
  mutualFriends: number;
  mutualFriendsList: MutualFriend[];
  verified?: boolean;
}

interface UserSuggestion {
  userId: string;
  userName: string;
  avatar?: string;
  mutualFriends: number;
  mutualFriendsList: MutualFriend[];
  verified?: boolean;
}

// Helper to get cover image style
const getCoverStyle = (index: number) => {
  const gradients = [
    "bg-gradient-to-br from-purple-500/40 to-pink-500/40",
    "bg-gradient-to-br from-blue-500/40 to-purple-500/40",
    "bg-gradient-to-br from-amber-500/40 to-orange-500/40",
    "bg-gradient-to-br from-emerald-500/40 to-teal-500/40",
  ];
  return gradients[index % gradients.length];
};

export function FriendRequestsSection() {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUserId(user.id);

      // Fetch pending friend requests where current user is the receiver (friend_id)
      const { data: requests } = await supabase
        .from("friendships")
        .select("id, user_id")
        .eq("friend_id", user.id)
        .eq("status", "pending");

      if (requests && requests.length > 0) {
        // Get sender profiles
        const senderIds = requests.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, is_verified")
          .in("user_id", senderIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        // Batch fetch mutual friends data for all senders at once
        const mutualDataMap = await getBatchMutualFriendsData(user.id, senderIds);

        const requestsWithMutual = requests.map((req) => {
          const mutualData = mutualDataMap.get(req.user_id) || { count: 0, friends: [] };
          const profile = profileMap.get(req.user_id);
          return {
            id: req.id,
            senderId: req.user_id,
            userName: profile?.full_name || "Người dùng",
            avatar: profile?.avatar_url || undefined,
            mutualFriends: mutualData.count,
            mutualFriendsList: mutualData.friends,
            verified: profile?.is_verified || false,
          };
        });

        setFriendRequests(requestsWithMutual);
      }

      // Fetch suggestions - users who are not friends and haven't sent/received requests
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, is_verified")
        .neq("user_id", user.id)
        .limit(20);

      if (allProfiles && allProfiles.length > 0) {
        // Get existing friendships
        const { data: existingFriendships } = await supabase
          .from("friendships")
          .select("user_id, friend_id")
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

        const connectedUserIds = new Set<string>();
        existingFriendships?.forEach(f => {
          connectedUserIds.add(f.user_id);
          connectedUserIds.add(f.friend_id);
        });

        // Filter out already connected users
        const nonConnectedProfiles = allProfiles.filter(
          p => !connectedUserIds.has(p.user_id)
        );

        // Batch fetch mutual friends data for all suggestions at once
        const suggestionUserIds = nonConnectedProfiles.slice(0, 8).map(p => p.user_id);
        const mutualDataMap = await getBatchMutualFriendsData(user.id, suggestionUserIds);

        const suggestionsWithMutual = nonConnectedProfiles.slice(0, 8).map((profile) => {
          const mutualData = mutualDataMap.get(profile.user_id) || { count: 0, friends: [] };
          return {
            userId: profile.user_id,
            userName: profile.full_name || "Người dùng",
            avatar: profile.avatar_url || undefined,
            mutualFriends: mutualData.count,
            mutualFriendsList: mutualData.friends,
            verified: profile.is_verified || false,
          };
        });

        setSuggestions(suggestionsWithMutual);
      }
    } catch (error) {
      console.error("Error fetching friend data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Batch fetch mutual friends for multiple target users at once
  const getBatchMutualFriendsData = async (
    currentUserId: string, 
    targetUserIds: string[]
  ): Promise<Map<string, { count: number; friends: MutualFriend[] }>> => {
    const result = new Map<string, { count: number; friends: MutualFriend[] }>();
    
    if (targetUserIds.length === 0) return result;
    
    try {
      // Single query: Get ALL friendships for current user
      const { data: currentUserFriendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .eq("status", "accepted")
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

      const currentUserFriendIds = new Set<string>();
      currentUserFriendships?.forEach(f => {
        if (f.user_id === currentUserId) currentUserFriendIds.add(f.friend_id);
        else currentUserFriendIds.add(f.user_id);
      });

      // Single query: Get ALL friendships for target users
      const orConditions = targetUserIds.map(id => `user_id.eq.${id},friend_id.eq.${id}`).join(",");
      const { data: targetFriendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .eq("status", "accepted")
        .or(orConditions);

      // Build a map of each target user's friends
      const targetUserFriendsMap = new Map<string, Set<string>>();
      targetUserIds.forEach(id => targetUserFriendsMap.set(id, new Set()));
      
      targetFriendships?.forEach(f => {
        targetUserIds.forEach(targetId => {
          if (f.user_id === targetId) {
            targetUserFriendsMap.get(targetId)?.add(f.friend_id);
          } else if (f.friend_id === targetId) {
            targetUserFriendsMap.get(targetId)?.add(f.user_id);
          }
        });
      });

      // Find mutual friends for each target
      const allMutualFriendIds = new Set<string>();
      const mutualFriendsPerTarget = new Map<string, string[]>();
      
      targetUserIds.forEach(targetId => {
        const targetFriends = targetUserFriendsMap.get(targetId) || new Set();
        const mutualIds: string[] = [];
        targetFriends.forEach(friendId => {
          if (currentUserFriendIds.has(friendId)) {
            mutualIds.push(friendId);
            allMutualFriendIds.add(friendId);
          }
        });
        mutualFriendsPerTarget.set(targetId, mutualIds);
      });

      // Single query: Fetch profiles for ALL mutual friends
      let profilesMap = new Map<string, MutualFriend>();
      if (allMutualFriendIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, avatar_url, full_name")
          .in("user_id", Array.from(allMutualFriendIds));
        
        profiles?.forEach(p => {
          profilesMap.set(p.user_id, {
            user_id: p.user_id,
            avatar_url: p.avatar_url || undefined,
            full_name: p.full_name || undefined,
          });
        });
      }

      // Build final result
      targetUserIds.forEach(targetId => {
        const mutualIds = mutualFriendsPerTarget.get(targetId) || [];
        const friends = mutualIds
          .slice(0, 3)
          .map(id => profilesMap.get(id))
          .filter((f): f is MutualFriend => f !== undefined);
        
        result.set(targetId, { count: mutualIds.length, friends });
      });

      return result;
    } catch (error) {
      console.error("Error fetching batch mutual friends:", error);
      targetUserIds.forEach(id => result.set(id, { count: 0, friends: [] }));
      return result;
    }
  };

  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (error) throw error;

      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success("Đã chấp nhận lời mời kết bạn!");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success("Đã xóa lời mời kết bạn");
    } catch (error) {
      console.error("Error declining friend request:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleAddFriend = async (targetUserId: string) => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để kết bạn");
      return;
    }

    setProcessingIds(prev => new Set(prev).add(targetUserId));
    try {
      const { error } = await supabase
        .from("friendships")
        .insert({
          user_id: currentUserId,
          friend_id: targetUserId,
          status: "pending"
        });

      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.userId !== targetUserId));
      toast.success("Đã gửi lời mời kết bạn!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }
  };

  const handleRemoveSuggestion = (userId: string) => {
    setSuggestions(prev => prev.filter(s => s.userId !== userId));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  // Don't show section if no data
  if (friendRequests.length === 0 && suggestions.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
    <div className="space-y-6">
      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Lời mời kết bạn</h3>
            <button className="text-muted-foreground hover:text-foreground">
              •••
            </button>
          </div>

          <div className="relative">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {friendRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="shrink-0 w-36 rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm"
                >
                  {/* Large photo area */}
                  <div className="relative h-36 overflow-hidden">
                    {request.avatar ? (
                      <img 
                        src={request.avatar} 
                        alt={request.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${getCoverStyle(index)} flex items-center justify-center`}>
                        <span className="text-4xl font-bold text-white/80">
                          {request.userName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 flex flex-col">
                    <Link to={`/user/${request.senderId}`} className="flex items-center gap-1 mb-1 hover:underline">
                      <span className="font-semibold text-sm truncate text-foreground">
                        {request.userName}
                      </span>
                      {request.verified && <span className="text-primary text-sm">💜</span>}
                    </Link>
                    {request.mutualFriends > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex -space-x-1">
                          {request.mutualFriendsList.slice(0, 3).map((friend) => (
                            <Tooltip key={friend.user_id}>
                              <TooltipTrigger asChild>
                                <Avatar className="w-4 h-4 border border-background cursor-pointer hover:z-10 hover:scale-110 transition-transform">
                                  <AvatarImage src={friend.avatar_url} alt={friend.full_name || ""} />
                                  <AvatarFallback className="text-[6px] bg-primary/20">
                                    {friend.full_name?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="bg-primary text-secondary font-medium text-xs px-2 py-1"
                              >
                                {friend.full_name || "Người dùng"}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {request.mutualFriends} bạn chung
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        className="w-full h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                        onClick={() => handleAcceptRequest(request.id, request.senderId)}
                        disabled={processingIds.has(request.id)}
                      >
                        {processingIds.has(request.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Xác nhận"
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full h-8 text-xs rounded-lg"
                        onClick={() => handleDeclineRequest(request.id)}
                        disabled={processingIds.has(request.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Navigation arrow */}
              <button className="shrink-0 w-8 h-8 self-center rounded-full bg-white shadow-md border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
          
          <Link to="/friends" className="text-sm text-primary hover:underline mt-3 mx-auto block text-center font-medium">
            Xem tất cả
          </Link>
        </div>
      )}

      {/* People You May Know */}
      {suggestions.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Những người bạn có thể biết</h3>
            <button className="text-muted-foreground hover:text-foreground">
              •••
            </button>
          </div>

          <div className="relative">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="shrink-0 w-36 rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm relative"
                >
                  {/* Remove button */}
                  <button 
                    className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
                    onClick={() => handleRemoveSuggestion(suggestion.userId)}
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                  
                  {/* Large photo area */}
                  <div className="relative h-36 overflow-hidden">
                    {suggestion.avatar ? (
                      <img 
                        src={suggestion.avatar} 
                        alt={suggestion.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${getCoverStyle(index + 2)} flex items-center justify-center`}>
                        <span className="text-4xl font-bold text-white/80">
                          {suggestion.userName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 flex flex-col">
                    <Link to={`/user/${suggestion.userId}`} className="flex items-center gap-1 mb-1 hover:underline">
                      <span className="font-semibold text-sm truncate text-foreground">
                        {suggestion.userName}
                      </span>
                      {suggestion.verified && <span className="text-primary text-sm">💜</span>}
                    </Link>
                    {suggestion.mutualFriends > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex -space-x-1">
                          {suggestion.mutualFriendsList.slice(0, 3).map((friend) => (
                            <Tooltip key={friend.user_id}>
                              <TooltipTrigger asChild>
                                <Avatar className="w-4 h-4 border border-background cursor-pointer hover:z-10 hover:scale-110 transition-transform">
                                  <AvatarImage src={friend.avatar_url} alt={friend.full_name || ""} />
                                  <AvatarFallback className="text-[6px] bg-primary/20">
                                    {friend.full_name?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                className="bg-primary text-secondary font-medium text-xs px-2 py-1"
                              >
                                {friend.full_name || "Người dùng"}
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {suggestion.mutualFriends} bạn chung
                        </span>
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full h-8 text-xs rounded-lg"
                      onClick={() => handleAddFriend(suggestion.userId)}
                      disabled={processingIds.has(suggestion.userId)}
                    >
                      {processingIds.has(suggestion.userId) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5 mr-1" />
                          Thêm bạn bè
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              {/* Navigation arrow */}
              <button className="shrink-0 w-8 h-8 self-center rounded-full bg-white shadow-md border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
          
          <Link to="/friends" className="text-sm text-primary hover:underline mt-3 mx-auto block text-center font-medium">
            Xem tất cả
          </Link>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
