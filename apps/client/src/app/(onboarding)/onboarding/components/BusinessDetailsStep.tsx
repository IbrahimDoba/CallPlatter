"use client";

import { useState } from "react";
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

  const handleNext = () => {
    onUpdate({
      businessName,
      businessDescription,
    });
    onNext();
  };

  const isFormValid = businessName.trim() !== "" && businessDescription.trim() !== "";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Business Details</h2>
        <p className="mt-2 text-gray-600">
          Tell us about your business so we can personalize your AI receptionist
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
            Business Name *
          </Label>
          <Input
            id="businessName"
            type="text"
            placeholder="Enter your business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="businessDescription" className="text-sm font-medium text-gray-700">
            What does your business do? *
          </Label>
          <Textarea
            id="businessDescription"
            placeholder="Describe your business, services, and what you offer to customers..."
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            className="mt-1 min-h-[100px]"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={handleNext}
          disabled={!isFormValid}
          className="px-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
