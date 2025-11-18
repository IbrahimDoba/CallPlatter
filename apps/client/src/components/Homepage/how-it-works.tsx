"use client"

import { motion } from "framer-motion"
import { Phone, Bot, MessageCircle, Calendar } from "lucide-react"

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

const steps = [
  {
    icon: Phone,
    title: "Customer Calls",
    description: "User calls about password reset, KYC status, or transaction question during high-volume period",
    bgColor: "bg-white",
    textColor: "text-primary",
  },
  {
    icon: Bot,
    title: "AI Handles Tier-1",
    description: "AI instantly answers common questions, checks account status, and provides step-by-step guidance",
    bgColor: "bg-primary",
    textColor: "text-white",
  },
  {
    icon: MessageCircle,
    title: "Smart Routing",
    description: "Complex issues route to your team with full context - no repetition needed from customer",
    bgColor: "bg-white",
    textColor: "text-primary",
  },
  {
    icon: Calendar,
    title: "Issue Resolved",
    description: "Customer gets instant answer or warm handoff to specialist. Average handle time reduced by 40%",
    bgColor: "bg-primary",
    textColor: "text-white",
  },
]

export default function HowItWorks() {
  return (
    <section className=" py-30 bg-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6" {...fadeInUp}>
            How It{" "}
            <span className="text-primary">Works</span>
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            From setup to scale in 48 hours. No engineering resources required.
          </motion.p>
        </div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <motion.div key={step.title} variants={fadeInUp} className="text-center relative">
                <motion.div
                  className={`w-24 h-24 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg border-2 border-primary/20`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent className={`w-10 h-10 ${step.textColor}`} />
                </motion.div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 text-lg">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-16 h-1 bg-gradient-to-r from-gray-400 to-transparent transform translate-x-4 rounded-full opacity-30" />
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
