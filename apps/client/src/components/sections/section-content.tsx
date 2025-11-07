"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface ContentCard {
  title: string;
  subtitle: string;
  image: string;
  imageAlt?: string;
}

interface SectionContentProps {
  title: string;
  contentTitle: string;
  contentTitleSubtext: string;
  cards: ContentCard[];
  className?: string;
}

export function SectionContent({
  title,
  contentTitle,
  contentTitleSubtext,
  cards,
  className = "",
}: SectionContentProps) {
  return (
    <section className={`py-20 px-6 ${className}`} style={{ backgroundColor: '#e8f3fa' }}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <motion.div
            className="space-y-6 lg:sticky lg:top-32"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">
              {title}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {contentTitle}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {contentTitleSubtext}
            </p>
          </motion.div>

          {/* Right Cards */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {cards.map((card, index) => (
              <motion.div
                key={`${card.title}-${index}`}
                className="bg-card border border-border rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                style={{ width: '595px', height: '500px' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-10">
                    {card.subtitle}
                  </p>
                  <div className="relative w-full flex-1 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={card.image}
                      alt={card.imageAlt || card.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}