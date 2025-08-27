"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

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

export default function HeroSection() {
  return (
    <main className="container mx-auto px-6">
      <div className="text-center py-20">
        <motion.div {...fadeInUp}>
          <Badge
            variant="secondary"
            className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0"
          >
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered for Nigerian Businesses
          </Badge>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          Your AI Receptionist
          <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Never Miss a Call
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Transform your business with an intelligent AI receptionist that answers missed calls, books appointments, and
          manages customer communications 24/7.
          <span className="font-semibold text-blue-600"> Optimized for Nigerian networks.</span>
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-10 py-4 shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-all"
          >
            Start Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-10 py-4 border-2 hover:bg-white/80 transform hover:scale-105 transition-all bg-transparent"
          >
            Watch Demo
          </Button>
        </motion.div>

        <motion.p
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          No credit card required • 14-day free trial
        </motion.p>
      </div>

      {/* Floating Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-32"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {[
          { value: "99%", label: "Call Answer Rate" },
          { value: "24/7", label: "Availability" },
          { value: "5min", label: "Setup Time" },
          { value: "1000+", label: "Happy Businesses" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            whileHover={{ y: -10, rotateX: 5 }}
            className="text-center bg-white/80 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20 shadow-lg"
          >
            <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              {stat.value}
            </div>
            <div className="text-gray-600 font-medium text-sm md:text-base">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
