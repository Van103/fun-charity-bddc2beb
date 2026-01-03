import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { PlatformStatsDisplay } from "@/components/campaigns/PlatformStatsDisplay";
import { Heart } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

const Campaigns = () => {
  const { t } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCampaignCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>{t('campaigns.title')} - FUN Charity</title>
        <meta
          name="description"
          content={t('campaigns.description')}
        />
      </Helmet>

      <main className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <Badge variant="trending" className="mb-4">
                <Heart className="w-3.5 h-3.5 mr-1" />
                {t('campaigns.makeImpact')}
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                {t('campaigns.discover')} <span className="gradient-text">{t('campaigns.title')}</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                {t('campaigns.description')}
              </p>
              <CreateCampaignModal onCampaignCreated={handleCampaignCreated} />
            </motion.div>

            {/* Platform Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <PlatformStatsDisplay />
            </motion.div>

            {/* Campaign List with Edge Function Integration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CampaignList
                key={refreshKey}
                showFilters={true}
                limit={12}
              />
            </motion.div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
};

export default Campaigns;
