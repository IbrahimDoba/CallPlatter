"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { PartyPopper, Phone } from "lucide-react";
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
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat m-0 p-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-background/50" />

        {/* Content */}
        <div className="relative z-10 bottom-25 container mx-auto px-6 text-center flex flex-col items-center justify-center min-h-screen">
          <motion.div {...fadeInUp} className="mb-8">
            <ShimmerButton background="bg-transparent" >
              <Link
                href="tel:+17344156557"
                className="inline-flex items-center rounded-full font-semibold text-sm"
              >
                <Phone className="mr-2" size={16} />
                <span>Call our AI receptionist (734) 415-6557</span>
              </Link>
            </ShimmerButton>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight drop-shadow-2xl font-poppins max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            AI that secures your calls while you{" "}
            <span className="text-primary">
              focus on your business
            </span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            DailZero is the AI receptionist that answers, filters, and manages
            every call just like a real assistant, so you never miss a customer.
            Time is money.
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 shadow-lg transform hover:scale-105 transition-all"
            >
              <Link href="/waitlist">Join Waitlist</Link>
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
            className="text-sm text-muted-foreground drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Early access • Exclusive pricing • Launch updates
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
                  className="text-center bg-card/95 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-border shadow-lg"
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-medium text-xs md:text-sm">
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
