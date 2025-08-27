"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

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

const pricingPlans = [
  {
    name: "Starter",
    price: "₦5,000",
    period: "per month",
    features: ["100 AI calls per month", "Basic appointment booking", "Business dashboard", "Email support"],
    popular: false,
  },
  {
    name: "Professional",
    price: "₦15,000",
    period: "per month",
    features: [
      "500 AI calls per month",
      "Advanced appointment booking",
      "Advanced analytics",
      "Calendar integrations",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "₦50,000",
    period: "per month",
    features: [
      "Unlimited AI calls",
      "Custom AI training",
      "White-label solution",
      "API access",
      "Dedicated support manager",
    ],
    popular: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="mb-32 container mx-auto px-6">
      <div className="text-center mb-16">
        <motion.h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6" {...fadeInUp}>
          Simple,{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transparent
          </span>{" "}
          Pricing
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          No hidden fees. Pay only for what you use.
        </motion.p>
      </div>

      <motion.div
        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`relative bg-white/80 backdrop-blur-lg rounded-3xl p-8 border-2 ${
              plan.popular ? "border-blue-500 shadow-xl shadow-blue-500/25" : "border-gray-200 shadow-lg"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2">
                  Most Popular
                </Badge>
              </div>
            )}
            <div className="text-center mb-8 mt-4">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{plan.name}</h3>
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {plan.price}
              </div>
              <div className="text-gray-600 text-lg">{plan.period}</div>
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`w-full py-4 ${
                plan.popular
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              }`}
            >
              {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
