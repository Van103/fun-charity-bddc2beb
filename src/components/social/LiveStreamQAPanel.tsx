import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircleQuestion, 
  Pin, 
  PinOff, 
  Check, 
  X, 
  Send,
  Trash2,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Question {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  timestamp: Date;
  isAnswered?: boolean;
  isPinned?: boolean;
}

export interface PinnedComment {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  timestamp: Date;
}

interface LiveStreamQAPanelProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
  onQuestionAnswered: (questionId: string) => void;
  onQuestionDismissed: (questionId: string) => void;
  pinnedComment: PinnedComment | null;
  onPinComment: (comment: PinnedComment | null) => void;
  isHost: boolean;
}

export function LiveStreamQAPanel({
  open,
  onClose,
  questions,
  onQuestionAnswered,
  onQuestionDismissed,
  pinnedComment,
  onPinComment,
  isHost,
}: LiveStreamQAPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const unansweredQuestions = questions.filter(q => !q.isAnswered);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute top-20 left-4 w-72 bg-black/90 backdrop-blur-md rounded-2xl overflow-hidden z-40"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5 text-primary" />
              <span className="text-white font-medium text-sm">Hỏi đáp (Q&A)</span>
              {unansweredQuestions.length > 0 && (
                <Badge className="bg-primary text-primary-foreground text-xs px-1.5">
                  {unansweredQuestions.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-white/70 hover:text-white p-1"
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              <button 
                onClick={onClose}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <ScrollArea className="max-h-64 p-3">
                  {unansweredQuestions.length === 0 ? (
                    <div className="text-center py-6 text-white/50 text-sm">
                      <MessageCircleQuestion className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Chưa có câu hỏi nào</p>
                      <p className="text-xs mt-1">Người xem có thể gửi câu hỏi trong chat</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {unansweredQuestions.map((question) => (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="bg-white/10 rounded-xl p-3 space-y-2"
                        >
                          <div className="flex items-start gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={question.avatar} />
                              <AvatarFallback className="text-xs bg-primary/30">
                                {question.user.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-primary text-xs font-semibold">{question.user}</p>
                              <p className="text-white text-sm">{question.text}</p>
                            </div>
                          </div>
                          
                          {isHost && (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                onClick={() => onQuestionAnswered(question.id)}
                                className="h-7 text-xs gap-1 flex-1"
                              >
                                <Check className="w-3 h-3" />
                                Đã trả lời
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onQuestionDismissed(question.id)}
                                className="h-7 text-xs text-white/70 hover:text-white hover:bg-white/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pinned Comment Display Component
interface PinnedCommentDisplayProps {
  comment: PinnedComment;
  onUnpin: () => void;
  isHost: boolean;
}

export function PinnedCommentDisplay({ comment, onUnpin, isHost }: PinnedCommentDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-16 left-4 right-20 z-30"
    >
      <div className="bg-gradient-to-r from-primary/80 to-primary/60 backdrop-blur-md rounded-xl p-3 shadow-lg">
        <div className="flex items-start gap-2">
          <Pin className="w-4 h-4 text-primary-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="w-5 h-5">
                <AvatarImage src={comment.avatar} />
                <AvatarFallback className="text-[10px] bg-white/30">
                  {comment.user.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-primary-foreground text-xs font-semibold">{comment.user}</span>
              <Badge className="bg-white/20 text-primary-foreground text-[10px] px-1.5">
                Đã ghim
              </Badge>
            </div>
            <p className="text-primary-foreground text-sm">{comment.text}</p>
          </div>
          {isHost && (
            <button
              onClick={onUnpin}
              className="text-primary-foreground/70 hover:text-primary-foreground p-1"
            >
              <PinOff className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
