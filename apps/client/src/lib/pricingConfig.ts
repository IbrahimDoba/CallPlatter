export interface PricingPlan {
  name: string
  price: number
  annualPriceMonthly: number
  annualPriceYearly: number
  isPopular?: boolean
  features: string[]
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "FREE",
    price: 0,
    annualPriceMonthly: 0,
    annualPriceYearly: 0,
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
    price: 20,
    annualPriceMonthly: 16,
    annualPriceYearly: 192,
    features: [
      "40 minutes included",
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
    price: 45,
    annualPriceMonthly: 36,
    annualPriceYearly: 432,
    isPopular: true,
    features: [
      "110 minutes included",
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
    price: 120,
    annualPriceMonthly: 96,
    annualPriceYearly: 1152,
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

// 🇳🇬 Nigerian Pricing (in Naira)
export const nigerianPricing = {
    FREE: {
      monthly: 0,
      annual: {
        monthly: 0,
        total: 0,
      },
    },
    Starter: {
      monthly: 33000, // ₦33,000/mo (≈$20)
      annual: {
        monthly: 26400, // ₦26,400/mo billed annually (20% off)
        total: 316800,  // ₦316,800/year
      },
    },
    Business: {
      monthly: 74250, // ₦74,250/mo (≈$45)
      annual: {
        monthly: 59400, // ₦59,400/mo billed annually (20% off)
        total: 712800,  // ₦712,800/year
      },
    },
    Enterprise: {
      monthly: 198000, // ₦198,000/mo (≈$120)
      annual: {
        monthly: 158400, // ₦158,400/mo billed annually (20% off)
        total: 1900800,  // ₦1,900,800/year
      },
    },
  }
  
  // 💵 USD Pricing
  export const usdPricing = {
    FREE: {
      monthly: 0,
      annual: {
        monthly: 0,
        total: 0,
      },
    },
    Starter: {
      monthly: 20, // $20/mo
      annual: {
        monthly: 16, // $16/mo billed annually (20% off)
        total: 192,  // $192/year
      },
    },
    Business: {
      monthly: 45, // $45/mo
      annual: {
        monthly: 36, // $36/mo billed annually (20% off)
        total: 432,  // $432/year
      },
    },
    Enterprise: {
      monthly: 120, // $120/mo
      annual: {
        monthly: 96, // $96/mo billed annually (20% off)
        total: 1152, // $1,152/year
      },
    },
  }
  

// Plan type mapping for API calls
export const planTypeMap: Record<string, string> = {
  'FREE': 'FREE',
  'Starter': 'STARTER', 
  'Business': 'BUSINESS',
  'Enterprise': 'ENTERPRISE'
}

// Utility function to format price based on currency and billing period
export const formatPrice = (planName: string, currency: 'USD' | 'NGN', billingPeriod: 'monthly' | 'annual' = 'monthly'): string => {
  if (currency === 'NGN') {
    const planPricing = nigerianPricing[planName as keyof typeof nigerianPricing]
    if (billingPeriod === 'annual') {
      const nigerianPrice = planPricing.annual.monthly
      return `₦${nigerianPrice.toLocaleString()}`
    }
    const nigerianPrice = planPricing.monthly
    return `₦${nigerianPrice.toLocaleString()}`
  }
  
  const planPricing = usdPricing[planName as keyof typeof usdPricing]
  if (billingPeriod === 'annual') {
    const usdPrice = planPricing.annual.monthly
    return `$${usdPrice % 1 === 0 ? usdPrice.toFixed(0) : usdPrice.toFixed(2)}`
  }
  const usdPrice = planPricing.monthly
  return `$${usdPrice % 1 === 0 ? usdPrice.toFixed(0) : usdPrice.toFixed(2)}`
}

// Get annual total price
export const formatAnnualTotal = (planName: string, currency: 'USD' | 'NGN'): string => {
  if (currency === 'NGN') {
    const planPricing = nigerianPricing[planName as keyof typeof nigerianPricing]
    const total = planPricing.annual.total
    return `₦${total.toLocaleString()}`
  }
  
  const planPricing = usdPricing[planName as keyof typeof usdPricing]
  const total = planPricing.annual.total
  return `$${total % 1 === 0 ? total.toFixed(0) : total.toFixed(2)}`
}

// Get savings amount for annual billing
export const getAnnualSavings = (planName: string, currency: 'USD' | 'NGN'): string => {
  if (currency === 'NGN') {
    const planPricing = nigerianPricing[planName as keyof typeof nigerianPricing]
    const monthlyTotal = planPricing.monthly * 12
    const annualTotal = planPricing.annual.total
    const savings = monthlyTotal - annualTotal
    return `₦${savings.toLocaleString()}`
  }
  
  const planPricing = usdPricing[planName as keyof typeof usdPricing]
  const monthlyTotal = planPricing.monthly * 12
  const annualTotal = planPricing.annual.total
  const savings = monthlyTotal - annualTotal
  return `$${savings % 1 === 0 ? savings.toFixed(0) : savings.toFixed(2)}`
}

// Get plan by name
export const getPlanByName = (name: string): PricingPlan | undefined => {
  return pricingPlans.find(plan => plan.name === name)
}

// Get all plan names
export const getPlanNames = (): string[] => {
  return pricingPlans.map(plan => plan.name)
}

// Check if plan is popular
export const isPlanPopular = (planName: string): boolean => {
  const plan = getPlanByName(planName)
  return plan?.isPopular || false
}

// Get overage rates for each plan
export const getOverageRates = () => {
  return {
    FREE: "No overage charges",
    Starter: "₦1,467/min ($0.89/min) after limit",
    Business: "₦1,000/min ($0.61/min) after limit", 
    Enterprise: "₦733/min ($0.44/min) after limit"
  }
}

// Polar Product ID mapping - Use environment variables for different environments
export const polarProductIds: Record<string, string> = {
  'FREE': '', // Free plan doesn't need a product ID
  'Starter': process.env.NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID || 'cbce686f-d936-493d-81b1-55f116a911ca',
  'Business': process.env.NEXT_PUBLIC_POLAR_BUSINESS_PRODUCT_ID || '3e0adf02-4259-4f79-8661-d18a0377a41c', 
  'Enterprise': process.env.NEXT_PUBLIC_POLAR_ENTERPRISE_PRODUCT_ID || 'ae5c084c-46ac-46bf-9015-4259281193e8'
}

// Get Polar product ID for a plan
export const getProductId = (planName: string): string | null => {
  const productId = polarProductIds[planName] || null;
  console.log(`Getting product ID for ${planName}:`, productId);
  return productId;
}