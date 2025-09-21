"use client"

import { motion } from "framer-motion"
import { Users, Zap, Heart } from "lucide-react"

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

export default function AboutSection() {
  return (
    <section id="about" className="mb-32 container mx-auto px-6">
      <motion.div
        className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 md:p-16 border border-white/20 shadow-lg"
        {...fadeInUp}
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DailZero
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We're a Nigerian tech company dedicated to helping local businesses thrive through AI-powered communication
            solutions. Founded in Lagos with a deep understanding of the Nigerian market, we bridge the gap between
            cutting-edge AI technology and practical business needs.
          </p>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-16"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {[
            {
              icon: Users,
              title: "Local Expertise",
              description: "Built by Nigerians for Nigerian businesses with deep local market understanding",
              gradient: "from-blue-500 to-purple-600",
            },
            {
              icon: Zap,
              title: "Cutting-Edge AI",
              description: "Advanced AI technology optimized for African telecommunications infrastructure",
              gradient: "from-green-500 to-blue-600",
            },
            {
              icon: Heart,
              title: "Customer First",
              description: "Dedicated support team that understands your business challenges and goals",
              gradient: "from-purple-500 to-pink-600",
            },
          ].map((item, index) => (
            <motion.div key={index} variants={fadeInUp} className="text-center">
              <div
                className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
              >
                <item.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
              <p className="text-gray-600 text-lg">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
