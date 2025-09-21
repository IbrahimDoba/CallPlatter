"use client"

import { motion } from "framer-motion"

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
    number: 1,
    title: "Customer Calls",
    description: "Customer dials your business number during off-hours or when you're busy",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    number: 2,
    title: "AI Answers",
    description: "Our AI receptionist picks up with a personalized greeting using your business name",
    gradient: "from-green-500 to-green-600",
  },
  {
    number: 3,
    title: "Natural Conversation",
    description: "AI understands customer intent and handles the conversation naturally",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    number: 4,
    title: "Appointment Booked",
    description: "Appointment is automatically scheduled and appears in your dashboard",
    gradient: "from-orange-500 to-orange-600",
  },
]

export default function HowItWorks() {
  return (
    <section className="mb-32 py-10" style={{ backgroundColor: '#343434' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 className="text-4xl md:text-6xl font-bold text-white mb-6" {...fadeInUp}>
            How It{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Works</span>
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Simple setup, powerful results. Get started in minutes.
          </motion.p>
        </div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={fadeInUp} className="text-center relative">
              <motion.div
                className={`w-24 h-24 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-3xl font-bold text-white">{step.number}</span>
              </motion.div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{step.title}</h3>
              <p className="text-gray-300 text-lg">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-16 h-1 bg-gradient-to-r from-gray-600 to-transparent transform translate-x-4 rounded-full opacity-30" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
