"use client";

import Header from "@/components/Homepage/header";
import HeroSection from "@/components/Homepage/hero-section";
import FeaturesSection from "@/components/Homepage/features-section";
import HowItWorks from "@/components/Homepage/how-it-works";
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

      {/* <HeroImageWithFeatures /> */}

      {/* <LogoCarousel /> */}

      <ScrollAnimationWrapper delay={0.1}>
        <FeaturesSection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.2}>
        <HowItWorks />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.3}>
        <TestimonialsSection />
      </ScrollAnimationWrapper>

      {/* <FAQSection /> */}

      {/* <AboutSection />*/}

      <ScrollAnimationWrapper delay={0.4}>
        <CTASection />
      </ScrollAnimationWrapper>

      <ScrollAnimationWrapper delay={0.5}>
        <Footer />
      </ScrollAnimationWrapper>
    </div>
  );
}
