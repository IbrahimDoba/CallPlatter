"use client";

import { motion } from "framer-motion";
import { Check, DollarSign, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardSpotlight } from "./CardSpotlight";
import { useState } from "react";
import { siteConfig } from "@/lib/siteConfig";

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
    className={`h-full ${isPopular ? "border-blue-500" : "border-white/10"} border-2`}
  >
    <div className="relative h-full p-6 flex flex-col">
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-600 text-white">
          POPULAR
        </Badge>
      )}
      <h3 className="text-xl font-medium mb-2 text-white">{name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {price}
        </span>
        <span className="text-gray-400 text-sm ml-1">{period}</span>
      </div>
      <p className="text-gray-400 mb-6">{description}</p>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full">
        Select plan
      </Button>
    </div>
  </CardSpotlight>
);

export default function PricingSection() {
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

  return (
    <section
      id="pricing"
      className="py-10"
      style={{ backgroundColor: "#343434" }}
    >
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-normal mb-6 text-white"
          >
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-medium">
              DailZero Plan
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-lg text-gray-400"
          >
            Select the perfect plan with advanced AI features and competitive
            pricing
          </motion.p>
        </div>

        {/* Currency Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant={currency === "USD" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrency("USD")}
            className={`flex items-center gap-1 transition-all duration-200 ${
              currency === "USD"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 scale-105"
                : "border-white/20 text-white hover:bg-white/10 hover:border-white/40"
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
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 scale-105"
                : "border-white/20 text-white hover:bg-white/10 hover:border-white/40"
            }`}
          >
            <Globe className="h-4 w-4" />
            NGN
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
        </div>
      </div>
    </section>
  );
}
