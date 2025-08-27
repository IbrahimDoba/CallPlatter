'use server'

import { db } from '@repo/db'

type CallLogInput = {
  callId: string
  businessId: string
  logs: Array<{
    type: 'user' | 'ai' | 'system'
    message: string
    timestamp: string
    duration?: number
    audioChunk?: string
  }>
}

export async function saveCallLogs(input: CallLogInput) {
  try {
    // Create or update the call
    const call = await db.call.upsert({
      where: { id: input.callId },
      create: {
        id: input.callId,
        businessId: input.businessId,
        status: 'COMPLETED',
        duration: 0, // Will be updated with the actual duration
      },
      update: {},
    })

    // Save logs
    const createdLogs = await db.$transaction(
      input.logs.map(log =>
        db.callLog.create({
          data: {
            callId: input.callId,
            message: log.message,
            sender: log.type === 'ai' ? 'ai' : 'user',
            audioChunk: log.audioChunk,
            timestamp: new Date(log.timestamp),
            metadata: {
              type: log.type,
              duration: log.duration,
            },
          },
        })
      )
    )

    // Update call duration
    if (input.logs.length > 0) {
      const lastLog = input.logs[input.logs.length - 1]
      if (lastLog?.timestamp) {
        const callDuration = Math.floor(
          (new Date(lastLog.timestamp).getTime() - call.createdAt.getTime()) / 1000
        )
        
        await db.call.update({
          where: { id: input.callId },
          data: {
            status: 'COMPLETED',
            duration: callDuration > 0 ? callDuration : call.duration,
          },
        })
      }
    }

    return { success: true, logs: createdLogs }
  } catch (error) {
    console.error('Error saving call logs:', error)
    return { success: false, error: 'Failed to save call logs' }
  }
}

export async function getCallLogs(callId: string, businessId: string) {
  try {
    const call = await db.call.findUnique({
      where: { id: callId, businessId },
      include: {
        logs: true
      }
    })

    if (!call) {
      return { success: false, error: 'Call not found' }
    }

    return { success: true, logs: call.logs }
  } catch (error) {
    console.error('Error fetching call logs:', error)
    return { success: false, error: 'Failed to fetch call logs' }
  }
}
