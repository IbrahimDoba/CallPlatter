"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ConversationShowcase } from "@/components/ui/conversation-showcase";

interface ImageInfoItem {
  id?: string;
  title: string;
  subtext: string;
  image: string;
  imageAlt?: string;
  // Conversation showcase props (optional)
  useConversation?: boolean;
  customerMessage?: string;
  aiResponse?: string;
}

interface SectionImageInfoProps {
  title: string;
  sectionHeading: string;
  subheading: string;
  items: ImageInfoItem[];
  className?: string;
}

export function SectionImageInfo({
  title,
  sectionHeading,
  subheading,
  items,
  className = "",
}: SectionImageInfoProps) {
  return (
    <section className={`py-20 px-6 bg-background ${className}`}>
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">
            {title}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            {sectionHeading}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {subheading}
          </p>
        </motion.div>

        {/* Items */}
        <div className="space-y-32">
          {items.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={item.id || `item-${index}-${item.title.slice(0, 20)}`}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  !isEven ? "lg:grid-flow-dense" : ""
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Content */}
                <div
                  className={`space-y-6 ${
                    !isEven ? "lg:col-start-2" : ""
                  }`}
                >
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {item.subtext}
                  </p>
                </div>

                {/* Image or Conversation */}
                <div
                  className={`relative ${
                    !isEven ? "lg:col-start-1 lg:row-start-1" : ""
                  }`}
                >
                  {item.useConversation && item.customerMessage && item.aiResponse ? (
                    <ConversationShowcase
                      imageSrc={item.image}
                      imageAlt={item.imageAlt || item.title}
                      customerMessage={item.customerMessage}
                      aiResponse={item.aiResponse}
                    />
                  ) : (
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-2xl" />

                      {/* Image container */}
                      <div className="relative border-2 border-border rounded-2xl overflow-hidden shadow-xl bg-card">
                        <div className="relative w-full h-[400px]">
                          <Image
                            src={item.image}
                            alt={item.imageAlt || item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

