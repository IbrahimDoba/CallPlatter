"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Headphones,
  Save,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

interface VoiceSelectionProps {
  voice: string;
  setVoice: (voice: string) => void;
  businessId: string | null;
  loadAgentConfig: () => Promise<void>;
}

export default function VoiceSelection({
  voice,
  setVoice,
  businessId,
  loadAgentConfig,
}: VoiceSelectionProps) {
  // Helper function to get voice name from voice ID
  const getVoiceName = (voiceId: string): string => {
    const voiceMap: Record<string, string> = {
      'james': 'James',
      'peter': 'Peter', 
      'hope': 'Hope',
      'emmanuel': 'Emmanuel',
      'stella': 'Stella'
    };
    return voiceMap[voiceId] || voiceId;
  };

  // Helper function to get ElevenLabs voice ID from voice name
  const getElevenLabsVoiceId = (voiceName: string): string => {
    const voiceIdMap: Record<string, string> = {
      'james': 'Smxkoz0xiOoHo5WcSskf',
      'peter': 'ChO6kqkVouUn0s7HMunx',
      'hope': 'zGjIP4SZlMnY9m93k97r',
      'emmanuel': '77aEIu0qStu8Jwv1EdhX',
      'stella': '2vbhUP8zyKg4dEZaTWGn'
    };
    return voiceIdMap[voiceName] || voiceName;
  };

  const updateVoice = async (newVoice: string) => {
    if (!businessId) {
      toast.error("Missing business ID. Please complete onboarding first.");
      return;
    }

    try {
      await api.voice.update({ 
        voice: newVoice, 
        voiceId: getElevenLabsVoiceId(newVoice), // Use actual ElevenLabs voice ID
        voiceName: getVoiceName(newVoice) 
      });
      toast.success("Voice updated successfully");
      
      // Refresh the agent config to get the latest voice settings
      await loadAgentConfig();
    } catch (error) {
      console.error("Error updating voice:", error);
      toast.error("Failed to update voice");
    }
  };

  const testVoice = () => {
    if (!voice) {
      toast.error("Please select a voice first");
      return;
    }

    try {
      // Map voice values to test audio files
      const voiceFileMap: Record<string, string> = {
        james: "james-test",
        peter: "peter-test",
        hope: "hope-test", 
        emmanuel: "Emmanuel-test",
        stella: "stella-test",
      };

      const fileName = voiceFileMap[voice];
      if (!fileName) {
        toast.error("Voice sample not available");
        return;
      }

      // Create audio element with proper error handling
      const audio = new Audio();

      // Handle audio loading errors
      audio.addEventListener("error", (e) => {
        console.error("Audio loading error:", e);
        toast.error(`Failed to load voice sample for ${getVoiceName(voice)}`);
      });

      // Handle successful loading
      audio.addEventListener("canplaythrough", () => {
        audio.play();
        toast.success(`Playing test audio with ${getVoiceName(voice)} voice`);
      });

      // Set the source and start loading
      audio.src = `/assets/${fileName}.mp3`;
      audio.load();
    } catch (error) {
      console.error("Error playing voice sample:", error);
      toast.error("Failed to play voice sample. Please try again.");
    }
  };

  const ids = {
    voice: "voice",
  } as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5" /> Voice Selection
        </CardTitle>
        <CardDescription>
          Choose your AI agent's voice and test how it sounds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor={ids.voice} className="text-lg font-medium">
            Select Voice
          </Label>
          <div className="flex items-center gap-3">
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger
                id={ids.voice}
                className="h-12 text-lg flex-1"
              >
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="james">
                  James - Neutral, balanced tone
                </SelectItem>
                <SelectItem value="peter">
                  Peter - Professional, clear voice
                </SelectItem>
                <SelectItem value="hope">
                  Hope - Warm, friendly voice
                </SelectItem>
                <SelectItem value="emmanuel">
                  Emmanuel - Confident, authoritative voice
                </SelectItem>
                <SelectItem value="stella">
                  Stella - Energetic, engaging voice
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={testVoice}
              className="h-10 px-4 bg-gray-600 hover:bg-gray-700"
              disabled={!voice}
            >
              <Headphones className="h-4 w-4 mr-2" />
              Test
            </Button>
            <Button
              onClick={() => updateVoice(voice)}
              className="h-10 px-4 bg-green-600 hover:bg-green-700"
              disabled={!voice}
            >
              <Save className="h-4 w-4 mr-2" />
              Update Voice
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
