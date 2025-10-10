'use server'

import { db } from '@repo/db'

export interface CallLogEntry {
  message: string
  sender: 'user' | 'ai'
  timestamp: Date
  audioChunk?: string
  metadata?: any
}

export interface CallData {
  businessId: string
  customerPhone?: string
  customerName?: string
  duration?: number
  logs: CallLogEntry[]
  finalTranscript?: string
  intent?: string
  status?: string
  audioFileUrl?: string
  metadata?: Record<string, any>
}

export async function saveCallToDatabase(callData: CallData) {
  try {
    // Validate required data
    if (!callData.businessId) {
      throw new Error('Business ID is required');
    }

    if (!callData.logs || callData.logs.length === 0) {
      throw new Error('Call logs are required');
    }

    // Verify business exists
    const business = await db.business.findUnique({
      where: { id: callData.businessId }
    });

    if (!business) {
      throw new Error(`Business with ID ${callData.businessId} not found`);
    }

    // Create the call record
    const call = await db.call.create({
      data: {
        businessId: callData.businessId,
        customerPhone: callData.customerPhone || null,
        customerName: callData.customerName || null,
        status: (callData.status as 'INCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'MISSED' | 'CANCELLED') || 'COMPLETED',
        duration: callData.duration || null,
        transcript: callData.finalTranscript || null,
        intent: callData.intent || null,
        audioFileUrl: callData.audioFileUrl || null,
      },
    });

    // Create call logs
    const callLogs = [];
    
    for (let i = 0; i < callData.logs.length; i++) {
      const log = callData.logs[i];
      if (!log) continue;
      
      try {
        const createdLog = await db.callLog.create({
          data: {
            callId: call.id,
            message: log.message,
            sender: log.sender,
            timestamp: log.timestamp,
            audioChunk: log.audioChunk || null,
            metadata: log.metadata || null,
          },
        });
        
        callLogs.push(createdLog);
      } catch (logError) {
        // Continue with other logs even if one fails
        continue;
      }
    }

    return {
      success: true,
      callId: call.id,
      logsCount: callLogs.length,
      message: `Call saved successfully with ${callLogs.length} logs`
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : undefined,
      prismaCode: error && typeof error === 'object' && 'code' in error ? error.code : undefined
    };
  }
}

// Test function to verify database connection
export async function testDatabaseConnection() {
  try {
    const businessCount = await db.business.count();
    const callCount = await db.call.count();
    const callLogCount = await db.callLog.count();
    
    return { 
      success: true, 
      businessCount, 
      callCount, 
      callLogCount 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Function to get a specific business by ID
export async function getBusinessById(businessId: string) {
  try {
    const business = await db.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        createdAt: true
      }
    });
    
    return {
      success: true,
      business
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function deleteCall(callId: string) {
  try {
    // Verify the call exists
    const existingCall = await db.call.findUnique({
      where: { id: callId },
    });

    if (!existingCall) {
      return { success: false as const, error: 'Call not found' };
    }

    // Delete all related call logs first (if you have a separate table for logs)
    await db.callLog.deleteMany({
      where: { callId },
    });

    // Delete the call
    await db.call.delete({
      where: { id: callId },
    });

    return { success: true as const };
  } catch (error) {
    console.error('Error deleting call:', error);
    return {
      success: false as const,
      error: 'Failed to delete call',
    };
  }
}