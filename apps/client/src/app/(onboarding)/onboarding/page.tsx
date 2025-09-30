"use client";

import { useState } from "react";
import { toast } from "sonner";
import { OnboardingStepper } from "./components/OnboardingStepper";
import { BusinessDetailsStep } from "./components/BusinessDetailsStep";
import { VoiceSelectionStep } from "./components/VoiceSelectionStep";
import { AgentSettingsStep } from "./components/AgentSettingsStep";
import { PhoneNumberStep } from "./components/PhoneNumberStep";

export interface OnboardingData {
  businessName: string;
  businessDescription: string;
  selectedVoice: string;
  selectedAccent: string;
  greeting: string;
  recordingConsent: boolean;
  selectedPhoneNumber: string;
}

const STEPS = [
  { id: 1, title: "Business Details", description: "Tell us about your business" },
  { id: 2, title: "Voice Selection", description: "Choose your AI voice" },
  { id: 3, title: "Agent Settings", description: "Configure your AI agent" },
  { id: 4, title: "Phone Number", description: "Select your phone number" },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessName: "",
    businessDescription: "",
    selectedVoice: "",
    selectedAccent: "",
    greeting: "",
    recordingConsent: false,
    selectedPhoneNumber: "",
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    console.log('Onboarding - Final data being sent:', onboardingData);
    setIsCompleting(true);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete onboarding');
      }

      // Show success toast and redirect
      toast.success('Onboarding completed successfully! Redirecting to your dashboard...');
      
      // Small delay to ensure session is updated, then redirect
      setTimeout(() => {
        window.location.href = '/calls';
      }, 1000);
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessDetailsStep
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <VoiceSelectionStep
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <AgentSettingsStep
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <PhoneNumberStep
            data={onboardingData}
            onUpdate={updateData}
            onFinish={handleFinish}
            onBack={handleBack}
            isCompleting={isCompleting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <OnboardingStepper
          steps={STEPS}
          currentStep={currentStep}
        />
        
        <div className="mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
