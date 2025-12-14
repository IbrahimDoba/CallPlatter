"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Headphones } from "lucide-react";
import type { OnboardingData } from "../page";
import { getVoiceName, getTestAudioFileName, getVoiceOptionsForOnboarding } from "@/lib/voiceConfig";

interface VoiceSelectionStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const VOICE_OPTIONS = getVoiceOptionsForOnboarding();


export function VoiceSelectionStep({ data, onUpdate, onNext, onBack }: VoiceSelectionStepProps) {
  const [selectedVoice, setSelectedVoice] = useState(data.selectedVoice);

  // Sync local state with data prop changes
  useEffect(() => {
    if (data.selectedVoice && data.selectedVoice !== selectedVoice) {
      console.log('🎤 VoiceSelectionStep: Syncing selectedVoice from data prop:', data.selectedVoice);
      setSelectedVoice(data.selectedVoice);
    }
  }, [data.selectedVoice, selectedVoice]);

  const handleNext = () => {
    onUpdate({ selectedVoice });
    onNext();
  };

  const testVoice = (voiceId: string) => {
    if (!voiceId) {
      toast.error("Please select a voice first");
      return;
    }

    try {
      const fileName = getTestAudioFileName(voiceId);
      if (!fileName) {
        toast.error("Voice sample not available");
        return;
      }

      // Create audio element with proper error handling
      const audio = new Audio();

      // Handle audio loading errors
      audio.addEventListener("error", (e) => {
        console.error("Audio loading error:", e);
        toast.error(`Failed to load voice sample for ${getVoiceName(voiceId)}`);
      });

      // Handle successful loading
      audio.addEventListener("canplaythrough", () => {
        audio.play();
        toast.success(`Playing test audio with ${getVoiceName(voiceId)} voice`);
      });

      // Set the source and start loading
      audio.src = `/assets/${fileName}.mp3`;
      audio.load();
    } catch (error) {
      console.error("Error playing voice sample:", error);
      toast.error("Failed to play voice sample. Please try again.");
    }
  };

  const isFormValid = selectedVoice !== "";

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
        <h2 className="text-2xl font-bold text-gray-900">Select a Voice</h2>
        <p className="mt-2 text-gray-600">
          Choose the voice that best represents your business
        </p>
      </motion.div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Label className="text-sm font-medium text-gray-700">
          Voice Selection *
        </Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VOICE_OPTIONS.map((voice, index) => (
            <motion.div
              key={voice.id}
              className={`w-full text-left border rounded-lg p-4 cursor-pointer transition-all ${
                selectedVoice === voice.id
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedVoice(voice.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
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
                  </motion.div>
                  <motion.div 
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedVoice === voice.id
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                    animate={{
                      scale: selectedVoice === voice.id ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      scale: {
                        duration: 0.3,
                        repeat: selectedVoice === voice.id ? 1 : 0,
                      },
                    }}
                  >
                    {selectedVoice === voice.id && (
                      <motion.div 
                        className="w-full h-full rounded-full bg-white scale-50"
                        initial={{ scale: 0 }}
                        animate={{ scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>


      <motion.div 
        className="flex justify-between pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={onBack}
            className="px-8"
          >
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
