"use client";

import Header from "@/components/Homepage/header";
import HeroSection from "@/components/Homepage/hero-section";
import LogoCarousel from "@/components/Homepage/logo-carousel";
import FeaturesSection from "@/components/Homepage/features-section";
import HowItWorks from "@/components/Homepage/how-it-works";
import TestimonialsSection from "@/components/Homepage/testimonials-section";
import FAQSection from "@/components/Homepage/faq-section";
import AboutSection from "@/components/Homepage/about-section";
import CTASection from "@/components/Homepage/cta-section";
import Footer from "@/components/Homepage/footer";
import BackgroundElements from "@/components/Homepage/background-elements";

export default function CallPlatterLanding() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#343434' }}>
      <BackgroundElements />

      <Header />

      <HeroSection />

      {/* <LogoCarousel /> */}

      <FeaturesSection />

      <HowItWorks />

      <TestimonialsSection />

      {/* <FAQSection /> */}

      {/* <AboutSection />*/}

      <CTASection /> 

      <Footer />
    </div>
  );
}
