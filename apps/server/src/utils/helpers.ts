import { AppError } from '../types';

export function createError(message: string, statusCode: number, code?: string): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
}

export function validateEnvironment(): void {
  const requiredEnvVars = [
    'DATABASE_URL',
    'OPENAI_API_KEY',
    'PORT'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function isValidAudioFormat(format: string): boolean {
  const validFormats = ['webm', 'mp3', 'wav', 'ogg', 'm4a'];
  return validFormats.includes(format.toLowerCase());
}

export function getAudioMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    webm: 'audio/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4'
  };
  
  return mimeTypes[format.toLowerCase()] || 'audio/webm';
}
