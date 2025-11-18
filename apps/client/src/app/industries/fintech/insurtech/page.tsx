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
import {
  Shield,
  Clock,
  Globe,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";

export default function InsurtechPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="Insurtech Answering Service"
        titleHighlight="24/7 Support for Digital Insurance"
        subtitle="24/7 answering service for insurtech companies, digital insurance platforms, and online insurance providers. Expert support for policy inquiries, claims filing, quote requests, and coverage questions. Increase policy conversions by 35% with instant insurance guidance."
        primaryButtonText="Start Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Insurtech customer service for digital insurance platforms and online insurance providers"
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, I was in a minor car accident yesterday and need to file a claim. It wasn't my fault but I'm not sure what information you need. Can you help me get started?"
        aiResponse="I'm sorry to hear about the accident, and I'm here to help. I can absolutely guide you through the claims process. First, is everyone okay? Good. I'll need some basic information: the date, time, and location of the accident, the other driver's information, any police report number, and photos if you have them. Let me walk you through each step and we'll get your claim filed today."
      />

      {/* Features Section */}
      <SectionContent
        title="Insurtech Answering Service Features"
        contentTitle="Expert Support for Digital Insurance & Insurtech Platforms"
        contentTitleSubtext="Specialized support for policy sales, claims processing, coverage questions, and quote requests. Built for digital-first insurance companies and insurtech platforms."
        cards={[
          {
            title: "24/7 Policy & Coverage Support",
            subtitle:
              "Handle policy inquiries, coverage explanations, premium questions, renewal assistance, and policy modification requests. Help customers understand their coverage, deductibles, limits, and exclusions clearly.",
            image:
              "https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "24/7 insurance policy and coverage support for insurtech platforms",
          },
          {
            title: "Claims Filing & Processing",
            subtitle:
              "Guide customers through claims filing, collect required documentation, explain claims process, provide claim status updates, and answer settlement questions. Reduce claims abandonment and accelerate processing with expert assistance.",
            image:
              "https://images.pexels.com/photos/6863117/pexels-photo-6863117.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Insurance claims filing and processing support for digital insurance",
          },
          {
            title: "Quote Generation & Sales Support",
            subtitle:
              "Assist with online quote requests, explain pricing factors, help with application completion, clarify coverage options, and handle underwriting questions. Convert quote requests into policies with instant phone support.",
            image:
              "https://images.pexels.com/photos/7821513/pexels-photo-7821513.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Insurance quote and sales support for insurtech companies",
          },
          {
            title: "Renewal & Retention Support",
            subtitle:
              "Handle renewal questions, explain rate changes, assist with policy updates, process endorsements, and prevent cancellations. Professional retention communication that reduces lapse rates and improves customer lifetime value.",
            image:
              "https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Insurance renewal and retention support for digital insurance platforms",
          },
          {
            title: "Multi-Line Insurance Expertise",
            subtitle:
              "Support various insurance products including auto insurance, home insurance, renters insurance, life insurance, health insurance, pet insurance, and specialty coverage. Specialists trained in each product line's specifics.",
            image:
              "https://images.pexels.com/photos/6863248/pexels-photo-6863248.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Multi-line insurance product support for insurtech platforms",
          },
          {
            title: "Insurance Platform Integration",
            subtitle:
              "Connect with policy management systems, claims platforms, quote engines, and CRM systems. Integrate with Guidewire, Duck Creek, Applied Epic, and other insurtech infrastructure for real-time policy and claims data access.",
            image:
              "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Insurtech platform integration and policy system connectivity",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Insurtech Companies Choose Professional Answering Services"
        pageInfoTitle="Increase Policy Conversions by 35% & Reduce Claims Abandonment"
        subtitle="Insurtech platforms use answering services to convert quotes into policies, provide immediate claims support, and deliver premium customer experience that drives retention."
        pageInfoText="Insurance buyers need immediate answers when comparing quotes, filing claims, or understanding coverage. When they can't reach support, they buy from competitors who answer calls quickly—digital insurance loses quote conversions to traditional carriers with robust call centers.\n\n24/7 insurance answering services provide specialists trained in insurance products, claims procedures, underwriting guidelines, and regulatory requirements. We handle policy questions, claims assistance, quote support, and renewal inquiries following state insurance regulations and carrier guidelines.\n\nWhile your underwriting and claims teams assess risk and process claims, we manage customer communications and prevent quote abandonment. Insurtech companies report 35% higher quote-to-policy conversion, 40% faster claims processing, and 50% lower support costs with professional coverage."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Insurtech Answering Service Benefits"
        heading="Convert More Policies & Accelerate Claims Processing"
        subheading="Proven results: higher conversions, faster claims, better retention, lower costs"
        cards={[
          {
            icon: TrendingUp,
            text: "35-45% increase in quote-to-policy conversion. Insurance shoppers compare multiple carriers—those who receive instant phone support explaining coverage and answering questions are 3x more likely to purchase.",
            id: "conversion-increase",
          },
          {
            icon: Shield,
            text: "Insurance regulatory compliance expertise. Specialists trained in state insurance regulations, disclosure requirements, claims handling standards, and fair claims practices. All communication follows DOI guidelines and carrier protocols.",
            id: "insurance-compliance",
          },
          {
            icon: Clock,
            text: "40-50% faster claims processing. Immediate claims intake, real-time document collection, and proactive status updates accelerate claims resolution and improve customer satisfaction during stressful claim events.",
            id: "faster-claims",
          },
          {
            icon: Globe,
            text: "24/7 availability for urgent claims. Accidents, natural disasters, and emergencies happen anytime. Provide immediate claims support when customers need help most, building trust and loyalty during critical moments.",
            id: "urgent-claims-support",
          },
          {
            icon: CheckCircle,
            text: "30-40% reduction in policy lapse rates. Professional renewal communication, proactive outreach, and helpful policy update assistance keep customers engaged and reduces cancellations.",
            id: "lapse-reduction",
          },
          {
            icon: Users,
            text: "50-60% lower support costs versus in-house teams. No hiring licensed agents, training on complex insurance products, or managing 24/7 operations. Scale support with policy growth seamlessly.",
            id: "cost-savings",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Insurtech Answering Services Work"
        sectionHeading="Launch Insurance Support in 72 Hours"
        subheading="Fast implementation with insurance-trained specialists ready to support your policyholders"
        items={[
          {
            title: "Insurance Product & Coverage Training",
            subtext:
              "Train specialists on your insurance products, coverage options, policy limits, deductibles, exclusions, and pricing structures. Master underwriting guidelines, claims procedures, and state-specific regulations.",
            image:
              "https://images.pexels.com/photos/6863248/pexels-photo-6863248.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Insurance product training for insurtech support specialists",
            useConversation: true,
            customerMessage:
              "We offer auto, home, renters, and pet insurance with different coverage levels. Can your team explain the differences and help customers choose?",
            aiResponse:
              "Absolutely! We'll train specialists on each insurance product you offer including coverage options, exclusions, deductibles, and pricing. They can explain auto liability vs collision, home dwelling vs personal property, and help customers understand which coverage levels fit their needs.",
          },
          {
            title: "Policy & Claims System Integration",
            subtext:
              "Connect with your policy administration system, claims platform, quote engine, and CRM. Access policy details, claims status, coverage information, and customer data for real-time support.",
            image:
              "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Insurance platform integration and policy system connectivity",
            useConversation: true,
            customerMessage:
              "We use Guidewire for claims management and our proprietary system for policies. Can you integrate with both?",
            aiResponse:
              "Yes! We integrate with Guidewire, Duck Creek, Applied Epic, and custom insurance platforms. With API access, we can check policy status, view coverage details, monitor claims progress, and update customer records in real-time during support calls.",
          },
          {
            title: "Claims & Regulatory Compliance Protocols",
            subtext:
              "Develop scripts for claims filing following state insurance department guidelines and fair claims handling practices. Ensure all communication meets disclosure requirements and maintains proper documentation for regulatory compliance.",
            image:
              "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Insurance compliance and claims procedures training",
            useConversation: true,
            customerMessage:
              "How do you ensure specialists follow proper claims procedures and state insurance regulations?",
            aiResponse:
              "We train specialists on state-specific insurance regulations, claims handling standards, disclosure requirements, and fair claims practices. They'll follow pre-approved scripts that include required language, proper documentation collection, and escalation protocols. All calls are recorded for compliance review.",
          },
          {
            title: "Launch & Performance Optimization",
            subtext:
              "Go live with insurance support. Monitor quote conversion rates, claims processing speed, policy retention, and customer satisfaction. Optimize based on common questions, coverage gaps, and seasonal insurance trends.",
            image:
              "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Insurtech performance analytics and optimization",
            useConversation: true,
            customerMessage:
              "How do you measure if support is actually improving our conversion rates and policy retention?",
            aiResponse:
              "We track key insurance metrics: quote-to-policy conversion, claims processing time, policy renewal rates, customer NPS, first-call resolution, and support cost per policy. You'll see exactly how professional support impacts your loss ratio and customer lifetime value.",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Insurtech Answering Service FAQ"
        heading="Common Questions About Professional Call Support for Digital Insurance & Insurtech Platforms"
        faqs={[
          {
            question:
              "Can your team handle different types of insurance like auto, home, life, and pet?",
            answer:
              "Yes. Our specialists receive comprehensive training on various insurance products including auto insurance, homeowners insurance, renters insurance, life insurance, health insurance, pet insurance, and specialty coverage. We learn each product's coverage options, exclusions, pricing factors, and underwriting requirements to provide accurate support.",
            id: "insurance-types",
          },
          {
            question:
              "How do you handle urgent claims like car accidents or home damage?",
            answer:
              "Claims require immediate, empathetic support. Our specialists are trained in first notice of loss (FNOL) procedures, collecting necessary claim information (what, when, where, who, how), coordinating emergency services when needed, and providing next-steps clarity. We can initiate claims 24/7 and ensure policyholders feel supported during stressful situations.",
            id: "urgent-claims",
          },
          {
            question:
              "Do you understand insurance regulations and compliance requirements?",
            answer:
              "Absolutely. Specialists are trained in state insurance department regulations, fair claims handling practices, disclosure requirements, unfair trade practices, and insurance-specific communication standards. All scripts include required disclosures and follow state DOI guidelines. Calls are recorded for compliance monitoring and regulatory audit purposes.",
            id: "insurance-compliance",
          },
          {
            question:
              "Can you help convert quotes into policies by answering coverage questions?",
            answer:
              "Yes. Insurance shoppers have questions about coverage limits, deductibles, exclusions, and pricing before purchasing. Instant phone support that clearly explains options, compares coverage levels, and addresses concerns increases quote-to-policy conversion by 35-45%. We help customers make informed decisions that fit their needs and budget.",
            id: "quote-conversion",
          },
          {
            question:
              "How do you prevent policy cancellations and improve retention?",
            answer:
              "Retention starts with great service. We handle renewal questions professionally, explain rate changes clearly, assist with policy updates promptly, and provide empathetic support during claims. When customers consider canceling, we can discuss concerns, explore coverage adjustments, and escalate to retention specialists—reducing lapse rates by 30-40%.",
            id: "retention-support",
          },
          {
            question:
              "Can you access our policy management system to check coverage and claims status?",
            answer:
              "Yes. With proper system access, we can view policy details, check coverage limits, verify effective dates, review claims status, monitor payment history, and access customer information in real-time. This enables immediate, informed support without policyholders waiting for callbacks or system lookups.",
            id: "system-access",
          },
          {
            question:
              "How quickly can insurtech answering service be implemented?",
            answer:
              "Most insurtech companies launch answering service within 72 hours to 1 week. Basic policy and claims support can begin within 3-4 days. Comprehensive product training, claims procedures, system integration, and regulatory compliance implementation typically requires 5-7 days depending on your product complexity and state licensing requirements.",
            id: "implementation-speed",
          },
          {
            question:
              "What does insurtech answering service cost?",
            answer:
              "At Dailzero, our insurtech answering service offers flexible pricing. Starter plan begins at $20/month, Business plan at $45/month, and Enterprise plan at $120/month with compliance features. This is massively cheaper than hiring licensed insurance agents at $20-$35/hour ($3,500-$6,000/month per employee) while providing 24/7 policyholder support and scaling with your book of business.",
            id: "pricing",
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
