"use client";

import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import Link from "next/link";
import {
  Landmark,
  Bitcoin,
  CreditCard,
  Wallet,
  Building2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function FintechHubPage() {
  const fintechCategories = [
    {
      title: "Digital Banking",
      description:
        "24/7 support for neobanks and mobile banking apps. Handle KYC verification, account activation, and transaction inquiries.",
      href: "/industries/fintech/digital-banking",
      icon: Landmark,
      keywords: "Neobanks • Digital Banks • Mobile Banking • Challenger Banks",
      comingSoon: false,
    },
    {
      title: "Cryptocurrency Platforms",
      description:
        "Expert support for crypto exchanges and blockchain platforms. Manage wallet issues, trading support, and DeFi inquiries.",
      href: "/industries/fintech/cryptocurrency-platforms",
      icon: Bitcoin,
      keywords: "Crypto Exchanges • Blockchain • DeFi • Digital Wallets",
      comingSoon: false,
    },
    {
      title: "Digital Lending Platforms",
      description:
        "Handle loan applications, underwriting questions, and repayment support for online lending and P2P platforms.",
      href: "/industries/fintech/lending-platforms",
      icon: TrendingUp,
      keywords: "Digital Lending • P2P Lending • Loan Platforms • Microfinance",
      comingSoon: false,
    },
    {
      title: "Payment Processors",
      description:
        "Support payment gateways and merchant services. Handle transaction disputes, integration help, and merchant inquiries.",
      href: "/industries/fintech/payment-processors",
      icon: CreditCard,
      keywords: "Payment Gateways • Merchant Services • Payment Processing",
      comingSoon: false,
    },
    {
      title: "Investment & Trading Platforms",
      description:
        "Customer support for online brokerages and robo-advisors. Manage account queries, trade execution, and portfolio questions.",
      href: "/industries/fintech/investment-platforms",
      icon: Wallet,
      keywords: "Robo-Advisors • Investment Apps • Online Brokerages • Trading",
      comingSoon: false,
    },
    {
      title: "Insurance Technology",
      description:
        "Insurtech call handling for policy inquiries, claims processing, and quote requests on digital insurance platforms.",
      href: "/industries/fintech/insurtech",
      icon: Building2,
      keywords: "Insurtech • Digital Insurance • Policy Management",
      comingSoon: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Landmark className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Fintech Answering Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Secure, compliant 24/7 answering service for financial technology companies.
              Reduce churn, accelerate onboarding, and scale customer support.
            </p>
            <div className="flex flex-wrap gap-3 justify-center text-sm text-muted-foreground">
              <span className="px-4 py-2 rounded-full bg-primary/5">PCI-DSS Compliant</span>
              <span className="px-4 py-2 rounded-full bg-primary/5">SOC 2 Certified</span>
              <span className="px-4 py-2 rounded-full bg-primary/5">GDPR Ready</span>
              <span className="px-4 py-2 rounded-full bg-primary/5">KYC/AML Support</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Fintech Sector
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get specialized support tailored to your fintech sector's unique compliance and customer needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fintechCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={category.comingSoon ? "#" : category.href}
                  className={`group block h-full ${category.comingSoon ? "pointer-events-none" : ""}`}
                >
                  <div className="relative h-full p-6 rounded-2xl border border-border bg-card hover:bg-accent/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                    {category.comingSoon && (
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        Coming Soon
                      </div>
                    )}

                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <category.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {category.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {category.keywords.split(" • ").map((keyword) => (
                        <span
                          key={keyword}
                          className="text-xs px-2 py-1 rounded-md bg-primary/5 text-primary/70"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>

                    {!category.comingSoon && (
                      <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                        <span>Learn More</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Fintech Companies Choose Us */}
      <section className="py-20 px-4 bg-accent/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Fintech Companies Choose DailZero
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade support built for fintech compliance and security
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Compliance First",
                description:
                  "KYC/AML, PCI-DSS, GDPR, SOC 2 certified. All calls encrypted and audit-ready.",
              },
              {
                title: "Security Focused",
                description:
                  "Bank-grade security, encrypted communications, and fraud prevention protocols.",
              },
              {
                title: "Fintech Expertise",
                description:
                  "Specialists trained in fintech terminology, blockchain, and digital banking operations.",
              },
              {
                title: "24/7/365 Coverage",
                description:
                  "Global support across all time zones with multilingual capabilities in 40+ languages.",
              },
              {
                title: "Rapid Onboarding",
                description:
                  "Reduce CAC by 35-50% and accelerate account activation with expert KYC guidance.",
              },
              {
                title: "Platform Integration",
                description:
                  "Works with Plaid, Stripe, Salesforce, and all major fintech infrastructure.",
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-background border border-border"
              >
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Reduce Churn and Scale Your Fintech?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Enterprise-grade support without the enterprise cost. Start in 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <button
                type="button"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Start Free Trial
              </button>
            </Link>
            <Link href="/pricing">
              <button
                type="button"
                className="px-8 py-4 bg-background border border-border rounded-lg font-semibold hover:bg-accent transition-colors"
              >
                View Pricing
              </button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
