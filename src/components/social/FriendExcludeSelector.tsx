import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Check, UserMinus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Friend {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface FriendExcludeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludedFriends: string[];
  onExcludedFriendsChange: (friends: string[]) => void;
  currentUserId?: string;
}

export function FriendExcludeSelector({
  open,
  onOpenChange,
  excludedFriends,
  onExcludedFriendsChange,
  currentUserId,
}: FriendExcludeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState<string[]>(excludedFriends);

  useEffect(() => {
    setSelectedFriends(excludedFriends);
  }, [excludedFriends]);

  useEffect(() => {
    if (open && currentUserId) {
      fetchFriends();
    }
  }, [open, currentUserId]);

  const fetchFriends = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      // Get accepted friendships
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('friend_id, user_id')
        .eq('status', 'accepted')
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

      if (error) throw error;

      // Extract friend IDs
      const friendIds = friendships?.map(f => 
        f.user_id === currentUserId ? f.friend_id : f.user_id
      ) || [];

      if (friendIds.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Get friend profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', friendIds);

      if (profilesError) throw profilesError;

      setFriends(profiles?.map(p => ({
        id: p.user_id,
        user_id: p.user_id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
      })) || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleConfirm = () => {
    onExcludedFriendsChange(selectedFriends);
    onOpenChange(false);
  };

  const filteredFriends = friends.filter(friend =>
    friend.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <UserMinus className="w-5 h-5 text-primary" />
            Bạn bè trừ...
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Chọn bạn bè sẽ không thể xem Live Stream của bạn
          </p>
        </DialogHeader>

        {/* Search */}
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bạn bè..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Selected count */}
        {selectedFriends.length > 0 && (
          <div className="px-4 py-2">
            <div className="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-primary">
                Đã chọn {selectedFriends.length} người
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFriends([])}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Bỏ chọn tất cả
              </Button>
            </div>
          </div>
        )}

        {/* Friend list */}
        <ScrollArea className="flex-1 max-h-[350px] px-4 pb-2">
          {loading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-1" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Không tìm thấy bạn bè' : 'Chưa có bạn bè nào'}
            </div>
          ) : (
            <div className="space-y-1 py-2">
              <AnimatePresence>
                {filteredFriends.map((friend) => {
                  const isSelected = selectedFriends.includes(friend.id);
                  return (
                    <motion.button
                      key={friend.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => toggleFriend(friend.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-muted/50 ${
                        isSelected ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={friend.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {friend.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">{friend.full_name || "Người dùng"}</p>
                        {isSelected && (
                          <p className="text-xs text-destructive">Sẽ không xem được</p>
                        )}
                      </div>
                      <Checkbox 
                        checked={isSelected}
                        className="pointer-events-none"
                      />
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Actions */}
        <div className="p-4 pt-2 border-t flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 gap-2"
          >
            <Check className="w-4 h-4" />
            Xác nhận ({selectedFriends.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
