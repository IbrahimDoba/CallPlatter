"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
}

export default function CTASection() {
  return (
    <section className="text-center py-20 mb-16" style={{ backgroundColor: '#343434' }}>
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl"
          whileHover={{ scale: 1.02 }}
          {...fadeInUp}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
            Join thousands of Nigerian businesses that never miss a call with DailZero's AI receptionist
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-xl font-bold px-12 py-5 shadow-lg transform hover:scale-105 transition-all"
              >
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-xl font-bold px-12 py-5 transform hover:scale-105 transition-all bg-transparent"
              >
                Schedule Demo
              </Button>
            </Link>
          </div>

          <p className="text-lg opacity-80">14-day free trial • No setup fees • Cancel anytime</p>
        </motion.div>
      </div>
    </section>
  )
}
