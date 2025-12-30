import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronRight, Video, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useStories, useLiveStreams, GroupedStory } from "@/hooks/useStories";
import { CreateStoryModal } from "./CreateStoryModal";
import { StoryViewerModal } from "./StoryViewerModal";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<GroupedStory | null>(null);
  
  const { data: stories = [], refetch: refetchStories } = useStories();
  const { data: liveStreams = [] } = useLiveStreams();

  const handleStoryCreated = () => {
    refetchStories();
  };

  return (
    <>
      <div className="glass-card p-4 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted p-1 rounded-xl border border-border">
            <TabsTrigger 
              value="stories" 
              className="rounded-lg text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              📖 Stories
            </TabsTrigger>
            <TabsTrigger 
              value="live" 
              className="rounded-lg text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            >
              <Video className="w-4 h-4 mr-1" />
              Live
              {liveStreams.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full">
                  {liveStreams.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="mt-0">
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {/* Create Story - Square Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="shrink-0 cursor-pointer"
                  onClick={() => setShowCreateModal(true)}
                >
                  <div className="relative w-28 h-40 rounded-xl bg-gradient-to-br from-muted to-muted/50 border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:from-primary/5 hover:to-primary/10 transition-all overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs text-foreground font-medium">Tạo tin</span>
                  </div>
                </motion.div>

                {/* Story Items - Square Cards */}
                {stories.map((storyGroup, index) => (
                  <motion.div
                    key={storyGroup.user_id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="shrink-0 cursor-pointer"
                    onClick={() => setSelectedStoryGroup(storyGroup)}
                  >
                    <div className="relative w-28 h-40 rounded-xl overflow-hidden group">
                      {/* Background - first story media or gradient */}
                      <div className={`absolute inset-0 ${!storyGroup.stories[0]?.media_url ? `bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]}` : ''}`}>
                        {storyGroup.stories[0]?.media_url && (
                          storyGroup.stories[0].media_type === "video" ? (
                            <video 
                              src={storyGroup.stories[0].media_url} 
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img 
                              src={storyGroup.stories[0].media_url} 
                              alt={storyGroup.userName} 
                              className="w-full h-full object-cover"
                            />
                          )
                        )}
                      </div>
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Ring indicator for new stories */}
                      {storyGroup.hasNew && (
                        <div className="absolute top-2 left-2">
                          <div className="p-0.5 rounded-full bg-gradient-to-br from-gold-champagne via-gold-light to-gold-champagne">
                            <div className="w-8 h-8 rounded-full bg-card border-2 border-card overflow-hidden">
                              {storyGroup.avatar ? (
                                <img src={storyGroup.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center text-white text-xs font-bold`}>
                                  {storyGroup.userName.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Story count badge */}
                      {storyGroup.stories.length > 1 && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/50 text-white text-[10px] rounded-full">
                          {storyGroup.stories.length}
                        </span>
                      )}

                      {/* Name at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <span className="text-xs text-white font-medium line-clamp-2 drop-shadow-lg">
                          {storyGroup.userName}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Empty state */}
                {stories.length === 0 && (
                  <div className="flex-1 flex items-center justify-center py-4 text-muted-foreground text-sm">
                    Chưa có story nào
                  </div>
                )}
              </div>

              {/* Navigation Arrow */}
              {stories.length > 3 && (
                <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-8 h-8 bg-white/90 rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors border border-white/50">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="live" className="mt-0">
            {liveStreams.length > 0 ? (
              <div className="relative">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {liveStreams.map((stream, index) => (
                    <motion.div
                      key={stream.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="shrink-0 cursor-pointer"
                    >
                      <div className="relative w-28 h-40 rounded-xl overflow-hidden group">
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]}`}>
                          {stream.profile?.avatar_url && (
                            <img 
                              src={stream.profile.avatar_url} 
                              alt="" 
                              className="w-full h-full object-cover opacity-50"
                            />
                          )}
                        </div>
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        {/* LIVE Badge - Flashing */}
                        <motion.span 
                          className="absolute top-2 left-2 px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full font-bold flex items-center gap-1"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          LIVE
                        </motion.span>

                        {/* Viewer count */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded-full">
                          <Eye className="w-3 h-3 text-white" />
                          <span className="text-[10px] text-white font-medium">
                            {stream.live_viewer_count || 0}
                          </span>
                        </div>

                        {/* Avatar */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="w-14 h-14 rounded-full border-3 border-destructive overflow-hidden">
                            {stream.profile?.avatar_url ? (
                              <img src={stream.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} flex items-center justify-center text-white text-lg font-bold`}>
                                {stream.profile?.full_name?.charAt(0) || "?"}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Name at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                          <span className="text-xs text-white font-medium line-clamp-1 drop-shadow-lg">
                            {stream.profile?.full_name || "Đang phát"}
                          </span>
                          {stream.title && (
                            <span className="text-[10px] text-white/80 line-clamp-1">
                              {stream.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Video className="w-8 h-8 mx-auto mb-2 opacity-70" />
                  <p className="text-sm">Chưa có ai đang phát trực tiếp</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Story Modal */}
      <CreateStoryModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onStoryCreated={handleStoryCreated}
      />

      {/* Story Viewer Modal */}
      {selectedStoryGroup && (
        <StoryViewerModal
          open={!!selectedStoryGroup}
          onOpenChange={(open) => !open && setSelectedStoryGroup(null)}
          storyGroup={selectedStoryGroup}
        />
      )}
    </>
  );
}
