"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock, Rocket, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function WhatsNewPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Header */}
          <motion.div {...fadeInUp} className="mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              What's New
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent p-3">
              Coming Soon
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We're working on exciting new features to make DailZero even better. 
              Stay tuned for amazing updates!
            </p>
          </motion.div>

          {/* Coming Soon Features */}
          <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Advanced AI Features
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enhanced AI capabilities with better conversation understanding and smarter call routing.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Smart Notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Intelligent notification system that keeps you informed about important calls and updates.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Real-time Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive analytics dashboard with real-time insights into your call performance.
              </p>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div {...fadeInUp} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-lg mb-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              Development Timeline
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Q1 2024</h3>
                  <p className="text-gray-600 dark:text-gray-300">Enhanced AI Features & Smart Notifications</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Q2 2024</h3>
                  <p className="text-gray-600 dark:text-gray-300">Real-time Analytics & Advanced Reporting</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Q3 2024</h3>
                  <p className="text-gray-600 dark:text-gray-300">Mobile App & API Integrations</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div {...fadeInUp} className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Want to be notified when these features are ready?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
              >
                <Bell className="h-5 w-5 mr-2" />
                Notify Me
              </Button>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-3 border-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
