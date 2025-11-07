"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SectionCTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  className?: string;
}

export function SectionCTA({
  title = "Ready for a free trial of our answering service?",
  subtitle = "Be one of the first to try Dailzero — an AI-powered virtual answering service that picks up the phone for you. Try for free today!",
  buttonText = "Try for Free",
  buttonHref = "/signup",
  className = "",
}: SectionCTAProps) {
  return (
    <section className={`py-20 bg-primary ${className}`}>
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
            {subtitle}
          </p>
          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="bg-background text-primary hover:bg-background/90 shadow-xl transform hover:scale-105 transition-all font-semibold"
            >
              <Link href={buttonHref}>{buttonText}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

