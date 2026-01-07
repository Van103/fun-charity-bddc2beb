import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Gift, MessageCircle, Users, Award, Heart, AlertCircle, UserCheck, UserX, Loader2, User, PhoneMissed, Phone, Settings, ThumbsUp, AtSign, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  data: Record<string, any>;
}

type FilterType = "all" | "unread";

const notificationIcons: Record<string, React.ReactNode> = {
  donation_received: <Gift className="w-4 h-4 text-green-500" />,
  donation_sent: <Heart className="w-4 h-4 text-pink-500" />,
  friend_request: <Users className="w-4 h-4 text-blue-500" />,
  comment_reply: <MessageCircle className="w-4 h-4 text-purple-500" />,
  badge_earned: <Award className="w-4 h-4 text-yellow-500" />,
  campaign_update: <AlertCircle className="w-4 h-4 text-orange-500" />,
  missed_call: <PhoneMissed className="w-4 h-4 text-red-500" />,
  like: <ThumbsUp className="w-4 h-4 text-blue-500" />,
  mention: <AtSign className="w-4 h-4 text-green-500" />,
  share: <Share2 className="w-4 h-4 text-cyan-500" />,
  system: <Bell className="w-4 h-4 text-muted-foreground" />,
};

const notificationBackgrounds: Record<string, string> = {
  donation_received: "bg-green-500/10",
  donation_sent: "bg-pink-500/10",
  friend_request: "bg-blue-500/10",
  comment_reply: "bg-purple-500/10",
  badge_earned: "bg-yellow-500/10",
  campaign_update: "bg-orange-500/10",
  missed_call: "bg-red-500/10",
  like: "bg-blue-500/10",
  mention: "bg-green-500/10",
  share: "bg-cyan-500/10",
  system: "bg-muted",
};

// Play notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch {}
};

export function NotificationDropdown() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error && data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
    fetchNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          // Play sound for new notifications
          playNotificationSound();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.is_read) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    setIsOpen(false);

    // Navigate based on notification type and data
    const { type, data } = notification;

    switch (type) {
      case "friend_request":
        navigate("/friends");
        break;
      case "comment_reply":
        if (data?.post_id) {
          navigate(`/social?post=${data.post_id}`);
        } else {
          navigate("/social");
        }
        break;
      case "donation_received":
      case "donation_confirmed":
        if (data?.campaign_id) {
          navigate(`/campaigns/${data.campaign_id}`);
        } else {
          navigate("/my-campaigns");
        }
        break;
      case "campaign_approved":
      case "campaign_rejected":
      case "campaign_funded":
        if (data?.campaign_id) {
          navigate(`/campaigns/${data.campaign_id}`);
        } else {
          navigate("/my-campaigns");
        }
        break;
      case "badge_earned":
        navigate("/profile");
        break;
      case "missed_call":
        if (data?.callee_id) {
          navigate(`/messages?user=${data.callee_id}`);
        } else {
          navigate("/messages");
        }
        break;
      case "like":
      case "mention":
      case "share":
        if (data?.post_id) {
          navigate(`/social?post=${data.post_id}`);
        } else {
          navigate("/social");
        }
        break;
      default:
        // Default navigation for other types
        break;
    }
  };

  const handleAcceptFriendRequest = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;

    setProcessingIds(prev => new Set(prev).add(notification.id));

    try {
      const senderId = notification.data?.sender_id;
      
      if (!senderId) {
        // Fallback: find by friend_id
        const { data: friendRequest, error: findError } = await supabase
          .from("friendships")
          .select("*")
          .eq("friend_id", currentUserId)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (findError || !friendRequest) {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy lời mời kết bạn",
            variant: "destructive",
          });
          return;
        }

        const { error: updateError } = await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .eq("id", friendRequest.id);

        if (updateError) throw updateError;
      } else {
        // Use sender_id from notification data
        const { error: updateError } = await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .eq("user_id", senderId)
          .eq("friend_id", currentUserId)
          .eq("status", "pending");

        if (updateError) throw updateError;
      }

      toast({
        title: "Thành công",
        description: "Đã chấp nhận lời mời kết bạn",
      });

      await markAsRead(notification.id);
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast({
        title: "Lỗi",
        description: "Đã có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const handleDeclineFriendRequest = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;

    setProcessingIds(prev => new Set(prev).add(notification.id));

    try {
      const senderId = notification.data?.sender_id;

      if (!senderId) {
        const { data: friendRequest, error: findError } = await supabase
          .from("friendships")
          .select("*")
          .eq("friend_id", currentUserId)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (findError || !friendRequest) {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy lời mời kết bạn",
            variant: "destructive",
          });
          return;
        }

        const { error: deleteError } = await supabase
          .from("friendships")
          .delete()
          .eq("id", friendRequest.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: deleteError } = await supabase
          .from("friendships")
          .delete()
          .eq("user_id", senderId)
          .eq("friend_id", currentUserId)
          .eq("status", "pending");

        if (deleteError) throw deleteError;
      }

      toast({
        title: "Đã từ chối",
        description: "Đã từ chối lời mời kết bạn",
      });

      await markAsRead(notification.id);
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    } catch (error) {
      console.error("Error declining friend request:", error);
      toast({
        title: "Lỗi",
        description: "Đã có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const getIcon = (type: string) => {
    return notificationIcons[type] || notificationIcons.system;
  };

  const getIconBackground = (type: string) => {
    return notificationBackgrounds[type] || notificationBackgrounds.system;
  };

  const formatTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: vi });
  };

  const isProcessing = (id: string) => processingIds.has(id);

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative w-10 h-10 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 shadow-xl border-border/50" sideOffset={8}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xl font-bold">Thông báo</h4>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={markAllAsRead}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </div>
          </div>
          {/* Filter tabs - Facebook style */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full h-8 px-4 ${filter === "all" ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted"}`}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full h-8 px-4 ${filter === "unread" ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted"}`}
              onClick={() => setFilter("unread")}
            >
              Chưa đọc
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-8 h-8 opacity-50" />
              </div>
              <p className="font-medium">
                {filter === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo nào"}
              </p>
              <p className="text-sm mt-1">
                {filter === "unread" ? "Bạn đã đọc tất cả thông báo" : "Khi có hoạt động mới, bạn sẽ thấy ở đây"}
              </p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-3 hover:bg-muted/50 cursor-pointer transition-all duration-200 border-l-4 ${
                    !notification.is_read 
                      ? "bg-primary/5 border-l-primary" 
                      : "border-l-transparent"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    {/* Avatar with icon overlay */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                        {notification.data?.sender_avatar_url ? (
                          <AvatarImage src={notification.data.sender_avatar_url} />
                        ) : null}
                        <AvatarFallback className={`${getIconBackground(notification.type)}`}>
                          <User className="w-5 h-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      {/* Icon badge overlay - Facebook style */}
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${getIconBackground(notification.type)} border-2 border-background flex items-center justify-center`}>
                        {getIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm leading-snug ${!notification.is_read ? "font-semibold" : ""}`}>
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                          )}
                        </div>
                        {!notification.is_read && (
                          <span className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${!notification.is_read ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {formatTime(notification.created_at)}
                      </p>

                      {/* Friend request action buttons */}
                      {notification.type === "friend_request" && !notification.is_read && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="h-8 flex-1 font-semibold"
                            onClick={(e) => handleAcceptFriendRequest(notification, e)}
                            disabled={isProcessing(notification.id)}
                          >
                            {isProcessing(notification.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Xác nhận
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 flex-1 font-semibold"
                            onClick={(e) => handleDeclineFriendRequest(notification, e)}
                            disabled={isProcessing(notification.id)}
                          >
                            {isProcessing(notification.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Xóa"
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Missed call action button */}
                      {notification.type === "missed_call" && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                              setIsOpen(false);
                              const calleeId = notification.data?.callee_id;
                              const callType = notification.data?.call_type || "video";
                              if (calleeId) {
                                navigate(`/messages?user=${calleeId}&startCall=${callType}`);
                              }
                            }}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Gọi lại
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
