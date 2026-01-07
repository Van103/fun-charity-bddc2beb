import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MessageCircle, Search, User as UserIcon, Circle, ExternalLink, X, Send, ThumbsUp, Smile } from "lucide-react";
import { ChatStickerPicker } from "@/components/chat/ChatStickerPicker";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { getOnlineStatus } from "@/hooks/usePresence";
import { motion, AnimatePresence } from "framer-motion";

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at: string;
  is_group?: boolean;
  name?: string;
  otherUser?: {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
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

interface MessageDropdownProps {
  userId: string | null;
  unreadCount: number;
}

export function MessageDropdown({ userId, unreadCount }: MessageDropdownProps) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const loadConversations = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order("last_message_at", { ascending: false })
      .limit(10);

    if (!convos) {
      setIsLoading(false);
      return;
    }

    const enrichedConvos = await Promise.all(
      convos.map(async (convo) => {
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", convo.id)
          .eq("is_read", false)
          .neq("sender_id", userId);

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

        return {
          ...convo,
          otherUser: profile || undefined,
          lastMessage: lastMsg?.image_url ? "📷 Hình ảnh" : lastMsg?.content || "",
          isOnline: onlineStatusMap.get(otherUserId) || false,
          unreadCount: unreadCount || 0
        };
      })
    );

    setConversations(enrichedConvos);
    setIsLoading(false);
  }, [userId]);

  const loadMessages = useCallback(async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (!data) return;

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

    setMessages(enrichedMessages);

    // Mark as read
    if (userId) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId);
    }
  }, [userId]);

  useEffect(() => {
    if (open && userId) {
      loadConversations();
    }
  }, [open, userId, loadConversations]);

  useEffect(() => {
    if (!activeChat?.id) return;

    const channel = supabase
      .channel(`dropdown-messages-${activeChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeChat.id}`
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url")
            .eq("user_id", newMsg.sender_id)
            .maybeSingle();

          setMessages(prev => [...prev, { ...newMsg, senderProfile: profile || undefined }]);

          if (userId && newMsg.sender_id !== userId) {
            await supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat?.id, userId]);

  const openChat = async (convo: Conversation) => {
    setActiveChat(convo);
    await loadMessages(convo.id);
  };

  const closeChat = () => {
    setActiveChat(null);
    setMessages([]);
    setNewMessage("");
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat || !userId) return;

    setIsSending(true);
    try {
      await supabase.from("messages").insert({
        conversation_id: activeChat.id,
        sender_id: userId,
        content: newMessage.trim()
      });

      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", activeChat.id);

      setNewMessage("");
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const sendLike = async () => {
    if (!activeChat || !userId) return;
    try {
      await supabase.from("messages").insert({
        conversation_id: activeChat.id,
        sender_id: userId,
        content: "👍"
      });
    } catch (error) {
      console.error("Send like error:", error);
    }
  };

  const filteredConversations = conversations.filter(convo =>
    convo.otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const goToFullMessages = () => {
    setOpen(false);
    if (activeChat) {
      navigate(`/messages?user=${activeChat.otherUser?.user_id}`);
    } else {
      navigate("/messages");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground hover:text-primary hover:bg-primary/10"
          title={t("nav.messages") || "Messages"}
        >
          <MessageCircle className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center text-[11px] font-bold text-white bg-red-500 rounded-full px-1.5 shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[360px] p-0 shadow-xl border border-border/50"
        sideOffset={8}
      >
        <AnimatePresence mode="wait">
          {activeChat ? (
            // Mini Chat View
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-[450px]"
            >
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-3 border-b border-border/50 bg-muted/30">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeChat}>
                  <X className="w-4 h-4" />
                </Button>
                <Avatar className="w-9 h-9">
                  <AvatarImage src={activeChat.otherUser?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {activeChat.otherUser?.full_name || "Người dùng"}
                  </p>
                  <div className="flex items-center gap-1">
                    <Circle className={`w-2 h-2 ${activeChat.isOnline ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"}`} />
                    <span className="text-xs text-muted-foreground">
                      {activeChat.isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToFullMessages}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-8">Bắt đầu cuộc trò chuyện...</p>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === userId;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          {!isMe && (
                            <Avatar className="w-6 h-6 mr-1.5 mt-1 flex-shrink-0">
                              <AvatarImage src={msg.senderProfile?.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/20 text-[8px]">
                                <UserIcon className="w-3 h-3" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[75%] px-3 py-1.5 rounded-2xl text-sm ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted text-foreground rounded-bl-md"
                            }`}
                          >
                            {msg.image_url && (
                              <img src={msg.image_url} alt="" className="max-w-full rounded-lg mb-1" />
                            )}
                            {msg.content && <p className="break-words">{msg.content}</p>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-2 border-t border-border/50 bg-muted/20">
                <div className="flex items-center gap-2">
                  <ChatStickerPicker onSelect={(sticker) => setNewMessage(prev => prev + sticker)} />
                  <Input
                    placeholder="Aa"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    className="flex-1 h-9 text-sm rounded-full bg-muted border-0"
                  />
                  {newMessage.trim() ? (
                    <Button size="icon" className="h-8 w-8 rounded-full" onClick={sendMessage} disabled={isSending}>
                      <Send className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={sendLike}>
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            // Conversation List View
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-[450px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-border/50">
                <h3 className="font-bold text-lg">Đoạn chat</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToFullMessages}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-2 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm rounded-full bg-muted border-0"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Chưa có cuộc trò chuyện</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {filteredConversations.map((convo) => (
                      <button
                        key={convo.id}
                        onClick={() => openChat(convo)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left ${
                          convo.unreadCount && convo.unreadCount > 0 ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={convo.otherUser?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/20">
                              <UserIcon className="w-5 h-5 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                          {convo.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm truncate ${convo.unreadCount && convo.unreadCount > 0 ? "text-foreground" : "text-foreground/80"}`}>
                            {convo.otherUser?.full_name || "Người dùng"}
                          </p>
                          <div className="flex items-center gap-1">
                            <p className={`text-xs truncate flex-1 ${convo.unreadCount && convo.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                              {convo.lastMessage || "Bắt đầu trò chuyện"}
                            </p>
                            {convo.last_message_at && (
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                · {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: false, locale: vi })}
                              </span>
                            )}
                          </div>
                        </div>
                        {convo.unreadCount && convo.unreadCount > 0 && (
                          <div className="w-3 h-3 bg-primary rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="p-2 border-t border-border/50">
                <Button variant="ghost" className="w-full text-primary text-sm" onClick={goToFullMessages}>
                  Xem tất cả trong Messenger
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}
