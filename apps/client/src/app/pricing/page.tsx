"use client";

import { motion } from "framer-motion";
import {
  Check,
  DollarSign,
  Globe,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardSpotlight } from "@/components/Homepage/CardSpotlight";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  pricingPlans, 
  formatPrice,
  formatAnnualTotal,
  getAnnualSavings,
  getProductId
} from "@/lib/pricingConfig";
import Footer from "@/components/Homepage/footer";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface PricingTierProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  billingPeriod: "monthly" | "annual";
  currency: "USD" | "NGN";
}

const PricingTier = ({
  name,
  price,
  period,
  description,
  features,
  isPopular,
  billingPeriod,
  currency,
}: PricingTierProps) => (
  <CardSpotlight
    className={`h-full ${isPopular ? "border-primary" : "border-border"} border-2 bg-muted`}
  >
    <div className="relative h-full p-6 flex flex-col">
      {isPopular && (
        <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary/90 text-primary-foreground">
          POPULAR
        </Badge>
      )}
      <h3 className="text-xl font-medium mb-2 text-muted-foreground">{name}</h3>
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-primary transition-all duration-300 ease-in-out">
            {price}
          </span>
          <span className="text-muted-foreground text-sm">
            {billingPeriod === "annual" ? "/month" : "/month"}
          </span>
        </div>
        {/* Reserve space to prevent layout shifts */}
        <div className="mt-1 h-8 flex flex-col justify-center">
          <div className="transition-all duration-300 ease-in-out transform">
            {billingPeriod === "annual" && name !== "Starter" ? (
              <div className="opacity-100 translate-y-0 transition-all duration-300 ease-in-out">
                <div className="text-xs text-muted-foreground">
                  Billed annually: {formatAnnualTotal(name, currency)}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  Save {getAnnualSavings(name, currency)}/year
                </div>
              </div>
            ) : name !== "Starter" ? (
              <div className="opacity-100 translate-y-0 transition-all duration-300 ease-in-out">
                <div className="text-xs text-muted-foreground">
                  Billed monthly
                </div>
              </div>
            ) : (
              <div className="opacity-0 h-0 overflow-hidden transition-all duration-300 ease-in-out">
                <div className="text-xs text-muted-foreground">
                  Free plan
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
        onClick={() => {
          // Redirect to Polar checkout with the product ID
          const productId = getProductId(name);
          if (productId) {
            window.location.href = `/checkout?products=${productId}`;
          }
        }}
      >
        Select plan
      </Button>
    </div>
  </CardSpotlight>
);

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg">
      <button
        type="button"
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-accent transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-foreground font-medium">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 pb-4"
        >
          <p className="text-muted-foreground leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </div>
  );
};

const faqs = [
  {
    question: "How does the AI receptionist work?",
    answer:
      "Our AI receptionist uses advanced natural language processing to understand customer inquiries, answer questions, and book appointments. It can handle multiple calls simultaneously and provides 24/7 availability for your business.",
  },
  {
    question: "Can I customize the AI's responses?",
    answer:
      "Yes! You can customize the AI's greeting, business information, and responses to match your brand voice and specific business needs. You can also set up custom workflows for different types of inquiries.",
  },
  {
    question: "What happens if the AI can't handle a call?",
    answer:
      "The AI can transfer calls to you or your team members, send you a text message with call details, or take a message and send it to your email. You have full control over how calls are handled.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use end-to-end encryption for all communications and are GDPR compliant. Your call recordings and customer data are stored securely and can be deleted at any time.",
  },
  {
    question: "Can I integrate with my existing CRM?",
    answer:
      "Yes! DailZero integrates with popular CRM systems like Salesforce, HubSpot, and others. Customer information from calls is automatically synced to your CRM.",
  },
  {
    question: "What languages does the AI support?",
    answer:
      "Our AI supports multiple languages and can understand various accents. It's particularly optimized for English and can handle local dialects and business terminology.",
  },
  {
    question: "How do I get started?",
    answer:
      "Getting started is easy! Sign up for a plan, provide your business information, customize your AI's responses, and you'll be ready to receive calls within minutes. Our team provides full setup support.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll only pay the difference for the current billing period.",
  },
  {
    question: "What if I need help?",
    answer:
      "We provide 24/7 customer support via email, chat, and phone. Our team is always ready to help you optimize your AI receptionist and resolve any issues quickly.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes! We offer a 14-day free trial for all new customers. You can test all features without any commitment and cancel anytime during the trial period.",
  },
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<"USD" | "NGN">("USD");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.div {...fadeInUp}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Pricing Plans
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              Choose the perfect plan for your business. All plans include our
              core AI receptionist features with no hidden costs.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-16"
        >
          {/* Billing Period Toggle - Centered */}
          <motion.div
            {...fadeInUp}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span
              className={cn(
                "text-sm transition-all duration-200",
                billingPeriod === "monthly"
                  ? "font-bold text-foreground"
                  : "font-medium text-muted-foreground"
              )}
            >
              Monthly
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setBillingPeriod(
                    billingPeriod === "monthly" ? "annual" : "monthly"
                  )
                }
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none"
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out",
                    billingPeriod === "annual"
                      ? "translate-x-6"
                      : "translate-x-1"
                  )}
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm transition-all duration-200",
                  billingPeriod === "annual"
                    ? "font-bold text-foreground"
                    : "font-medium text-muted-foreground"
                )}
              >
                Annually
              </span>
              <Badge className="bg-primary text-primary-foreground text-xs">
                Save 20%
              </Badge>
            </div>
          </motion.div>

          {/* Currency Toggle */}
          <motion.div
            {...fadeInUp}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <Button
              variant={currency === "USD" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrency("USD")}
              className={`flex items-center gap-1 transition-all duration-200 ${
                currency === "USD"
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg scale-105"
                  : "bg-secondary border-border text-secondary-foreground hover:bg-accent hover:border-accent"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              USD
            </Button>
            <Button
              variant={currency === "NGN" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrency("NGN")}
              className={`flex items-center gap-1 transition-all duration-200 ${
                currency === "NGN"
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg scale-105"
                  : "bg-secondary border-border text-secondary-foreground hover:bg-accent hover:border-accent"
              }`}
            >
              <Globe className="h-4 w-4" />
              NGN
            </Button>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            {...fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {pricingPlans.map((plan) => (
              <PricingTier
                key={plan.name}
                name={plan.name}
                price={formatPrice(plan.name, currency, billingPeriod)}
                period="per month"
                description={plan.features[0] || ""}
                features={plan.features}
                isPopular={plan.isPopular}
                billingPeriod={billingPeriod}
                currency={currency}
              />
            ))}
          </motion.div>

          {/* FAQ Section */}
          <motion.section
            {...fadeInUp}
            className="bg-card backdrop-blur-lg rounded-xl p-8 border border-border"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6 flex items-center justify-center gap-3">
                <HelpCircle className="w-10 h-10 text-primary" />
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to know about DailZero's AI receptionist
                service
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section {...fadeInUp} className="text-center">
            <div className="bg-primary rounded-3xl p-12 text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of businesses using DailZero's AI receptionist
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-accent text-xl font-bold px-8 py-4"
                  onClick={() => {
                    // Redirect to Polar checkout for Starter plan
                    const productId = getProductId('Starter');
                    if (productId) {
                      window.location.href = `/checkout?products=${productId}`;
                    }
                  }}
                >
                  Start Free Trial
                </Button>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-xl font-bold px-8 py-4"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </motion.section>
        </motion.div>

        {/* Back to Home */}
        <motion.div {...fadeInUp} className="text-center mt-12">
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
