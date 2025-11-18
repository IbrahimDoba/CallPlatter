"use client";

import { motion } from "framer-motion";
import { Bitcoin, CreditCard, TrendingUp, Building2 } from "lucide-react";

const useCases = [
  {
    icon: Bitcoin,
    title: "Crypto Exchange",
    problem: "500% call spike during market crash",
    solution: "AI handled wallet questions and security resets. Team focused on trading issues only.",
    result: "Zero support downtime during volatility",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: Building2,
    title: "Digital Bank",
    problem: "50% of applicants abandoned during KYC",
    solution: "Instant answers about document requirements and verification status 24/7.",
    result: "40% faster account activation",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: CreditCard,
    title: "Payment Processor",
    problem: "Merchants calling about settlement delays",
    solution: "AI checks real-time transaction status and payout schedules via API integration.",
    result: "65% reduction in support tickets",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Lending Platform",
    problem: "Loan applicants had questions, switched to competitors",
    solution: "24/7 support for application status, required documents, and next steps.",
    result: "50% less abandonment, 30% more funded loans",
    color: "from-green-500 to-emerald-500",
  },
];

export default function UseCasesSection() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Real Fintech <span className="text-primary">Use Cases</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how different fintech sectors solve support challenges with DailZero
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${useCase.color} rounded-xl mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {useCase.title}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-semibold text-red-600 mb-1">❌ Problem</div>
                      <p className="text-gray-700">{useCase.problem}</p>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-blue-600 mb-1">💡 Solution</div>
                      <p className="text-gray-700">{useCase.solution}</p>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-green-600 mb-1">✅ Result</div>
                      <p className="text-gray-900 font-medium">{useCase.result}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
