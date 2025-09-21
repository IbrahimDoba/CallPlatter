"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingData } from "../page";

interface PhoneNumberStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onFinish: () => void;
  onBack: () => void;
}

// Mock data - in real implementation, this would come from an API
const AVAILABLE_NUMBERS = [
  {
    id: "1",
    number: "+1 (555) 123-4567",
    location: "New York, NY",
    areaCode: "555"
  },
  {
    id: "2", 
    number: "+1 (555) 234-5678",
    location: "Los Angeles, CA",
    areaCode: "555"
  },
  {
    id: "3",
    number: "+1 (555) 345-6789", 
    location: "Chicago, IL",
    areaCode: "555"
  },
  {
    id: "4",
    number: "+1 (555) 456-7890",
    location: "Houston, TX", 
    areaCode: "555"
  },
  {
    id: "5",
    number: "+1 (555) 567-8901",
    location: "Phoenix, AZ",
    areaCode: "555"
  }
];

export function PhoneNumberStep({ data, onUpdate, onFinish, onBack }: PhoneNumberStepProps) {
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(data.selectedPhoneNumber);

  const handleFinish = () => {
    onUpdate({ selectedPhoneNumber });
    onFinish();
  };

  const isFormValid = selectedPhoneNumber !== "";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Phone Number</h2>
        <p className="mt-2 text-gray-600">
          You can forward calls to this number later
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
            Pick a Number *
          </Label>
          <Select value={selectedPhoneNumber} onValueChange={setSelectedPhoneNumber}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a phone number" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_NUMBERS.map((phone) => (
                <SelectItem key={phone.id} value={phone.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{phone.number}</span>
                    <span className="text-sm text-gray-500">{phone.location}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-sm text-gray-500">
            Choose a phone number for your business. You can change this later in settings.
          </p>
        </div>

        {selectedPhoneNumber && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Selected Number
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  {AVAILABLE_NUMBERS.find(p => p.id === selectedPhoneNumber)?.number}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="px-8"
        >
          Back
        </Button>
        <Button
          onClick={handleFinish}
          disabled={!isFormValid}
          className="px-8"
        >
          Finish Setup
        </Button>
      </div>
    </div>
  );
}
