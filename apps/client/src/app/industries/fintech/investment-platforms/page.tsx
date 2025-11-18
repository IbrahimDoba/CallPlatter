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

export default function InvestmentPlatformsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="Investment Platform Answering Service"
        titleHighlight="24/7 Support for Trading & Investing Apps"
        subtitle="24/7 answering service for investment platforms, online brokerages, robo-advisors, and trading apps. Expert support for account setup, trade execution, portfolio questions, and investment inquiries. Reduce account abandonment by 40% with instant investment guidance."
        primaryButtonText="Start Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Investment platform customer service for online brokerages and trading apps"
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, I'm trying to place a limit order for 100 shares of Tesla but it keeps getting rejected. I set my limit at $250 but the stock is trading at $248. What's going wrong?"
        aiResponse="I can help with that. Let me check your account and order details. The rejection is likely due to insufficient buying power—at $250 per share for 100 shares, you'd need $25,000 plus our $10 commission. Your current buying power shows $23,500. You could reduce to 94 shares or adjust your limit price. Would you like me to walk you through either option?"
      />

      {/* Features Section */}
      <SectionContent
        title="Investment Platform Answering Service Features"
        contentTitle="Expert Support for Brokerages, Robo-Advisors & Trading Apps"
        contentTitleSubtext="Specialized support for account setup, trading, portfolio management, and investment questions. Built for online brokerages, robo-advisors, and investment platforms."
        cards={[
          {
            title: "24/7 Trading Support",
            subtitle:
              "Handle trade execution questions, order type explanations (market, limit, stop-loss), order status inquiries, and trading platform navigation. Support investors during market hours and after-hours trading sessions.",
            image:
              "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "24/7 trading support for investment platforms and online brokerages",
          },
          {
            title: "Account Opening & Funding",
            subtitle:
              "Guide new investors through account setup, identity verification, funding options (ACH, wire transfer, check), and account type selection (individual, joint, IRA, Roth IRA). Accelerate account activation with instant onboarding support.",
            image:
              "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Investment account opening and funding support for brokerages",
          },
          {
            title: "Portfolio & Asset Allocation",
            subtitle:
              "Handle portfolio performance questions, asset allocation inquiries, rebalancing explanations, and diversification guidance. Help investors understand their holdings, risk exposure, and investment strategy.",
            image:
              "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Portfolio management and asset allocation support for investment platforms",
          },
          {
            title: "Market Data & Research Tools",
            subtitle:
              "Assist with platform features including stock screeners, charting tools, analyst ratings, earnings calendars, and market news. Help investors navigate research capabilities and data sources.",
            image:
              "https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Market research and trading tools support for investment platforms",
          },
          {
            title: "Compliance & Tax Reporting",
            subtitle:
              "Handle questions about 1099 tax forms, cost basis reporting, wash sales, dividend reinvestment, and regulatory disclosures. Guide investors through compliance requirements and documentation.",
            image:
              "https://images.pexels.com/photos/6863117/pexels-photo-6863117.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Investment compliance and tax reporting support for brokerages",
          },
          {
            title: "Robo-Advisor & Algorithm Support",
            subtitle:
              "Explain automated portfolio management, risk assessment questionnaires, algorithm-driven rebalancing, and robo-advisor features. Help investors understand how automated investing works on your platform.",
            image:
              "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Robo-advisor and automated investing support for investment platforms",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Investment Platforms Choose Professional Answering Services"
        pageInfoTitle="Reduce Account Abandonment by 40% & Increase AUM"
        subtitle="Investment platforms use answering services to capture high-intent investors, accelerate account funding, and provide premium support that builds trust and increases assets under management."
        pageInfoText="Investment platforms lose 50-65% of potential investors during account opening when support is unavailable. Opening an investment account involves questions about account types, funding methods, tax implications, and platform features—delayed answers cause abandonment to competitors.\n\n24/7 investment answering services provide specialists trained in brokerage operations, investment products, trading platforms, and regulatory requirements. We handle account questions, trading support, portfolio inquiries, and platform navigation following FINRA, SEC, and investment regulations.\n\nWhile your investment team manages portfolios and platform development, we handle investor communications and reduce onboarding friction. Investment platforms report 40% lower account abandonment, 35% faster funding, and 50% reduction in support costs with professional coverage."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Investment Platform Answering Service Benefits"
        heading="Increase AUM & Accelerate Account Growth"
        subheading="Proven results: higher account conversions, faster funding, better retention, lower costs"
        cards={[
          {
            icon: TrendingUp,
            text: "40-50% reduction in account abandonment. Instant answers during account opening about funding methods, account types, and platform features convert high-intent investors who would otherwise abandon applications.",
            id: "abandonment-reduction",
          },
          {
            icon: Shield,
            text: "FINRA and SEC compliance expertise. Specialists trained in investment regulations, disclosure requirements, suitability standards, and fiduciary responsibilities. All communication follows regulatory guidelines for registered investment platforms.",
            id: "investment-compliance",
          },
          {
            icon: Clock,
            text: "35-45% faster account funding. Proactive support for funding questions, bank verification, and transfer assistance accelerates time-to-first-trade and increases investor engagement.",
            id: "faster-funding",
          },
          {
            icon: Globe,
            text: "24/7 support during market volatility. When markets drop or spike, anxious investors call with questions. Professional support during volatile periods prevents panic selling and maintains investor confidence.",
            id: "volatility-support",
          },
          {
            icon: CheckCircle,
            text: "30-40% increase in investor satisfaction (NPS). Premium phone support differentiates your platform from discount brokers and builds trust with high-net-worth individuals seeking personalized service.",
            id: "satisfaction-improvement",
          },
          {
            icon: Users,
            text: "50-60% lower support costs versus in-house teams. No hiring licensed representatives, training on complex products, or managing 24/7 coverage. Scale support with AUM growth seamlessly.",
            id: "cost-reduction",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Investment Platform Answering Services Work"
        sectionHeading="Launch Investment Support in 72 Hours"
        subheading="Fast setup with investment-trained specialists ready to support your investor base"
        items={[
          {
            title: "Investment Platform & Product Training",
            subtext:
              "Train specialists on your trading platform, investment products (stocks, bonds, ETFs, mutual funds, options), account types, fee structure, and platform features. Master order types, research tools, and common investor workflows.",
            image:
              "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Investment platform training for support specialists",
            useConversation: true,
            customerMessage:
              "We offer stocks, ETFs, options, and fractional shares. Can your team explain the differences and help investors choose?",
            aiResponse:
              "Absolutely! We'll train specialists on each investment product you offer including stocks, ETFs, options, mutual funds, and fractional shares. They'll explain product features, fee structures, risk profiles, and help investors understand which products align with their goals—without providing investment advice.",
          },
          {
            title: "Trading Platform & System Integration",
            subtext:
              "Connect with your brokerage platform, account management system, and CRM. Access account details, trade history, portfolio data, and funding status for real-time investor assistance.",
            image:
              "https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Investment platform integration and system connectivity",
            useConversation: true,
            customerMessage:
              "Can you access our platform to check account status, pending orders, and portfolio performance?",
            aiResponse:
              "Yes! With appropriate access, we can view account balances, check trade status, review portfolio holdings, monitor pending orders, and see funding progress. This allows us to provide real-time support without investors waiting for callbacks or account lookups.",
          },
          {
            title: "Compliance & Disclosure Protocols",
            subtext:
              "Develop compliant scripts following FINRA communication rules, SEC disclosure requirements, and investment suitability standards. Ensure all investor communication includes required risk disclosures and regulatory warnings.",
            image:
              "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Investment compliance and regulatory protocol training",
            useConversation: true,
            customerMessage:
              "How do you ensure specialists don't provide investment advice or violate FINRA rules?",
            aiResponse:
              "We train specialists on the critical distinction between education and advice. They can explain platform features, product types, and how things work—but never recommend specific investments or strategies. All scripts include required risk disclosures and are pre-approved for regulatory compliance.",
          },
          {
            title: "Launch & Investor Success Tracking",
            subtext:
              "Go live with investment support. Monitor account conversion rates, funding completion, trade execution volume, and investor satisfaction. Optimize based on common questions and account opening friction points.",
            image:
              "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Investment platform analytics and performance tracking",
            useConversation: true,
            customerMessage:
              "How do you measure if support is actually increasing our AUM and account growth?",
            aiResponse:
              "We track key investment metrics: account completion rates, time-to-funding, first-trade conversion, investor NPS, support resolution time, and account retention. You'll see exactly how professional support impacts AUM growth and investor acquisition costs.",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Investment Platform Answering Service FAQ"
        heading="Common Questions About Professional Call Support for Investment Platforms & Online Brokerages"
        faqs={[
          {
            question:
              "Can your team provide investment advice or recommend specific stocks?",
            answer:
              "No. Our specialists are trained to provide platform support and investment education—not investment advice. They can explain how products work, platform features, order types, and general investment concepts, but never recommend specific securities or investment strategies. This ensures FINRA compliance and keeps your firm's liability low.",
            id: "investment-advice",
          },
          {
            question:
              "Do you understand different account types like IRAs, Roth IRAs, and 401(k) rollovers?",
            answer:
              "Yes. Our specialists receive comprehensive training on account types including individual accounts, joint accounts, traditional IRAs, Roth IRAs, SEP IRAs, 401(k) rollovers, custodial accounts, and trust accounts. They understand contribution limits, tax implications, withdrawal rules, and can guide investors through account type selection.",
            id: "account-types",
          },
          {
            question:
              "How do you handle support during market volatility and crashes?",
            answer:
              "Market volatility drives massive support volume spikes—300-500% increases during crashes. We scale instantly to handle anxious investor calls, provide calm explanations of market conditions, help with platform access during high-traffic periods, and prevent panic selling through professional communication. This crisis support protects your brand and investor relationships.",
            id: "market-volatility",
          },
          {
            question:
              "Can you help investors with complex order types like stop-loss and options?",
            answer:
              "Yes. Specialists are trained on various order types including market orders, limit orders, stop-loss, stop-limit, trailing stop, and options strategies. They can explain how each order type works, when to use them, and help troubleshoot rejected orders—without recommending specific trading strategies.",
            id: "order-types",
          },
          {
            question:
              "How do you ensure FINRA and SEC compliance in all communications?",
            answer:
              "All scripts are developed with compliance input and include required risk disclosures. Specialists never provide investment recommendations, discuss performance predictions, or make guarantees. They're trained to recognize questions requiring licensed advisor escalation. All calls are recorded for regulatory review and audit purposes.",
            id: "regulatory-compliance",
          },
          {
            question:
              "Can you access our platform to check trade status and account balances?",
            answer:
              "Yes. With proper system access, we can view account balances, check pending orders, review trade history, monitor portfolio performance, and verify funding status. This enables real-time support that resolves investor questions immediately without callbacks or email delays.",
            id: "platform-access",
          },
          {
            question:
              "How quickly can investment platform answering service be implemented?",
            answer:
              "Most investment platforms launch answering service within 72 hours to 1 week. Basic account and trading support can begin within 3 days. Comprehensive product training, compliance script approval, platform integration, and regulatory protocol implementation typically requires 5-7 days depending on product complexity and compliance requirements.",
            id: "implementation-time",
          },
          {
            question:
              "What does investment platform answering service cost?",
            answer:
              "At Dailzero, our investment platform answering service offers flexible pricing. Starter plan begins at $20/month, Business plan at $45/month, and Enterprise plan at $120/month with compliance features. This is significantly cheaper than hiring licensed representatives at $25-$40/hour ($4,300-$7,000/month per employee) while providing 24/7 investor support.",
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
