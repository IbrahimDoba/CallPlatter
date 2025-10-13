export const siteConfig = {
  name: "DailZero",
  description: "AI-powered receptionist that answers missed calls and manages your business communications 24/7.",
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
      title: "24/7 AI Receptionist",
      description: "Never miss a call again with our intelligent AI that handles calls around the clock",
    },
    {
      title: "Appointment Booking",
      description: "Automatically schedule appointments and manage your calendar seamlessly",
    },
    {
      title: "Multi-Accent Support",
      description: "Natural accent recognition and expressions for better customer experience worldwide",
    },
    {
      title: "CRM Integration",
      description: "Connect with your existing CRM and manage customer relationships effectively",
    },
    {
      title: "Call Analytics",
      description: "Detailed insights and reports on your call performance and customer interactions",
    },
    {
      title: "Multi-language Support",
      description: "Support for multiple languages and dialects worldwide",
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
    email: "info@dailzero.com",
    phone: "+1 (555) 123-4567",
    address: "Global",
    supportEmail: "info@dailzero.com",
  },
  companyInfo: {
    founded: "2025",
    employees: "1",
    certifications: [
      "GDPR Compliant",
      "SOC 2 Type II Certified"
    ],
    expertise: [
      "AI Voice Technology",
      "Natural Language Processing",
      "Call Center Automation",
      "CRM Integration",
      "Real-time Communication",
      "Global Business Solutions"
    ],
    technologies: [
      "OpenAI GPT-4",
      "Twilio Voice API",
      "WebSocket Real-time",
      "PostgreSQL Database",
      "Next.js Frontend",
      "Express.js Backend"
    ]
  },
  socialProof: {
    customers: "500+",
    callsHandled: "10,000+",
    satisfaction: "98%",
    uptime: "99.9%"
  },
  testimonials: [
    {
      name: "Sarah Johnson",
      company: "Metro Medical Center",
      role: "Practice Manager",
      content: "DailZero has transformed how we handle patient calls. Our appointment bookings increased by 40% since implementing the AI receptionist.",
      rating: 5
    },
    {
      name: "Michael Chen",
      company: "Tech Solutions Inc",
      role: "CEO",
      content: "The multi-accent feature is amazing! Our customers feel more comfortable speaking with an AI that understands their local context.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      company: "Global Law Firm",
      role: "Managing Partner",
      content: "Professional and efficient. Never missed a client call since using DailZero. The CRM integration is seamless.",
      rating: 5
    }
  ]
}

export type SiteConfig = typeof siteConfig
