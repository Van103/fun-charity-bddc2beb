import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, 
  Clock, Loader2
} from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { vi } from "date-fns/locale";

interface CallSession {
  id: string;
  conversation_id: string;
  caller_id: string;
  call_type: "video" | "audio";
  status: string;
  started_at: string;
  ended_at: string | null;
  callerProfile?: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  otherProfile?: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  isOutgoing: boolean;
}

interface CallsTabProps {
  userId: string | null;
  onCallUser: (userId: string, callType: "video" | "audio") => void;
}

export function CallsTab({ userId, onCallUser }: CallsTabProps) {
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    const fetchCallHistory = async () => {
      try {
        // Fetch conversations where user is a participant
        const { data: conversations, error: convError } = await supabase
          .from("conversations")
          .select("id, participant1_id, participant2_id")
          .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

        if (convError || !conversations?.length) {
          setLoading(false);
          return;
        }

        const conversationIds = conversations.map(c => c.id);

        // Fetch call sessions for these conversations
        const { data: callSessions, error: callError } = await supabase
          .from("call_sessions")
          .select("*")
          .in("conversation_id", conversationIds)
          .order("started_at", { ascending: false })
          .limit(50);

        if (callError || !callSessions?.length) {
          setLoading(false);
          return;
        }

        // Get all unique user IDs from calls and conversations
        const userIds = new Set<string>();
        callSessions.forEach(call => userIds.add(call.caller_id));
        conversations.forEach(conv => {
          userIds.add(conv.participant1_id);
          userIds.add(conv.participant2_id);
        });

        // Fetch profiles
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", Array.from(userIds));

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const convMap = new Map(conversations.map(c => [c.id, c]));

        // Build call history with user info
        const enrichedCalls: CallSession[] = callSessions.map(call => {
          const conv = convMap.get(call.conversation_id);
          const isOutgoing = call.caller_id === userId;
          
          // Find the other user in the conversation
          let otherUserId: string | null = null;
          if (conv) {
            otherUserId = conv.participant1_id === userId 
              ? conv.participant2_id 
              : conv.participant1_id;
          }

          return {
            id: call.id,
            conversation_id: call.conversation_id,
            caller_id: call.caller_id,
            call_type: call.call_type as "video" | "audio",
            status: call.status,
            started_at: call.started_at,
            ended_at: call.ended_at,
            callerProfile: profileMap.get(call.caller_id) || undefined,
            otherProfile: otherUserId ? profileMap.get(otherUserId) : undefined,
            isOutgoing
          };
        });

        setCalls(enrichedCalls);
      } catch (error) {
        console.error("Error fetching call history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCallHistory();

    // Subscribe to call_sessions changes
    const channel = supabase
      .channel("calls-tab-updates")
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_sessions'
        },
        () => {
          fetchCallHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getCallIcon = (call: CallSession) => {
    if (call.status === "declined" || call.status === "no_answer") {
      return <PhoneMissed className="w-5 h-5 text-destructive" />;
    }
    if (call.isOutgoing) {
      return <PhoneOutgoing className="w-5 h-5 text-green-500" />;
    }
    return <PhoneIncoming className="w-5 h-5 text-primary" />;
  };

  const getCallStatusText = (call: CallSession) => {
    const prefix = call.isOutgoing ? "Cuộc gọi đi" : "Cuộc gọi đến";
    switch (call.status) {
      case "completed":
      case "ended":
        return prefix;
      case "active":
        return "Đang gọi";
      case "declined":
        return call.isOutgoing ? "Đã bị từ chối" : "Đã từ chối";
      case "no_answer":
        return call.isOutgoing ? "Không trả lời" : "Cuộc gọi nhỡ";
      case "pending":
        return "Đang chờ";
      default:
        return prefix;
    }
  };

  const getCallDuration = (call: CallSession) => {
    if (!call.ended_at || call.status === "declined" || call.status === "no_answer") {
      return null;
    }
    const start = new Date(call.started_at).getTime();
    const end = new Date(call.ended_at).getTime();
    const durationMs = end - start;
    
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const formatCallTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "HH:mm");
  };

  const formatRelativeTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: vi });
  };

  const handleCallback = (call: CallSession) => {
    const otherUserId = call.otherProfile?.user_id;
    if (otherUserId) {
      onCallUser(otherUserId, call.call_type);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Phone className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">Chưa có cuộc gọi nào</p>
        <p className="text-sm">Bắt đầu gọi cho bạn bè ngay!</p>
      </div>
    );
  }

  // Group calls by date
  const groupedCalls = calls.reduce((groups, call) => {
    const date = new Date(call.started_at);
    let key: string;
    
    if (isToday(date)) {
      key = "Hôm nay";
    } else if (isYesterday(date)) {
      key = "Hôm qua";
    } else {
      key = format(date, "EEEE, dd/MM/yyyy", { locale: vi });
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(call);
    return groups;
  }, {} as Record<string, CallSession[]>);

  return (
    <ScrollArea className="flex-1">
      {Object.entries(groupedCalls).map(([dateGroup, groupCalls]) => (
        <div key={dateGroup}>
          {/* Date Header */}
          <div className="px-4 py-2 bg-muted/30 sticky top-0 z-10">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {dateGroup}
            </span>
          </div>

          {/* Calls in this group */}
          {groupCalls.map((call) => {
            const displayProfile = call.otherProfile || call.callerProfile;
            const duration = getCallDuration(call);
            const isMissed = call.status === "declined" || call.status === "no_answer";

            return (
              <div
                key={call.id}
                className="flex items-center gap-3 p-3 mx-2 my-1 rounded-xl hover:bg-muted/50 transition-colors"
              >
                {/* Avatar with call type indicator */}
                <div className="relative flex-shrink-0">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={displayProfile?.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-medium">
                      {displayProfile?.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-card border-2 border-card">
                    {call.call_type === "video" ? (
                      <Video className="w-3 h-3 text-primary" />
                    ) : (
                      <Phone className="w-3 h-3 text-primary" />
                    )}
                  </div>
                </div>

                {/* Call info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold truncate ${isMissed ? 'text-destructive' : ''}`}>
                      {displayProfile?.full_name || "Người dùng"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(call.started_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm mt-0.5">
                    {getCallIcon(call)}
                    <span className={`${isMissed ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {getCallStatusText(call)}
                    </span>
                  </div>

                  {/* Detailed time info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Bắt đầu: {formatCallTime(call.started_at)}
                    </span>
                    {call.ended_at && (
                      <span className="flex items-center gap-1">
                        Kết thúc: {formatCallTime(call.ended_at)}
                      </span>
                    )}
                    {duration && (
                      <span className="font-medium text-primary">
                        Thời lượng: {duration}
                      </span>
                    )}
                    {!duration && isMissed && (
                      <span className="font-medium text-destructive">
                        {call.status === "no_answer" ? "Không có phản hồi" : "Bị từ chối"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Callback buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-primary/10"
                    onClick={() => handleCallback({ ...call, call_type: "audio" })}
                    title="Gọi điện"
                  >
                    <Phone className="w-5 h-5 text-primary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-primary/10"
                    onClick={() => handleCallback({ ...call, call_type: "video" })}
                    title="Gọi video"
                  >
                    <Video className="w-5 h-5 text-primary" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </ScrollArea>
  );
}
