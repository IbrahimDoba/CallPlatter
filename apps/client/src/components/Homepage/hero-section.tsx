"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { PartyPopper, Phone, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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
  const [showVideo, setShowVideo] = useState(false);

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
            The AI Receptionist for
            <br />
            <span className="text-primary">
              Online Banks & Currency Exchanges
            </span>
          </motion.h1>

          <motion.p
            className="text-base md:text-lg text-gray-600 mb-10 max-w-3xl leading-relaxed mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Handle balance inquiries, transaction tracking, KYC
            verification, and real-time exchange rates automatically - 24/7. Built
            for digital banks, neobanks, and forex platforms.
            <strong>
              80% call deflection. 60% cost reduction. Zero hiring.
            </strong>
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
              <div className="relative w-full max-w-7xl mx-auto border-4 border-primary/40 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-gray-50">
                {showVideo ? (
                  <div className="relative w-full aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/XjoQN_BA2vk?si=m6W1eJSL00by1f-K&autoplay=1"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                      className="w-full h-full"
                    />
                    <button
                      onClick={() => setShowVideo(false)}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-full aspect-video">
                      <Image
                        src="/hero-img.png"
                        alt="DailZero AI Receptionist Dashboard"
                        width={1400}
                        height={800}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.button
                        onClick={() => setShowVideo(true)}
                        className="bg-primary/90 hover:bg-primary text-white rounded-full p-6 shadow-2xl transition-all duration-300 hover:scale-110"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="w-12 h-12 ml-1" fill="currentColor" />
                      </motion.button>
                    </div>

                    {/* Subtle overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

// i want you to create a section for me, we will have a text saying AI Agents that handle evert request (icon), grow with businsess (icon, and deliver better (icon) results over time, in large ttext, when we scroll to this we want the text to be light/gray then be black,(an animation) then below will be 5 cards, in two rows, 2 cards in one row, and 3 in the second,
