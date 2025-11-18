"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const integrations = [
  { name: "Plaid", logo: "https://logo.clearbit.com/plaid.com", bgColor: "bg-blue-50" },
  { name: "Stripe", logo: "https://logo.clearbit.com/stripe.com", bgColor: "bg-purple-50" },
  { name: "Salesforce", logo: "https://logo.clearbit.com/salesforce.com", bgColor: "bg-cyan-50" },
  { name: "Twilio", logo: "https://logo.clearbit.com/twilio.com", bgColor: "bg-red-50" },
  { name: "Zendesk", logo: "https://logo.clearbit.com/zendesk.com", bgColor: "bg-green-50" },
  { name: "Intercom", logo: "https://logo.clearbit.com/intercom.com", bgColor: "bg-blue-50" },
];

export default function IntegrationsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Integrates with Your <span className="text-primary">Fintech Stack</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect seamlessly with the tools you already use
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center"
        >
          {integrations.map((integration, index) => {
            return (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group flex flex-col items-center justify-center p-6 rounded-xl bg-white hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
              >
                <div className={`w-16 h-16 rounded-xl ${integration.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Image
                    src={integration.logo}
                    alt={`${integration.name} logo`}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                  {integration.name}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-6">
            Plus hundreds more through Zapier and custom API integrations
          </p>
          <div className="inline-flex gap-2 flex-wrap justify-center">
            <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">Banking APIs</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">KYC Providers</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">Payment Processors</span>
            <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">CRM Systems</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
