"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Owner, AutoFix Solutions",
    content:
      "As a small auto repair business, I couldn't afford a full-time receptionist. DailZero handles all my appointment bookings professionally. My revenue has increased by 40% since implementation.",
  },
  {
    name: "Maria Rodriguez",
    role: "Director, Elite Beauty Spa",
    content:
      "The setup was incredibly easy and the AI sounds so natural. Our clients can't tell the difference between our AI receptionist and a human. It's perfect for our beauty spa business.",
  },
  {
    name: "David Chen",
    role: "Manager, Golden Dragon Restaurant",
    content:
      "DailZero handles our reservation system flawlessly. Customers love the natural conversation flow, and we've seen a 60% increase in bookings since implementing the service.",
  },
  {
    name: "Emma Thompson",
    role: "Owner, Fashion Forward Boutique",
    content:
      "The AI receptionist understands our customers perfectly and can handle inquiries in multiple languages. It's been a game-changer for our boutique's customer service.",
  },
  {
    name: "Alex Kumar",
    role: "CEO, Tech Innovation Hub",
    content:
      "DailZero's integration with our CRM system is seamless. The AI captures all customer information accurately and our team can focus on what matters most - building relationships.",
  },
];

const TestimonialsSection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 2000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section
        id="testimonials"
        className="py-20 overflow-hidden bg-background"
      >
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-normal mb-4 text-foreground">
              Trusted by{" "}
              <span className="text-primary">
                Businesses Worldwide
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of satisfied businesses using DailZero
            </p>
          </motion.div>
        </div>

        <div className="w-full mx-auto px-4">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem
                  key={testimonial.name}
                  className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Card className="h-full bg-card/10 backdrop-blur-xl border-border hover:border-primary/30 transition-all duration-300 p-8 hover:scale-105">
                    <div className="mb-6">
                      <h4 className="font-medium text-foreground text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {testimonial.content}
                    </p>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-card/10 border-border text-foreground hover:bg-card/20" />
            <CarouselNext className="right-4 bg-card/10 border-border text-foreground hover:bg-card/20" />
          </Carousel>
        </div>
      </section>
  );
};

export default TestimonialsSection;
