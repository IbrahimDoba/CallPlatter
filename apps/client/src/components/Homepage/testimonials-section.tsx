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
import { Star, Quote, Building2, TrendingUp, Bitcoin, CreditCard, Shield } from "lucide-react";

const testimonials = [
  {
    name: "Alex Martinez",
    role: "Head of Support",
    company: "NeoBank Pro",
    content:
      "We reduced support costs by 65% while handling 10x more calls. During our Series B announcement, call volume spiked 500% - DailZero scaled instantly. Game changer for fintech support.",
    rating: 5,
    icon: Building2,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Priya Sharma",
    role: "VP Operations",
    company: "CryptoExchange.io",
    content:
      "Market crashes used to crash our support lines too. Now AI handles password resets and wallet questions while our team focuses on complex trading issues. No more 2-hour wait times.",
    rating: 5,
    icon: Bitcoin,
    gradient: "from-orange-500 to-yellow-500",
  },
  {
    name: "James Chen",
    role: "CTO",
    company: "PayFlow Systems",
    content:
      "The compliance features sealed the deal - PCI-DSS certified, encrypted calls, complete audit trails. Our regulators were impressed. Integration with our payment API took 2 days.",
    rating: 5,
    icon: CreditCard,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Sarah Williams",
    role: "Customer Success",
    company: "LendFast",
    content:
      "Our loan applicants get instant answers about document requirements and application status. Abandonment rate dropped 50%. We're funding loans 40% faster than before DailZero.",
    rating: 5,
    icon: TrendingUp,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Michael Torres",
    role: "COO",
    company: "InsurTech Solutions",
    content:
      "We handle claims intake 24/7 now. Customers file claims at 2am and get immediate confirmation. Our NPS score jumped 35 points. Worth every penny for an insurtech startup.",
    rating: 5,
    icon: Shield,
    gradient: "from-indigo-500 to-blue-500",
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
                Leading Fintech Companies
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              From Series A startups to enterprise fintechs scaling globally
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
              {testimonials.map((testimonial) => {
                const Icon = testimonial.icon;
                return (
                  <CarouselItem
                    key={testimonial.name}
                    className="pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/3"
                  >
                    <Card className="h-full bg-white border-2 border-gray-100 hover:border-primary/30 transition-all duration-300 p-8 hover:shadow-2xl group relative overflow-hidden">
                      {/* Gradient background on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                      {/* Content */}
                      <div className="relative">
                        {/* Icon and Quote */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <Quote className="w-8 h-8 text-gray-200" />
                        </div>

                        {/* Rating */}
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>

                        {/* Testimonial content */}
                        <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                          "{testimonial.content}"
                        </p>

                        {/* Author info */}
                        <div className="pt-4 border-t border-gray-100">
                          <h4 className="font-semibold text-gray-900 text-base">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {testimonial.role}
                          </p>
                          <p className="text-sm font-medium text-primary mt-1">
                            {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-card/10 border-border text-foreground hover:bg-card/20" />
            <CarouselNext className="right-4 bg-card/10 border-border text-foreground hover:bg-card/20" />
          </Carousel>
        </div>
      </section>
  );
};

export default TestimonialsSection;
