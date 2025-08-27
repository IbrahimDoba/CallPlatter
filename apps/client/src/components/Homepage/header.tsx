"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Phone, Menu, X } from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
}

const pulseAnimation = {
  animate: {
    scale: [0.8, 1.2, 0.8],
    opacity: [1, 0, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut" as const,
    },
  },
}

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <>
      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileNavOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CallPlatter
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <nav className="space-y-6">
                <a
                  href="#features"
                  onClick={() => setMobileNavOpen(false)}
                  className="block text-gray-600 hover:text-blue-600 transition-colors font-medium text-lg"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileNavOpen(false)}
                  className="block text-gray-600 hover:text-blue-600 transition-colors font-medium text-lg"
                >
                  Pricing
                </a>
                <a
                  href="#testimonials"
                  onClick={() => setMobileNavOpen(false)}
                  className="block text-gray-600 hover:text-blue-600 transition-colors font-medium text-lg"
                >
                  Testimonials
                </a>
                <a
                  href="#about"
                  onClick={() => setMobileNavOpen(false)}
                  className="block text-gray-600 hover:text-blue-600 transition-colors font-medium text-lg"
                >
                  About
                </a>
                <div className="pt-6 border-t">
                  <Button variant="ghost" className="w-full mb-4 justify-start">
                    Sign In
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-40">
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div className="flex items-center gap-3" {...fadeInUp}>
              <div className="relative">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                  {...pulseAnimation}
                />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CallPlatter
              </span>
            </motion.div>

            <motion.div
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Testimonials
              </a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                About
              </a>
            </motion.div>

            <motion.div
              className="hidden md:flex items-center space-x-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Button variant="ghost">Sign In</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                Get Started
              </Button>
            </motion.div>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileNavOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </nav>
      </header>
    </>
  )
}
