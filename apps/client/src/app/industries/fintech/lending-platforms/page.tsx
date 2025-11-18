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

export default function LendingPlatformsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="Digital Lending Answering Service"
        titleHighlight="24/7 Support for Loan Platforms"
        subtitle="24/7 answering service for digital lending platforms, P2P lending, microfinance apps, and loan origination systems. Expert support for loan applications, underwriting questions, repayment inquiries, and borrower onboarding. Increase loan conversions by 40% with instant phone assistance."
        primaryButtonText="Start Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/6863332/pexels-photo-6863332.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Digital lending customer service providing loan application support and underwriting assistance"
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, I submitted my loan application yesterday and uploaded all the documents. When will I hear back about approval? I need the funds by Friday for my business."
        aiResponse="I understand the urgency. Let me check your application status right away. I can see your documents were received and are currently under review by our underwriting team. Based on your application type, you should receive a decision within 24-48 hours. I'll note the Friday deadline and can have someone follow up with you by tomorrow afternoon."
      />

      {/* Features Section */}
      <SectionContent
        title="Digital Lending Answering Service Features"
        contentTitle="Expert Call Support for Loan Platforms & Lending Apps"
        contentTitleSubtext="Specialized support for loan applications, underwriting, repayment management, and borrower communication. Built for P2P lending, microfinance, and digital loan origination."
        cards={[
          {
            title: "24/7 Loan Application Support",
            subtitle:
              "Handle loan inquiries, application guidance, document submission help, and eligibility questions. Pre-qualify borrowers, capture complete application data, and reduce abandonment rates by 50% with instant phone support.",
            image:
              "https://images.pexels.com/photos/6863515/pexels-photo-6863515.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "24/7 loan application support for digital lending platforms and P2P lending",
          },
          {
            title: "Underwriting & Approval Status",
            subtitle:
              "Provide application status updates, explain underwriting requirements, request additional documentation, and clarify approval conditions. Keep borrowers informed throughout the decisioning process to maintain trust and engagement.",
            image:
              "https://images.pexels.com/photos/7821513/pexels-photo-7821513.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Loan underwriting support and application status updates for lending platforms",
          },
          {
            title: "Loan Terms & Rate Explanations",
            subtitle:
              "Explain interest rates, APR calculations, repayment schedules, loan terms, fees, and payment options. Handle rate comparison questions, refinancing inquiries, and help borrowers understand total cost of borrowing.",
            image:
              "https://images.pexels.com/photos/6863248/pexels-photo-6863248.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Loan terms and interest rate explanation support for digital lending",
          },
          {
            title: "Repayment & Collections Support",
            subtitle:
              "Handle payment questions, schedule modifications, grace period requests, late payment concerns, and default prevention. Professional collections communication that maintains borrower relationships and improves recovery rates.",
            image:
              "https://images.pexels.com/photos/6863117/pexels-photo-6863117.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Loan repayment support and collections assistance for lending platforms",
          },
          {
            title: "Document Verification & Compliance",
            subtitle:
              "Guide borrowers through document upload, income verification, identity confirmation, and compliance requirements. Ensure KYC/AML adherence, credit check authorization, and regulatory disclosure compliance for all loan applications.",
            image:
              "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Loan document verification and compliance support for digital lending platforms",
          },
          {
            title: "Lending Platform Integration",
            subtitle:
              "Connect with loan origination systems (LOS), credit bureaus, banking APIs, and CRM platforms. Integrate with Salesforce, Plaid, Blend, Encompass, and other lending infrastructure for real-time application data access.",
            image:
              "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Lending platform integration with loan origination systems and APIs",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Lending Platforms Choose Professional Answering Services"
        pageInfoTitle="Increase Loan Conversions by 40% & Reduce Application Abandonment"
        subtitle="Digital lending platforms use answering services to capture borrowers during high-intent moments, accelerate loan processing, and improve borrower satisfaction."
        pageInfoText="Lending platforms lose 50-70% of loan applicants when phone support is unavailable during the application process. Borrowers have urgent financial needs—when they can't reach someone to answer questions about eligibility, rates, or documentation, they immediately apply with competitors.\n\n24/7 lending answering services provide specialists trained in loan products, underwriting requirements, credit criteria, and compliance regulations. We handle application questions, document guidance, status updates, and repayment inquiries following TILA, ECOA, FCRA, and state lending regulations.\n\nWhile your underwriting team evaluates applications, we manage borrower communications, reduce call-backs, and prevent application abandonment. Lending platforms report 40% higher conversion rates, 30% faster funding times, and 60% lower support costs with professional phone coverage."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Digital Lending Answering Service Benefits"
        heading="Convert More Borrowers & Accelerate Loan Origination"
        subheading="Proven results: higher conversions, faster funding, lower costs, better borrower experience"
        cards={[
          {
            icon: TrendingUp,
            text: "40-50% increase in loan conversion rates. Borrowers are 3x more likely to complete applications when they receive instant phone support for questions about eligibility, documentation, or loan terms during the application process.",
            id: "conversion-increase",
          },
          {
            icon: Shield,
            text: "Full lending compliance with TILA, ECOA, FCRA, and state regulations. Specialists trained in fair lending practices, disclosure requirements, and regulatory communication standards. All calls recorded for compliance audits.",
            id: "lending-compliance",
          },
          {
            icon: Clock,
            text: "30-40% faster loan funding. Proactive outreach for missing documents, quick answers to underwriting questions, and real-time status updates accelerate the borrower journey from application to funding.",
            id: "faster-funding",
          },
          {
            icon: Globe,
            text: "24/7 availability matches borrower schedules. Most people research loans in evenings and weekends. Capture applications outside business hours when borrower intent and urgency are highest.",
            id: "247-availability",
          },
          {
            icon: CheckCircle,
            text: "50% reduction in application abandonment. Immediate answers to eligibility questions, documentation guidance, and application assistance prevent drop-offs during the loan application funnel.",
            id: "abandonment-reduction",
          },
          {
            icon: Users,
            text: "60% lower support costs versus in-house teams. No hiring loan officers for phone support, training costs, or managing support staff. Scale support volume with loan origination growth seamlessly.",
            id: "cost-reduction",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Digital Lending Answering Services Work"
        sectionHeading="Launch Loan Application Support in 48-72 Hours"
        subheading="Fast implementation with lending-trained specialists ready to support your borrowers"
        items={[
          {
            title: "Loan Product & Criteria Training",
            subtext:
              "Train specialists on your loan products, interest rates, eligibility criteria, credit score requirements, income documentation, and application process. Master your underwriting guidelines for accurate pre-qualification.",
            image:
              "https://images.pexels.com/photos/6863248/pexels-photo-6863248.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Loan product training for lending platform support specialists",
            useConversation: true,
            customerMessage:
              "We offer personal loans, business loans, and lines of credit with different rate structures and requirements. Can your team handle questions about all three products?",
            aiResponse:
              "Absolutely! We'll train specialists on each loan product's specific rates, terms, eligibility requirements, and documentation needs. They'll be able to help borrowers choose the right product, pre-qualify them, and guide them through the correct application path for their situation.",
          },
          {
            title: "LOS & CRM Integration",
            subtext:
              "Connect with your loan origination system (LOS), credit bureaus, banking APIs, and CRM. Access application status, required documents, underwriting decisions, and borrower information in real-time for informed support.",
            image:
              "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Loan origination system integration for lending platforms",
            useConversation: true,
            customerMessage:
              "We use Blend for loan origination and Salesforce for CRM. Can you integrate with both to access application data?",
            aiResponse:
              "Yes! We integrate with Blend, Salesforce, Encompass, and most major LOS platforms. With proper API access, we can check application status, see required documents, view underwriting notes, and update borrower records in real-time during support calls.",
          },
          {
            title: "Compliance & Script Development",
            subtext:
              "Develop compliant call scripts following TILA disclosure requirements, ECOA fair lending rules, and state lending regulations. Ensure all borrower communications meet regulatory standards and maintain audit trails.",
            image:
              "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Lending compliance and regulatory script development",
            useConversation: true,
            customerMessage:
              "How do you ensure compliance with fair lending laws and TILA requirements during phone calls?",
            aiResponse:
              "We develop pre-approved scripts that include required TILA disclosures, fair lending language, and regulatory warnings. All specialists are trained on ECOA, FCRA, and state lending regulations. Every call is recorded for compliance review and audit purposes.",
          },
          {
            title: "Launch & Performance Monitoring",
            subtext:
              "Go live with lending support. Track conversion rates, application completion, document submission rates, and borrower satisfaction. Optimize scripts based on common questions, approval patterns, and funding metrics.",
            image:
              "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Lending platform performance analytics and optimization",
            useConversation: true,
            customerMessage:
              "How do you measure if the answering service is actually improving our loan conversions?",
            aiResponse:
              "We track key lending metrics: application completion rates, time-to-funding, document submission speed, borrower NPS, and most importantly—conversion from inquiry to funded loan. You'll see exactly how many applications were saved from abandonment through phone support intervention.",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Digital Lending Answering Service FAQ"
        heading="Common Questions About Professional Call Support for Loan Platforms & Lending Apps"
        faqs={[
          {
            question:
              "Can your team handle different loan types like personal loans, business loans, and mortgages?",
            answer:
              "Yes. Our specialists receive comprehensive training on various loan products including personal loans, business loans, student loans, auto loans, home equity lines, and even mortgages. We learn your specific products' rates, terms, eligibility criteria, and documentation requirements to provide accurate guidance for each loan type your platform offers.",
            id: "loan-types",
          },
          {
            question:
              "How do you ensure compliance with lending regulations like TILA, ECOA, and FCRA?",
            answer:
              "Compliance is critical in lending. Our specialists are trained on Truth in Lending Act (TILA) disclosure requirements, Equal Credit Opportunity Act (ECOA) fair lending practices, Fair Credit Reporting Act (FCRA) credit pull authorization, and state-specific lending regulations. All scripts are pre-approved by compliance, and every call is recorded for regulatory audit purposes.",
            id: "lending-compliance",
          },
          {
            question:
              "Can you help reduce loan application abandonment rates?",
            answer:
              "Absolutely. 50-70% of borrowers abandon loan applications when they can't get immediate answers to questions. We provide instant phone support during the application process to answer eligibility questions, explain documentation requirements, clarify terms, and guide borrowers through each step—reducing abandonment by 50% and increasing funded loans significantly.",
            id: "abandonment-reduction",
          },
          {
            question:
              "Do you integrate with loan origination systems (LOS) and credit bureaus?",
            answer:
              "Yes. We integrate with major LOS platforms including Blend, Encompass, Ellie Mae, nCino, and others. We can also connect with banking APIs (Plaid), credit bureaus, and CRM systems (Salesforce, HubSpot). This lets us access application status, required documents, credit decisions, and borrower data in real-time during support calls.",
            id: "los-integration",
          },
          {
            question:
              "How do you handle sensitive financial information securely?",
            answer:
              "Security is paramount in lending. We're SOC 2 certified and maintain strict data protection protocols. Specialists are trained never to request or store sensitive information like full SSNs, bank account passwords, or credit card details. We use secure verification methods and all systems are encrypted with complete audit logging for compliance.",
            id: "data-security",
          },
          {
            question:
              "Can you help with collections and late payment communications?",
            answer:
              "Yes. We provide professional collections support following FDCPA regulations for consumer lending. Our approach balances firm but respectful communication—reminding borrowers of payments, explaining consequences, offering payment plan options, and escalating to your collections team when needed. We focus on maintaining borrower relationships while improving recovery rates.",
            id: "collections-support",
          },
          {
            question:
              "How quickly can lending answering service be implemented?",
            answer:
              "Most lending platforms launch answering service within 48-72 hours. Basic loan inquiry and application support can begin within 2 days. Comprehensive product training, LOS integration, compliance script approval, and underwriting criteria mastery typically requires 3-5 days depending on your loan product complexity and compliance requirements.",
            id: "implementation-speed",
          },
          {
            question:
              "What does digital lending answering service cost?",
            answer:
              "At Dailzero, our lending answering service offers flexible pricing. Starter plan begins at $20/month, Business plan at $45/month, and Enterprise plan at $120/month with compliance features. This is significantly cheaper than hiring loan officers for phone support at $20-$35/hour ($3,500-$6,000/month per employee) while providing 24/7 coverage and scaling with your origination volume.",
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
