"use client";

import { motion } from "framer-motion";
import { Check, DollarSign, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardSpotlight } from "./CardSpotlight";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  pricingPlans, 
  formatPrice,
  formatAnnualTotal,
  getAnnualSavings
} from "@/lib/pricingConfig";

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
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transition-all duration-300 ease-in-out">
            {price}
          </span>
          <span className="text-gray-400 text-sm">
            {billingPeriod === "annual" ? "/month" : "/month"}
          </span>
        </div>
        {/* Reserve space to prevent layout shifts */}
        <div className="mt-1 h-8 flex flex-col justify-center">
          <div className="transition-all duration-300 ease-in-out transform">
            {billingPeriod === "annual" && name !== "FREE" ? (
              <div className="opacity-100 translate-y-0 transition-all duration-300 ease-in-out">
                <div className="text-xs text-gray-400">
                  Billed annually: {formatAnnualTotal(name, currency)}
                </div>
                <div className="text-xs text-green-400 font-medium">
                  Save {getAnnualSavings(name, currency)}/year
                </div>
              </div>
            ) : name !== "FREE" ? (
              <div className="opacity-100 translate-y-0 transition-all duration-300 ease-in-out">
                <div className="text-xs text-gray-400">
                  Billed monthly
                </div>
              </div>
            ) : (
              <div className="opacity-0 h-0 overflow-hidden transition-all duration-300 ease-in-out">
                <div className="text-xs text-gray-400">
                  Free plan
                </div>
              </div>
            )}
          </div>
        </div>
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
  const [currency, setCurrency] = useState<"USD" | "NGN">("USD");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

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

        {/* Billing Period Toggle - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <span
            className={cn(
              "text-sm transition-all duration-200",
              billingPeriod === "monthly"
                ? "font-bold text-white"
                : "font-medium text-gray-400"
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
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-colors focus:outline-none"
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
                  ? "font-bold text-white"
                  : "font-medium text-gray-400"
              )}
            >
              Annually
            </span>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
              Save 20%
            </Badge>
          </div>
        </motion.div>

        {/* Currency Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
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
      </div>
    </section>
  );
}
