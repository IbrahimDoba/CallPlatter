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
    title: "Tier-1 Support Automation",
    description: "AI handles 80% of calls: password resets, account questions, KYC status, and basic navigation.",
    icon: <Bot className="w-6 h-6" />,
  },
  {
    title: "Intelligent Call Routing",
    description: "Complex issues route to your team with full context. No more \"let me transfer you\" frustration.",
    icon: <Phone className="w-6 h-6" />,
  },
  {
    title: "Instant Volatility Scaling",
    description: "Handle 300-500% volume spikes during market events without hiring. Scale support on-demand.",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    title: "Compliance-Ready",
    description: "PCI-DSS, SOC 2, GDPR compliant. All calls encrypted and audit-ready for regulatory requirements.",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    title: "Real-Time Analytics",
    description: "Track call deflection rates, resolution times, and customer satisfaction. Optimize support ROI.",
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    title: "24/7 Global Coverage",
    description: "Support customers across all time zones in 40+ languages. Never miss urgent account issues.",
    icon: <Clock className="w-6 h-6" />,
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
            Why Fintech Companies Choose <span className="text-primary">DailZero</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Reduce support costs by 60%, scale instantly during volatility, and maintain compliance
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
