export const siteConfig = {
  name: "DailZero",
  description: "AI-powered tier-1 support for fintech companies. Handle 80% of customer calls instantly, route complex issues to your team. Reduce support costs by 60% while scaling during volatility.",
  url: "https://dailzero.com",
  ogImage: "/og-image.png",
  links: {
    twitter: "@Dobaibrahim",
  },
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Features",
      href: "/#features",
    },
    {
      title: "Pricing",
      href: "/#pricing",
    },
    {
      title: "How It Works",
      href: "/#how-it-works",
    },
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Contact",
      href: "/contact",
    },
  ],
  features: [
    {
      title: "Tier-1 Support Automation",
      description: "AI handles password resets, account questions, KYC status checks, and basic navigation - 80% call deflection",
    },
    {
      title: "Intelligent Call Routing",
      description: "Complex issues route to your team with full context. Reduces escalation friction and improves resolution time",
    },
    {
      title: "Volatility Scaling",
      description: "Handle 300-500% volume spikes during market events, product launches, or funding rounds without hiring",
    },
    {
      title: "Fintech Platform Integration",
      description: "Connect with Plaid, Stripe, Salesforce, banking cores, and KYC providers for real-time data access",
    },
    {
      title: "Compliance & Security",
      description: "PCI-DSS, SOC 2, GDPR compliant. Encrypted calls, audit trails, and regulatory-ready documentation",
    },
    {
      title: "24/7 Global Coverage",
      description: "Support customers across all time zones in 40+ languages. Never miss urgent account or transaction issues",
    },
  ],
  pricing: {
    plans: [
      {
        name: "Starter",
        price: "₦30,000",
        period: "per month",
        description: "Perfect for small businesses starting their AI journey",
        features: [
          "38 minutes included",
          "₦1,467/min ($0.89/min) after limit",
          "24/7 AI answering",
          "Instant call summaries",
          "Call recordings & transcription",
          "Spam blocking",
          "Zapier integration",
        ],
        popular: false,
      },
      {
        name: "Business",
        price: "₦71,000",
        period: "per month",
        description: "Advanced features for growing businesses",
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
        popular: true,
      },
      {
        name: "Enterprise",
        price: "₦190,000",
        period: "per month",
        description: "Enterprise-grade solutions for large organizations",
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
        popular: false,
      },
    ],
    nigerianPricing: {
      Starter: {
        annual: 300000, // ₦300,000
        monthly: 30000,
      },
      Business: {
        annual: 710000, // ₦710,000
        monthly: 71000,
      },
      Enterprise: {
        annual: 1900000, // ₦1,900,000
        monthly: 190000,
      },
    },
    usdPricing: {
      Starter: {
        annual: 218.16, // $218.16
        monthly: 18.18,
      },
      Business: {
        annual: 516.36, // $516.36
        monthly: 43.03,
      },
      Enterprise: {
        annual: 1381.80, // $1,381.80
        monthly: 115.15,
      },
    },
  },
  contact: {
    email: "support@dailzero.com",
    phone: "+234 81 4911 3328",
    supportEmail: "support@dailzero.com",
  },
  companyInfo: {
    founded: "2025",
    employees: "1",
    certifications: [
      "PCI-DSS Compliant",
      "SOC 2 Type II Certified",
      "GDPR Compliant"
    ],
    expertise: [
      "Fintech Customer Support",
      "AI Voice Technology",
      "KYC/AML Support",
      "Payment Processing Support",
      "Digital Banking Operations",
      "Regulatory Compliance",
      "Call Deflection & Routing",
      "Tier-1 Support Automation"
    ],
    technologies: [
      "OpenAI GPT-4",
      "Twilio Voice API",
      "Plaid Integration",
      "Stripe Integration",
      "Salesforce API",
      "Banking-as-a-Service Platforms"
    ]
  },
  socialProof: {
    customers: "50+ Fintech Companies",
    callsHandled: "100,000+",
    callDeflection: "80%",
    costReduction: "60%"
  },
  testimonials: [
    {
      name: "Alex Martinez",
      company: "NeoBank Pro",
      role: "Head of Customer Support",
      content: "DailZero reduced our support costs by 65%. We handle 10x more calls with the same team size. During our Series B announcement, we had 500% call spike - DailZero scaled instantly.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      company: "CryptoExchange.io",
      role: "VP of Operations",
      content: "Market volatility used to crash our support lines. Now AI handles password resets and account questions while our team focuses on complex trading issues. Game changer.",
      rating: 5
    },
    {
      name: "James Chen",
      company: "PayFlow Systems",
      role: "CTO",
      content: "The compliance features are exactly what we needed. PCI-DSS compliant, encrypted calls, audit trails - our regulators were impressed. Integration with our payment API was seamless.",
      rating: 5
    }
  ]
}

export type SiteConfig = typeof siteConfig
