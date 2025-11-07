"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
}

interface SectionFAQProps {
  title: string;
  heading: string;
  faqs: FAQItem[];
  className?: string;
}

export function SectionFAQ({
  title,
  heading,
  faqs,
  className = "",
}: SectionFAQProps) {
  return (
    <section className={`py-20 px-6 bg-muted/30 ${className}`} style={{ backgroundColor: '#e8f3fa' }}>
      <div className="container mx-auto max-w-4xl">
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
            {heading}
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion
            type="single"
            collapsible
            className="w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id || `faq-${index}-${faq.question.slice(0, 20)}`}
                value={`item-${index}`}
                className="border-border px-6 py-4 last:border-b-0"
              >
                <AccordionTrigger className="text-base md:text-lg font-semibold text-foreground hover:text-primary hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

