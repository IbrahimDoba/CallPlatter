"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Star, Zap, Crown } from "lucide-react";
import { polarProductIds } from "@/lib/pricingConfig";
import type { OnboardingData } from "../page";

interface PlanSelectionStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$20/month',
    trialDays: 0,
    icon: Star,
    color: 'blue',
    features: [
      '40 minutes included',
      '₦1,467/min ($0.89/min) after limit',
      '24/7 AI answering',
      'Instant call summaries',
      'Call recordings & transcription',
      'Spam blocking',
      'Zapier integration'
    ],
    popular: false
  },
  {
    id: 'business',
    name: 'Business',
    price: '$45/month',
    trialDays: 14,
    icon: Zap,
    color: 'purple',
    features: [
      '14-day free trial',
      '110 minutes included',
      '₦1,000/min ($0.61/min) after limit',
      '24/7 AI answering',
      'Instant call summaries',
      'Call recordings & transcription',
      'Spam blocking',
      'Zapier integration',
      'Priority support'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$120/month',
    trialDays: 0,
    icon: Crown,
    color: 'gold',
    features: [
      '300 minutes included',
      '₦733/min ($0.44/min) after limit',
      '24/7 AI answering',
      'Instant call summaries',
      'Call recordings & transcription',
      'Spam blocking',
      'Zapier integration',
      'Priority support',
      'Custom integrations'
    ]
  }
];

export function PlanSelectionStep({ data, onUpdate, onNext, onBack }: PlanSelectionStepProps) {
  const [selectedPlan, setSelectedPlan] = useState(data.selectedPlan || 'starter');
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync local state with data prop changes
  useEffect(() => {
    if (data.selectedPlan) {
      console.log('💳 PlanSelectionStep: Syncing selectedPlan from data prop:', data.selectedPlan);
      setSelectedPlan(data.selectedPlan);
    }
  }, [data.selectedPlan]);

  const handleNext = async () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Update onboarding data
      onUpdate({ 
        selectedPlan,
        trialActivated: selectedPlan === 'business'
      });

      // Save progress to database before redirect
      try {
        console.log('💾 Saving progress before Polar redirect...');
        const saveResponse = await fetch('/api/onboarding/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentStep: 5, // Next step after subscription completion
            selectedPlan,
            trialActivated: selectedPlan === 'business'
          })
        });
        
        const saveData = await saveResponse.json();
        console.log('✅ Save progress response:', saveData);
      } catch (error) {
        console.error('❌ Error saving progress before Polar redirect:', error);
      }

      // Get the appropriate Polar product ID
      const capitalizedPlan = selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);
      const productId = polarProductIds[capitalizedPlan as keyof typeof polarProductIds];
      
      // Build checkout URL with appropriate parameters
      let checkoutUrl = `/checkout?products=${productId}`;
      
      // Add trial parameters for Business plan
      if (selectedPlan === 'business') {
        checkoutUrl += '&trial_duration=14&trial_duration_unit=day';
      }
      
      // Add success and cancel URLs
      checkoutUrl += `&success_url=${encodeURIComponent(`${window.location.origin}/onboarding?step=5&plan=${selectedPlan}&return=true`)}`;
      checkoutUrl += `&cancel_url=${encodeURIComponent(`${window.location.origin}/onboarding?step=4&return=true`)}`;
      
      console.log('🛒 Redirecting to Polar checkout:', checkoutUrl);
      window.location.href = checkoutUrl;
      
    } catch (error) {
      toast.error("Failed to process plan selection");
      console.error('Plan selection error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = selectedPlan !== "";

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
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="mt-2 text-gray-600">
          Start with a free trial or choose a plan that fits your business
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, index) => {
          const IconComponent = plan.icon;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <motion.div
              key={plan.id}
              className={`relative border rounded-lg p-6 cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              } ${plan.popular ? "ring-2 ring-blue-200" : ""}`}
              onClick={() => setSelectedPlan(plan.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${plan.color}-100 mb-4`}>
                  <IconComponent className={`w-6 h-6 text-${plan.color}-600`} />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{plan.price}</p>
                
                {plan.trialDays > 0 && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {plan.trialDays}-day free trial
                  </p>
                )}
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="flex justify-between pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button variant="outline" onClick={onBack} className="px-8">
            Back
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={handleNext}
            disabled={!isFormValid || isProcessing}
            className="px-8"
          >
            {isProcessing ? "Processing..." : "Continue"}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
