"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Headphones } from "lucide-react";
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
    name: "James",
    description: "Neutral, balanced tone",
    gender: "Neutral",
    accent: "American"
  },
  {
    id: "ballad",
    name: "Silver",
    description: "Smooth, melodic tone",
    gender: "Female",
    accent: "American"
  },
  {
    id: "coral",
    name: "Cortana",
    description: "Bright, energetic voice",
    gender: "Female",
    accent: "American"
  },
  {
    id: "sage",
    name: "Zyra",
    description: "Calm, wise voice",
    gender: "Female",
    accent: "American"
  },
  {
    id: "verse",
    name: "Darius",
    description: "Rich, deep voice",
    gender: "Male",
    accent: "American"
  }
];

const ACCENT_OPTIONS = [
  { value: "american", label: "American" },
  { value: "nigerian", label: "Nigerian" }
];

export function VoiceSelectionStep({ data, onUpdate, onNext, onBack }: VoiceSelectionStepProps) {
  const [selectedVoice, setSelectedVoice] = useState(data.selectedVoice);
  const [selectedAccent, setSelectedAccent] = useState(data.selectedAccent);

  const handleNext = () => {
    onUpdate({ selectedVoice, selectedAccent });
    onNext();
  };

  const testVoice = (voiceId: string) => {
    if (!voiceId) {
      toast.error("Please select a voice first");
      return;
    }

    try {
      // Map voice values to custom file names
      const voiceFileMap: Record<string, string> = {
        verse: "darius-verse",
        sage: "zyra-sage",
        coral: "cortana-coral",
        ballad: "silver-ballad",
        alloy: "James-alloy",
      };

      const fileName = voiceFileMap[voiceId];
      if (!fileName) {
        toast.error("Voice sample not available");
        return;
      }

      // Create audio element with proper error handling
      const audio = new Audio();

      // Handle audio loading errors
      audio.addEventListener("error", (e) => {
        console.error("Audio loading error:", e);
        toast.error(`Failed to load voice sample for ${voiceId}`);
      });

      // Handle successful loading
      audio.addEventListener("canplaythrough", () => {
        audio.play();
        toast.success(`Playing test audio with ${voiceId} voice`);
      });

      // Set the source and start loading
      audio.src = `/assets/${fileName}.mp3`;
      audio.load();
    } catch (error) {
      console.error("Error playing voice sample:", error);
      toast.error("Failed to play voice sample. Please try again.");
    }
  };

  const isFormValid = selectedVoice !== "" && selectedAccent !== "";

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
            <button
              key={voice.id}
              type="button"
              className={`w-full text-left border rounded-lg p-4 cursor-pointer transition-all ${
                selectedVoice === voice.id
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedVoice(voice.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
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
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      testVoice(voice.id);
                    }}
                    size="sm"
                    variant="outline"
                    className="h-8 px-3"
                  >
                    <Headphones className="h-4 w-4 mr-1" />
                    Test
                  </Button>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedVoice === voice.id
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}>
                    {selectedVoice === voice.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700">
          Accent Selection *
        </Label>
        <Select value={selectedAccent} onValueChange={setSelectedAccent}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an accent" />
          </SelectTrigger>
          <SelectContent>
            {ACCENT_OPTIONS.map((accent) => (
              <SelectItem key={accent.value} value={accent.value}>
                {accent.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
