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
import { FAQSection } from "@/components/home/FAQSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { VolunteerSignupSection } from "@/components/home/VolunteerSignupSection";
import { TransparencyDashboard } from "@/components/transparency/TransparencyDashboard";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div className="container mx-auto px-4">
        <TransparencyDashboard />
      </div>
      <AboutSection />
      <FeaturedCampaigns />
      <HowItWorks />
      <TestimonialsSection />
      <PartnersSection />
      <VolunteerSignupSection />
      <TeamSection />
      <FAQSection />
      <ImpactStats />
      <NewsletterSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
