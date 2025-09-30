export const siteConfig = {
  name: "DailZero",
  description: "AI-powered receptionist that answers missed calls and manages your business communications 24/7.",
  url: "https://dailzero.com",
  ogImage: "https://dailzero.com/og-image.png",
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
      title: "Nigerian Accent Support",
      description: "Natural Nigerian accent and expressions for better customer experience",
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
      description: "Support for English, Pidgin, and local Nigerian languages",
    },
  ],
  pricing: {
    plans: [
      {
        name: "Starter",
        price: "₦34,000",
        period: "per month",
        description: "Perfect for small businesses starting their AI journey",
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
        popular: false,
      },
      {
        name: "Business",
        price: "₦77,000",
        period: "per month",
        description: "Advanced features for growing businesses",
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
        popular: true,
      },
      {
        name: "Enterprise",
        price: "₦152,000",
        period: "per month",
        description: "Enterprise-grade solutions for large organizations",
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
        popular: false,
      },
    ],
    nigerianPricing: {
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
    },
    usdPricing: {
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
    },
  },
  contact: {
    email: "info@dailzero.com",
    phone: "+234 814 911 3328",
    address: "Abuja, Nigeria",
    supportEmail: "info@dailzero.com",
  },
  companyInfo: {
    founded: "2025",
    employees: "1",
    certifications: [
      "Nigerian Data Protection Act Compliant"
    ],
    expertise: [
      "AI Voice Technology",
      "Natural Language Processing",
      "Call Center Automation",
      "CRM Integration",
      "Real-time Communication",
      "Nigerian Business Solutions"
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
      company: "Lagos Medical Center",
      role: "Practice Manager",
      content: "DailZero has transformed how we handle patient calls. Our appointment bookings increased by 40% since implementing the AI receptionist.",
      rating: 5
    },
    {
      name: "Emeka Okafor",
      company: "Nigerian Tech Solutions",
      role: "CEO",
      content: "The Nigerian accent feature is amazing! Our customers feel more comfortable speaking with an AI that sounds like a local.",
      rating: 5
    },
    {
      name: "Aisha Mohammed",
      company: "Abuja Law Firm",
      role: "Managing Partner",
      content: "Professional and efficient. Never missed a client call since using DailZero. The CRM integration is seamless.",
      rating: 5
    }
  ]
}

export type SiteConfig = typeof siteConfig
