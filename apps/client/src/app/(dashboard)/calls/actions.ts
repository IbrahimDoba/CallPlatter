'use server'

import { db } from '@repo/db'

export type CallLog = {
  id: string
  message: string
  sender: 'user' | 'ai'
  timestamp: Date
  audioChunk?: string
}

export type CallWithLogs = {
  id: string
  businessId: string
  customerPhone: string
  customerName: string | null
  duration: number | null
  status: 'COMPLETED' | 'IN_PROGRESS' | 'MISSED' | 'FAILED'
  audioFileUrl?: string
  createdAt: Date
  updatedAt: Date
  logs: CallLog[]
}

export async function getCalls(businessId: string): Promise<CallWithLogs[]> {
  if (!businessId) {
    throw new Error('Business ID is required')
  }

  try {
    const calls = await db.call.findMany({
      where: { businessId },
      include: {
        logs: {
          orderBy: { timestamp: 'asc' },
          select: {
            id: true,
            message: true,
            sender: true,
            timestamp: true,
            audioChunk: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Ensure proper typing and handle null values
    return calls.map(call => ({
      ...call,
      customerPhone: call.customerPhone || 'Unknown',
      status: call.status as 'COMPLETED' | 'IN_PROGRESS' | 'MISSED' | 'FAILED',
      audioFileUrl: call.audioFileUrl || undefined, // Convert null to undefined
      logs: call.logs.map(log => ({
        ...log,
        sender: log.sender === 'ai' ? 'ai' : 'user' as const,
        audioChunk: log.audioChunk || undefined // Convert null to undefined
      }))
    }))
  } catch (error) {
    console.error('Error fetching calls:', error)
    throw new Error('Failed to fetch calls')
  }
}
