"use client";

import { motion } from "framer-motion";
import { TrendingDown, Users, Zap, Shield } from "lucide-react";

const stats = [
  {
    icon: TrendingDown,
    value: "60%",
    label: "Cost Reduction",
    description: "vs hiring support staff",
  },
  {
    icon: Zap,
    value: "80%",
    label: "Call Deflection",
    description: "Tier-1 issues resolved",
  },
  {
    icon: Users,
    value: "10x",
    label: "Scale Factor",
    description: "More calls, same team",
  },
  {
    icon: Shield,
    value: "48hr",
    label: "Setup Time",
    description: "From onboarding to live",
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Built for <span className="text-primary">Fintech Scale</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real metrics from fintech companies using DailZero
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center p-8 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {stat.label}
                </div>
                <p className="text-gray-600">{stat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
