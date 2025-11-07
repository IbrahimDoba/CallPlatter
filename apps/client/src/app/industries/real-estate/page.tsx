"use client";

import {
  SectionHero,
  SectionContent,
  SectionInfo,
  SectionContentSlider,
  SectionImageInfo,
  SectionFAQ,
  SectionCTA,
} from "@/components/sections";
import { Phone, Calendar, Clock, Shield, TrendingUp, Zap } from "lucide-react";
import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";

export default function RealEstatePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="Never Miss a Real Estate Lead Again"
        titleHighlight="24/7 Answering Service"
        subtitle="Capture every buyer and seller inquiry instantly with professional real estate call answering. Stop losing commissions to agents who respond faster. 100% lead capture guaranteed, even during showings and after hours."
        primaryButtonText="Start Capturing Leads"
        primaryButtonHref="/waitlist"
        secondaryButtonText="See How It Works"
        secondaryButtonHref="#features"
        imageSrc="https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Professional Real Estate Answering Service for Realtors and Agents"
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, I'm interested in the 3-bedroom house on Maple Street. Is it still available? Can I schedule a showing for tomorrow afternoon?"
        aiResponse="Yes, that beautiful property is still available! I'd be happy to schedule a showing for you tomorrow afternoon. What time works best for you? I can check the agent's availability and send you a confirmation right away."
      />

      {/* Features Section */}
      <SectionContent
        title="Real Estate Answering Service Features"
        contentTitle="Complete Call Management Solution for Property Professionals"
        contentTitleSubtext="Every feature designed specifically for real estate agents, brokers, and property managers who need to capture every opportunity without missing important calls during critical moments."
        cards={[
          {
            title: "24/7 Virtual Receptionist for Real Estate",
            subtitle:
              "Round-the-clock live answering service ensures every buyer inquiry, seller lead, and showing request receives immediate professional response, even during evenings, weekends, and holidays when competitors miss calls.",
            image:
              "https://images.pexels.com/photos/7851263/pexels-photo-7851263.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "24/7 real estate answering service virtual receptionist",
          },
          {
            title: "Real Estate Trained Call Specialists",
            subtitle:
              "Our answering service representatives understand property listings, MLS terminology, buyer qualification questions, seller motivations, and can professionally handle showing requests, open house inquiries, and listing questions with expertise.",
            image:
              "https://images.pexels.com/photos/6775268/pexels-photo-6775268.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Real estate call center specialists answering agent calls",
          },
          {
            title: "Automated Appointment Scheduling Integration",
            subtitle:
              "Schedule property showings, buyer consultations, listing appointments, and follow-up meetings directly into your calendar system. Eliminate phone tag and capture more appointments while you focus on closings.",
            image:
              "https://images.pexels.com/photos/7841471/pexels-photo-7841471.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Real estate appointment scheduling calendar integration",
          },
          {
            title: "Real Estate CRM Integration & Lead Management",
            subtitle:
              "Seamlessly sync every call, contact detail, property inquiry, and buyer information into your existing real estate CRM platform. Automatic lead capture ensures no opportunity falls through the cracks in your sales pipeline.",
            image:
              "https://images.pexels.com/photos/6775240/pexels-photo-6775240.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Real estate CRM integration for lead management",
          },
          {
            title: "Intelligent Call Screening & Prioritization",
            subtitle:
              "Smart call routing identifies hot buyer leads and motivated sellers requiring immediate attention versus routine inquiries. Urgent property matters reach you instantly while general questions are professionally managed and scheduled appropriately.",
            image:
              "https://images.pexels.com/photos/7821683/pexels-photo-7821683.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Call prioritization system for real estate agents",
          },
          {
            title: "Professional Brand Representation",
            subtitle:
              "Enhance your real estate business image with consistent, professional call handling that reflects your premium service quality. Every caller experiences your brand excellence, building trust and credibility from first contact.",
            image:
              "https://images.pexels.com/photos/5668838/pexels-photo-5668838.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Professional real estate brand answering service",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Choose Our Real Estate Answering Service"
        pageInfoTitle="Transform Your Property Business with Professional Call Handling That Captures Every Lead"
        subtitle="In competitive real estate markets where timing determines success, professional answering services ensure zero missed opportunities and maximum lead conversion."
        pageInfoText="Missing phone calls costs real estate agents thousands in lost commissions every month. When potential buyers discover their dream home or sellers decide to list their property, they contact multiple agents immediately. The agent who responds first professionally wins the business.\n\nOur specialized real estate answering service captures 100% of incoming calls with live, trained representatives who understand property terminology, listing details, buyer qualifications, and seller motivations. We schedule showings, answer property questions, and create exceptional first impressions that convert inquiries into signed contracts.\n\nWhile competitors send callers to voicemail, your business provides immediate professional service that protects your marketing investment, enhances your reputation, and ensures every lead opportunity receives the attention required to close more deals and grow your real estate business consistently."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Real Estate Answering Service Benefits"
        heading="How Professional Call Services Increase Your Real Estate Revenue"
        subheading="Proven advantages that boost lead conversion, protect commissions, and grow your property business"
        cards={[
          {
            icon: Zap,
            text: "Instant lead response times increase conversion rates by up to 391%. Real estate leads contacted within 5 minutes are 21 times more likely to convert than leads contacted after 30 minutes.",
            id: "faster-response",
          },
          {
            icon: TrendingUp,
            text: "Revenue protection through guaranteed lead capture. One additional closing from never missing a buyer or seller call typically pays for an entire year of answering service investment with substantial profit remaining.",
            id: "revenue-protection",
          },
          {
            icon: Shield,
            text: "Professional brand image that differentiates you from competitors. Buyers and sellers reaching live real estate specialists instead of voicemail perceive higher expertise, better service, and premium value worth your commission.",
            id: "professional-image",
          },
          {
            icon: Clock,
            text: "24/7 availability captures evening and weekend leads when 70% of property inquiries occur. Dominate your market by answering calls when competitors are unavailable during peak buyer and seller research times.",
            id: "availability",
          },
          {
            icon: Phone,
            text: "Work-life balance without sacrificing business growth. Attend showings, closings, family events, and vacations confidently knowing every call receives professional handling and urgent matters reach you immediately when needed.",
            id: "work-life-balance",
          },
          {
            icon: Calendar,
            text: "Operational efficiency saves 10-15 hours weekly. Eliminate phone tag, routine scheduling, and basic information calls while focusing your valuable time on high-commission activities like negotiations, closings, and client relationships.",
            id: "efficiency",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Our Real Estate Answering Service Works"
        sectionHeading="Quick Setup Process, Immediate Lead Capture Results"
        subheading="Start capturing every real estate call professionally within 24-48 hours"
        items={[
          {
            title: "Select Your Real Estate Call Handling Plan",
            subtext:
              "Choose service features matching your business needs including call volume, coverage hours, appointment scheduling capabilities, and CRM integration requirements. Configure custom call routing rules for buyers, sellers, and existing clients based on your priorities.",
            image:
              "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Real estate answering service plan selection",
            useConversation: true,
            customerMessage:
              "I'm a solo agent doing about 15-20 deals a year. I need help capturing leads while I'm showing properties. Can you handle that?",
            aiResponse:
              "Absolutely! Our Starter plan is perfect for solo agents. We'll answer all your calls while you're busy with showings, qualify leads, schedule appointments, and forward hot prospects to you immediately. You'll never miss a buyer or seller inquiry again!",
          },
          {
            title: "Customize Your Real Estate Call Scripts",
            subtext:
              "Collaborate with our team to develop custom call handling scripts reflecting your unique brand voice, current property listings, service area coverage, showing procedures, and preferred buyer qualification questions ensuring consistent professional representation.",
            image:
              "https://images.pexels.com/photos/7841464/pexels-photo-7841464.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Custom real estate call scripts and protocols",
            useConversation: true,
            customerMessage:
              "Can your team learn about my current listings and answer basic questions like square footage, school districts, and pricing?",
            aiResponse:
              "Yes! We'll learn all your listing details including square footage, schools, neighborhoods, pricing, and key features. We can answer buyer questions professionally and schedule showings while you're with other clients. We'll represent your brand perfectly!",
          },
          {
            title: "Integrate Your Real Estate Technology Stack",
            subtext:
              "Seamlessly connect with your existing real estate CRM, calendar platforms, email systems, and communication tools. Automated data sync ensures showing appointments, buyer leads, seller inquiries, and contact information flow directly into your workflow without manual entry.",
            image:
              "https://images.pexels.com/photos/7841471/pexels-photo-7841471.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Real estate CRM and calendar integration",
            useConversation: true,
            customerMessage:
              "I use Follow Up Boss for my CRM and Google Calendar. Will the appointments sync automatically?",
            aiResponse:
              "Perfect! We integrate directly with Follow Up Boss and Google Calendar. Every lead we capture goes straight into Follow Up Boss with full details, and showing appointments appear instantly in your Google Calendar. Zero manual entry required!",
          },
          {
            title: "Launch and Optimize Your Lead Capture System",
            subtext:
              "Your real estate answering service activates immediately, capturing every incoming call professionally. Review detailed call analytics, lead quality metrics, and conversion data to continuously refine scripts, optimize marketing strategies, and maximize your return on investment.",
            image:
              "https://images.pexels.com/photos/5668838/pexels-photo-5668838.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Real estate lead capture analytics and optimization",
            useConversation: true,
            customerMessage:
              "How do I know if this is actually helping me close more deals? Can I see what calls I'm getting?",
            aiResponse:
              "You'll have a full dashboard showing every call, lead quality scores, scheduled showings, and conversion metrics. You'll see exactly how many leads we captured that you would have missed, plus recordings and transcripts of every conversation!",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Real Estate Answering Service FAQ"
        heading="Common Questions About Professional Call Services for Realtors"
        faqs={[
          {
            question:
              "How quickly can my real estate answering service be activated?",
            answer:
              "Most real estate agents have their professional answering service fully operational within 24 hours for standard setups. Basic call handling can begin within hours, while complete CRM integration and custom script development typically requires 1 business day depending on your specific technology requirements and customization needs.",
            id: "setup-time",
          },
          {
            question: "What does a real estate answering service cost?",
            answer:
              "At Dailzero, we offer extremely affordable and scalable pricing designed to fit your business needs. Our Starter plan begins at just $20/month, the Business plan at $45/month, and the Enterprise plan at $120/month. Pricing depends on your business’s call volume and specific feature requirements, ensuring you only pay for what you need while getting maximum value and performance.",
            id: "cost",
          },
          {
            question:
              "Are answering service representatives trained in real estate terminology?",
            answer:
              "Yes, absolutely. Our real estate answering service specialists receive comprehensive training in property terminology, MLS systems, buyer qualification processes, listing presentation basics, showing protocols, and transaction terminology. They understand differences between buyer's agents and listing agents, can discuss property features professionally, and handle real estate conversations with industry expertise.",
            id: "training",
          },
          {
            question: "How do I receive updates about calls and leads?",
            answer:
              "Our real estate answering service provides multiple notification options customized to your preferences. Urgent buyer leads and hot seller inquiries can transfer to you immediately. Routine inquiries deliver via instant text message, email summaries, or scheduled reports. Your dashboard provides real-time access to all call recordings, transcripts, lead details, and appointment confirmations.",
            id: "updates",
          },
          {
            question:
              "What happens with complex real estate situations or difficult caller questions?",
            answer:
              "Our answering service follows clear escalation protocols for complex scenarios. Questions requiring specific listing details, pricing negotiations, contract terms, or legal matters transfer directly to you or capture comprehensive information for immediate callback. The goal is professional triage ensuring appropriate handling based on urgency, complexity, and your availability preferences.",
            id: "complex-situations",
          },
          {
            question:
              "Does the answering service integrate with my existing real estate CRM and tools?",
            answer:
              "Yes. Our real estate answering service integrates seamlessly with popular CRM platforms including Follow Up Boss, LionDesk, kvCORE, BoomTown, Contactually, and others. We also connect with Google Calendar, Microsoft Outlook, Calendly, and major email systems. This integration eliminates duplicate data entry and ensures every lead, appointment, and call detail synchronizes automatically with your existing workflow.",
            id: "integration",
          },
        ]}
      />

      {/* CTA Section */}
      <SectionCTA />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
