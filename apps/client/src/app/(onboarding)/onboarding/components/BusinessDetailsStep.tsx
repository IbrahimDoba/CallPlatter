"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingData } from "../page";

interface BusinessDetailsStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function BusinessDetailsStep({ data, onUpdate, onNext }: BusinessDetailsStepProps) {
  const [businessName, setBusinessName] = useState(data.businessName);
  const [businessDescription, setBusinessDescription] = useState(data.businessDescription);

  // Sync local state with data prop changes
  useEffect(() => {
    if (data.businessName && data.businessName !== businessName) {
      console.log('🏢 BusinessDetailsStep: Syncing businessName from data prop:', data.businessName);
      setBusinessName(data.businessName);
    }
    if (data.businessDescription && data.businessDescription !== businessDescription) {
      console.log('🏢 BusinessDetailsStep: Syncing businessDescription from data prop:', data.businessDescription);
      setBusinessDescription(data.businessDescription);
    }
  }, [data.businessName, data.businessDescription, businessName, businessDescription]);

  const handleNext = () => {
    onUpdate({
      businessName,
      businessDescription,
    });
    onNext();
  };

  const isFormValid = businessName.trim() !== "" && businessDescription.trim() !== "";

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold text-gray-900">Business Details</h2>
        <p className="mt-2 text-gray-600">
          Tell us about your business so we can personalize your AI receptionist
        </p>
      </motion.div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
            Business Name *
          </Label>
          <motion.div
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Input
              id="businessName"
              type="text"
              placeholder="Enter your business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-1"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Label htmlFor="businessDescription" className="text-sm font-medium text-gray-700">
            What does your business do? *
          </Label>
          <motion.div
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Textarea
              id="businessDescription"
              placeholder="Describe your business, services, and what you offer to customers..."
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              className="mt-1 min-h-[100px]"
              rows={4}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="flex justify-end pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={handleNext}
            disabled={!isFormValid}
            className="px-8"
          >
            Next
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
