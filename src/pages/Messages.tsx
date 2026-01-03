import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, Send, ArrowLeft, Search, Image as ImageIcon, X, 
  Phone, Video, Users, Plus, ThumbsUp, Circle, MoreVertical, Trash2,
  Info, Edit3, Bell, BellOff, Lock, ChevronDown, ChevronRight,
  File, Image as ImageIconSmall, Shield, Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDistanceToNow, Locale } from "date-fns";
import { vi, enUS, zhCN, ja, ko, th } from "date-fns/locale";
import { usePresence, getOnlineStatus } from "@/hooks/usePresence";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { useMessageReactions } from "@/hooks/useMessageReactions";
import { ChatStickerPicker } from "@/components/chat/ChatStickerPicker";
import { VideoCallModal } from "@/components/chat/VideoCallModal";
import { AgoraVideoCallModal } from "@/components/chat/AgoraVideoCallModal";
import { AgoraGroupCallModal } from "@/components/chat/AgoraGroupCallModal";
import { CreateGroupModal } from "@/components/chat/CreateGroupModal";
import { MessageReactionPicker, MessageReactionsDisplay } from "@/components/chat/MessageReactionPicker";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useIncomingCallListener } from "@/hooks/useIncomingCallListener";
// IncomingCallNotification import removed - now handled globally in App.tsx
import { CallsTab } from "@/components/chat/CallsTab";
import { CallMessageBubble, isCallMessage } from "@/components/chat/CallMessageBubble";
import { useLanguage } from "@/contexts/LanguageContext";

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  is_group?: boolean;
  name?: string;
  created_by?: string;
  otherUser?: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  participants?: Array<{
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  }>;
  lastMessage?: string;
  isOnline?: boolean;
  unreadCount?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
  senderProfile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface SearchUser {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

// Helper function to check if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

// Locale map for date-fns
const localeMap: Record<string, Locale> = {
  vi, en: enUS, zh: zhCN, ja, ko, th
};

export default function Messages() {
  const { t, language } = useLanguage();
  const dateLocale = localeMap[language] || vi;
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get("user");
  const answerCallId = searchParams.get("answer");
  const answerConversationId = searchParams.get("conversation");
  const answerCallType = searchParams.get("type") as "video" | "audio" | null;
  const startCallType = searchParams.get("startCall") as "video" | "audio" | null;
  const { toast } = useToast();
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [useAgoraCall, setUseAgoraCall] = useState(true); // Use Agora by default
  const [showGroupCall, setShowGroupCall] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "groups" | "calls">("all");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [autoAnswerCall, setAutoAnswerCall] = useState(false);
  const [incomingCallSessionId, setIncomingCallSessionId] = useState<string | null>(null);
  const [incomingCallConversationId, setIncomingCallConversationId] = useState<string | null>(null);
  const [incomingCallOtherUser, setIncomingCallOtherUser] = useState<{
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activeConversationRef = useRef<string | null>(null);

  // Setup presence tracking
  usePresence(currentUserId);
  
  // Setup message notifications
  useMessageNotifications(currentUserId, activeConversation?.id || null);
  
  // Setup typing indicator
  const { typingUsers, handleTyping, setTyping } = useTypingIndicator(
    activeConversation?.id || null,
    currentUserId
  );

  // Handle incoming call answer
  const handleAnswerIncomingCall = useCallback(async (call: {
    id: string;
    conversationId: string;
    callerId: string;
    callerName: string;
    callerAvatar: string | null;
    callType: "video" | "audio";
  }) => {
    console.log("Answering incoming call:", call);
    setCallType(call.callType);
    setIsIncomingCall(true);
    setIncomingCallSessionId(call.id);
    setIncomingCallConversationId(call.conversationId);
    setIncomingCallOtherUser({
      user_id: call.callerId,
      full_name: call.callerName,
      avatar_url: call.callerAvatar
    });
    setShowVideoCall(true);
  }, []);

  // Handle refresh when call ends (from global listener or local VideoCallModal)
  const handleCallEnded = useCallback(() => {
    if (currentUserId) {
      loadConversations(currentUserId);
      if (activeConversation?.id) {
        loadMessages(activeConversation.id);
      }
    }
  }, [currentUserId, activeConversation?.id]);

  // Listen for call-ended-refresh event from global IncomingCallListener in App.tsx
  useEffect(() => {
    const handleGlobalCallEnded = () => {
      console.log("Received call-ended-refresh event");
      handleCallEnded();
    };
    
    window.addEventListener('call-ended-refresh', handleGlobalCallEnded);
    return () => window.removeEventListener('call-ended-refresh', handleGlobalCallEnded);
  }, [handleCallEnded]);

  // Setup incoming call listener - REMOVED local notification, using global in App.tsx
  const { incomingCall, answerCall, declineCall, dismissCall } = useIncomingCallListener({
    userId: currentUserId,
    onAnswerCall: handleAnswerIncomingCall,
    onCallEnded: handleCallEnded
  });

  // Get message IDs for reactions
  const messageIds = useMemo(() => messages.map(m => m.id), [messages]);

  // Setup message reactions
  const { 
    toggleReaction, 
    getMessageReactions, 
    getUserReaction 
  } = useMessageReactions(messageIds, currentUserId);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update ref when active conversation changes
  useEffect(() => {
    activeConversationRef.current = activeConversation?.id || null;
  }, [activeConversation?.id]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);
      await loadConversations(user.id);
      
      if (targetUserId) {
        await openConversationWithUser(user.id, targetUserId);
        
        // Auto start call if startCall param is present
        if (startCallType) {
          // Small delay to ensure conversation is loaded
          setTimeout(() => {
            setCallType(startCallType);
            setIsIncomingCall(false);
            setAutoAnswerCall(false);
            setShowVideoCall(true);
            // Clear the startCall param
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("startCall");
            setSearchParams(newParams, { replace: true });
          }, 500);
        }
      }
      
      setIsLoading(false);
    };
    
    init();
  }, [targetUserId, startCallType]);

  // Handle incoming call from URL params (when user clicks answer from notification)
  useEffect(() => {
    // Only require answerCallId and answerConversationId - we'll wait for currentUserId separately
    if (!answerCallId || !answerConversationId) return;
    // Wait for currentUserId to be available (don't skip if still loading)
    if (!currentUserId) return;
    
    const handleIncomingCallFromUrl = async () => {
      console.log("Handling incoming call from URL params:", answerCallId, answerConversationId, answerCallType);
      
      // Fetch call session to get caller info
      const { data: callSession, error: callError } = await supabase
        .from("call_sessions")
        .select("*")
        .eq("id", answerCallId)
        .single();
      
      if (callError || !callSession) {
        console.error("Error fetching call session:", callError);
        toast({
          title: t('common.error'),
          description: t('messages.callNotFound'),
          variant: "destructive"
        });
        // Clear URL params
        setSearchParams({});
        return;
      }
      
      // Check if call is still pending
      if (callSession.status !== "pending") {
        console.log("Call is no longer pending:", callSession.status);
        toast({
          title: t('messages.callEnded'),
          description: t('messages.callNotAvailable'),
        });
        // Clear URL params
        setSearchParams({});
        return;
      }
      
      // Fetch caller profile
      const { data: callerProfile } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .eq("user_id", callSession.caller_id)
        .single();
      
      // Set up incoming call state
      setCallType((answerCallType || callSession.call_type) as "video" | "audio");
      setIsIncomingCall(true);
      setAutoAnswerCall(true); // Auto answer since user clicked from notification
      setIncomingCallSessionId(answerCallId);
      setIncomingCallConversationId(answerConversationId);
      setIncomingCallOtherUser({
        user_id: callSession.caller_id,
        full_name: callerProfile?.full_name || t('messages.user'),
        avatar_url: callerProfile?.avatar_url || null
      });
      setShowVideoCall(true);
      
      // Clear URL params after processing
      setSearchParams({});
    };
    
    handleIncomingCallFromUrl();
  }, [answerCallId, answerConversationId, answerCallType, currentUserId, isLoading, toast, setSearchParams]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }
      
      setIsSearching(true);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .ilike("full_name", `%${searchQuery}%`)
        .neq("user_id", currentUserId)
        .limit(10);
      
      setSearchResults(data || []);
      setShowSearchDropdown(true);
      setIsSearching(false);
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, currentUserId]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadConversations = useCallback(async (userId: string) => {
    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (!convos) return;

    const enrichedConvos = await Promise.all(
      convos.map(async (convo) => {
        // Get unread count
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", convo.id)
          .eq("is_read", false)
          .neq("sender_id", userId);

        if (convo.is_group) {
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", convo.id);

          const participantIds = participants?.map(p => p.user_id).filter(id => id !== userId) || [];
          
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url")
            .in("user_id", participantIds);

          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, image_url")
            .eq("conversation_id", convo.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const getMediaLabel = (url: string): string => {
            return isVideoUrl(url) ? `🎬 ${t('messages.video')}` : `📷 ${t('messages.image')}`;
          };

          return {
            ...convo,
            participants: profiles || [],
            lastMessage: lastMsg?.image_url ? getMediaLabel(lastMsg.image_url) : lastMsg?.content || "",
            isOnline: false,
            unreadCount: unreadCount || 0
          };
        }

        const otherUserId = convo.participant1_id === userId ? convo.participant2_id : convo.participant1_id;
        const onlineStatusMap = await getOnlineStatus([otherUserId]);
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .eq("user_id", otherUserId)
          .maybeSingle();

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content, image_url")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const getMediaLabel = (url: string): string => {
          return isVideoUrl(url) ? `🎬 ${t('messages.video')}` : `📷 ${t('messages.image')}`;
        };

        return {
          ...convo,
          otherUser: profile || undefined,
          lastMessage: lastMsg?.image_url ? getMediaLabel(lastMsg.image_url) : lastMsg?.content || "",
          isOnline: onlineStatusMap.get(otherUserId) || false,
          unreadCount: unreadCount || 0
        };
      })
    );

    setConversations(enrichedConvos);
  }, [t]);

  const openConversationWithUser = async (myId: string, theirId: string) => {
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("is_group", false)
      .or(`and(participant1_id.eq.${myId},participant2_id.eq.${theirId}),and(participant1_id.eq.${theirId},participant2_id.eq.${myId})`)
      .maybeSingle();

    let convo = existing;

    if (!convo) {
      const { data: newConvo } = await supabase
        .from("conversations")
        .insert({ 
          participant1_id: myId, 
          participant2_id: theirId,
          is_group: false
        })
        .select()
        .single();
      
      convo = newConvo;

      if (newConvo) {
        await supabase
          .from("conversation_participants")
          .insert([
            { conversation_id: newConvo.id, user_id: myId },
            { conversation_id: newConvo.id, user_id: theirId }
          ]);
      }
      
      await loadConversations(myId);
    }

    if (convo) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .eq("user_id", theirId)
        .maybeSingle();

      const onlineStatusMap = await getOnlineStatus([theirId]);

      // Clear messages first when switching
      setMessages([]);
      
      setActiveConversation({
        ...convo,
        otherUser: profile || undefined,
        isOnline: onlineStatusMap.get(theirId) || false
      });
      
      await loadMessages(convo.id);
    }
  };

  const loadMessages = useCallback(async (conversationId: string) => {
    // Only load if this is still the active conversation
    if (activeConversationRef.current && activeConversationRef.current !== conversationId) {
      return;
    }

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!data) {
      setMessages([]);
      return;
    }

    const senderIds = [...new Set(data.map(m => m.sender_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", senderIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const enrichedMessages = data.map(msg => ({
      ...msg,
      senderProfile: profileMap.get(msg.sender_id)
    }));

    // Double check we're still on the same conversation
    if (activeConversationRef.current === conversationId) {
      setMessages(enrichedMessages);
    }

    if (currentUserId) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentUserId);
    }
  }, [currentUserId]);

  const selectConversation = async (convo: Conversation) => {
    // Clear messages immediately to prevent showing old chat
    setMessages([]);
    // Update ref BEFORE loading messages so the check passes
    activeConversationRef.current = convo.id;
    setActiveConversation(convo);
    await loadMessages(convo.id);
  };

  const selectSearchResult = async (user: SearchUser) => {
    if (!currentUserId) return;
    setSearchQuery("");
    setShowSearchDropdown(false);
    await openConversationWithUser(currentUserId, user.user_id);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: t('messages.fileTooLarge'),
        description: t('messages.fileSizeLimit'),
        variant: "destructive"
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleStickerSelect = (sticker: string) => {
    setNewMessage(prev => prev + sticker);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !imageFile) || !activeConversation || !currentUserId) return;
    
    setIsSending(true);
    setTyping(false);
    
    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `${currentUserId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConversation.id,
          sender_id: currentUserId,
          content: newMessage.trim() || (imageUrl ? "" : ""),
          image_url: imageUrl
        });

      if (error) throw error;

      setNewMessage("");
      setImageFile(null);
      setImagePreview(null);
      
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", activeConversation.id);

      // Refresh conversation list
      if (currentUserId) {
        await loadConversations(currentUserId);
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('messages.sendFailed'),
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendLike = async () => {
    if (!activeConversation || !currentUserId) return;
    
    try {
      await supabase
        .from("messages")
        .insert({
          conversation_id: activeConversation.id,
          sender_id: currentUserId,
          content: "👍"
        });
      
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", activeConversation.id);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const recallMessage = async (messageId: string) => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("sender_id", currentUserId);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== messageId));
      
      toast({
        title: t('messages.recalled'),
        description: t('messages.recallSuccess'),
      });

      // Refresh conversation list
      if (currentUserId) {
        await loadConversations(currentUserId);
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('messages.recallFailed'),
        variant: "destructive"
      });
    }
  };

  const startCall = async (type: "video" | "audio") => {
    // Allow calling even if the other user is offline; if they don't answer, we'll mark it as missed.
    setIsIncomingCall(false);
    setIncomingCallSessionId(null);
    setIncomingCallConversationId(null);
    setIncomingCallOtherUser(null);
    setCallType(type);
    setShowVideoCall(true);
  };

  // Realtime subscription for messages
  useEffect(() => {
    if (!activeConversation?.id) return;

    const conversationId = activeConversation.id;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          if (activeConversationRef.current === conversationId) {
            const newMsg = payload.new as Message;
            
            const { data: profile } = await supabase
              .from("profiles")
              .select("user_id, full_name, avatar_url")
              .eq("user_id", newMsg.sender_id)
              .maybeSingle();
            
            setMessages(prev => [...prev, {
              ...newMsg,
              senderProfile: profile || undefined
            }]);

            if (newMsg.sender_id !== currentUserId) {
              await supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", newMsg.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation?.id, currentUserId]);

  // Realtime subscription for presence changes
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("presence-updates")
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        async () => {
          await loadConversations(currentUserId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, loadConversations]);

  // Realtime subscription for new messages in any conversation
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("all-messages")
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id !== currentUserId) {
            await loadConversations(currentUserId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, loadConversations]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const filteredConversations = conversations.filter(c => {
    // Text filter
    const matchesSearch = !searchQuery.trim() || 
      (c.is_group ? c.name?.toLowerCase().includes(searchQuery.toLowerCase()) : 
       c.otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Tab filter
    if (activeFilter === "unread") return matchesSearch && (c.unreadCount || 0) > 0;
    if (activeFilter === "groups") return matchesSearch && c.is_group;
    return matchesSearch;
  });

  const getConversationName = (convo: Conversation) => {
    if (convo.is_group) return convo.name || t('messages.groupChat');
    return convo.otherUser?.full_name || t('messages.user');
  };

  const getConversationAvatar = (convo: Conversation) => {
    if (convo.is_group) return null;
    return convo.otherUser?.avatar_url;
  };

  // Get media from messages
  const messageMedia = messages.filter(m => m.image_url);

  return (
    <div className="fixed inset-0 bg-background flex">
      <Helmet>
        <title>Messenger | FUN Charity</title>
      </Helmet>

      {/* Left Sidebar - Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-card ${activeConversation ? 'hidden md:flex' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{t('messages.chats')}</h1>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9 hover:bg-muted"
                title={t('settings.title')}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCreateGroup(true)}
                title={t('messages.newConversation')}
                className="rounded-full hover:bg-muted h-9 w-9"
              >
                <Edit3 className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative" ref={searchInputRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('messages.searchMessenger')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSearchDropdown(true)}
              className="pl-10 rounded-full bg-muted/50 border-0 focus-visible:ring-1 h-10"
            />
            
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearchDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      {t('messages.noUsersFound')}
                    </div>
                  ) : (
                    searchResults.map(user => (
                      <button
                        key={user.user_id}
                        onClick={() => selectSearchResult(user)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.full_name || t('messages.user')}</span>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-3">
            <Button
              variant={activeFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter("all")}
              className="rounded-full h-8 px-4"
            >
              {t('messages.all')}
            </Button>
            <Button
              variant={activeFilter === "unread" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter("unread")}
              className="rounded-full h-8 px-4"
            >
              {t('messages.unread')}
            </Button>
            <Button
              variant={activeFilter === "groups" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter("groups")}
              className="rounded-full h-8 px-4"
            >
              {t('messages.groups')}
            </Button>
            <Button
              variant={activeFilter === "calls" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter("calls")}
              className="rounded-full h-8 px-4 gap-1"
            >
              <Phone className="w-3.5 h-3.5" />
              {t('messages.calls')}
            </Button>
          </div>
        </div>
        
        {/* Conversations List or Calls Tab */}
        {activeFilter === "calls" ? (
          <CallsTab 
            userId={currentUserId} 
            onCallUser={async (userId, callType) => {
              if (!currentUserId) return;
              await openConversationWithUser(currentUserId, userId);
              setCallType(callType);
              setIsIncomingCall(false);
              setAutoAnswerCall(false);
              setShowVideoCall(true);
            }}
          />
        ) : (
          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t('messages.noConversations')}
              </div>
            ) : (
              filteredConversations.map(convo => (
                <motion.div
                  key={convo.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectConversation(convo)}
                  className={`flex items-center gap-3 p-3 mx-2 my-1 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors ${
                    activeConversation?.id === convo.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {convo.is_group ? (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                    ) : (
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={getConversationAvatar(convo) || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                          {getConversationName(convo).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!convo.is_group && (
                      <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${
                        convo.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold truncate ${convo.unreadCount ? 'text-foreground' : ''}`}>
                        {getConversationName(convo)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate flex-1 ${
                        convo.unreadCount ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}>
                        {convo.lastMessage || t('messages.startConversation')}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        · {formatDistanceToNow(new Date(convo.last_message_at), { locale: dateLocale, addSuffix: false })}
                      </span>
                      {!!convo.unreadCount && convo.unreadCount > 0 && (
                        <span className="flex-shrink-0 w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </ScrollArea>
        )}
      </div>

      {/* Center - Messages Area */}
      <div className={`flex-1 flex flex-col bg-background ${!activeConversation ? 'hidden md:flex' : ''}`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full h-10 w-10"
                  onClick={() => setActiveConversation(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                
                {activeConversation.is_group ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-base">{activeConversation.name || t('messages.groupChat')}</p>
                      <p className="text-xs text-muted-foreground">
                        {(activeConversation.participants?.length || 0) + 1} {t('messages.members')}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to={`/user/${activeConversation.otherUser?.user_id}`} className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={activeConversation.otherUser?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {activeConversation.otherUser?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card ${
                        activeConversation.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </Link>
                    <div>
                      <Link 
                        to={`/user/${activeConversation.otherUser?.user_id}`}
                        className="font-bold hover:underline block text-base"
                      >
                        {activeConversation.otherUser?.full_name || t('messages.user')}
                      </Link>
                      <p className="text-xs">
                        {activeConversation.isOnline ? (
                          <span className="text-green-500 flex items-center gap-1">
                            <Circle className="w-2 h-2 fill-green-500" />
                            {t('messages.online')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{t('messages.recentlyActive')}</span>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                {/* Group call buttons */}
                {activeConversation.is_group && activeConversation.participants && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCallType("audio");
                        setShowGroupCall(true);
                      }}
                      title={t('messages.groupAudioCall')}
                      className="rounded-full hover:bg-muted text-primary h-10 w-10"
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCallType("video");
                        setShowGroupCall(true);
                      }}
                      title={t('messages.groupVideoCall')}
                      className="rounded-full hover:bg-muted text-primary h-10 w-10"
                    >
                      <Video className="w-5 h-5" />
                    </Button>
                  </>
                )}
                
                {/* 1:1 call buttons */}
                {!activeConversation.is_group && activeConversation.otherUser && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startCall("audio")}
                      title={t('messages.audioCall')}
                      className="rounded-full hover:bg-muted text-primary h-10 w-10"
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startCall("video")}
                      title={t('messages.videoCall')}
                      className="rounded-full hover:bg-muted text-primary h-10 w-10"
                    >
                      <Video className="w-5 h-5" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  title={t('messages.conversationInfo')}
                  className={`rounded-full hover:bg-muted h-10 w-10 ${showRightPanel ? 'text-primary' : ''}`}
                >
                  <Info className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Security notice */}
            <div className="px-4 py-2 bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                {t('messages.encryptedMessages')}
              </p>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-2">
              <div className="space-y-2 max-w-4xl mx-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src={activeConversation.otherUser?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {(activeConversation.otherUser?.full_name || "U").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-lg">{activeConversation.otherUser?.full_name || t('messages.user')}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t('messages.startConversation')}...</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isCurrentUser = msg.sender_id === currentUserId;
                    const showAvatar = !isCurrentUser && (
                      index === 0 || 
                      messages[index - 1]?.sender_id !== msg.sender_id
                    );
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-end gap-2 group ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Avatar for other user's messages */}
                        {!isCurrentUser && (
                          <div className="w-8 h-8 flex-shrink-0">
                            {showAvatar && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={msg.senderProfile?.avatar_url || activeConversation.otherUser?.avatar_url || ""} />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {(msg.senderProfile?.full_name || activeConversation.otherUser?.full_name || "U").charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                        
                        {/* Reaction picker + Recall button for own messages */}
                        {isCurrentUser && (
                          <div className="flex items-center gap-1">
                            <MessageReactionPicker
                              onSelect={(emoji) => toggleReaction(msg.id, emoji)}
                              currentReaction={getUserReaction(msg.id)}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                >
                                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border">
                                <DropdownMenuItem 
                                  onClick={() => recallMessage(msg.id)}
                                  className="text-destructive focus:text-destructive cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {t('messages.recallMessage')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        {/* Reaction picker for other user's messages */}
                        {!isCurrentUser && (
                          <MessageReactionPicker
                            onSelect={(emoji) => toggleReaction(msg.id, emoji)}
                            currentReaction={getUserReaction(msg.id)}
                          />
                        )}
                        
                        <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                          {/* Sender name for group */}
                          {activeConversation.is_group && !isCurrentUser && showAvatar && (
                            <span className="text-xs text-muted-foreground mb-1 ml-1">
                              {msg.senderProfile?.full_name || "Người dùng"}
                            </span>
                          )}
                          
                          <div className="relative">
                            {/* Special UI for call messages */}
                            {msg.content && isCallMessage(msg.content) ? (
                              <CallMessageBubble
                                content={msg.content}
                                isCurrentUser={isCurrentUser}
                                onCallback={(type) => startCall(type)}
                              />
                            ) : (
                              <div
                                className={`rounded-2xl overflow-hidden ${
                                  isCurrentUser
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                {msg.image_url && (
                                  isVideoUrl(msg.image_url) ? (
                                    <video 
                                      src={msg.image_url} 
                                      controls
                                      className="max-w-full max-h-72 rounded-lg"
                                      preload="metadata"
                                    />
                                  ) : (
                                    <img 
                                      src={msg.image_url} 
                                      alt="Shared image" 
                                      className="max-w-full max-h-72 object-cover cursor-pointer"
                                      onClick={() => window.open(msg.image_url!, '_blank')}
                                    />
                                  )
                                )}
                                {msg.content && (
                                  <div className={`px-4 py-2 ${msg.content === '👍' ? 'text-4xl py-1' : ''}`}>
                                    <p className="text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Reactions display */}
                            <MessageReactionsDisplay
                              reactions={getMessageReactions(msg.id)}
                              onReactionClick={(emoji) => toggleReaction(msg.id, emoji)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                
                {/* Typing indicator */}
                <AnimatePresence>
                  {typingUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-end gap-2"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activeConversation.otherUser?.avatar_url || ""} />
                        <AvatarFallback className="text-xs">
                          {activeConversation.otherUser?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Image Preview */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2 border-t border-border bg-card"
                >
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="max-h-24 rounded-lg" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={removeImage}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Input */}
            <div className="p-3 border-t border-border bg-card">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <div className="flex items-center gap-2 max-w-4xl mx-auto">
                {/* Left action buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-muted text-primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    title={t('messages.attachMedia')}
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-muted text-primary hidden sm:flex"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    title={t('messages.sendImage')}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  <ChatStickerPicker onSelect={handleStickerSelect} />
                </div>
                
                {/* Message input */}
                <div className="flex-1">
                  <Input
                    placeholder="Aa"
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isSending}
                    className="w-full rounded-full bg-muted/50 border-0 focus-visible:ring-1 h-11 text-base"
                  />
                </div>
                
                {/* Send/Like button */}
                {newMessage.trim() || imageFile ? (
                  <Button 
                    onClick={sendMessage}
                    disabled={isSending}
                    size="icon"
                    className="h-10 w-10 rounded-full flex-shrink-0"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-muted text-primary flex-shrink-0"
                    onClick={sendLike}
                    title={t('messages.sendLike')}
                  >
                    <ThumbsUp className="w-6 h-6" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4 p-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Send className="w-12 h-12 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-bold text-xl text-foreground">{t('messages.yourMessages')}</p>
              <p className="text-sm mt-1">{t('messages.selectConversation')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Chat Info */}
      <AnimatePresence>
        {showRightPanel && activeConversation && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col border-l border-border bg-card overflow-hidden"
          >
            <ScrollArea className="flex-1">
              <div className="p-6">
                {/* Profile Section */}
                <div className="text-center mb-6">
                  <Avatar className="w-20 h-20 mx-auto mb-3">
                    <AvatarImage src={activeConversation.otherUser?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {(activeConversation.otherUser?.full_name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{activeConversation.otherUser?.full_name || t('messages.user')}</h3>
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.isOnline ? t('messages.online') : t('messages.recentlyActive')}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-center gap-4 mb-6">
                  <div className="text-center">
                    <Link 
                      to={`/user/${activeConversation.otherUser?.user_id}`}
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-1 hover:bg-muted/80 transition-colors"
                    >
                    <Users className="w-5 h-5" />
                    </Link>
                    <span className="text-xs text-muted-foreground">{t('messages.profile')}</span>
                  </div>
                  <div className="text-center">
                    <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-1 hover:bg-muted/80 transition-colors">
                      <Bell className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-muted-foreground">{t('messages.muteNotifications')}</span>
                  </div>
                  <div className="text-center">
                    <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-1 hover:bg-muted/80 transition-colors">
                      <Search className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-muted-foreground">{t('common.search')}</span>
                  </div>
                </div>

                {/* Collapsible Sections */}
                <div className="space-y-2">
                  {/* Chat Info */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="font-medium">{t('messages.chatInfo')}</span>
                      <ChevronDown className="w-5 h-5" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 py-2">
                      <p className="text-sm text-muted-foreground">
                        {t('messages.conversationCreated')} {formatDistanceToNow(new Date(activeConversation.last_message_at), { locale: dateLocale, addSuffix: true })}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Customize Chat */}
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="font-medium">{t('messages.customizeChat')}</span>
                      <ChevronDown className="w-5 h-5" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 py-2 space-y-2">
                      <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm">{t('messages.changeTheme')}</span>
                      </button>
                      <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <Edit3 className="w-4 h-4" />
                        <span className="text-sm">{t('messages.changeNickname')}</span>
                      </button>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Media & Files */}
                  <Collapsible open={mediaOpen} onOpenChange={setMediaOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="font-medium">{t('messages.mediaFiles')}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${mediaOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 py-2">
                      {messageMedia.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('messages.noFiles')}</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {messageMedia.slice(0, 6).map((msg) => (
                            isVideoUrl(msg.image_url!) ? (
                              <div 
                                key={msg.id}
                                className="aspect-square rounded-lg cursor-pointer hover:opacity-80 transition-opacity relative bg-muted overflow-hidden"
                                onClick={() => window.open(msg.image_url!, '_blank')}
                              >
                                <video 
                                  src={msg.image_url!}
                                  className="w-full h-full object-cover"
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Video className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            ) : (
                              <img
                                key={msg.id}
                                src={msg.image_url!}
                                alt="Media"
                                className="aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(msg.image_url!, '_blank')}
                              />
                            )
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Privacy & Support */}
                  <Collapsible open={privacyOpen} onOpenChange={setPrivacyOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="font-medium">{t('messages.privacySupport')}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${privacyOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 py-2 space-y-2">
                      <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <BellOff className="w-4 h-4" />
                        <span className="text-sm">{t('messages.muteNotifications')}</span>
                      </button>
                      <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-destructive">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">{t('messages.block')}</span>
                      </button>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incoming Call Notification - REMOVED, now handled globally in App.tsx */}

      {/* Video/Audio Call Modal - Agora or WebRTC */}
      {showVideoCall && currentUserId && (
        useAgoraCall ? (
          <AgoraVideoCallModal
            open={showVideoCall}
            onClose={() => {
              setShowVideoCall(false);
              setIsIncomingCall(false);
              setAutoAnswerCall(false);
              setIncomingCallSessionId(null);
              setIncomingCallConversationId(null);
              setIncomingCallOtherUser(null);
            }}
            conversationId={isIncomingCall && incomingCallConversationId ? incomingCallConversationId : (activeConversation?.id || "")}
            recipientId={isIncomingCall && incomingCallOtherUser ? incomingCallOtherUser.user_id : (activeConversation?.otherUser?.user_id || "")}
            recipientName={isIncomingCall && incomingCallOtherUser ? (incomingCallOtherUser.full_name || t('messages.user')) : (activeConversation?.otherUser?.full_name || t('messages.user'))}
            recipientAvatar={isIncomingCall && incomingCallOtherUser ? (incomingCallOtherUser.avatar_url || undefined) : (activeConversation?.otherUser?.avatar_url || undefined)}
            callType={callType}
            isIncoming={isIncomingCall}
            callSessionId={incomingCallSessionId || undefined}
            currentUserId={currentUserId}
            autoAnswer={autoAnswerCall}
            onCallEnded={() => {
              // Refresh conversations and messages after call ends
              if (currentUserId) {
                loadConversations(currentUserId);
                if (activeConversation?.id) {
                  loadMessages(activeConversation.id);
                }
              }
            }}
          />
        ) : (
          <VideoCallModal
            open={showVideoCall}
            onClose={() => {
              setShowVideoCall(false);
              setIsIncomingCall(false);
              setAutoAnswerCall(false);
              setIncomingCallSessionId(null);
              setIncomingCallConversationId(null);
              setIncomingCallOtherUser(null);
            }}
            conversationId={isIncomingCall && incomingCallConversationId ? incomingCallConversationId : (activeConversation?.id || "")}
            currentUserId={currentUserId}
            otherUser={isIncomingCall && incomingCallOtherUser ? incomingCallOtherUser : (activeConversation?.otherUser || { user_id: "", full_name: null, avatar_url: null })}
            callType={callType}
            isIncoming={isIncomingCall}
            callSessionId={incomingCallSessionId || undefined}
            autoAnswer={autoAnswerCall}
            onCallEnded={() => {
              // Refresh conversations and messages after call ends
              if (currentUserId) {
                loadConversations(currentUserId);
                if (activeConversation?.id) {
                  loadMessages(activeConversation.id);
                }
              }
            }}
          />
        )
      )}

      {/* Group Call Modal */}
      {showGroupCall && activeConversation?.is_group && currentUserId && (
        <AgoraGroupCallModal
          open={showGroupCall}
          onClose={() => setShowGroupCall(false)}
          conversationId={activeConversation.id}
          conversationName={activeConversation.name || t('messages.groupChat')}
          participants={activeConversation.participants || []}
          callType={callType}
          currentUserId={currentUserId}
          onCallEnded={() => {
            setShowGroupCall(false);
            if (currentUserId) {
              loadConversations(currentUserId);
              if (activeConversation?.id) {
                loadMessages(activeConversation.id);
              }
            }
          }}
        />
      )}

      {/* Create Group Modal */}
      {currentUserId && (
        <CreateGroupModal
          open={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          currentUserId={currentUserId}
          onGroupCreated={async (conversationId) => {
            await loadConversations(currentUserId);
            const newConvo = conversations.find(c => c.id === conversationId);
            if (newConvo) {
              setActiveConversation(newConvo);
              await loadMessages(conversationId);
            }
          }}
        />
      )}
    </div>
  );
}
