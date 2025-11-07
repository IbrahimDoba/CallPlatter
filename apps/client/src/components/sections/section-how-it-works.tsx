"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Step {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

interface SectionHowItWorksProps {
  title: string;
  subtitle: string;
  steps: Step[];
  ctaText?: string;
  ctaHref?: string;
}

export function SectionHowItWorks({
  title,
  subtitle,
  steps,
  ctaText = "Get Started Today",
  ctaHref = "/signup",
}: SectionHowItWorksProps) {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        </div>

        <div className="relative">
          {/* Timeline Connector */}
          <div
            className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-border"
            aria-hidden="true"
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative md:flex items-center mb-12"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div
                className={`md:w-1/2 ${
                  index % 2 === 0 ? "md:pr-8" : "md:pl-8 md:order-2"
                }`}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={step.image}
                    alt={step.imageAlt}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              <div
                className={`md:w-1/2 mt-6 md:mt-0 ${
                  index % 2 === 0 ? "md:pl-8" : "md:pr-8"
                }`}
              >
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl border-4 border-card">
                  {index + 1}
                </div>
                <div className="bg-background/50 p-8 rounded-xl border border-border">
                  <h3 className="text-2xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {ctaText && ctaHref && (
          <div className="text-center mt-16">
            <Button asChild size="lg">
              <Link href={ctaHref}>{ctaText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
