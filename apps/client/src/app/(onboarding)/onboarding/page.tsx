"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingStepper } from "./components/OnboardingStepper";
import { BusinessDetailsStep } from "./components/BusinessDetailsStep";
import { VoiceSelectionStep } from "./components/VoiceSelectionStep";
import { AgentSettingsStep } from "./components/AgentSettingsStep";
import { PlanSelectionStep } from "./components/PlanSelectionStep";
import { PhoneNumberStep } from "./components/PhoneNumberStep";
import { LoadingAnimation } from "./components/LoadingAnimation";
// import { ProgressCelebration } from "./components/ProgressCelebration";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OnboardingData {
  businessName: string;
  businessDescription: string;
  selectedVoice: string;
  selectedAccent: string;
  greeting: string;
  recordingConsent: boolean;
  selectedPhoneNumber: string;
  selectedPhoneNumberId: string;
  selectedPlan: string;
  trialActivated: boolean;
  polarCustomerId?: string;
}

const STEPS = [
  {
    id: 1,
    title: "Business Details",
    description: "Tell us about your business",
  },
  { id: 2, title: "Voice Selection", description: "Choose your AI voice" },
  { id: 3, title: "Agent Settings", description: "Configure your AI agent" },
  { id: 4, title: "Plan Selection", description: "Choose your plan" }, // NEW
  { id: 5, title: "Phone Number", description: "Select your phone number" },
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  // const [showProgressCelebration, setShowProgressCelebration] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessName: "",
    businessDescription: "",
    selectedVoice: "",
    selectedAccent: "",
    greeting: "",
    recordingConsent: false,
    selectedPhoneNumber: "",
    selectedPhoneNumberId: "",
    selectedPlan: "",
    trialActivated: false,
    polarCustomerId: undefined,
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

  const restoreOnboardingProgress = useCallback(async () => {
    console.log('🔄 Starting onboarding progress restoration...');
    try {
      const response = await fetch('/api/onboarding/restore-progress');
      console.log('📡 Restore progress response status:', response.status);
      const data = await response.json();

      console.log('📊 Restoration response:', data);

      if (data.success && data.progress) {
        console.log('✅ Found saved progress, restoring data...');
        console.log('📊 Progress data:', data.progress);
        
        // Create the restored data object
        const restoredData = {
          businessName: data.progress.businessName || "",
          businessDescription: data.progress.businessDescription || "",
          selectedVoice: data.progress.selectedVoice || "",
          selectedAccent: data.progress.selectedAccent || "",
          greeting: data.progress.greeting || "",
          recordingConsent: data.progress.recordingConsent === true,
          selectedPhoneNumber: data.progress.selectedPhoneNumber || "",
          selectedPhoneNumberId: data.progress.selectedPhoneNumberId || "",
          selectedPlan: data.progress.selectedPlan || "",
          trialActivated: data.progress.trialActivated === true,
          polarCustomerId: data.progress.polarCustomerId || undefined,
        };

        console.log('📊 Restored data object:', restoredData);

        // Restore the onboarding data using functional update to ensure state consistency
        setOnboardingData(prevData => {
          console.log('🔄 Previous data:', prevData);
          console.log('🔄 New data:', restoredData);
          return restoredData;
        });

        console.log('✅ State updated with restored data');

        // Set the current step based on what's available
        const hasPhoneNumber = data.progress.selectedPhoneNumber;
        const hasTrialActivated = data.progress.trialActivated;
        const currentStepFromDB = data.progress.currentStep;

        let targetStep = 5; // Default to phone number step
        if (hasPhoneNumber) {
          targetStep = 5; // Phone number step if phone is already selected
        } else if (hasTrialActivated) {
          targetStep = 5; // Phone number step after trial
        } else if (currentStepFromDB && currentStepFromDB > 1) {
          targetStep = currentStepFromDB; // Use saved step if available
        }

        console.log('🎯 Setting current step to:', targetStep);
        if (targetStep >= 1 && targetStep <= STEPS.length) {
          setCurrentStep(targetStep);
        }

        // Show appropriate success message
        if (hasPhoneNumber) {
          toast.success("Welcome back! Let's complete your setup.");
        } else if (hasTrialActivated) {
          toast.success("Trial activated successfully! Let's complete your setup.");
        } else {
          toast.success("Progress restored! Let's continue where you left off.");
        }

        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        console.log('🧹 Cleaned up URL parameters');
      } else {
        console.log('❌ No saved progress found');
        toast.error("No saved progress found. Please start over.");
      }
    } catch (error) {
      console.error('Error restoring onboarding progress:', error);
      toast.error("Error restoring your progress. Please start over.");
    }
  }, []);

  const checkForTrialProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/onboarding/restore-progress');
      const data = await response.json();

      if (data.success && data.progress) {
        // Check if user has trial activated OR has already selected a phone number
        const hasTrialActivated = data.progress.trialActivated;
        const hasPhoneNumber = data.progress.selectedPhoneNumber;
        const currentStepFromDB = data.progress.currentStep;

        console.log('🔍 Progress check:', { 
          hasTrialActivated, 
          hasPhoneNumber, 
          currentStepFromDB,
          progress: data.progress 
        });

        if (hasTrialActivated || hasPhoneNumber) {
          console.log('✅ Found progress to restore, restoring data...');
          
          // Create the restored data object
          const restoredData = {
            businessName: data.progress.businessName || "",
            businessDescription: data.progress.businessDescription || "",
            selectedVoice: data.progress.selectedVoice || "",
            selectedAccent: data.progress.selectedAccent || "",
            greeting: data.progress.greeting || "",
            recordingConsent: data.progress.recordingConsent === true,
            selectedPhoneNumber: data.progress.selectedPhoneNumber || "",
            selectedPhoneNumberId: data.progress.selectedPhoneNumberId || "",
            selectedPlan: data.progress.selectedPlan || "",
            trialActivated: data.progress.trialActivated === true,
            polarCustomerId: data.progress.polarCustomerId || undefined,
          };

          console.log('📊 Progress restored data:', restoredData);

          // Restore the onboarding data using functional update
          setOnboardingData(prevData => {
            console.log('🔄 Previous data:', prevData);
            console.log('🔄 New restored data:', restoredData);
            return restoredData;
          });

          // Set to the appropriate step based on what's available
          let targetStep = 5; // Default to phone number step
          if (hasPhoneNumber) {
            targetStep = 5; // Phone number step if phone is already selected
          } else if (hasTrialActivated) {
            targetStep = 5; // Phone number step after trial
          } else if (currentStepFromDB && currentStepFromDB > 1) {
            targetStep = currentStepFromDB; // Use saved step if available
          }

          console.log('🎯 Setting current step to:', targetStep);
          setCurrentStep(targetStep);
          
          if (hasPhoneNumber) {
            toast.success("Welcome back! Let's complete your setup.");
          } else if (hasTrialActivated) {
            toast.success("Trial activated! Let's complete your setup.");
          } else {
            toast.success("Progress restored! Let's continue where you left off.");
          }
        } else {
          console.log('❌ No progress found to restore');
        }
      }
    } catch (error) {
      console.error('Error checking trial progress:', error);
    }
  }, []);

  // Handle state restoration from Polar redirect
  useEffect(() => {
    if (status === "loading" || !session) return;

    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get('step');
    const trial = urlParams.get('trial');
    const plan = urlParams.get('plan');
    const returnFromPolar = urlParams.get('return');

    console.log('🔍 URL params check:', { step, trial, plan, returnFromPolar, currentUrl: window.location.href });

    // Check if returning from Polar checkout
    if (returnFromPolar === 'true' && step && (trial === 'true' || plan)) {
      console.log('✅ Triggering restoration from Polar redirect');
      restoreOnboardingProgress();
    } else if (returnFromPolar === 'true') {
      // Even if no step/plan, if we're returning from Polar, try to restore
      console.log('🔄 Returning from Polar but no step/plan detected, checking for progress...');
      checkForTrialProgress();
    } else if (!step && !trial && !returnFromPolar) {
      // Fallback: Check if user has trial activated in saved progress
      console.log('🔄 No URL params detected, checking for trial progress...');
      checkForTrialProgress();
    }
  }, [session, status, restoreOnboardingProgress, checkForTrialProgress]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('🔍 Onboarding state changed:', {
      currentStep,
      onboardingData: {
        businessName: onboardingData.businessName,
        selectedVoice: onboardingData.selectedVoice,
        selectedPlan: onboardingData.selectedPlan,
        selectedPhoneNumber: onboardingData.selectedPhoneNumber,
        trialActivated: onboardingData.trialActivated
      },
      timestamp: new Date().toISOString()
    });
  }, [currentStep, onboardingData]);

  const saveOnboardingProgress = async (updates: Partial<OnboardingData>) => {
    try {
      await fetch('/api/onboarding/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep,
          ...updates
        })
      });
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      // Show progress celebration for steps 2 and 3
      // if (currentStep >= 2) {
      //   setShowProgressCelebration(true);
      //   await new Promise((resolve) => setTimeout(resolve, 2000));
      //   setShowProgressCelebration(false);
      // }

      // Add a small delay for the transition animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCurrentStep(currentStep + 1);
    }
  };


  const handleBack = async () => {
    if (currentStep > 1) {
      // Add a small delay for the transition animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async (phoneNumber?: string, phoneNumberId?: string) => {
    // Use the passed phone number and ID or the ones from state
    const finalData = {
      ...onboardingData,
      selectedPhoneNumber: phoneNumber || onboardingData.selectedPhoneNumber,
      selectedPhoneNumberId: phoneNumberId || onboardingData.selectedPhoneNumberId,
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
    setOnboardingData((prev) => {
      const newData = { ...prev, ...updates };
      
      // Save progress to database
      saveOnboardingProgress(updates);
      
      return newData;
    });
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
            <PlanSelectionStep
              data={onboardingData}
              onUpdate={updateData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
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
      {/* Logout Button - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            signOut({ callbackUrl: "/" });
          }}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>

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

      {/* <ProgressCelebration
        isVisible={showProgressCelebration}
        stepNumber={currentStep}
        totalSteps={STEPS.length}
      /> */}
    </>
  );
}
