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

export default function CryptocurrencyPlatformsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="Cryptocurrency Platform Answering Service"
        titleHighlight="24/7 Expert Support for Crypto Exchanges"
        subtitle="24/7 specialized answering service for crypto exchanges, blockchain platforms, DeFi apps, and digital wallets. Expert support for trading issues, wallet management, deposit/withdrawal questions, and security concerns. Reduce support tickets by 60% with instant crypto-native assistance."
        primaryButtonText="Start Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/8369648/pexels-photo-8369648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Cryptocurrency exchange customer service providing 24/7 support for crypto trading and blockchain platforms"
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, I sent Bitcoin to my wallet 2 hours ago but it's not showing up. The transaction shows 3 confirmations on the blockchain. What's going on?"
        aiResponse="I understand your concern. Let me help you track this. With 3 confirmations, your Bitcoin transaction is valid on the blockchain. Can you provide your wallet address or transaction ID? I'll check our system to see if there's a processing delay and escalate if needed."
      />

      {/* Features Section */}
      <SectionContent
        title="Cryptocurrency Answering Service Features"
        contentTitle="Expert Call Support for Crypto Exchanges & Blockchain Platforms"
        contentTitleSubtext="Specialized support for trading, wallet management, blockchain transactions, and DeFi operations. Specialists trained in crypto terminology and security protocols."
        cards={[
          {
            title: "24/7 Crypto Trading Support",
            subtitle:
              "Round-the-clock support for trading questions, order execution issues, market volatility concerns, and exchange platform navigation. Handle high call volumes during price spikes and market crashes when user anxiety peaks.",
            image:
              "https://images.pexels.com/photos/8369516/pexels-photo-8369516.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "24/7 cryptocurrency trading support for crypto exchanges and trading platforms",
          },
          {
            title: "Wallet & Transaction Support",
            subtitle:
              "Expert assistance for wallet setup, private key recovery, deposit/withdrawal issues, transaction tracking, blockchain confirmations, gas fee questions, and stuck transaction resolution. Reduce wallet-related support tickets by 70%.",
            image:
              "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Cryptocurrency wallet support and blockchain transaction assistance",
          },
          {
            title: "KYC & Account Verification for Crypto",
            subtitle:
              "Handle crypto exchange KYC verification, identity document submission, tier upgrade requests, and compliance questions. Accelerate user onboarding while maintaining AML/CTF regulatory compliance for cryptocurrency platforms.",
            image:
              "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "KYC verification support for cryptocurrency exchanges and blockchain platforms",
          },
          {
            title: "DeFi & Staking Support",
            subtitle:
              "Specialized support for DeFi protocols, yield farming, liquidity pools, staking operations, reward calculations, and smart contract interactions. Guide users through complex DeFi processes with crypto-native expertise.",
            image:
              "https://images.pexels.com/photos/7567486/pexels-photo-7567486.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "DeFi and staking support for cryptocurrency and blockchain platforms",
          },
          {
            title: "Security & Fraud Prevention",
            subtitle:
              "Handle security alerts, 2FA issues, suspicious activity reports, phishing attempts, and account recovery. Trained in crypto-specific fraud patterns, cold storage best practices, and security verification protocols.",
            image:
              "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Cryptocurrency security and fraud prevention customer support",
          },
          {
            title: "Crypto Platform Integration",
            subtitle:
              "Integration with crypto exchange APIs, blockchain explorers, wallet systems, and support platforms. Sync customer interactions with Zendesk, Intercom, and CRM systems for complete support visibility.",
            image:
              "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Cryptocurrency platform integration and API connectivity for exchanges",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Crypto Platforms Choose Professional Answering Services"
        pageInfoTitle="Handle 300% Volume Spikes & Reduce Support Costs by 60%"
        subtitle="Crypto exchanges and blockchain platforms use answering services to manage volatile support volumes, provide 24/7 global coverage, and scale during market events."
        pageInfoText="Crypto platforms face 300-500% support volume spikes during market volatility. When Bitcoin crashes or pumps, anxious users flood support lines. Without instant answers, users panic-sell, blame your platform, and leave negative reviews.\n\n24/7 crypto answering services provide specialists trained in blockchain technology, cryptocurrency trading, DeFi protocols, and wallet operations. We handle transaction questions, trading issues, wallet problems, and security concerns following crypto-specific best practices.\n\nDuring market volatility, bull runs, or exchange issues, support scales instantly without hiring. Crypto platforms report 60% lower support costs, 40% faster resolution times, and improved trust scores with professional 24/7 coverage."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Cryptocurrency Answering Service Benefits"
        heading="Scale Support During Volatility & Build User Trust"
        subheading="Proven results: instant scaling, lower costs, faster resolution, better retention"
        cards={[
          {
            icon: TrendingUp,
            text: "Instant scaling during volatility. Handle 300-500% volume spikes during bull runs, crashes, or exchange issues without hiring. Peak support capacity on-demand when users need help most.",
            id: "volatility-scaling",
          },
          {
            icon: Shield,
            text: "Crypto-native expertise. Specialists trained in blockchain, trading, DeFi, staking, gas fees, and wallet operations. Understand mempool congestion, slippage, impermanent loss, and crypto-specific issues.",
            id: "crypto-expertise",
          },
          {
            icon: Clock,
            text: "40-60% faster resolution times. Crypto-trained specialists resolve wallet issues, transaction tracking, and trading questions on first contact versus escalating to Level 2 support.",
            id: "faster-resolution",
          },
          {
            icon: Globe,
            text: "24/7 global coverage for international crypto users. Support across all time zones in 40+ languages. Asian, European, and American trading hours fully covered.",
            id: "global-coverage",
          },
          {
            icon: CheckCircle,
            text: "50-70% reduction in negative reviews during outages. Professional crisis communication during downtime, stuck transactions, or network congestion prevents panic and maintains user trust.",
            id: "reputation-protection",
          },
          {
            icon: Users,
            text: "60% lower support costs versus in-house teams. No hiring, training, or managing crypto support staff. Pay only for actual call volume with flexible scaling.",
            id: "cost-savings",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Cryptocurrency Answering Services Work"
        sectionHeading="Launch Expert Crypto Support in 72 Hours"
        subheading="Fast setup with crypto-trained specialists ready to handle your platform's unique requirements"
        items={[
          {
            title: "Platform & Crypto Training",
            subtext:
              "Train specialists on your exchange features, supported coins, trading pairs, fee structures, and policies. Learn your platform's UI, wallet architecture, and common user issues for accurate first-call resolution.",
            image:
              "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Cryptocurrency platform training for support specialists",
            useConversation: true,
            customerMessage:
              "We're a DeFi platform with complex staking and liquidity pool features. Can your team handle technical questions about APY calculations and impermanent loss?",
            aiResponse:
              "Absolutely! Our specialists receive comprehensive training on DeFi concepts including staking, liquidity pools, APY calculations, and impermanent loss. We'll learn your platform's specific mechanics and can explain these concepts clearly to users or escalate complex edge cases to your team.",
          },
          {
            title: "Integration & Call Routing Setup",
            subtext:
              "Connect with your exchange API, support ticketing system, and blockchain explorers. Set up call routing for different issue types: trading, wallets, KYC, or technical problems.",
            image:
              "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Crypto platform integration and API setup",
            useConversation: true,
            customerMessage:
              "Do you integrate with Zendesk and can you access our exchange's API to check transaction status?",
            aiResponse:
              "Yes! We integrate with Zendesk, Intercom, and most support platforms. With API access, we can check transaction status, account details, and trading history in real-time to resolve issues faster. All API access is secured and audit-logged for compliance.",
          },
          {
            title: "Crisis Communication Protocols",
            subtext:
              "Develop scripts for handling exchange downtime, stuck transactions, network congestion, and security incidents. Clear communication during crises prevents panic and maintains user trust.",
            image:
              "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Cryptocurrency crisis communication and incident management",
            useConversation: true,
            customerMessage:
              "What happens when our exchange has unexpected downtime or blockchain network congestion causes delays?",
            aiResponse:
              "We'll follow pre-approved crisis scripts that acknowledge the issue, explain what's happening, provide ETAs when available, and reassure users. We can also proactively update users via phone about major incidents, reducing support ticket floods.",
          },
          {
            title: "Launch & Continuous Optimization",
            subtext:
              "Go live with 24/7 crypto support. Monitor call volumes, resolution rates, and user satisfaction. Refine scripts based on new features, market conditions, and emerging crypto trends.",
            image:
              "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Cryptocurrency support analytics and performance optimization",
            useConversation: true,
            customerMessage:
              "How do you stay current with crypto trends, new DeFi protocols, and emerging blockchain technologies?",
            aiResponse:
              "Our crypto specialists receive ongoing training on industry developments, new protocols, and emerging trends. We monitor crypto news, protocol updates, and your platform changes. Monthly training sessions keep the team current on evolving blockchain technology.",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Cryptocurrency Answering Service FAQ"
        heading="Common Questions About Professional Call Support for Crypto Exchanges & Blockchain Platforms"
        faqs={[
          {
            question:
              "Can your team handle complex crypto questions about blockchain, gas fees, and DeFi?",
            answer:
              "Yes. Our specialists receive comprehensive training on blockchain technology, cryptocurrency trading, gas fee dynamics, DeFi protocols, staking, yield farming, and wallet operations. They understand concepts like mempool congestion, slippage, impermanent loss, and can explain them clearly to users. Complex edge cases escalate to your technical team with full context.",
            id: "crypto-expertise",
          },
          {
            question:
              "How do you handle massive volume spikes during market volatility?",
            answer:
              "We scale instantly during volatility. When Bitcoin pumps/crashes or your exchange experiences issues, we can handle 300-500% volume increases immediately without degrading service quality. No hiring delays, no overtime costs—just instant capacity when you need it most.",
            id: "volume-scaling",
          },
          {
            question:
              "What about security? How do you prevent social engineering and unauthorized access?",
            answer:
              "Security is critical for crypto platforms. Our specialists follow strict verification protocols including multi-factor authentication, security questions, and account validation before discussing sensitive information. We're trained to recognize social engineering attempts, phishing patterns, and suspicious requests. All calls are recorded and monitored for security compliance.",
            id: "security-protocols",
          },
          {
            question:
              "Do you provide support in multiple languages for global crypto users?",
            answer:
              "Yes. Crypto is global, and so is our support. We provide multilingual specialists in 40+ languages including English, Spanish, Chinese (Mandarin/Cantonese), Japanese, Korean, French, German, Portuguese, Russian, and more. Cover Asian, European, and American trading hours with native speakers.",
            id: "multilingual-support",
          },
          {
            question:
              "How quickly can crypto answering service be implemented?",
            answer:
              "Most crypto platforms launch professional answering service within 72 hours. Basic trading and wallet support can begin within 48 hours. Comprehensive platform training, DeFi feature mastery, and API integration typically requires 3-5 days depending on your exchange's complexity and feature set.",
            id: "implementation-speed",
          },
          {
            question:
              "Can you access our exchange API to check transaction status and account details?",
            answer:
              "Yes. We integrate with crypto exchange APIs, blockchain explorers, and wallet systems to access real-time transaction status, account balances, trading history, and KYC verification status. API access is secured, encrypted, and fully audit-logged. We only access what's needed to resolve user issues efficiently.",
            id: "api-integration",
          },
          {
            question:
              "What happens during exchange downtime, network congestion, or stuck transactions?",
            answer:
              "We follow pre-approved crisis communication protocols that acknowledge issues professionally, explain technical reasons (network congestion, high gas fees, blockchain delays), provide ETAs when available, and reassure users. This prevents panic, reduces negative reviews, and maintains trust during unavoidable crypto infrastructure issues.",
            id: "crisis-handling",
          },
          {
            question:
              "How much does cryptocurrency answering service cost?",
            answer:
              "At Dailzero, our crypto answering service offers flexible pricing. Starter plan begins at $20/month, Business plan at $45/month, and Enterprise plan at $120/month with advanced features. This is massively cheaper than hiring crypto-knowledgeable support staff at $25-$40/hour ($4,000-$7,000/month per employee) while providing 24/7 coverage and instant volatility scaling.",
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
