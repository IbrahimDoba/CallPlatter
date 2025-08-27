"use client";

import Header from "@/components/Homepage/header";
import HeroSection from "@/components/Homepage/hero-section";
import FeaturesSection from "@/components/Homepage/features-section";
import HowItWorks from "@/components/Homepage/how-it-works";
import PricingSection from "@/components/Homepage/pricing-section";
import TestimonialsSection from "@/components/Homepage/testimonials-section";
import FAQSection from "@/components/Homepage/faq-section";
import AboutSection from "@/components/Homepage/about-section";
import CTASection from "@/components/Homepage/cta-section";
import Footer from "@/components/Homepage/footer";
import BackgroundElements from "@/components/Homepage/background-elements";

export default function CallPlatterLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      <BackgroundElements />

      <Header />

      <HeroSection />

      <FeaturesSection />

      <HowItWorks />

      <PricingSection />

      <TestimonialsSection />

      <FAQSection />

      <AboutSection />

      <CTASection />

      <Footer />
    </div>
  );
}
