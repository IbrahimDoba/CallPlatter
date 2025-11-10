"use client";

import type React from "react";

import { useState } from "react";
import { Check, DollarSign, Globe, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  pricingPlans,
  formatPrice,
  formatAnnualTotal,
  getAnnualSavings,
  getProductId,
  planTypeMap,
} from "@/lib/pricingConfig";

interface PricingModalProps {
  children: React.ReactNode;
  currentPlan?: string;
  subscriptionStatus?: string;
  currentPeriodEnd?: string;
  onPlanChange?: (newPlan: string) => void;
}

export function PricingModal({
  children,
  currentPlan,
  subscriptionStatus,
  currentPeriodEnd,
}: PricingModalProps) {
  const [currency, setCurrency] = useState<"USD" | "NGN">("USD");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Map plan type (STARTER, BUSINESS, etc.) to plan name (Starter, Business, etc.)
  const mapPlanTypeToName = (planType: string): string => {
    const reverseMap: Record<string, string> = {};
    Object.entries(planTypeMap).forEach(([name, type]) => {
      reverseMap[type] = name;
    });
    return reverseMap[planType] || planType;
  };

  const currentPlanName = currentPlan ? mapPlanTypeToName(currentPlan) : undefined;
  
  // Check if subscription is active (not expired, cancelled, etc.)
  const isSubscriptionActive = () => {
    if (!subscriptionStatus) return false;
    
    // Check if status indicates an active subscription
    if (subscriptionStatus === 'CANCELLED' || 
        subscriptionStatus === 'PAST_DUE' || 
        subscriptionStatus === 'SUSPENDED') {
      return false;
    }
    
    // Check if period has ended
    if (currentPeriodEnd) {
      const now = new Date();
      const periodEnd = new Date(currentPeriodEnd);
      if (now > periodEnd) {
        return false;
      }
    }
    
    // Subscription is active if status is ACTIVE or TRIAL and period hasn't ended
    return subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL';
  };
  
  const isActive = isSubscriptionActive();
  
  // Debug logging
  console.log('PricingModal - Current Plan Debug:', {
    currentPlan,
    currentPlanName,
    subscriptionStatus,
    currentPeriodEnd,
    isActive,
    planTypeMap
  });

  const handlePlanSelection = async (planName: string) => {
    // Only prevent selection if it's the same plan AND subscription is active
    if (planName === currentPlanName && isActive) {
      return; // Don't do anything if it's the same active plan
    }

    // Handle Custom plan differently
    if (planName === 'Custom') {
      // Open Discord link for custom pricing inquiries
      window.open(process.env.NEXT_PUBLIC_DISCORD_LINK || 'https://discord.gg/Xc89m7sRFc', '_blank');
      return;
    }

    setIsLoading(true);
    setSelectedPlan(planName);

    try {
      const productId = getProductId(planName);
      if (!productId) {
        toast.error("Product not found. Please contact support.");
        return;
      }

      // Build checkout URL with customer information
      const checkoutUrl = new URL('/checkout', window.location.origin);
      checkoutUrl.searchParams.set('products', productId);
      
      // Add billing period information
      if (billingPeriod === 'annual') {
        checkoutUrl.searchParams.set('metadata', JSON.stringify({
          billingPeriod: 'annual',
          currency: currency
        }));
      }

      // Redirect to Polar checkout
      window.location.href = checkoutUrl.toString();
    } catch (error) {
      console.error("Error processing plan selection:", error);
      toast.error("Failed to process plan selection. Please try again.");
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex flex-col items-center space-y-6">
            <DialogTitle className="text-2xl font-semibold">
              Select your plan
            </DialogTitle>

            {/* Billing Period Toggle - Centered */}
            <div className="flex items-center gap-4">
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
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={currency === "USD" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrency("USD")}
                className="flex items-center gap-1"
              >
                <DollarSign className="h-4 w-4" />
                USD
              </Button>
              <Button
                variant={currency === "NGN" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrency("NGN")}
                className="flex items-center gap-1"
              >
                <Globe className="h-4 w-4" />
                NGN
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Pricing plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 pb-6">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-lg border p-6 bg-card flex flex-col",
                plan.isPopular && "border-green-600 shadow-lg",
                plan.name === "Starter" && "border-blue-200 bg-blue-50",
                currentPlanName === plan.name &&
                  "border-blue-600 bg-blue-50 shadow-lg"
              )}
            >
              {plan.isPopular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-600 hover:bg-green-600 text-white">
                  POPULAR
                </Badge>
              )}
              {currentPlanName === plan.name && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-600 text-white">
                  CURRENT PLAN
                </Badge>
              )}

              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold transition-all duration-300 ease-in-out">
                          {formatPrice(plan.name, currency, billingPeriod)}
                        </span>
                        {plan.name !== 'Custom' && (
                          <span className="text-muted-foreground text-sm">
                            {billingPeriod === "annual" ? "/month" : "/month"}
                          </span>
                        )}
                      </div>
                      {/* Reserve space to prevent modal shifting */}
                      <div className="mt-1 h-8 flex flex-col justify-center">
                        <div className="transition-all duration-300 ease-in-out transform">
                          {plan.name === "Custom" ? (
                            <div className="opacity-100 translate-y-0 transition-all duration-300 ease-in-out">
                              <div className="text-xs text-muted-foreground">
                                Custom pricing available
                              </div>
                            </div>
                          ) : billingPeriod === "annual" &&
                          plan.name !== "Starter" ? (
                            <div className="opacity-100 translate-y-0 transition-all duration-300 ease-in-out">
                              <div className="text-xs text-muted-foreground">
                                Billed annually:{" "}
                                {formatAnnualTotal(plan.name, currency)}
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                Save {getAnnualSavings(plan.name, currency)}
                                /year
                              </div>
                            </div>
                          ) : plan.name !== "Starter" ? (
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
                  </div>

                  <ul className="space-y-3 mt-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => handlePlanSelection(plan.name)}
                    disabled={isLoading || (currentPlanName === plan.name && isActive)}
                    className={cn(
                      "w-full",
                      currentPlanName === plan.name
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : plan.name === "Starter"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : plan.name === "Custom"
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : plan.isPopular
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    {isLoading && selectedPlan === plan.name ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : currentPlanName === plan.name && isActive ? (
                      "Current Plan"
                    ) : currentPlanName === plan.name && !isActive ? (
                      "Renew Plan"
                    ) : plan.name === "Starter" ? (
                      "Get Started"
                    ) : plan.name === "Custom" ? (
                      "Contact US"
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
