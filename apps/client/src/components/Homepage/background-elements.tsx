"use client"

import { motion } from "framer-motion"

const floatingAnimation = {
  animate: {
    y: [-20, 0, -20],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut" as const,
    },
  },
}

export default function BackgroundElements() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-40 -right-80 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        {...floatingAnimation}
      />
      <motion.div
        className="absolute -bottom-40 -left-80 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{
          y: [-20, 0, -20],
          transition: {
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut" as const,
            delay: -2,
          },
        }}
      />
      <motion.div
        className="absolute top-40 left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        animate={{
          y: [-20, 0, -20],
          transition: {
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut" as const,
            delay: -4,
          },
        }}
      />
    </div>
  )
}
