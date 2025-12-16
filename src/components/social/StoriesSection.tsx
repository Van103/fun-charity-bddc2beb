import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronRight, Video } from "lucide-react";
import { motion } from "framer-motion";

interface Story {
  id: string;
  userName: string;
  avatar: string;
  hasNew: boolean;
  isLive?: boolean;
}

const mockStories: Story[] = [
  { id: "1", userName: "Anh Elgon", avatar: "", hasNew: true },
  { id: "2", userName: "Kim Ngọc", avatar: "", hasNew: true },
  { id: "3", userName: "Lê Minh Trí", avatar: "", hasNew: true },
  { id: "4", userName: "Lê Huỳnh Như", avatar: "", hasNew: false },
  { id: "5", userName: "Na Trần", avatar: "", hasNew: true },
  { id: "6", userName: "Diệu Ngọc", avatar: "", hasNew: false },
];

// Soft gradient backgrounds for letter avatars
const avatarGradients = [
  "from-purple-soft to-purple-light",
  "from-gold-champagne to-gold-light",
  "from-pink-400 to-rose-300",
  "from-sky-400 to-blue-300",
  "from-emerald-400 to-teal-300",
  "from-amber-400 to-orange-300",
];

export function StoriesSection() {
  const [activeTab, setActiveTab] = useState("stories");

  return (
    <div className="glass-card p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger 
            value="stories" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-light data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
          >
            📖 Stories
          </TabsTrigger>
          <TabsTrigger 
            value="live" 
            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-light data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
          >
            <Video className="w-4 h-4 mr-1" />
            Live
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="mt-0">
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {/* Create Story */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="shrink-0 cursor-pointer"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-muted/50 border-2 border-dashed border-primary/40 flex items-center justify-center hover:border-primary/60 hover:bg-muted transition-all">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">Tạo tin</span>
                </div>
              </motion.div>

              {/* Story Items */}
              {mockStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="shrink-0 cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-2">
                    {/* Avatar with gold ring for new stories */}
                    <div className={`p-0.5 rounded-full ${
                      story.hasNew 
                        ? "bg-gradient-to-br from-gold-champagne via-gold-light to-gold-champagne" 
                        : "bg-border"
                    }`}>
                      <div className="p-0.5 rounded-full bg-card">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={story.avatar} />
                          <AvatarFallback className={`bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} text-white font-semibold text-lg`}>
                            {story.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Live indicator */}
                    {story.isLive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full font-medium">
                        LIVE
                      </span>
                    )}

                    {/* Name */}
                    <span className="text-xs text-foreground font-medium line-clamp-1 max-w-[64px] text-center">
                      {story.userName}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Navigation Arrow */}
            <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-8 h-8 bg-card rounded-full shadow-md flex items-center justify-center hover:bg-muted transition-colors border border-border">
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </TabsContent>

        <TabsContent value="live" className="mt-0">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có ai đang phát trực tiếp</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}