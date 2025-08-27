"use client"

import { motion } from "framer-motion"
import { Phone, Calendar, BarChart3, Globe, Clock, Shield } from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const features = [
  {
    icon: Phone,
    title: "AI Voice Assistant",
    description:
      "Natural conversation handling with advanced speech recognition. Our AI understands Nigerian accents and local business contexts.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Calendar,
    title: "Smart Appointment Booking",
    description:
      "Automatically schedule appointments during calls. Integrates with your calendar and sends reminders to customers.",
    gradient: "from-green-500 to-green-600",
  },
  {
    icon: BarChart3,
    title: "Business Dashboard",
    description:
      "Track calls, appointments, and customer interactions. Get insights into your business communications patterns.",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: Globe,
    title: "Africa's Talking Integration",
    description:
      "Optimized for Nigerian telecom networks with better pricing and regulatory compliance than international alternatives.",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "Never miss a customer call again. Our AI works around the clock to ensure your business never loses potential customers.",
    gradient: "from-red-500 to-red-600",
  },
  {
    icon: Shield,
    title: "Multi-Tenant Security",
    description: "Enterprise-grade security with complete data isolation. Your business data is protected and private.",
    gradient: "from-indigo-500 to-indigo-600",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="mb-32 container mx-auto px-6">
      <div className="text-center mb-16">
        <motion.h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6" {...fadeInUp}>
          Why Choose{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CallPlatter
          </span>
          ?
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Built specifically for Nigerian businesses with local network optimization and regulatory compliance.
        </motion.p>
      </div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            whileHover={{ y: -10, rotateX: 5 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div
              className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
            >
              <feature.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
            <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
