"use client";

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
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center flex-1">
              <div className="flex-1">
                <div
                  className={`h-2 rounded-full transition-colors duration-300 ${
                    currentStep >= step.id
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                />
                <p className={`text-sm font-medium mt-2 text-center ${
                  currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                }`}>
                  {step.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
