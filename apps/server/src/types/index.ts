// Prisma-generated types
export type ConversationStatus = 'ACTIVE' | 'ENDED' | 'PAUSED';
export type MessageType = 'TEXT' | 'AUDIO' | 'SYSTEM';

// Business Context Types
export interface BusinessContext {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  services?: Service[];
  hours?: BusinessHours;
  address?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number; // in minutes
}

export interface BusinessHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  open: string; // HH:MM format
  close: string; // HH:MM format
  closed?: boolean;
}

// Conversation Types
export interface ConversationData {
  id: string;
  businessId: string;
  sessionId: string;
  status: ConversationStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  messages: MessageData[];
}

export interface MessageData {
  id: string;
  conversationId: string;
  type: MessageType;
  content: string;
  audioUrl?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Audio Types
export interface AudioChunk {
  data: Buffer;
  format: string;
  timestamp: number;
  sessionId: string;
}

export interface AudioResponse {
  audio: Buffer;
  format: string;
  duration: number;
  text: string;
}

// WebSocket Event Types
export interface SocketEvents {
  'audio-chunk': (data: AudioChunk) => void;
  'conversation-start': (data: { businessId: string }) => void;
  'conversation-end': (data: { conversationId: string }) => void;
  'audio-response': (data: AudioResponse) => void;
  'transcription': (data: { text: string; conversationId: string }) => void;
  'ai-text': (data: { text: string; conversationId: string }) => void;
  'conversation-id': (data: { conversationId: string; sessionId: string }) => void;
  'error': (data: { message: string; code?: string }) => void;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  code?: string;
  isOperational: boolean;
}

// Environment Types
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
  CORS_ORIGIN: string;
  MAX_AUDIO_SIZE: number;
  AUDIO_TIMEOUT: number;
}
