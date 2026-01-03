import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useRealtimeRankingUpdates } from "@/hooks/useRealtimeRankingUpdates";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HonorStatsOverview } from "@/components/honor/HonorStatsOverview";
import { HonorPodium } from "@/components/honor/HonorPodium";
import { RankerCard } from "@/components/honor/RankerCard";
import { BadgeCard } from "@/components/honor/BadgeCard";
import { useTopRankers } from "@/hooks/useHonorStats";
import { useVolunteerRanking } from "@/hooks/useVolunteerRanking";
import { useBadges } from "@/hooks/useBadges";
import { Loader2, Trophy, Heart, Award } from "lucide-react";

export default function HonorBoard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("donors");
  
  // Enable realtime ranking updates with toast notifications
  useRealtimeRankingUpdates();
  
  const { data: topDonors = [], isLoading: donorsLoading } = useTopRankers();
  const { data: topVolunteers = [], isLoading: volunteersLoading } = useVolunteerRanking();
  const { data: badges = [], isLoading: badgesLoading } = useBadges();

  const top3Donors = topDonors.slice(0, 3);
  const restDonors = topDonors.slice(3);
  
  const top3Volunteers = topVolunteers.slice(0, 3);
  const restVolunteers = topVolunteers.slice(3);

  return (
    <>
      <Helmet>
        <title>{t("honorBoard.pageTitle")} | FUN Charity</title>
        <meta name="description" content={t("honorBoard.metaDescription")} />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen pt-16 pb-20 lg:pb-8">
        {/* Hero Section with Video Background */}
        <section className="relative overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/sidebar-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-purple-800/50 to-background" />
          
          <div className="relative container mx-auto px-4 py-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-gold-shimmer">
                <span className="animate-sparkle inline-block mr-2">✨</span>
                {t("honorBoard.title")}
                <span className="animate-sparkle-delay inline-block ml-2">✨</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                {t("honorBoard.subtitle")}
              </p>
            </motion.div>
            
            {/* Stats Overview */}
            <HonorStatsOverview />
          </div>
        </section>

        {/* Tabs Section */}
        <section className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="donors" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">{t("honorBoard.topDonors")}</span>
                <span className="sm:hidden">{t("honorBoard.donors")}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="volunteers"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">{t("honorBoard.topVolunteers")}</span>
                <span className="sm:hidden">{t("honorBoard.volunteers")}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="badges"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">{t("honorBoard.badgesTab")}</span>
                <span className="sm:hidden">{t("honorBoard.badges")}</span>
              </TabsTrigger>
            </TabsList>

            {/* Top Donors Tab */}
            <TabsContent value="donors" className="space-y-8">
              {donorsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : topDonors.length === 0 ? (
                <div className="text-center py-16 glass-card max-w-md mx-auto">
                  <Trophy className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">{t("honorBoard.noDonors")}</p>
                </div>
              ) : (
                <>
                  {/* Podium for Top 3 */}
                  <HonorPodium 
                    rankers={top3Donors} 
                    type="donor"
                  />
                  
                  {/* Rest of the list */}
                  {restDonors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3 max-w-2xl mx-auto"
                    >
                      {restDonors.map((ranker, index) => (
                        <RankerCard 
                          key={ranker.userId} 
                          ranker={ranker} 
                          type="donor"
                          delay={index * 0.05}
                        />
                      ))}
                    </motion.div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Top Volunteers Tab */}
            <TabsContent value="volunteers" className="space-y-8">
              {volunteersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : topVolunteers.length === 0 ? (
                <div className="text-center py-16 glass-card max-w-md mx-auto">
                  <Heart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">{t("honorBoard.noVolunteers")}</p>
                </div>
              ) : (
                <>
                  {/* Podium for Top 3 */}
                  <HonorPodium 
                    rankers={top3Volunteers} 
                    type="volunteer"
                  />
                  
                  {/* Rest of the list */}
                  {restVolunteers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3 max-w-2xl mx-auto"
                    >
                      {restVolunteers.map((ranker, index) => (
                        <RankerCard 
                          key={ranker.userId} 
                          ranker={ranker} 
                          type="volunteer"
                          delay={index * 0.05}
                        />
                      ))}
                    </motion.div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges">
              {badgesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                >
                  {badges.map((badge, index) => (
                    <BadgeCard 
                      key={badge.id} 
                      badge={badge}
                      delay={index * 0.05}
                    />
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>
      
      <MobileBottomNav />
    </>
  );
}
