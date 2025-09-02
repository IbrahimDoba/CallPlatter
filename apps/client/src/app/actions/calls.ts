'use server'

import { db } from '@repo/db'

export type CallWithLogs = {
  id: string
  businessId: string
  customerPhone: string
  customerName: string | null
  summary: string | null
  duration: number | null
  status: 'COMPLETED' | 'IN_PROGRESS' | 'MISSED' | 'FAILED'
  createdAt: Date
  updatedAt: Date
  audioFileUrl: string | null
  logs: {
    id: string
    message: string
    sender: 'user' | 'ai'
    timestamp: Date
  }[]
}

export type PaginatedCalls = {
  calls: CallWithLogs[]
  total: number
}

export async function getCalls(businessId: string, page = 1, limit = 10): Promise<PaginatedCalls> {
  if (!businessId) {
    throw new Error('Business ID is required')
  }

  try {
    const skip = (page - 1) * limit;
    const [calls, total] = await Promise.all([
      db.call.findMany({
        where: { businessId },
        include: {
          logs: {
            orderBy: { timestamp: 'asc' },
            select: {
              id: true,
              message: true,
              sender: true,
              timestamp: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.call.count({ where: { businessId } })
    ]);

    // Ensure customerPhone is never null and return paginated results
    return {
      calls: calls.map(call => ({
        ...call,
        customerPhone: call.customerPhone || 'Unknown'
      })) as CallWithLogs[],
      total
    }
  } catch (error) {
    console.error('Error fetching calls:', error)
    throw new Error('Failed to fetch calls')
  }
}
