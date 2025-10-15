"use client";

import { motion } from "framer-motion";
import { CheckCircle, Phone, Clock, Shield, Users } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const leftFeatures = [
  {
    icon: Phone,
    title: "24/7 Call Handling",
    description: "Never miss a call with our AI that works around the clock"
  },
  {
    icon: Shield,
    title: "Smart Filtering",
    description: "Automatically filter spam and prioritize important calls"
  },
  {
    icon: Clock,
    title: "Instant Response",
    description: "Answer calls in milliseconds, not minutes"
  }
];

const rightFeatures = [
  {
    icon: Users,
    title: "Multi-language Support",
    description: "Handle calls in multiple languages seamlessly"
  },
  {
    icon: CheckCircle,
    title: "Quality Assurance",
    description: "Advanced AI ensures consistent, professional service"
  },
  {
    icon: Phone,
    title: "Call Analytics",
    description: "Detailed insights and reporting for every interaction"
  }
];

export default function HeroImageWithFeatures() {
  return (
    <section className="py-32 bg-stone-100">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            See DailZero in{" "}
            <span className="text-primary">Action</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience how our AI receptionist handles calls, manages appointments, 
            and provides exceptional customer service 24/7.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              {/* Glow effect behind the image */}
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-2xl" />
              
              {/* Main image container */}
              <div className="relative w-full border-4 border-primary rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-gray-50">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  alt="DailZero AI Receptionist Dashboard"
                  className="w-full h-auto object-contain"
                />
                
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>

          {/* Right - All Features */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="space-y-8">
              {/* Left Features */}
              {leftFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Right Features */}
              {rightFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
