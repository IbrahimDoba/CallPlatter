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
import { siteConfig } from "@/lib/siteConfig";
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

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const plans: PricingPlan[] = siteConfig.pricing.plans;

// Nigerian pricing structure (Annual and Monthly fees in NGN)
const nigerianPricing = siteConfig.pricing.nigerianPricing;

// USD pricing structure (Annual fees in USD)
const usdPricing = siteConfig.pricing.usdPricing;

const PricingTier = ({
  name,
  price,
  period,
  description,
  features,
  isPopular,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}) => (
  <CardSpotlight
    className={`h-full ${isPopular ? "border-primary" : "border-border"} border-2 bg-muted`}
  >
    <div className="relative h-full p-6 flex flex-col">
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary/90 text-primary-foreground">
          POPULAR
        </Badge>
      )}
      <h3 className="text-xl font-medium mb-2 text-muted-foreground">{name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold text-primary">
          {price}
        </span>
        <span className="text-muted-foreground text-sm ml-1">{period}</span>
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
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full">
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
  const [currency, setCurrency] = useState<"USD" | "NGN">("NGN");

  const formatPrice = (planName: string) => {
    if (currency === "NGN") {
      const planPricing =
        nigerianPricing[planName as keyof typeof nigerianPricing];
      return `₦${planPricing.monthly.toLocaleString()}`;
    }
    const planPricing = usdPricing[planName as keyof typeof usdPricing];
    return `$${planPricing.monthly.toFixed(2)}`;
  };

  const formatFeatures = (planName: string) => {
    const plan = plans.find((p) => p.name === planName);
    if (!plan) return [];

    if (currency === "NGN") {
      return plan.features;
    }

    // Convert NGN features to USD features
    return plan.features.map((feature) => {
      if (feature.includes("₦1,467/min ($0.89/min)"))
        return "$0.89/min after limit";
      if (feature.includes("₦1,000/min ($0.61/min)"))
        return "$0.61/min after limit";
      if (feature.includes("₦733/min ($0.44/min)"))
        return "$0.44/min after limit";
      return feature;
    });
  };

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
            {plans.map((plan) => (
              <PricingTier
                key={plan.name}
                name={plan.name}
                price={formatPrice(plan.name)}
                period="per month"
                description={plan.description}
                features={plan.features}
                isPopular={plan.isPopular}
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
                <Link href="/waitlist">
                  <Button
                    size="lg"
                    className="bg-background text-foreground hover:bg-accent text-xl font-bold px-8 py-4"
                  >
                    Start Free Trial
                  </Button>
                </Link>
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
    </div>
  );
}
