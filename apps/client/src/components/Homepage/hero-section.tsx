"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartyPopper, Zap } from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HeroSection() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 bottom-25 container mx-auto px-6 text-center flex flex-col items-center justify-center min-h-screen">
        <motion.div {...fadeInUp} className="mb-8">
          <Badge
            variant="secondary"
            className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0"
          >
            <PartyPopper size={20} className="mr-2 text-orange-400" />
            AI-Powered for Nigerian Businesses
          </Badge>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight drop-shadow-2xl font-poppins"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          Your AI Receptionist
          <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
            Never Miss a Call
          </span>
        </motion.h1>

        <motion.p
          className="text-base md:text-lg text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Transform your business with an intelligent AI receptionist that
          answers missed calls, books appointments, and manages customer
          communications 24/7.
          <span className="font-semibold text-blue-300">
            {" "}
            Optimized for Nigerian networks.
          </span>
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Button
            asChild
            size="default"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-all"
          >
            <Link href="/login">Start Free Trial</Link>
          </Button>
          {/* <Button
            size="default"
            variant="outline"
            className="px-8 py-3 border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transform hover:scale-105 transition-all bg-transparent"
          >
            Watch Demo
          </Button> */}
        </motion.div>

        <motion.p
          className="text-sm text-gray-300 drop-shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          No credit card required • 14-day free trial
        </motion.p>
      </div>

      {/* Floating Stats */}
      <div className="absolute bottom-25 left-0 right-0 z-10">
        <div className="container mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { value: "99%", label: "Call Answer Rate" },
              { value: "24/7", label: "Availability" },
              { value: "5min", label: "Setup Time" },
              { value: "10+", label: "Happy Businesses" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.02 }}
                className="text-center bg-white/95 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/40 shadow-lg"
              >
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium text-xs md:text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
