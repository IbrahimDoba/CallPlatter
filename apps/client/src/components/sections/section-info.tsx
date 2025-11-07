"use client";

import { motion } from "framer-motion";

interface SectionInfoProps {
  title: string;
  pageInfoTitle: string;
  subtitle: string;
  pageInfoText: string;
  className?: string;
}

export function SectionInfo({
  title,
  pageInfoTitle,
  subtitle,
  pageInfoText,
  className = "",
}: SectionInfoProps) {
  // Normalize and split text by double newlines to create proper paragraphs
  // Replace any literal \n strings with actual newlines, then split
  const normalizedText = pageInfoText
    .replace(/\\n/g, '\n') // Replace escaped \n with actual newlines
    .replace(/\r\n/g, '\n') // Normalize Windows line endings
    .replace(/\r/g, '\n'); // Normalize Mac line endings
  
  const paragraphs = normalizedText
    .split('\n\n')
    .map((p) => p.replace(/\n/g, ' ').trim()) // Replace single newlines with spaces
    .filter((p) => p.length > 0);

  return (
    <section
      className={`py-20 md:py-32 px-6 bg-muted/30 ${className}`}
    >
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Content */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">
              {title}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {pageInfoTitle}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          </motion.div>

          {/* Right Content */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Top Section - Darker Background */}
            <div className="bg-muted/50 rounded-2xl p-8 md:p-10 lg:p-12">
              <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">
                {paragraphs[0] || pageInfoText}
              </p>
            </div>
            
            {/* Bottom Section - Text */}
            <div className="rounded-2xl p-8 md:p-10 lg:p-12">
              <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
                {paragraphs.slice(1).map((paragraph, index) => (
                  <p key={`paragraph-${paragraph.slice(0, 20)}-${index}`} className="mb-6 last:mb-0">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

