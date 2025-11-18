"use client";

import Header from "@/components/Homepage/header";
import HeroSection from "@/components/Homepage/hero-section";
import StatsSection from "@/components/Homepage/stats-section";
import FeaturesSection from "@/components/Homepage/features-section";
import UseCasesSection from "@/components/Homepage/use-cases-section";
import HowItWorks from "@/components/Homepage/how-it-works";
import IntegrationsSection from "@/components/Homepage/integrations-section";
import TestimonialsSection from "@/components/Homepage/testimonials-section";
import CTASection from "@/components/Homepage/cta-section";
import Footer from "@/components/Homepage/footer";
import BackgroundElements from "@/components/Homepage/background-elements";
import ScrollAnimationWrapper from "@/components/Homepage/scroll-animation-wrapper";

export default function CallPlatterLanding() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      <BackgroundElements />

      <Header />

      <HeroSection />

      <ScrollAnimationWrapper delay={0.1}>
        <StatsSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.1}>
        <FeaturesSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.2}>
        <UseCasesSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.2}>
        <HowItWorks />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.3}>
        <IntegrationsSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.3}>
        <TestimonialsSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.4}>
        <CTASection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.5}>
        <Footer />
      </ScrollAnimationWrapper>
    </div>
  );
}
