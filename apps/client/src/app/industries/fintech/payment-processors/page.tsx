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

export default function PaymentProcessorsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="Payment Processing Answering Service"
        titleHighlight="24/7 Support for Payment Gateways"
        subtitle="24/7 answering service for payment processors, payment gateways, merchant services, and PSP platforms. Expert support for transaction disputes, chargeback inquiries, integration assistance, and merchant onboarding. Reduce chargeback losses by 35% with professional dispute resolution."
        primaryButtonText="Start Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/6963098/pexels-photo-6963098.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Payment processing customer service for payment gateways and merchant services"
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, we received a chargeback notification for a $2,500 transaction from last month. The customer claims they never received the product, but we have delivery confirmation. What do we do?"
        aiResponse="I can help you with this chargeback dispute. First, let me pull up the transaction details. Since you have delivery confirmation, that's strong evidence for your case. I'll guide you through submitting the representment with the required documentation—delivery tracking, customer signature, and transaction records. We'll need to respond within 7 days to preserve your rights."
      />

      {/* Features Section */}
      <SectionContent
        title="Payment Processing Answering Service Features"
        contentTitle="Expert Support for Payment Gateways & Merchant Services"
        contentTitleSubtext="Specialized support for transaction processing, dispute resolution, merchant onboarding, and payment integration. Built for PSPs, payment gateways, and merchant acquirers."
        cards={[
          {
            title: "24/7 Transaction Support",
            subtitle:
              "Handle payment processing questions, failed transaction troubleshooting, settlement inquiries, batch processing issues, and authorization declines. Reduce merchant confusion and prevent revenue loss from technical payment issues.",
            image:
              "https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "24/7 payment transaction support for payment processors and gateways",
          },
          {
            title: "Chargeback & Dispute Resolution",
            subtitle:
              "Expert chargeback management, representment guidance, dispute documentation assistance, and fraud claim support. Help merchants fight chargebacks effectively with proper evidence submission and deadline management.",
            image:
              "https://images.pexels.com/photos/6863117/pexels-photo-6863117.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Chargeback dispute resolution support for payment processors",
          },
          {
            title: "Merchant Onboarding Support",
            subtitle:
              "Guide new merchants through account setup, KYC verification, underwriting requirements, integration testing, and API documentation. Accelerate merchant activation with instant onboarding assistance.",
            image:
              "https://images.pexels.com/photos/7821513/pexels-photo-7821513.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Merchant onboarding and KYC support for payment service providers",
          },
          {
            title: "Integration & API Assistance",
            subtitle:
              "Technical support for payment API integration, SDK implementation, webhook configuration, test environment setup, and production cutover. Help developers troubleshoot integration issues and accelerate go-live timelines.",
            image:
              "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Payment API integration and developer support for payment gateways",
          },
          {
            title: "Compliance & Risk Management",
            subtitle:
              "Handle PCI-DSS compliance questions, fraud prevention inquiries, AML/KYC verification, and risk threshold explanations. Ensure merchants understand regulatory requirements and security best practices.",
            image:
              "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Payment compliance and risk management support for PSPs",
          },
          {
            title: "Payout & Settlement Support",
            subtitle:
              "Handle payout schedule questions, settlement timing inquiries, reserve account clarification, and bank account verification. Explain payment cycles, hold periods, and funds availability to reduce merchant anxiety.",
            image:
              "https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Payment settlement and payout support for merchant services",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Payment Processors Choose Professional Answering Services"
        pageInfoTitle="Reduce Chargebacks by 35% & Improve Merchant Retention"
        subtitle="Payment processors use answering services to provide instant merchant support, reduce chargeback losses, and scale customer service without massive support team expansion."
        pageInfoText="Payment processors lose merchants when support is slow during critical payment issues. A failed transaction, chargeback, or integration problem requires immediate answers—delays cost merchants money and erode trust in your platform.\n\n24/7 payment answering services provide specialists trained in payment processing, chargeback procedures, PCI-DSS compliance, and merchant services. We handle transaction questions, dispute guidance, API integration support, and compliance inquiries following card network rules and payment regulations.\n\nWhile your risk and engineering teams focus on platform stability and fraud prevention, we manage merchant communications and reduce support ticket escalations. Payment processors report 35% lower chargeback losses, 45% faster merchant onboarding, and 50% reduction in support costs with professional coverage."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Payment Processing Answering Service Benefits"
        heading="Reduce Chargebacks & Accelerate Merchant Growth"
        subheading="Proven results: lower chargeback losses, faster onboarding, higher retention, reduced costs"
        cards={[
          {
            icon: TrendingUp,
            text: "35-45% reduction in chargeback losses. Professional guidance on representment documentation, evidence submission, and dispute timelines helps merchants win more chargebacks and recover revenue.",
            id: "chargeback-reduction",
          },
          {
            icon: Shield,
            text: "PCI-DSS compliance and fraud prevention expertise. Specialists trained in payment security standards, tokenization, 3D Secure, fraud scoring, and risk management protocols. All support follows card network rules.",
            id: "compliance-security",
          },
          {
            icon: Clock,
            text: "45-60% faster merchant onboarding. Instant support for KYC questions, underwriting requirements, and integration assistance accelerates time-to-first-transaction and reduces activation abandonment.",
            id: "faster-onboarding",
          },
          {
            icon: Globe,
            text: "24/7 global merchant support. Payment issues happen around the clock—failed transactions, chargebacks, integration bugs. Provide instant answers when merchants need help most, regardless of time zone.",
            id: "global-support",
          },
          {
            icon: CheckCircle,
            text: "40% higher merchant retention rates. Professional support during payment crises, proactive chargeback assistance, and quick issue resolution build merchant loyalty and reduce platform switching.",
            id: "merchant-retention",
          },
          {
            icon: Users,
            text: "50-65% lower support costs versus in-house teams. No hiring payment specialists, training on card networks, or managing 24/7 support staff. Scale support with merchant growth seamlessly.",
            id: "cost-savings",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Payment Processing Answering Services Work"
        sectionHeading="Launch Merchant Support in 48-72 Hours"
        subheading="Fast implementation with payment-trained specialists ready to support your merchant base"
        items={[
          {
            title: "Payment Platform Training",
            subtext:
              "Train specialists on your payment gateway features, transaction flow, pricing structure, chargeback procedures, and API capabilities. Master merchant portal navigation, reporting tools, and common integration patterns.",
            image:
              "https://images.pexels.com/photos/6863248/pexels-photo-6863248.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Payment platform training for support specialists",
            useConversation: true,
            customerMessage:
              "We support multiple payment methods—cards, ACH, wallets, buy-now-pay-later. Can your team handle questions about all of them?",
            aiResponse:
              "Absolutely! We'll train specialists on each payment method you support including cards (Visa, Mastercard, Amex), ACH processing, digital wallets (Apple Pay, Google Pay), and BNPL integrations. They'll understand method-specific flows, fees, settlement times, and common issues.",
          },
          {
            title: "Merchant Portal & API Integration",
            subtext:
              "Connect with your merchant dashboard, payment API, and support platforms. Access transaction data, merchant accounts, chargeback systems, and integration documentation for real-time merchant assistance.",
            image:
              "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Payment API and merchant portal integration",
            useConversation: true,
            customerMessage:
              "Can you access our merchant portal to look up transactions and help merchants navigate their account?",
            aiResponse:
              "Yes! With proper credentials, we can access your merchant portal to pull transaction details, check settlement status, view chargeback information, and guide merchants through account features. This allows for real-time support without lengthy back-and-forth.",
          },
          {
            title: "Chargeback & Compliance Protocols",
            subtext:
              "Develop scripts for chargeback management following Visa, Mastercard, and Amex dispute procedures. Ensure PCI-DSS compliant communication and proper handling of sensitive payment data during support calls.",
            image:
              "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Payment compliance and chargeback procedures training",
            useConversation: true,
            customerMessage:
              "How do you ensure specialists follow proper chargeback timelines and evidence requirements for different card networks?",
            aiResponse:
              "We train specialists on card network-specific chargeback rules—Visa's 30-day representment window, Mastercard's compelling evidence requirements, and Amex's inquiry process. They'll guide merchants through proper documentation, deadline management, and evidence submission for maximum win rates.",
          },
          {
            title: "Launch & Merchant Success Tracking",
            subtext:
              "Go live with payment support. Monitor chargeback win rates, merchant satisfaction, integration completion times, and support resolution metrics. Optimize based on common merchant issues and payment trends.",
            image:
              "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Payment support analytics and merchant success metrics",
            useConversation: true,
            customerMessage:
              "How do you measure if support is actually improving our merchant retention and reducing chargebacks?",
            aiResponse:
              "We track key payment metrics: chargeback win rates, representment submission speed, merchant satisfaction (NPS), time-to-resolution, integration completion rates, and merchant churn. You'll see exactly how support impacts merchant retention and revenue protection.",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Payment Processing Answering Service FAQ"
        heading="Common Questions About Professional Call Support for Payment Processors & Merchant Services"
        faqs={[
          {
            question:
              "Can your team handle technical questions about payment APIs and integration?",
            answer:
              "Yes. Our specialists receive training on payment API concepts including authentication, tokenization, webhooks, idempotency, error codes, and integration patterns. While they won't write code, they can guide developers through API documentation, troubleshoot common integration issues, and escalate complex technical problems to your engineering team with full context.",
            id: "api-support",
          },
          {
            question:
              "How do you help merchants fight chargebacks and improve win rates?",
            answer:
              "We guide merchants through the representment process: explaining chargeback reason codes, identifying required evidence (delivery confirmation, customer communication, service records), meeting submission deadlines, and formatting compelling evidence packages. This professional chargeback assistance increases merchant win rates by 35-45% compared to merchants handling disputes alone.",
            id: "chargeback-assistance",
          },
          {
            question:
              "Do you understand PCI-DSS compliance and payment security requirements?",
            answer:
              "Absolutely. Our specialists are trained in PCI-DSS requirements, tokenization, encryption, 3D Secure authentication, fraud prevention tools, and secure payment handling. We can answer merchant compliance questions, explain SAQ requirements, and guide merchants through security best practices—all while following PCI-compliant communication protocols ourselves.",
            id: "pci-compliance",
          },
          {
            question:
              "Can you support multiple payment methods like cards, ACH, wallets, and crypto?",
            answer:
              "Yes. We train specialists on all payment methods you support including credit/debit cards (Visa, Mastercard, Amex, Discover), ACH/bank transfers, digital wallets (Apple Pay, Google Pay, PayPal), buy-now-pay-later (Klarna, Affirm), and even cryptocurrency payments. Each method has unique flows, fees, and issues we master.",
            id: "payment-methods",
          },
          {
            question:
              "How do you handle merchant onboarding and KYC verification support?",
            answer:
              "We guide new merchants through account setup, KYC document submission, business verification, bank account confirmation, and underwriting requirements. By providing instant answers to onboarding questions and helping with document issues, we reduce activation abandonment and accelerate time-to-first-transaction by 45-60%.",
            id: "merchant-onboarding",
          },
          {
            question:
              "Can you access our merchant portal and payment system to look up transactions?",
            answer:
              "Yes. With proper API access or portal credentials, we can view transaction details, check settlement status, review chargeback information, monitor payout schedules, and access merchant account data in real-time. This enables informed, efficient support without merchants waiting for callbacks or email responses.",
            id: "system-access",
          },
          {
            question:
              "How quickly can payment processing answering service be implemented?",
            answer:
              "Most payment processors launch answering service within 48-72 hours. Basic transaction and merchant support can begin within 2 days. Comprehensive platform training, chargeback procedures, API integration, and compliance protocol implementation typically requires 3-5 days depending on your payment system's complexity.",
            id: "implementation-time",
          },
          {
            question:
              "What does payment processing answering service cost?",
            answer:
              "At Dailzero, our payment processing answering service offers flexible pricing. Starter plan begins at $20/month, Business plan at $45/month, and Enterprise plan at $120/month with advanced features. This is far cheaper than hiring payment specialists at $22-$35/hour ($3,800-$6,000/month per employee) while providing 24/7 merchant support and scaling with transaction volume.",
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
