"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Phone, Bot } from "lucide-react";

interface ConversationShowcaseProps {
  imageSrc: string;
  imageAlt?: string;
  customerMessage: string;
  aiResponse: string;
  className?: string;
}

export function ConversationShowcase({
  imageSrc,
  imageAlt = "Conversation showcase",
  customerMessage,
  aiResponse,
  className = "",
}: ConversationShowcaseProps) {
  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      {/* Background Image with Overlay */}
      <div className="relative w-full h-full min-h-[500px] md:min-h-[600px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Conversation Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-2xl space-y-4">
          {/* Customer Message */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-start gap-3 justify-start"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl rounded-tl-sm px-5 py-4 shadow-xl max-w-[85%]">
              <p className="text-sm md:text-base text-foreground leading-relaxed">
                {customerMessage}
              </p>
            </div>
          </motion.div>

          {/* AI Response */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-start gap-3 justify-end"
          >
            <div className="bg-primary/95 backdrop-blur-sm rounded-2xl rounded-tr-sm px-5 py-4 shadow-xl max-w-[85%]">
              <p className="text-sm md:text-base text-primary-foreground leading-relaxed">
                {aiResponse}
              </p>
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Optional: Animated pulse indicator */}
      <motion.div
        className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <motion.div
          className="w-2 h-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        />
        <span className="text-xs font-medium text-foreground">AI Active</span>
      </motion.div>
    </div>
  );
}

