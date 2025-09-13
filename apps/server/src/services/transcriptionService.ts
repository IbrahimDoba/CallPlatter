// services/transcriptionService.ts
import { logger } from "../utils/logger";
import { db } from "@repo/db";
import { summarizeCall } from "./summaryService";

interface TranscriptionResult {
  transcript: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
    speaker?: 'AI' | 'HUMAN';
  }>;
}


interface BusinessContext {
  businessId: string;
  businessName: string;
  systemMessage: string;
  firstMessage?: string;
  goodbyeMessage?: string;
  questionsToAsk: string[];
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudioWithWhisper(audioUrl: string): Promise<TranscriptionResult> {
  try {
    logger.info("Starting Whisper transcription", { audioUrl });

    // First, download the audio file from UploadThing
    logger.info("Downloading audio file for transcription", { audioUrl });
    const audioResponse = await fetch(audioUrl);
    
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio file: ${audioResponse.status} ${audioResponse.statusText}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });

    // Create FormData for Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities', '["segment"]');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Whisper API error", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Whisper API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    logger.info("Whisper transcription completed", {
      duration: result.duration,
      language: result.language,
      segmentCount: result.segments?.length || 0
    });

    return {
      transcript: result.text,
      segments: result.segments?.map((segment: { start: number; end: number; text: string }) => ({
        start: segment.start,
        end: segment.end,
        text: segment.text
      })) || []
    };

  } catch (error) {
    logger.error("Error in Whisper transcription", {
      error: error instanceof Error ? error.message : String(error),
      audioUrl
    });
    throw error;
  }
}

/**
 * Identify speakers using GPT-4 with business context
 */
export async function identifySpeakersWithGPT(
  transcript: string,
  segments: Array<{ start: number; end: number; text: string }>,
  businessContext: BusinessContext
): Promise<Array<{ start: number; end: number; text: string; speaker: 'AI' | 'HUMAN' }>> {
  try {
    logger.info("Starting speaker identification with GPT-4", {
      businessName: businessContext.businessName,
      segmentCount: segments.length
    });

    const prompt = `You are analyzing a call transcript from a business called "${businessContext.businessName}".

BUSINESS CONTEXT:
- Business Name: ${businessContext.businessName}
- AI Instructions: ${businessContext.systemMessage.substring(0, 500)}...
- AI First Message: "${businessContext.firstMessage || 'Not specified'}"
- AI Goodbye Message: "${businessContext.goodbyeMessage || 'Not specified'}"
- AI Asks For: ${businessContext.questionsToAsk.join(', ')}

TRANSCRIPT:
${transcript}

TASK:
Label each segment as either "AI:" or "HUMAN:" based on the context and content. The AI follows the instructions above and asks for the specified information.

Return ONLY a JSON array with this exact format:
[
  {"start": 0.0, "end": 2.5, "text": "Hello, thank you for calling...", "speaker": "AI"},
  {"start": 2.5, "end": 4.0, "text": "Hi, I need help with...", "speaker": "HUMAN"}
]

Rules:
- AI speaks first (greeting)
- AI asks questions about ${businessContext.questionsToAsk.join(', ')}
- AI provides helpful information
- HUMAN responds to questions and asks their own
- Be consistent with speaker labels
- Return ONLY the JSON array, no other text`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing call transcripts and identifying speakers based on business context and conversation patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("GPT-4 API error", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`GPT-4 API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from GPT-4");
    }

    // Clean the content - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    logger.info("GPT-4 response content", { 
      originalLength: content.length,
      cleanedLength: cleanedContent.length,
      startsWithJson: cleanedContent.startsWith('['),
      preview: cleanedContent.substring(0, 200) + '...'
    });

    // Parse the JSON response
    const speakerSegments = JSON.parse(cleanedContent);
    
    logger.info("Speaker identification completed", {
      segmentCount: speakerSegments.length,
      aiSegments: speakerSegments.filter((s: { speaker: string }) => s.speaker === 'AI').length,
      humanSegments: speakerSegments.filter((s: { speaker: string }) => s.speaker === 'HUMAN').length
    });

    return speakerSegments;

  } catch (error) {
    logger.error("Error in speaker identification", {
      error: error instanceof Error ? error.message : String(error),
      businessName: businessContext.businessName
    });
    throw error;
  }
}

/**
 * Get business context for a call
 */
export async function getBusinessContext(callId: string): Promise<BusinessContext | null> {
  try {
    const call = await db.call.findUnique({
      where: { id: callId },
      include: {
        business: {
          include: {
            aiAgentConfig: true
          }
        }
      }
    });

    if (!call || !call.business) {
      logger.warn("No business context found for call", { callId });
      return null;
    }

    const aiConfig = call.business.aiAgentConfig;
    if (!aiConfig) {
      logger.warn("No AI config found for business", { businessId: call.business.id });
      return null;
    }

    // Build questions to ask array
    const questionsToAsk = [];
    if (aiConfig.askForName) questionsToAsk.push("name");
    if (aiConfig.askForPhone) questionsToAsk.push("phone number");
    if (aiConfig.askForEmail) questionsToAsk.push("email address");
    if (aiConfig.askForCompany) questionsToAsk.push("company name");
    if (aiConfig.askForAddress) questionsToAsk.push("address");

    // Fetch business memories
    const businessMemories = await db.businessMemory.findMany({
      where: {
        businessId: call.business.id,
        isActive: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const memoryContent = businessMemories
      .map((memory: any) => `${memory.title}: ${memory.content}`)
      .join('\n');

    const systemMessage = aiConfig.systemPrompt || "You are a helpful AI assistant.";
    const fullSystemMessage = memoryContent 
      ? `${systemMessage}\n\nBusiness Context & Memory:\n${memoryContent}`
      : systemMessage;

    return {
      businessId: call.business.id,
      businessName: call.business.name,
      systemMessage: fullSystemMessage,
      firstMessage: aiConfig.firstMessage || undefined,
      goodbyeMessage: aiConfig.goodbyeMessage || undefined,
      questionsToAsk
    };

  } catch (error) {
    logger.error("Error getting business context", {
      error: error instanceof Error ? error.message : String(error),
      callId
    });
    return null;
  }
}

/**
 * Save transcript to database
 */
export async function saveTranscriptToDatabase(
  callId: string,
  transcript: string,
  segments: Array<{ start: number; end: number; text: string; speaker: 'AI' | 'HUMAN' }>
): Promise<void> {
  try {
    // Update the call record with the full transcript
    await db.call.update({
      where: { id: callId },
      data: {
        transcript: transcript,
        summary: `Call transcribed - ${transcript.length} characters, ${segments.length} segments`
      }
    });

    // Create transcript segments (if you want to store them separately)
    // You might want to create a separate table for this
    // await db.transcriptSegment.createMany({
    //   data: segments.map(segment => ({
    //     callId: callId,
    //     startTime: segment.start,
    //     endTime: segment.end,
    //     text: segment.text,
    //     speaker: segment.speaker
    //   }))
    // });

    logger.info("Transcript saved to database", {
      callId,
      transcriptLength: transcript.length,
      segmentCount: segments.length
    });

  } catch (error) {
    logger.error("Error saving transcript to database", {
      error: error instanceof Error ? error.message : String(error),
      callId
    });
    throw error;
  }
}


/**
 * Main transcription function - orchestrates the entire process
 */
export async function transcribeCall(callId: string): Promise<void> {
  try {
    logger.info("Starting call transcription process", { callId });

    // Step 1: Get call record with audio URL
    const call = await db.call.findUnique({
      where: { id: callId }
    });

    if (!call) {
      throw new Error(`Call not found: ${callId}`);
    }

    if (!call.audioFileUrl) {
      throw new Error(`No audio file URL found for call: ${callId}`);
    }

    // Step 2: Get business context
    const businessContext = await getBusinessContext(callId);
    if (!businessContext) {
      throw new Error(`No business context found for call: ${callId}`);
    }

    // Step 3: Transcribe with Whisper
    const whisperResult = await transcribeAudioWithWhisper(call.audioFileUrl);

    // Step 4: Identify speakers with GPT-4
    const speakerSegments = await identifySpeakersWithGPT(
      whisperResult.transcript,
      whisperResult.segments,
      businessContext
    );

    // Step 5: Create structured transcript with speaker labels
    const structuredTranscript = speakerSegments
      .map(segment => `${segment.speaker}: ${segment.text}`)
      .join('\n');

    // Step 6: Save transcript to database
    await saveTranscriptToDatabase(callId, structuredTranscript, speakerSegments);

    // Step 7: Generate and save summary
    await summarizeCall(callId, structuredTranscript, businessContext);

    logger.info("Call transcription and summary completed successfully", {
      callId,
      businessName: businessContext.businessName,
      transcriptLength: whisperResult.transcript.length,
      segmentCount: speakerSegments.length
    });

  } catch (error) {
    logger.error("Error in call transcription process", {
      error: error instanceof Error ? error.message : String(error),
      callId
    });
    throw error;
  }
}
