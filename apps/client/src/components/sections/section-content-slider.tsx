"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface SliderCard {
  icon: LucideIcon;
  text: string;
  id?: string;
}

interface SectionContentSliderProps {
  title: string;
  heading: string;
  subheading: string;
  cards: SliderCard[];
  className?: string;
}

export function SectionContentSlider({
  title,
  heading,
  subheading,
  cards,
  className = "",
}: SectionContentSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, cards.length - cardsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section
      className={`min-h-screen flex flex-col justify-center py-20 px-6 bg-background ${className}`}
      style={{ backgroundColor: '#e8f3fa' }}
    >
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
            {heading}
          </h2>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {subheading}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="rounded-full disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="rounded-full disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Slider */}
        <div className="relative" ref={containerRef}>
          <motion.div
            className="flex gap-6"
            animate={{
              x: `-${currentIndex * (100 / cardsPerView)}%`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.id || `card-${index}-${card.text.slice(0, 20)}`}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / cardsPerView}% - ${(6 * (cardsPerView - 1)) / cardsPerView}px)` }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-card border border-border rounded-xl p-8 h-full hover:shadow-lg transition-all hover:border-primary/50 group">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-base text-foreground leading-relaxed">
                        {card.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }, (_, i) => i).map((dotIndex) => (
            <button
              key={`slide-indicator-${dotIndex}`}
              type="button"
              onClick={() => setCurrentIndex(dotIndex)}
              className={`w-2 h-2 rounded-full transition-all ${
                dotIndex === currentIndex
                  ? "bg-primary w-8"
                  : "bg-border hover:bg-primary/50"
              }`}
              aria-label={`Go to slide ${dotIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

