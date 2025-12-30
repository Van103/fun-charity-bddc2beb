import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedCampaigns } from "@/components/home/FeaturedCampaigns";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ImpactStats } from "@/components/home/ImpactStats";
import { CTASection } from "@/components/home/CTASection";
import { AboutSection } from "@/components/home/AboutSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TeamSection } from "@/components/home/TeamSection";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturedCampaigns />
      <HowItWorks />
      <TestimonialsSection />
      <TeamSection />
      <ImpactStats />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
