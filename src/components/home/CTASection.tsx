import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ParticleButton } from "@/components/ui/ParticleButton";
import { Heart, ArrowRight, Building2, Users, Sparkles, Crown, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function CTASection() {
  const { t } = useLanguage();

  const roles = [
    {
      icon: Heart,
      titleKey: "cta.wantToShare",
      descKey: "cta.shareDesc",
      ctaKey: "cta.startGiving",
      href: "/campaigns",
      gradient: "from-secondary to-secondary-light",
    },
    {
      icon: Users,
      titleKey: "cta.haveTime",
      descKey: "cta.volunteerDesc",
      ctaKey: "cta.joinUs",
      href: "/auth",
      gradient: "from-primary to-primary-light",
    },
    {
      icon: Building2,
      titleKey: "cta.areOrganization",
      descKey: "cta.orgDesc",
      ctaKey: "cta.registerNow",
      href: "/auth",
      gradient: "from-success to-secondary",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={role.href}>
                  <div className="glass-card-hover p-8 h-full group luxury-border">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {t(role.titleKey)}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {t(role.descKey)}
                    </p>
                    <Button variant="outline" className="group/btn hover-glossy">
                      {t(role.ctaKey)}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-primary" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(43_55%_52%_/_0.2),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(275_60%_30%_/_0.3),_transparent_50%)]" />

          {/* Content */}
          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center crown-glow">
                <Crown className="w-8 h-8 text-secondary" />
              </div>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              {t("cta.ready")}
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-4 max-w-2xl mx-auto">
              {t("cta.thousandHearts")}
            </p>
            <p className="text-secondary font-medium mb-8">
              {t("cta.givingIsReceiving")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/campaigns">
                <ParticleButton 
                  variant="hero" 
                  size="xl" 
                  className="glossy-btn glossy-btn-gradient"
                  particleColors={['#84D9BA', '#FFD700', '#FF6B9D', '#00D4FF']}
                  glowColor="#84D9BA"
                >
                  <Heart className="w-5 h-5" fill="currentColor" />
                  {t("cta.exploreCampaigns")}
                </ParticleButton>
              </Link>
              <ParticleButton 
                variant="wallet" 
                size="xl" 
                className="glossy-btn glossy-btn-purple"
                particleColors={['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']}
                glowColor="#8B5CF6"
              >
                <Wallet className="w-5 h-5" />
                {t("cta.connectWallet")}
              </ParticleButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}