"use client"

import type React from "react"

import { useState } from "react"
import { Check, DollarSign, Globe } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
    name: "Starter",
    price: 24.95,
    annualPrice: 19.96,
    features: [
      "1,080 minutes included",
      "₦346/min ($0.23/min) after limit",
      "Annual savings ~13.5%",
      "24/7 answering",
      "Instant call summaries",
      "Call transfers",
      "Send text messages",
      "Call recordings & transcript ion",
      "Spam blocking",
      "Zapier integration",
    ],
  },
  {
    name: "Business",
    price: 59.95,
    annualPrice: 47.96,
    isPopular: true,
    features: [
      "2,640 minutes included",
      "₦321/min ($0.21/min) after limit",
      "Annual savings ~19.8%",
      "24/7 answering",
      "Instant call summaries",
      "Call transfers",
      "Send text messages",
      "Call recordings & transcription",
      "Spam blocking",
      "Zapier integration",
    ],
  },
  {
    name: "Enterprise",
    price: 159.95,
    annualPrice: 127.96,
    features: [
      "5,760 minutes included",
      "₦290/min ($0.19/min) after limit",
      "Annual savings ~27.5%",
      "24/7 answering",
      "Instant call summaries",
      "Call transfers",
      "Send text messages",
      "Call recordings & transcription",
      "Spam blocking",
      "Zapier integration",
    ],
  },
]

// Nigerian pricing structure (Annual and Monthly fees in NGN)
const nigerianPricing = {
  Starter: {
    annual: 374000, // ₦374,000 ($248)
    monthly: 34000,
  },
  Business: {
    annual: 847000, // ₦847,000 ($562)
    monthly: 77000,
  },
  Enterprise: {
    annual: 1672000, // ₦1,672,000 ($1,110)
    monthly: 152000,
  },
}

// USD pricing structure (Annual fees in USD)
const usdPricing = {
  Starter: {
    annual: 248, // $248
    monthly: 24.95,
  },
  Business: {
    annual: 562, // $562
    monthly: 59.95,
  },
  Enterprise: {
    annual: 1110, // $1,110
    monthly: 159.95,
  },
}

// Note: Nigerian pricing uses fixed annual rates, not USD conversion

interface PricingModalProps {
  children: React.ReactNode
}

export function PricingModal({ children }: PricingModalProps) {
  const [isAnnual, setIsAnnual] = useState(false)
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN')

  const formatPrice = (planName: string) => {
    if (currency === 'NGN') {
      // Use the specific Nigerian pricing structure
      const planPricing = nigerianPricing[planName as keyof typeof nigerianPricing]
      const nigerianPrice = isAnnual ? planPricing.annual : planPricing.monthly
      return `₦${nigerianPrice.toLocaleString()}`
    }
    // Use the specific USD pricing structure
    const planPricing = usdPricing[planName as keyof typeof usdPricing]
    const usdPrice = isAnnual ? planPricing.annual : planPricing.monthly
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

        {/* Annual discount toggle */}
        <div className="px-6 pb-6 max-w-6xl">
          <div className="flex items-center justify-center gap-3">
            <Switch 
              checked={isAnnual} 
              onCheckedChange={setIsAnnual} 
              className="data-[state=checked]:bg-green-600"
            />
            <span className="text-sm text-muted-foreground">
              {currency === 'NGN' ? (
                <>
                  Annual pricing <span className="text-green-600 font-medium">(Save ~10%)</span>
                </>
              ) : (
                <>
                  Annual discount <span className="text-green-600 font-medium">-20%</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Pricing plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn("relative rounded-lg border p-6 bg-card", plan.isPopular && "border-green-600 shadow-lg")}
            >
              {plan.isPopular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-600 hover:bg-green-600 text-white">
                  POPULAR
                </Badge>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">
                      {formatPrice(plan.name)}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      {isAnnual ? 'per year' : 'per month'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full",
                    plan.isPopular
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground",
                  )}
                >
                  Select plan
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
