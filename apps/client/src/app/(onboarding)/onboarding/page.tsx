"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingStepper } from "./components/OnboardingStepper";
import { BusinessDetailsStep } from "./components/BusinessDetailsStep";
import { VoiceSelectionStep } from "./components/VoiceSelectionStep";
import { AgentSettingsStep } from "./components/AgentSettingsStep";
import { PhoneNumberStep } from "./components/PhoneNumberStep";
import { LoadingAnimation } from "./components/LoadingAnimation";
import { ProgressCelebration } from "./components/ProgressCelebration";

export interface OnboardingData {
  businessName: string;
  businessDescription: string;
  selectedVoice: string;
  selectedAccent: string;
  greeting: string;
  recordingConsent: boolean;
  selectedPhoneNumber: string;
  selectedPhoneNumberId: string;
}

const STEPS = [
  {
    id: 1,
    title: "Business Details",
    description: "Tell us about your business",
  },
  { id: 2, title: "Voice Selection", description: "Choose your AI voice" },
  { id: 3, title: "Agent Settings", description: "Configure your AI agent" },
  { id: 4, title: "Phone Number", description: "Select your phone number" },
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [showProgressCelebration, setShowProgressCelebration] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessName: "",
    businessDescription: "",
    selectedVoice: "",
    selectedAccent: "",
    greeting: "",
    recordingConsent: false,
    selectedPhoneNumber: "",
    selectedPhoneNumberId: "",
  });

  // Check if user has already completed onboarding
  useEffect(() => {
    if (status === "loading") return; // Still loading session

    if (!session) {
      // Not authenticated, redirect to waitlist
      router.push("/waitlist");
      return;
    }

    if (session.user?.onboardingCompleted && session.user?.businessId) {
      // Already completed onboarding, redirect to calls
      router.push("/calls");
      return;
    }
  }, [session, status, router]);

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      // Show progress celebration for steps 2 and 3
      if (currentStep >= 2) {
        setShowProgressCelebration(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setShowProgressCelebration(false);
      }

      setIsTransitioning(true);

      // Add a small delay for the transition animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCurrentStep(currentStep + 1);
      setIsTransitioning(false);
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      setIsTransitioning(true);

      // Add a small delay for the transition animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCurrentStep(currentStep - 1);
      setIsTransitioning(false);
    }
  };

  const handleFinish = async (phoneNumber?: string) => {
    // Use the passed phone number or the one from state
    const finalData = {
      ...onboardingData,
      selectedPhoneNumber: phoneNumber || onboardingData.selectedPhoneNumber,
    };

    console.log("Onboarding - Final data being sent:", finalData);
    setIsCompleting(true);
    setShowLoadingAnimation(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete onboarding");
      }

      // Show success toast and redirect
      toast.success(
        "Onboarding completed successfully! Redirecting to your dashboard..."
      );

      // Wait a moment for the database update to complete, then redirect
      setTimeout(() => {
        window.location.href = "/calls";
      }, 500);
    } catch (error) {
      console.error("Onboarding completion error:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsCompleting(false);
      setShowLoadingAnimation(false);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    const stepVariants = {
      enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
      }),
      center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
      },
      exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0,
      }),
    };

    const transition = {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    };

    return (
      <AnimatePresence mode="wait" custom={1}>
        <motion.div
          key={currentStep}
          custom={1}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="w-full"
        >
          {currentStep === 1 && (
            <BusinessDetailsStep
              data={onboardingData}
              onUpdate={updateData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <VoiceSelectionStep
              data={onboardingData}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <AgentSettingsStep
              data={onboardingData}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <PhoneNumberStep
              data={onboardingData}
              onUpdate={updateData}
              onFinish={handleFinish}
              onBack={handleBack}
              isCompleting={isCompleting}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if user should be redirected
  if (
    !session ||
    (session.user?.onboardingCompleted && session.user?.businessId)
  ) {
    return null;
  }

  return (
    <>
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="bg-white rounded-lg border border-gray-200 p-8"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <OnboardingStepper steps={STEPS} currentStep={currentStep} />

          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {renderStep()}
          </motion.div>
        </motion.div>
      </motion.div>

      <LoadingAnimation
        isVisible={showLoadingAnimation}
        message="Completing your setup..."
      />

      <ProgressCelebration
        isVisible={showProgressCelebration}
        stepNumber={currentStep}
        totalSteps={STEPS.length}
      />
    </>
  );
}
