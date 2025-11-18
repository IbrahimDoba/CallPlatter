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

export default function DigitalBankingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="Digital Banking Answering Service"
        titleHighlight="24/7 Compliant Customer Support for Neobanks"
        subtitle="24/7 secure answering service for digital banks, neobanks, and mobile banking apps. Expert KYC verification support, account activation, transaction disputes, and compliant customer onboarding. Reduce churn by 35-45% with instant phone support."
        primaryButtonText="Start Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Fintech customer service representative providing secure phone support for digital banking and cryptocurrency platform"
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, I submitted my KYC documents three days ago but my account is still pending verification. Can you check the status? I need to make a transfer urgently."
        aiResponse="I understand the urgency. Let me check your account status immediately. I can see your KYC documents were received and are currently in final review. For security purposes, may I verify your account email and the last four digits of your registered phone number?"
      />

      {/* Features Section */}
      <SectionContent
        title="Digital Banking Answering Service Features"
        contentTitle="Secure Call Management for Digital Banks & Neobanks"
        contentTitleSubtext="Compliant, secure customer support for account verification, KYC processes, transaction inquiries, and regulatory requirements. Built specifically for digital-first financial institutions."
        cards={[
          {
            title: "24/7 Compliant Digital Banking Support",
            subtitle:
              "Round-the-clock secure call answering for account inquiries, transaction questions, verification requests, and security concerns. Global coverage across all time zones with immediate professional response when your team is unavailable.",
            image:
              "https://images.pexels.com/photos/6772076/pexels-photo-6772076.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "24/7 compliant digital banking customer support and secure call answering service for neobanks",
          },
          {
            title: "KYC & Account Verification Support",
            subtitle:
              "Expert KYC verification, identity confirmation, document guidance, and account activation support. Reduce abandonment rates by 60% and accelerate onboarding with compliant KYC/AML assistance following strict data privacy protocols.",
            image:
              "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "KYC verification and account onboarding support for digital banks and neobanks",
          },
          {
            title: "Card Activation & Payment Support",
            subtitle:
              "Handle debit card activation, virtual card setup, payment failures, transaction disputes, chargebacks, and account funding questions. Guide users through card controls, spending limits, and digital wallet integration.",
            image:
              "https://images.pexels.com/photos/6863332/pexels-photo-6863332.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Digital banking card activation and payment support for neobanks",
          },
          {
            title: "Account Security & Fraud Prevention",
            subtitle:
              "Handle security alerts, suspicious activity reports, account lockouts, password resets, and two-factor authentication issues. Trained specialists follow strict verification protocols to prevent fraud while providing quick resolution for legitimate users.",
            image:
              "https://images.pexels.com/photos/8369648/pexels-photo-8369648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Digital banking security and fraud prevention customer support",
          },
          {
            title: "Transaction Dispute Resolution",
            subtitle:
              "Manage transaction disputes, chargebacks, failed payments, refund requests, and merchant questions. Integrate with Plaid, Stripe, and banking cores to access transaction data and provide accurate status updates for quick resolution.",
            image:
              "https://images.pexels.com/photos/6963098/pexels-photo-6963098.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Digital banking transaction dispute resolution and payment support",
          },
          {
            title: "Banking Platform Integration",
            subtitle:
              "Seamless integration with Salesforce, Plaid, Stripe, Unit, Synapse, Mambu, and major banking-as-a-service platforms. Customer interactions, call recordings, and verification status sync automatically for complete audit trails and compliance.",
            image:
              "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Digital banking CRM integration and platform connectivity for neobanks",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Digital Banks Choose Professional Answering Services"
        pageInfoTitle="Reduce Churn by 35-45% & Accelerate Account Onboarding"
        subtitle="Neobanks and digital banks use professional answering services to scale customer support, maintain compliance, and prevent onboarding abandonment."
        pageInfoText="Digital banks lose 40-60% of potential customers during onboarding when phone support is unavailable. Trust is critical in banking—users abandon applications when they can't reach support for KYC issues or security concerns.\n\n24/7 answering services provide specialists trained in KYC/AML procedures, PCI-DSS compliance, and digital banking operations. We handle account verification, card activation, transaction disputes, and security issues following GDPR, CCPA, and financial regulations.\n\nWhile your team builds features, we manage customer communications, reduce support tickets, and accelerate verification. Digital banks report improved CSAT scores, higher activation rates, and 50-70% lower support costs versus in-house call centers."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Digital Banking Answering Service Benefits"
        heading="Reduce Churn & Accelerate Growth for Neobanks"
        subheading="Proven results: higher conversions, faster onboarding, lower costs, better compliance"
        cards={[
          {
            icon: TrendingUp,
            text: "CAC reduction of 35-50% by preventing onboarding abandonment. Digital banks lose $50K-$200K monthly when applicants abandon verification due to unavailable support. Immediate phone support converts high-intent users into active accounts.",
            id: "cac-reduction",
          },
          {
            icon: Shield,
            text: "Full compliance with KYC/AML, PCI-DSS, GDPR, and banking regulations. Specialists trained in security protocols, fraud prevention, and data privacy. All calls encrypted and audit-ready for regulatory compliance.",
            id: "compliance-security",
          },
          {
            icon: Clock,
            text: "60-75% faster account activation. Guides users through KYC verification, document submission, and account setup immediately versus waiting days for email support. Faster onboarding reduces early-stage churn.",
            id: "onboarding-acceleration",
          },
          {
            icon: Globe,
            text: "Global expansion with multilingual 24/7 support across all time zones. Serve customers in 40+ languages without establishing support offices in every market. Scale internationally instantly.",
            id: "global-expansion",
          },
          {
            icon: CheckCircle,
            text: "40-55% higher CSAT and NPS scores. Banking customers demand immediate support for account and transaction issues. Professional answering builds trust, prevents negative reviews, and generates referrals.",
            id: "satisfaction-improvement",
          },
          {
            icon: Users,
            text: "50-70% lower support costs versus in-house teams. No recruitment, payroll taxes, benefits, office space, or phone systems. Enterprise-quality support at startup-friendly pricing.",
            id: "cost-reduction",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Fintech Answering Services Work"
        sectionHeading="Simple Setup Process, Immediate Compliant Customer Support"
        subheading="Start providing professional fintech customer support within 48-72 hours with complete compliance, security protocols, and platform integration"
        items={[
          {
            title: "Select Your Fintech Support Plan & Compliance Level",
            subtext:
              "Choose service coverage matching your fintech company's needs including call volume capacity, hours of operation (business hours, extended hours, or 24/7/365 coverage), security requirements, compliance level (PCI-DSS, SOC 2, GDPR, HIPAA for health fintech), multilingual support, and integration complexity. Plans scale flexibly for early-stage startups through enterprise fintech platforms serving millions of users globally.",
            image:
              "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Fintech answering service plan selection and compliance setup",
            useConversation: true,
            customerMessage:
              "We're a digital lending platform that needs support for loan applications and account verification. Do you handle sensitive financial information securely?",
            aiResponse:
              "Absolutely. We're PCI-DSS compliant and SOC 2 certified, perfect for digital lending platforms. Our specialists are trained in secure handling of financial data, loan application processes, and KYC procedures. We can integrate with your lending platform and CRM. Would you like to start with our Business or Enterprise plan?",
          },
          {
            title: "Customize Financial Services Call Scripts & Protocols",
            subtext:
              "Work with our fintech specialists to develop custom call handling procedures reflecting your brand voice, product offerings, verification workflows, compliance requirements, escalation paths, and customer communication style. Specialists receive comprehensive training on your platform features, account types, product terminology, regulatory requirements, security protocols, and common customer scenarios ensuring authentic, knowledgeable representation that builds user trust.",
            image:
              "https://images.pexels.com/photos/7688465/pexels-photo-7688465.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Custom fintech call scripts and compliance protocol training",
            useConversation: true,
            customerMessage:
              "Our crypto platform has specific procedures for wallet security and two-factor authentication. Can your team handle technical questions about blockchain confirmations and gas fees?",
            aiResponse:
              "Yes! We'll train our specialists on your entire platform including wallet security, 2FA setup, blockchain confirmations, gas fees, staking, and all your crypto-specific features. They'll understand the technical aspects and can guide users through common issues or escalate complex technical problems to your engineering team appropriately.",
          },
          {
            title: "Integrate With Your Fintech Platform & CRM Systems",
            subtext:
              "Seamless connection to your existing technology stack including core banking platforms, CRM systems, customer data platforms, KYC/AML verification tools, payment processors, and communication software. Integration with Salesforce Financial Services Cloud, HubSpot, Zendesk, Plaid, Stripe, Unit, Synapse, Alloy, Persona, and other fintech infrastructure ensures customer interactions sync automatically, verification statuses update in real-time, and support tickets route correctly without manual data entry or system switching.",
            image:
              "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Fintech platform integration with banking systems and CRM",
            useConversation: true,
            customerMessage:
              "We use Plaid for account verification and Salesforce for our CRM. Will everything sync automatically?",
            aiResponse:
              "Perfect! We integrate seamlessly with both Plaid and Salesforce. When we assist with account verification, the status updates in your Plaid dashboard and all customer interactions log automatically in Salesforce with complete call notes and recordings. Zero manual work needed on your end!",
          },
          {
            title: "Launch Support & Continuous Optimization",
            subtext:
              "Your fintech answering service begins handling customer calls immediately with full compliance and security protocols active. Monitor real-time performance through comprehensive dashboards showing call volumes, resolution rates, customer satisfaction scores, verification completion rates, common inquiry types, and support quality metrics. Continuously refine scripts based on product updates, regulatory changes, customer feedback analytics, and seasonal patterns to maximize first-call resolution and customer satisfaction.",
            image:
              "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Fintech customer support analytics and performance monitoring",
            useConversation: true,
            customerMessage:
              "How can I track if the answering service is actually reducing our customer churn and improving onboarding completion?",
            aiResponse:
              "Excellent question! Your dashboard shows detailed metrics including calls handled, verification issues resolved, onboarding completion rates, customer satisfaction scores, average handle time, and first-call resolution rates. You'll see exactly how many customers we've helped activate versus historical abandonment rates. We also provide weekly reports with actionable insights.",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Fintech Answering Service FAQ"
        heading="Common Questions About Professional Call Services for Digital Banks, Neobanks, Cryptocurrency Platforms & Financial Technology Companies"
        faqs={[
          {
            question:
              "How quickly can fintech answering service be implemented for our digital banking platform?",
            answer:
              "Most fintech companies have professional answering service fully operational within 48-72 hours. Basic customer support and account inquiry handling can begin within 24 hours after call routing setup, while comprehensive platform training, CRM integration, compliance protocol implementation, and KYC workflow integration typically requires 2-3 business days depending on platform complexity, security requirements, and regulatory compliance level.",
            id: "implementation-timeline",
          },
          {
            question:
              "What does fintech answering service cost compared to building an in-house support team?",
            answer:
              "At Dailzero, our fintech answering service offers exceptional value with flexible pricing. Our Starter plan begins at just $20/month, Business plan at $45/month, and Enterprise plan at $120/month with compliance features. This represents massive savings compared to hiring support representatives at $18-$30/hour ($3,000-$5,000/month per employee) plus benefits, training, management, phone systems, and office space. Building 24/7 in-house coverage requires 15-20 employees minimum ($60,000-$100,000/month) while our service provides superior coverage, compliance, and multilingual support at a fraction of the cost.",
            id: "pricing-comparison",
          },
          {
            question:
              "Is the fintech answering service compliant with KYC, AML, PCI-DSS, GDPR, and financial regulations?",
            answer:
              "Absolutely. Our fintech answering service maintains strict compliance with all major financial services regulations including KYC/AML requirements, PCI-DSS Level 1 certification, GDPR data privacy, CCPA, SOC 2 Type II, and industry-specific regulations. All calls are encrypted, recorded for audit purposes, and handled by specialists trained in financial data protection, identity verification procedures, fraud prevention protocols, and regulatory requirements. We provide complete audit trails and compliance documentation as required.",
            id: "compliance-certifications",
          },
          {
            question:
              "Can answering service specialists handle technical questions about cryptocurrency, blockchain, DeFi, and complex fintech products?",
            answer:
              "Yes. Our fintech answering specialists receive comprehensive training on your specific products including cryptocurrency wallets, blockchain transactions, DeFi protocols, digital lending processes, payment processing, account verification systems, and all product features. They master technical terminology, common troubleshooting procedures, platform navigation, and security protocols to provide knowledgeable first-line support. Complex technical issues escalate to your engineering team through established protocols with complete context and customer information.",
            id: "technical-expertise",
          },
          {
            question:
              "How do you handle sensitive customer data and prevent fraud in fintech support calls?",
            answer:
              "Security and fraud prevention are core to our fintech answering service. Specialists follow strict authentication procedures including multi-factor verification, security question validation, and identity confirmation before discussing account details. We never request or store sensitive information like passwords, private keys, or complete account numbers. All conversations are encrypted, recorded, and monitored for suspicious activity. Specialists are trained to recognize and escalate potential fraud attempts, social engineering attacks, and suspicious requests immediately to your security team.",
            id: "data-security-fraud",
          },
          {
            question:
              "Does the service integrate with Plaid, Stripe, Salesforce Financial Services Cloud, and our core banking platform?",
            answer:
              "Yes. Our fintech answering service integrates with all major financial technology platforms including Plaid for account verification, Stripe for payment processing, Salesforce Financial Services Cloud, HubSpot, Zendesk, Unit, Synapse, Mambu, Thought Machine, and other core banking platforms. We also connect with KYC/AML verification providers like Alloy, Persona, Onfido, and Jumio. Integration ensures customer interactions, verification statuses, and support tickets sync automatically across all your systems with real-time data access and zero manual entry.",
            id: "platform-integrations",
          },
          {
            question:
              "Can you provide multilingual support for our global fintech user base?",
            answer:
              "Absolutely. Our fintech answering service provides multilingual support in 40+ languages including Spanish, Portuguese, French, German, Mandarin, Cantonese, Japanese, Korean, Arabic, Hindi, and others. Specialists are native speakers with financial services training who understand cultural nuances in financial communication. This enables fintech companies to expand globally and serve international markets with professional local-language support without establishing call centers in every country.",
            id: "multilingual-support",
          },
          {
            question:
              "What happens during high-volume periods like product launches, market volatility, or security incidents?",
            answer:
              "This is exactly when fintech answering services provide maximum value. During cryptocurrency market volatility, product launches, system outages, or security incidents, call volumes can spike 300-500% suddenly. Our service scales immediately to handle surge capacity without busy signals or long hold times. Customers receive immediate professional support that prevents panic, reduces support ticket backlog, maintains trust during critical periods, and allows your core team to focus on resolving technical issues rather than answering repetitive customer questions.",
            id: "high-volume-handling",
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
