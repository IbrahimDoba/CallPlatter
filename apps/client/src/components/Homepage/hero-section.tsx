"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { PartyPopper, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    <main className="relative flex items-center justify-center overflow-hidden bg-white">
      {/* Grid background */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] z-0" />
      {/* Content */}
      <div className="container mx-auto px-6 flex flex-col items-center justify-center py-20 pt-32 relative z-10">
        {/* Text content */}
        <div className="w-full text-center mb-12">
          <motion.div {...fadeInUp} className="mb-8">
            <ShimmerButton background="bg-transparent">
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
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight font-poppins"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            AI that secures your calls while you{" "}
            <span className="text-primary">focus on your business</span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-gray-600 mb-10 max-w-2xl leading-relaxed mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            DailZero is the AI receptionist that answers, filters, and manages
            every call just like a real assistant, so you never miss a customer.
            Time is money.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16"
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
          </motion.div>
        </div>

        {/* Hero Image */}
        <div className="w-full flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative w-full max-w-6xl"
          >
            <div className="relative">
              {/* Glow effect behind the image */}
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-2xl" />

              {/* Main image container */}
              <div className="relative w-full border-4 border-primary/40 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-gray-50">
                <Image
                  src="/hero-img.png"
                  alt="DailZero AI Receptionist Dashboard"
                  width={1400}
                  height={800}
                  className="w-full h-auto object-cover"
                  priority
                />

                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

// i want you to create a section for me, we will have a text saying AI Agents that handle evert request (icon), grow with businsess (icon, and deliver better (icon) results over time, in large ttext, when we scroll to this we want the text to be light/gray then be black,(an animation) then below will be 5 cards, in two rows, 2 cards in one row, and 3 in the second,
