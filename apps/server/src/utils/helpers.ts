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

  const optionalEnvVars = [
    'UPLOADTHING_SECRET',
    'UPLOADTHING_APP_ID',
    'BASE_URL',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Log optional environment variables status
  const missingOptional = optionalEnvVars.filter(varName => !process.env[varName]);
  if (missingOptional.length > 0) {
    console.warn(`Missing optional environment variables: ${missingOptional.join(', ')}`);
    if (missingOptional.includes('BASE_URL')) {
      console.warn('BASE_URL not set - WebSocket URLs may not work correctly in production');
    }
    if (missingOptional.includes('TWILIO_ACCOUNT_SID') || missingOptional.includes('TWILIO_AUTH_TOKEN')) {
      console.warn('Twilio credentials missing - call recording may not work');
    }
    if (missingOptional.includes('RESEND_API_KEY') || missingOptional.includes('RESEND_FROM_EMAIL')) {
      console.warn('Resend credentials missing - email functionality may not work');
    }
    console.warn('UploadThing functionality may not work without these variables');
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

/**
 * Construct WebSocket URL for production environments
 * Handles proxy headers and SSL termination properly
 */
export function constructWebSocketUrl(req: { headers: Record<string, string | string[] | undefined>; secure?: boolean }, path: string = '/api/openai-realtime/media-stream'): string {
  // In production, prefer BASE_URL if set
  if (process.env.BASE_URL) {
    const baseUrl = process.env.BASE_URL.replace(/^http/, 'ws');
    return `${baseUrl}${path}`;
  }

  // Fallback to dynamic construction with better proxy support
  const host = req.headers.host;
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const isSecure = req.secure || forwardedProto === 'https';
  
  // Use forwarded host if available (common in production)
  const finalHost = forwardedHost || host;
  const protocol = isSecure ? 'wss' : 'ws';
  
  return `${protocol}://${finalHost}${path}`;
}
