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
    name: "Emeka Okafor",
    role: "Owner, AutoFix Nigeria",
    content:
      "As a small auto repair business, I couldn't afford a full-time receptionist. CallPlatter handles all my appointment bookings professionally. My revenue has increased by 40% since implementation.",
  },
  {
    name: "Fatima Ibrahim",
    role: "Director, Abuja Beauty Spa",
    content:
      "The setup was incredibly easy and the AI sounds so natural. Our clients can't tell the difference between our AI receptionist and a human. It's perfect for our beauty spa business.",
  },
  {
    name: "Chinedu Nwosu",
    role: "Manager, Lagos Restaurant",
    content:
      "CallPlatter handles our reservation system flawlessly. Customers love the natural conversation flow, and we've seen a 60% increase in bookings since implementing the service.",
  },
  {
    name: "Aisha Mohammed",
    role: "Owner, Kano Fashion Boutique",
    content:
      "The AI receptionist understands our local customers perfectly and can handle inquiries in multiple languages. It's been a game-changer for our boutique's customer service.",
  },
  {
    name: "Oluwaseun Adebayo",
    role: "CEO, Port Harcourt Tech Hub",
    content:
      "CallPlatter's integration with our CRM system is seamless. The AI captures all customer information accurately and our team can focus on what matters most - building relationships.",
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
        className="py-20 overflow-hidden"
        style={{ backgroundColor: "#343434" }}
      >
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-normal mb-4 text-white">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Nigerian Businesses
              </span>
            </h2>
            <p className="text-gray-300 text-lg">
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
                  <Card className="h-full bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/30 transition-all duration-300 p-8 hover:scale-105">
                    <div className="mb-6">
                      <h4 className="font-medium text-white/90 text-lg">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-white/60">
                        {testimonial.role}
                      </p>
                    </div>
                    <p className="text-white/70 leading-relaxed">
                      {testimonial.content}
                    </p>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-white/10 border-white/20 text-white hover:bg-white/20" />
            <CarouselNext className="right-4 bg-white/10 border-white/20 text-white hover:bg-white/20" />
          </Carousel>
        </div>
      </section>
  );
};

export default TestimonialsSection;
