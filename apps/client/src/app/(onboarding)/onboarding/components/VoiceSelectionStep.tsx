"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OnboardingData } from "../page";

interface VoiceSelectionStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const VOICE_OPTIONS = [
  {
    id: "alloy",
    name: "Alloy",
    description: "Neutral, balanced voice",
    gender: "Neutral",
    accent: "American"
  },
  {
    id: "echo",
    name: "Echo",
    description: "Warm, friendly voice",
    gender: "Male",
    accent: "American"
  },
  {
    id: "fable",
    name: "Fable",
    description: "Professional, clear voice",
    gender: "Male",
    accent: "British"
  },
  {
    id: "onyx",
    name: "Onyx",
    description: "Deep, authoritative voice",
    gender: "Male",
    accent: "American"
  },
  {
    id: "nova",
    name: "Nova",
    description: "Bright, energetic voice",
    gender: "Female",
    accent: "American"
  },
  {
    id: "shimmer",
    name: "Shimmer",
    description: "Soft, gentle voice",
    gender: "Female",
    accent: "American"
  }
];

export function VoiceSelectionStep({ data, onUpdate, onNext, onBack }: VoiceSelectionStepProps) {
  const [selectedVoice, setSelectedVoice] = useState(data.selectedVoice);

  const handleNext = () => {
    onUpdate({ selectedVoice });
    onNext();
  };

  const isFormValid = selectedVoice !== "";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Select a Voice</h2>
        <p className="mt-2 text-gray-600">
          Choose the voice that best represents your business
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700">
          Voice Selection *
        </Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VOICE_OPTIONS.map((voice) => (
            <div
              key={voice.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedVoice === voice.id
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedVoice(voice.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{voice.name}</h3>
                  <p className="text-sm text-gray-600">{voice.description}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {voice.gender}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {voice.accent}
                    </span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedVoice === voice.id
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}>
                  {selectedVoice === voice.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
