import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { MentionSuggestions } from "./MentionSuggestions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface MentionUser {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange: (mentions: MentionUser[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
}

export function MentionInput({
  value,
  onChange,
  onMentionsChange,
  placeholder,
  className = "",
  disabled = false,
  minHeight = "100px",
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [mentions, setMentions] = useState<MentionUser[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch friends for suggestions
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["mention-friends", searchQuery],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get accepted friendships
      const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .eq("status", "accepted")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (!friendships || friendships.length === 0) return [];

      // Get friend IDs
      const friendIds = friendships.map((f) => 
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      // Get profiles
      let query = supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", friendIds);

      if (searchQuery) {
        query = query.ilike("full_name", `%${searchQuery}%`);
      }

      const { data: profiles } = await query.limit(10);
      return (profiles || []) as MentionUser[];
    },
    enabled: showSuggestions,
  });

  // Track when user types @
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(newPosition);

    // Check if user just typed @ or is continuing to type after @
    const textBeforeCursor = newValue.slice(0, newPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      // Check if @ is at start or after whitespace
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " ";
      if (/\s/.test(charBeforeAt) || lastAtIndex === 0) {
        const query = textBeforeCursor.slice(lastAtIndex + 1);
        // Only show if query doesn't contain spaces (still typing username)
        if (!query.includes(" ")) {
          setMentionStartIndex(lastAtIndex);
          setSearchQuery(query);
          setShowSuggestions(true);
          setSelectedIndex(0);
          return;
        }
      }
    }
    
    setShowSuggestions(false);
    setMentionStartIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || friends.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < friends.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : friends.length - 1
        );
        break;
      case "Enter":
        if (friends[selectedIndex]) {
          e.preventDefault();
          insertMention(friends[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  // Insert mention into text
  const insertMention = useCallback((user: MentionUser) => {
    if (mentionStartIndex === -1) return;
    
    const displayName = user.full_name || "Người dùng";
    // Format: @[Name](user_id)
    const mentionText = `@[${displayName}](${user.user_id}) `;
    
    const beforeMention = value.slice(0, mentionStartIndex);
    const afterCursor = value.slice(cursorPosition);
    
    const newValue = beforeMention + mentionText + afterCursor;
    onChange(newValue);
    
    // Add to mentions list if not already there
    if (!mentions.find(m => m.user_id === user.user_id)) {
      const newMentions = [...mentions, user];
      setMentions(newMentions);
      onMentionsChange(newMentions);
    }
    
    setShowSuggestions(false);
    setMentionStartIndex(-1);
    
    // Focus and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = beforeMention.length + mentionText.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  }, [value, cursorPosition, mentionStartIndex, mentions, onChange, onMentionsChange]);

  // Extract existing mentions from value when it changes
  useEffect(() => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const existingMentions: MentionUser[] = [];
    let match;
    
    while ((match = mentionRegex.exec(value)) !== null) {
      const fullName = match[1];
      const userId = match[2];
      if (!existingMentions.find(m => m.user_id === userId)) {
        existingMentions.push({
          user_id: userId,
          full_name: fullName,
          avatar_url: null,
        });
      }
    }
    
    if (JSON.stringify(existingMentions) !== JSON.stringify(mentions)) {
      setMentions(existingMentions);
      onMentionsChange(existingMentions);
    }
  }, [value]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${className} resize-none`}
        style={{ minHeight }}
        disabled={disabled}
      />
      {showSuggestions && (
        <div 
          className="absolute left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg"
        >
          <MentionSuggestions
            users={friends}
            isLoading={isLoading}
            selectedIndex={selectedIndex}
            onSelect={insertMention}
          />
        </div>
      )}
    </div>
  );
}
