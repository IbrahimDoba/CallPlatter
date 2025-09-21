"use client"

import { motion } from "framer-motion"
import { Check, DollarSign, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CardSpotlight } from "./CardSpotlight"
import { useState } from "react"
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
      "Call recordings & transcription",
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

const PricingTier = ({
  name,
  price,
  description,
  features,
  isPopular,
  currency,
  isAnnual,
}: {
  name: string
  price: string
  description: string
  features: string[]
  isPopular?: boolean
  currency: 'USD' | 'NGN'
  isAnnual: boolean
}) => (
  <CardSpotlight className={`h-full ${isPopular ? "border-blue-500" : "border-white/10"} border-2`}>
    <div className="relative h-full p-6 flex flex-col">
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-600 text-white">
          POPULAR
        </Badge>
      )}
      <h3 className="text-xl font-medium mb-2 text-white">{name}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{price}</span>
        <span className="text-gray-400 text-sm ml-1">
          {isAnnual ? 'per year' : 'per month'}
        </span>
      </div>
      <p className="text-gray-400 mb-6">{description}</p>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
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
)

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN')

  const formatPrice = (planName: string) => {
    if (currency === 'NGN') {
      const planPricing = nigerianPricing[planName as keyof typeof nigerianPricing]
      const nigerianPrice = isAnnual ? planPricing.annual : planPricing.monthly
      return `₦${nigerianPrice.toLocaleString()}`
    }
    const planPricing = usdPricing[planName as keyof typeof usdPricing]
    const usdPrice = isAnnual ? planPricing.annual : planPricing.monthly
    return `$${usdPrice.toFixed(2)}`
  }

  return (
    <section id="pricing" className="py-10" style={{ backgroundColor: '#343434' }}>
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-normal mb-6 text-white"
          >
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-medium">DailZero Plan</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-lg text-gray-400"
          >
            Select the perfect plan with advanced AI features and competitive pricing
          </motion.p>
        </div>

        {/* Currency Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
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

        {/* Annual discount toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Switch 
            checked={isAnnual} 
            onCheckedChange={setIsAnnual} 
            className="data-[state=checked]:bg-green-600"
          />
          <span className="text-sm text-gray-300">
            {currency === 'NGN' ? (
              <>
                Annual pricing <span className="text-green-400 font-medium">(Save ~10%)</span>
              </>
            ) : (
              <>
                Annual discount <span className="text-green-400 font-medium">-20%</span>
              </>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PricingTier
              key={plan.name}
              name={plan.name}
              price={formatPrice(plan.name)}
              description={plan.name === "Starter" ? "Perfect for small businesses starting their AI journey" : 
                          plan.name === "Business" ? "Advanced features for growing businesses" : 
                          "Enterprise-grade solutions for large organizations"}
              features={plan.features}
              isPopular={plan.isPopular}
              currency={currency}
              isAnnual={isAnnual}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
