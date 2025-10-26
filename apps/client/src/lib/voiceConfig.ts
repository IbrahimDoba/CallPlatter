/**
 * Centralized voice configuration for the frontend application
 * This file contains all available voices and their corresponding ElevenLabs voice IDs
 */

export interface VoiceConfig {
  id: string;
  name: string;
  description: string;
  voiceId: string;
  category: string;
  gender?: string;
  accent?: string;
}

export const AVAILABLE_VOICES: VoiceConfig[] = [
  {
    id: 'james',
    name: 'James',
    description: 'Neutral, balanced tone',
    voiceId: 'Smxkoz0xiOoHo5WcSskf',
    category: 'Standard',
    gender: 'Male',
    accent: 'American'
  },
  {
    id: 'peter',
    name: 'Peter',
    description: 'Professional, clear voice',
    voiceId: 'ChO6kqkVouUn0s7HMunx',
    category: 'Standard',
    gender: 'Male',
    accent: 'American'
  },
  {
    id: 'hope',
    name: 'Hope',
    description: 'Warm, friendly voice',
    voiceId: 'zGjIP4SZlMnY9m93k97r',
    category: 'Standard',
    gender: 'Female',
    accent: 'American'
  },
  {
    id: 'emmanuel',
    name: 'Emmanuel',
    description: 'Confident, authoritative voice',
    voiceId: '77aEIu0qStu8Jwv1EdhX',
    category: 'Standard',
    gender: 'Male',
    accent: 'Nigerian'
  },
  {
    id: 'stella',
    name: 'Stella',
    description: 'Energetic, engaging voice',
    voiceId: '2vbhUP8zyKg4dEZaTWGn',
    category: 'Standard',
    gender: 'Female',
    accent: 'Nigerian'
  },
  {
    id: 'toluwa',
    name: 'Toluwa',
    description: 'Warm, professional African voice',
    voiceId: 'NVp9wQor3NDIWcxYoZiW',
    category: 'African',
    gender: 'Female',
    accent: 'African'
  },
  {
    id: 'ayomide',
    name: 'Ayomide',
    description: 'Confident, clear African voice',
    voiceId: 'bcbkbYJpNzQGHml4XFrp',
    category: 'African',
    gender: 'Male',
    accent: 'African'
  },
  {
    id: 'john',
    name: 'John',
    description: 'Authoritative, professional African voice',
    voiceId: '3mwVS2Cu52S8MzAVx66c',
    category: 'African',
    gender: 'Male',
    accent: 'African'
  },
  {
    id: 'wale',
    name: 'Wale',
    description: 'Friendly, engaging African voice',
    voiceId: 'LEvd0YiWkwZ6hTZOmdVE',
    category: 'African',
    gender: 'Male',
    accent: 'African'
  }
];

/**
 * Get voice configuration by ID
 */
export function getVoiceById(id: string): VoiceConfig | undefined {
  return AVAILABLE_VOICES.find(voice => voice.id === id);
}

/**
 * Get voice configuration by ElevenLabs voice ID
 */
export function getVoiceByVoiceId(voiceId: string): VoiceConfig | undefined {
  return AVAILABLE_VOICES.find(voice => voice.voiceId === voiceId);
}

/**
 * Get all available voices
 */
export function getAllVoices(): VoiceConfig[] {
  return AVAILABLE_VOICES;
}

/**
 * Get voices by category
 */
export function getVoicesByCategory(category: string): VoiceConfig[] {
  return AVAILABLE_VOICES.filter(voice => voice.category === category);
}

/**
 * Get voices by gender
 */
export function getVoicesByGender(gender: string): VoiceConfig[] {
  return AVAILABLE_VOICES.filter(voice => voice.gender === gender);
}

/**
 * Get default voice configuration
 */
export function getDefaultVoice(): VoiceConfig {
  const defaultVoice = AVAILABLE_VOICES[0];
  if (!defaultVoice) {
    throw new Error('No voices configured');
  }
  return defaultVoice;
}

/**
 * Validate if a voice ID exists
 */
export function isValidVoiceId(id: string): boolean {
  return AVAILABLE_VOICES.some(voice => voice.id === id);
}

/**
 * Get voice name from voice ID
 */
export function getVoiceName(voiceId: string): string {
  const voice = getVoiceById(voiceId);
  return voice?.name || voiceId;
}

/**
 * Get ElevenLabs voice ID from voice name/ID
 */
export function getElevenLabsVoiceId(voiceId: string): string {
  const voice = getVoiceById(voiceId);
  return voice?.voiceId || voiceId;
}

/**
 * Get test audio file name for a voice
 */
export function getTestAudioFileName(voiceId: string): string {
  const voiceFileMap: Record<string, string> = {
    james: "james-test",
    peter: "peter-test",
    hope: "hope-test", 
    emmanuel: "Emmanuel-test",
    stella: "stella-test",
    toluwa: "toluwa-test",
    ayomide: "ayomide-test",
    john: "john-test",
    wale: "wale-test",
  };
  return voiceFileMap[voiceId] || voiceId;
}

/**
 * Get voice options for onboarding (simplified format)
 */
export function getVoiceOptionsForOnboarding() {
  return AVAILABLE_VOICES.map(voice => ({
    id: voice.id,
    name: voice.name,
    description: voice.description,
    gender: voice.gender,
    accent: voice.accent
  }));
}
