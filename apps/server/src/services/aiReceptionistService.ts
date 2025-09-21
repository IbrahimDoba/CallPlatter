import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
// Removed ffmpeg dependency - using WebM directly with Whisper
import { logger } from '../utils/logger';

// Supported OpenAI TTS voices (as per API error enum)
const ALLOWED_TTS_VOICES = new Set([
  'nova', 'shimmer', 'echo', 'onyx', 'fable', 'alloy', 'ash', 'sage', 'coral',
]);

function sanitizeVoice(input?: string): string {
  const v = (input || '').toLowerCase();
  if (ALLOWED_TTS_VOICES.has(v)) return v;
  if (v) {
    logger.warn('Unsupported TTS voice requested; falling back to alloy', { requested: v });
  }
  return 'alloy';
}

// Ensure env vars are loaded if this file is imported directly in tests/tools
dotenv.config();

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (openai) return openai;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing. Set it in your environment or .env file.');
  }
  openai = new OpenAI({ apiKey });
  return openai;
}
export type AgentRuntimeConfig = {
  transcriptionModel?: string; // e.g. 'whisper-1'
  responseModel?: string;      // e.g. 'gpt-4o-mini' (non-realtime flow)
  voice?: string;              // e.g. 'alloy'
  firstMessage?: string | null;
  agentLLM?: string | null;    // memory/context
  systemPrompt?: string | null;
  temperature?: number | null;
};

export class AIReceptionistService {
  private static instance: AIReceptionistService;

  public static getInstance(): AIReceptionistService {
    if (!AIReceptionistService.instance) {
      AIReceptionistService.instance = new AIReceptionistService();
    }
    return AIReceptionistService.instance;
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   */

  async transcribeAudio(audioBuffer: Buffer, cfg?: AgentRuntimeConfig, format?: string): Promise<string> {
    try {
      // Create temporary file for audio (supports WebM, WAV, and other formats)
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Determine file extension based on format or default to webm
      const extension = format || 'webm';
      const tempFilePath = path.join(tempDir, `audio_${Date.now()}.${extension}`);
      fs.writeFileSync(tempFilePath, audioBuffer);

      const audioFile = fs.createReadStream(tempFilePath);
      
      const transcription = await getOpenAIClient().audio.transcriptions.create({
        file: audioFile,
        model: cfg?.transcriptionModel || 'whisper-1',
        prompt: 'Business-related conversation, including terms like hours, appointment, booking, customer service. ALL ANSWERS SHOULD BE SHORT, DYNAMIC AND STRAINGHT TO THE POINT',
        response_format: 'text'
      });

      // Clean up temp file
      this.cleanupFile(tempFilePath);

      logger.info('Audio transcribed successfully', { 
        transcription: transcription.substring(0, 100) + '...'
      });

      return transcription;
    } catch (error) {
      logger.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Generate AI response using ChatGPT
   */
  async generateResponse(transcription: string, cfg?: AgentRuntimeConfig): Promise<string> {
    try {
      const system = [
        'You are an AI phone receptionist for a business. Greet, answer, route, book appointments, and take messages.',
        'Style: extremely concise, friendly, and professional. Prefer one short sentence (<= 20 words). Avoid filler.',
        'If the caller indicates the conversation is over or the task is complete, append <END_CALL> after your final sentence.',
        cfg?.systemPrompt || '',
        cfg?.agentLLM ? `Business memory/context:\n${cfg.agentLLM}` : '',
      ].filter(Boolean).join('\n\n');

      // Use a chat model, not realtime model for text generation
      const chatModel = cfg?.responseModel?.includes('realtime') ? 'gpt-3.5-turbo' : (cfg?.responseModel || 'gpt-3.5-turbo');
      
      const completion = await getOpenAIClient().chat.completions.create({
        model: chatModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: transcription },
        ],
        max_tokens: 150,
        temperature: typeof cfg?.temperature === 'number' ? cfg!.temperature! : 0.3,
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I didn\'t understand that. Could you please repeat your question?';

      logger.info('AI response generated', { 
        response: response.substring(0, 100) + '...' 
      });

      return response;
    } catch (error) {
      logger.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Convert text to speech using OpenAI TTS
   */
  async textToSpeech(text: string, cfg?: AgentRuntimeConfig): Promise<Buffer> {
    try {
      const mp3 = await getOpenAIClient().audio.speech.create({
        model: 'tts-1',
        voice: sanitizeVoice(cfg?.voice),
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());

      logger.info('Text converted to speech successfully', { 
        textLength: text.length,
        audioSize: buffer.length 
      });

      return buffer;
    } catch (error) {
      logger.error('Error converting text to speech:', error);
      throw new Error('Failed to convert text to speech');
    }
  }

  /**
   * Process complete audio conversation flow
   */
  async processAudioConversation(audioBuffer: Buffer, cfg?: AgentRuntimeConfig): Promise<Buffer> {
    try {
      // Step 1: Transcribe audio
      const transcription = await this.transcribeAudio(audioBuffer, cfg);
      
      // Step 2: Generate AI response
      const aiResponse = await this.generateResponse(transcription, cfg);
      
      // Step 3: Convert response to speech
      const audioResponse = await this.textToSpeech(aiResponse, cfg);
      
      return audioResponse;
    } catch (error) {
      logger.error('Error in audio conversation flow:', error);
      throw error;
    }
  }

  /**
   * Process complete audio conversation flow with detailed response
   */
  async processAudioConversationWithDetails(inputAudioBuffer: Buffer, cfg?: AgentRuntimeConfig): Promise<{
    transcription: string;
    aiResponse: string;
    audioBuffer: Buffer;
  }> {
    try {
      // Step 1: Transcribe audio
      const transcription = await this.transcribeAudio(inputAudioBuffer, cfg);
      
      // Step 2: Generate AI response
      const aiResponse = await this.generateResponse(transcription, cfg);
      
      // Step 3: Convert response to speech (strip END marker from spoken text)
      const END_MARKER = '<END_CALL>';
      const speakText = aiResponse.includes(END_MARKER)
        ? aiResponse.replaceAll(END_MARKER, '').trim()
        : aiResponse;
      const audioBuffer = await this.textToSpeech(speakText, cfg);
      
      return {
        transcription,
        aiResponse,
        audioBuffer
      };
    } catch (error) {
      logger.error('Error in detailed audio conversation flow:', error);
      throw error;
    }
  }

  /**
   * Clean up temporary files
   */
  private cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info('Temporary file cleaned up', { filePath });
      }
    } catch (error) {
      logger.error('Error cleaning up file:', error);
    }
  }

  /**
   * Clean up all temporary files in temp directory
   */
  public cleanupTempFiles(): void {
    try {
      const tempDir = path.join(process.cwd(), 'temp');
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
          const filePath = path.join(tempDir, file);
          fs.unlinkSync(filePath);
        });
        logger.info('All temporary files cleaned up');
      }
    } catch (error) {
      logger.error('Error cleaning up temp files:', error);
    }
  }
}
