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
    <section className="text-center py-20 bg-stone-100">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          className="bg-primary rounded-3xl p-12 md:p-16 text-primary-foreground shadow-2xl"
          whileHover={{ scale: 1.02 }}
          {...fadeInUp}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
            Join thousands of businesses worldwide that never miss a call with DailZero's AI receptionist
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Link href="/waitlist">
              <Button
                size="lg"
                className="bg-background text-primary hover:bg-background/90 text-xl font-bold px-12 py-5 shadow-lg transform hover:scale-105 transition-all"
              >
                Join the Waitlist
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-xl font-bold px-12 py-5 transform hover:scale-105 transition-all bg-transparent"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <p className="text-lg opacity-80">Early access • Exclusive pricing • Launch updates</p>
        </motion.div>
      </div>
    </section>
  )
}
