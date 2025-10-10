"use client"

import type React from "react"

import { useState } from "react"
import { Check, DollarSign, Globe } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PricingPlan {
  name: string
  price: number
  annualPrice: number
  isPopular?: boolean
  features: string[]
}

const plans: PricingPlan[] = [
  {
    name: "FREE",
    price: 0,
    annualPrice: 0,
    features: [
      "5 minutes included",
      "No overage charges",
      "Basic AI receptionist",
      "Call recordings",
      "Call summaries",
      "Perfect for testing",
    ],
  },
  {
    name: "Starter",
    price: 18.18,
    annualPrice: 18.18,
    features: [
      "38 minutes included",
      "₦1,467/min ($0.89/min) after limit",
      "24/7 AI answering",
      "Instant call summaries",
      "Call recordings & transcription",
      "Spam blocking",
      "Zapier integration",
    ],
  },
  {
    name: "Business",
    price: 43.03,
    annualPrice: 43.03,
    isPopular: true,
    features: [
      "105 minutes included",
      "₦1,000/min ($0.61/min) after limit",
      "24/7 AI answering",
      "Instant call summaries",
      "Call recordings & transcription",
      "Spam blocking",
      "Zapier integration",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: 115.15,
    annualPrice: 115.15,
    features: [
      "300 minutes included",
      "₦733/min ($0.44/min) after limit",
      "24/7 AI answering",
      "Instant call summaries",
      "Call recordings & transcription",
      "Spam blocking",
      "Zapier integration",
      "Priority support",
      "Custom integrations",
    ],
  },
]

// Nigerian pricing structure (Monthly fees in NGN)
const nigerianPricing = {
  FREE: {
    monthly: 0,
  },
  Starter: {
    monthly: 30000, // ₦30,000
  },
  Business: {
    monthly: 71000, // ₦71,000
  },
  Enterprise: {
    monthly: 190000, // ₦190,000
  },
}

// USD pricing structure (Monthly fees in USD)
const usdPricing = {
  FREE: {
    monthly: 0,
  },
  Starter: {
    monthly: 18.18, // $18.18
  },
  Business: {
    monthly: 43.03, // $43.03
  },
  Enterprise: {
    monthly: 115.15, // $115.15
  },
}

// Note: Nigerian pricing uses fixed annual rates, not USD conversion

interface PricingModalProps {
  children: React.ReactNode
  currentPlan?: string
}

export function PricingModal({ children, currentPlan }: PricingModalProps) {
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN')

  const formatPrice = (planName: string) => {
    if (currency === 'NGN') {
      // Use the specific Nigerian pricing structure
      const planPricing = nigerianPricing[planName as keyof typeof nigerianPricing]
      const nigerianPrice = planPricing.monthly
      return `₦${nigerianPrice.toLocaleString()}`
    }
    // Use the specific USD pricing structure
    const planPricing = usdPricing[planName as keyof typeof usdPricing]
    const usdPrice = planPricing.monthly
    return `$${usdPrice.toFixed(2)}`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">Select your plan</DialogTitle>
            <div className="flex items-center gap-2 mr-12">
              <Button
                variant={currency === 'USD' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrency('USD')}
                className="flex items-center gap-1"
              >
                <DollarSign className="h-4 w-4" />
                USD
              </Button>
              <Button
                variant={currency === 'NGN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrency('NGN')}
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
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-lg border p-6 bg-card flex flex-col", 
                plan.isPopular && "border-green-600 shadow-lg",
                plan.name === 'FREE' && "border-blue-200 bg-blue-50",
                currentPlan === plan.name && "border-blue-600 bg-blue-50 shadow-lg"
              )}
            >
              {plan.isPopular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-600 hover:bg-green-600 text-white">
                  POPULAR
                </Badge>
              )}
              {currentPlan === plan.name && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-600 text-white">
                  CURRENT PLAN
                </Badge>
              )}

              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">
                        {formatPrice(plan.name)}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">
                        per month
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mt-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Button
                    className={cn(
                      "w-full",
                      currentPlan === plan.name
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : plan.name === 'FREE'
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : plan.isPopular
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground",
                    )}
                  >
                    {currentPlan === plan.name 
                      ? 'Current Plan' 
                      : plan.name === 'FREE' 
                      ? 'Get Started' 
                      : 'Select plan'
                    }
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
