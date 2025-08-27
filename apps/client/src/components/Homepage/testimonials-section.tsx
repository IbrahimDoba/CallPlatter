"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const testimonials = [
  {
    name: "Adaora Okechukwu",
    role: "CEO, Lagos Medical Center",
    content:
      "CallPlatter has been a game-changer for our clinic. We never miss patient appointments anymore, and the AI understands medical terminology perfectly. Our patient satisfaction has improved significantly.",
    avatar: "A",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    name: "Emeka Okafor",
    role: "Owner, AutoFix Nigeria",
    content:
      "As a small auto repair business, I couldn't afford a full-time receptionist. CallPlatter handles all my appointment bookings professionally. My revenue has increased by 40% since implementation.",
    avatar: "E",
    gradient: "from-green-500 to-blue-600",
  },
  {
    name: "Fatima Ibrahim",
    role: "Director, Abuja Beauty Spa",
    content:
      "The setup was incredibly easy and the AI sounds so natural. Our clients can't tell the difference between our AI receptionist and a human. It's perfect for our beauty spa business.",
    avatar: "F",
    gradient: "from-purple-500 to-pink-600",
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="mb-32 container mx-auto px-6">
      <div className="text-center mb-16">
        <motion.h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6" {...fadeInUp}>
          What Our{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Customers</span>{" "}
          Say
        </motion.h2>
        <motion.p
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Join thousands of Nigerian businesses that trust CallPlatter
        </motion.p>
      </div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            whileHover={{ y: -10, rotateX: 5 }}
            className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <div
                className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center mr-4`}
              >
                <span className="text-white font-bold text-lg">{testimonial.avatar}</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                <p className="text-gray-600">{testimonial.role}</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{testimonial.content}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
