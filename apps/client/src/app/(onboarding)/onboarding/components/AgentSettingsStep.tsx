"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingData } from "../page";

interface AgentSettingsStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AgentSettingsStep({ data, onUpdate, onNext, onBack }: AgentSettingsStepProps) {
  const [greeting, setGreeting] = useState(data.greeting);
  const [recordingConsent, setRecordingConsent] = useState(data.recordingConsent);

  // Sync local state with data prop changes
  useEffect(() => {
    if (data.greeting && data.greeting !== greeting) {
      console.log('🤖 AgentSettingsStep: Syncing greeting from data prop:', data.greeting);
      setGreeting(data.greeting);
    }
    if (data.recordingConsent !== recordingConsent) {
      console.log('🤖 AgentSettingsStep: Syncing recordingConsent from data prop:', data.recordingConsent);
      setRecordingConsent(data.recordingConsent);
    }
  }, [data.greeting, data.recordingConsent, greeting, recordingConsent]);

  const handleNext = () => {
    onUpdate({
      greeting,
      recordingConsent,
    });
    onNext();
  };

  const isFormValid = greeting.trim() !== "";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Agent Settings</h2>
        <p className="mt-2 text-gray-600">
          Configure your AI agent's behavior and settings
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="greeting" className="text-sm font-medium text-gray-700">
            Greetings *
          </Label>
          <Input
            id="greeting"
            type="text"
            placeholder="e.g., Hello! Thank you for calling [Business Name]. How can I help you today?"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="mt-1"
          />
          <p className="mt-1 text-sm text-gray-500">
            This is the first message callers will hear when they call your business.
          </p>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="recordingConsent"
              checked={recordingConsent}
              onCheckedChange={(checked) => setRecordingConsent(checked as boolean)}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label htmlFor="recordingConsent" className="text-sm font-medium text-gray-700">
                Recording Consent (Optional)
              </Label>
              <p className="text-sm text-gray-600">
                I acknowledge and agree that calls are recorded. I am responsible for notifying callers, as may be required by law.
              </p>
            </div>
          </div>
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
