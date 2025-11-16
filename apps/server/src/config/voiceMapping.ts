/**
 * Voice Mapping Configuration
 *
 * Maps local voice names to ElevenLabs voice IDs
 * These voices are optimized for telephony (8kHz audio)
 */

export interface VoiceConfig {
  voiceId: string;
  voiceName: string;
  description?: string;
  gender?: "male" | "female";
  accent?: string;
}

// ElevenLabs voice IDs for common voices
// Source: https://elevenlabs.io/docs/voices/premade-voices
export const ELEVENLABS_VOICES: Record<string, VoiceConfig> = {
  // Female voices
  rachel: {
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    voiceName: "Rachel",
    description: "Warm and calm, professional female voice",
    gender: "female",
    accent: "american",
  },
  sarah: {
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    voiceName: "Sarah",
    description: "Soft and friendly female voice",
    gender: "female",
    accent: "american",
  },
  bella: {
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    voiceName: "Bella",
    description: "Warm and engaging female voice",
    gender: "female",
    accent: "american",
  },
  domi: {
    voiceId: "AZnzlk1XvdvUeBnXmlld",
    voiceName: "Domi",
    description: "Strong and confident female voice",
    gender: "female",
    accent: "american",
  },
  elli: {
    voiceId: "MF3mGyEYCl7XYWbV9V6O",
    voiceName: "Elli",
    description: "Expressive young female voice",
    gender: "female",
    accent: "american",
  },

  // Male voices
  james: {
    voiceId: "Smxkoz0xiOoHo5WcSskf",
    voiceName: "James",
    description: "Professional authoritative male voice",
    gender: "male",
    accent: "american",
  },
  josh: {
    voiceId: "TxGEqnHWrfWFTfGW9XjX",
    voiceName: "Josh",
    description: "Young and energetic male voice",
    gender: "male",
    accent: "american",
  },
  adam: {
    voiceId: "pNInz6obpgDQGcFmaJgB",
    voiceName: "Adam",
    description: "Deep and resonant male voice",
    gender: "male",
    accent: "american",
  },
  sam: {
    voiceId: "yoZ06aMxZJJ28mfd3POQ",
    voiceName: "Sam",
    description: "Calm and professional male voice",
    gender: "male",
    accent: "american",
  },
  arnold: {
    voiceId: "VR6AewLTigWG4xSOukaG",
    voiceName: "Arnold",
    description: "Authoritative male voice",
    gender: "male",
    accent: "american",
  },
  antoni: {
    voiceId: "ErXwobaYiN019PkySvjV",
    voiceName: "Antoni",
    description: "Smooth and articulate male voice",
    gender: "male",
    accent: "american",
  },
};

// Default voice for fallback
export const DEFAULT_VOICE: VoiceConfig = ELEVENLABS_VOICES.rachel as VoiceConfig;

/**
 * Get voice configuration by name
 */
export function getVoiceByName(name: string): VoiceConfig {
  const normalizedName = name.toLowerCase().trim();

  // Check if it's already a voice ID (long alphanumeric string)
  if (name.length > 15 && /^[A-Za-z0-9]+$/.test(name)) {
    return {
      voiceId: name,
      voiceName: name,
      description: "Custom voice ID",
    };
  }

  const voice = ELEVENLABS_VOICES[normalizedName] as VoiceConfig | undefined;

  if (voice) {
    return voice;
  }

  // Fallback to default voice
  return DEFAULT_VOICE;
}

/**
 * Get all available voices
 */
export function getAllVoices(): VoiceConfig[] {
  return Object.values(ELEVENLABS_VOICES);
}

/**
 * Get voices by gender
 */
export function getVoicesByGender(gender: "male" | "female"): VoiceConfig[] {
  return Object.values(ELEVENLABS_VOICES).filter((v) => v.gender === gender);
}
