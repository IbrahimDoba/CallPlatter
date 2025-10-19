"use client";

import { motion } from "framer-motion";
import { CheckIcon } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface OnboardingStepperProps {
  steps: Step[];
  currentStep: number;
}

export function OnboardingStepper({ steps, currentStep }: OnboardingStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <motion.div 
              key={step.id} 
              className="flex items-center flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex items-center">
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                    animate={{
                      scale: isCurrent ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      scale: {
                        duration: 0.6,
                        repeat: isCurrent ? Infinity : 0,
                        repeatDelay: 2,
                      },
                    }}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </motion.div>
                </div>

                {/* Progress Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`}
                        initial={{ width: "0%" }}
                        animate={{ 
                          width: isCompleted ? "100%" : isCurrent ? "50%" : "0%" 
                        }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Step Titles */}
      <div className="flex justify-between mt-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <motion.div
              key={`title-${step.id}`}
              className="flex-1 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <motion.p
                className={`text-sm font-medium transition-colors duration-300 ${
                  isCompleted 
                    ? "text-green-600" 
                    : isCurrent 
                    ? "text-blue-600" 
                    : "text-gray-500"
                }`}
                animate={{
                  scale: isCurrent ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  scale: {
                    duration: 0.6,
                    repeat: isCurrent ? Infinity : 0,
                    repeatDelay: 2,
                  },
                }}
              >
                {step.title}
              </motion.p>
              <motion.p
                className="text-xs text-gray-400 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.4 }}
              >
                {step.description}
              </motion.p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
