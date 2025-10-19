"use client";

import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";

interface ProgressCelebrationProps {
  isVisible: boolean;
  stepNumber: number;
  totalSteps: number;
}

export function ProgressCelebration({ isVisible, stepNumber, totalSteps }: ProgressCelebrationProps) {
  if (!isVisible) return null;

  const progressPercentage = (stepNumber / totalSteps) * 100;

  return (
    <motion.div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md mx-4"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          delay: 0.1 
        }}
      >
        {/* Celebration Icons */}
        <div className="relative mb-6">
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 15,
              delay: 0.2 
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.4,
                type: "spring",
                stiffness: 300
              }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>

          {/* Floating Stars */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${20 + (i * 10)}%`,
                left: `${15 + (i * 15)}%`,
              }}
              initial={{ 
                scale: 0, 
                rotate: 0,
                opacity: 0 
              }}
              animate={{ 
                scale: [0, 1, 0.8, 1],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0.8, 1]
              }}
              transition={{
                duration: 2,
                delay: 0.5 + (i * 0.1),
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <Star className="w-4 h-4 text-yellow-400" />
            </motion.div>
          ))}
        </div>

        {/* Progress Text */}
        <motion.h3
          className="text-2xl font-bold text-gray-900 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Great Progress!
        </motion.h3>
        
        <motion.p
          className="text-gray-600 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          You've completed step {stepNumber} of {totalSteps}
        </motion.p>

        {/* Progress Bar */}
        <motion.div
          className="w-full bg-gray-200 rounded-full h-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ 
              duration: 1.5, 
              delay: 0.9,
              ease: "easeOut"
            }}
          />
        </motion.div>

        {/* Progress Percentage */}
        <motion.p
          className="text-sm font-medium text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {Math.round(progressPercentage)}% Complete
        </motion.p>

        {/* Celebration Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ 
                scale: 0, 
                opacity: 0 
              }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [0, -50, -100]
              }}
              transition={{
                duration: 2,
                delay: 1 + (i * 0.1),
                repeat: Infinity,
                repeatDelay: 4,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
