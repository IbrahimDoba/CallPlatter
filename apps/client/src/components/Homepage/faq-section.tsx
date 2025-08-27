"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
}

const faqs = [
  {
    id: "faq1",
    question: "How does CallPlatter work with Nigerian phone numbers?",
    answer:
      "CallPlatter integrates with Africa's Talking and other local telecom providers to ensure seamless connectivity with all Nigerian networks including MTN, Airtel, Glo, and 9mobile. We handle all the technical setup for you.",
  },
  {
    id: "faq2",
    question: "Can the AI understand different Nigerian accents and languages?",
    answer:
      "Yes! Our AI is specifically trained on Nigerian English and can understand various local accents. We're also working on support for Pidgin English, Yoruba, Igbo, and Hausa languages.",
  },
  {
    id: "faq3",
    question: "How quickly can I set up CallPlatter for my business?",
    answer:
      "Setup takes less than 5 minutes! Simply sign up, provide your business information, and we'll configure everything. Your AI receptionist will be ready to take calls immediately.",
  },
  {
    id: "faq4",
    question: "What happens if I exceed my monthly call limit?",
    answer:
      "We'll notify you when you're approaching your limit. You can easily upgrade your plan or purchase additional call credits. We never cut off your service unexpectedly.",
  },
  {
    id: "faq5",
    question: "Is my business data secure and private?",
    answer:
      "Absolutely. We use enterprise-grade encryption and comply with international data protection standards. Your business data is completely isolated and never shared with other customers or third parties.",
  },
]

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)

  const toggleFAQ = (faqId: string) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId)
  }

  return (
    <section className="mb-32 container mx-auto px-6">
      <div className="text-center mb-16">
        <motion.h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6" {...fadeInUp}>
          Frequently Asked{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Questions</span>
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Everything you need to know about CallPlatter
        </motion.p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden shadow-lg"
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              className="w-full p-8 text-left flex items-center justify-between hover:bg-white/50 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900">{faq.question}</h3>
              <motion.div animate={{ rotate: openFAQ === faq.id ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-6 h-6 text-gray-600" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openFAQ === faq.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-8 pb-8"
                >
                  <p className="text-gray-600 text-lg leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
