"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CallAIButton } from "@/components/ui/call-ai-button";
import { ConversationShowcase } from "@/components/ui/conversation-showcase";
import Link from "next/link";
import Image from "next/image";

interface SectionHeroProps {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  imageSrc: string;
  imageAlt?: string;
  showCallButton?: boolean;
  className?: string;
  // Conversation showcase props (optional)
  useConversation?: boolean;
  customerMessage?: string;
  aiResponse?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

export function SectionHero({
  title,
  titleHighlight,
  subtitle,
  primaryButtonText = "Try for Free",
  primaryButtonHref = "/waitlist",
  secondaryButtonText = "Book a Demo",
  secondaryButtonHref = "/contact",
  imageSrc,
  imageAlt = "Hero Image",
  showCallButton = true,
  className = "",
  useConversation = false,
  customerMessage = "",
  aiResponse = "",
}: SectionHeroProps) {
  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-background ${className}`}
    >
      {/* Grid background */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] z-0" />

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col space-y-8">
            {/* Call AI Button */}
            {showCallButton && (
              <motion.div {...fadeInUp}>
                <CallAIButton />
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              {title}{" "}
              {titleHighlight && (
                <span className="text-primary">{titleHighlight}</span>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-base md:text-lg text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {subtitle}
            </motion.p>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-all"
              >
                <Link href={primaryButtonHref}>{primaryButtonText}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="shadow-md transform hover:scale-105 transition-all"
              >
                <Link href={secondaryButtonHref}>{secondaryButtonText}</Link>
              </Button>
            </motion.div>
          </div>

          {/* Right Content - Either Conversation or Image */}
          {useConversation && customerMessage && aiResponse ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <ConversationShowcase
                imageSrc={imageSrc}
                imageAlt={imageAlt}
                customerMessage={customerMessage}
                aiResponse={aiResponse}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-2xl" />

                {/* Image container */}
                <div className="relative border-4 border-primary/40 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-background to-muted">
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

