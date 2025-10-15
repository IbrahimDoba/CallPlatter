"use client";
import { motion } from "framer-motion";
import {
  Phone,
  Calendar,
  BarChart3,
  Shield,
  Clock,
  Users,
  Bot,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "24/7 AI Receptionist",
    description: "Never miss a call again with our intelligent AI that answers every call professionally.",
    icon: <Phone className="w-6 h-6" />,
  },
  {
    title: "Smart Scheduling",
    description: "Automatic appointment booking with calendar integration saves you hours daily.",
    icon: <Calendar className="w-6 h-6" />,
  },
  {
    title: "Call Analytics",
    description: "Complete insights into every call with detailed reports and customer analytics.",
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    title: "Professional Service",
    description: "Consistent, high-quality customer service that represents your brand perfectly.",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    title: "Instant Response",
    description: "Lightning-fast call handling with zero wait times for your customers.",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    title: "AI-Powered",
    description: "Advanced artificial intelligence that learns and improves with every interaction.",
    icon: <Bot className="w-6 h-6" />,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container px-4 mx-auto max-w-7xl">
        {/* Header with slide-in animation from left */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="text-primary">DailZero</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to transform your business communication with AI
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.2 + index * 0.1, 
                duration: 0.6,
                ease: "easeOut"
              }}
              className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <div className="text-primary">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
