// Accent instructions for different accents
export const ACCENT_INSTRUCTIONS = {
  american: "CRITICAL VOICE INSTRUCTIONS: You MUST speak with a clear American accent. Use standard American pronunciation patterns. Speak with the natural rhythm and intonation of American English. Be warm, professional, and use typical American expressions like 'sure thing', 'absolutely', 'you bet'. Your voice should sound like a friendly American customer service representative.",
  
  nigerian: "VOICE INSTRUCTIONS: Speak with a subtle Nigerian accent. Use gentle Nigerian pronunciation patterns and occasionally include Nigerian expressions like 'na so' (that's right), 'abi?' (isn't it?), 'sha' (just). Be warm and professional, speaking naturally without being overly animated."
};

// Function to get accent instructions
export function getAccentInstructions(accent?: string): string {
  if (!accent || !ACCENT_INSTRUCTIONS[accent as keyof typeof ACCENT_INSTRUCTIONS]) {
    return ACCENT_INSTRUCTIONS.american; // Default to American
  }
  return ACCENT_INSTRUCTIONS[accent as keyof typeof ACCENT_INSTRUCTIONS];
}
