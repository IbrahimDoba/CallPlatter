'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface CallLog {
  id?: string
  message: string
  type: 'user' | 'ai' | 'system'
  timestamp: string
  duration?: number
  audioChunk?: string
}

interface CallLogsProps {
  callId: string
  businessId: string
}

export function CallLogs({ callId, businessId }: CallLogsProps) {
  const [logs, setLogs] = useState<CallLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      if (!callId || !businessId) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/calls/${callId}/logs?businessId=${businessId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch call logs')
        }
        
        const data = await response.json()
        setLogs(data.logs || [])
      } catch (err) {
        console.error('Error fetching call logs:', err)
        setError('Failed to load call logs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [callId, businessId])

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Loading call logs...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>No call logs found</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Call Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] overflow-y-auto pr-4">
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={log.id || `log-${index}`}
                className={`p-4 rounded-lg ${
                  log.type === 'ai' ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={log.type === 'ai' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {log.type}
                    </Badge>
                    {log.type && (
                      <Badge variant="outline" className="capitalize">
                        {log.type}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{log.message}</p>
                {log.duration && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration: {log.duration}ms
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
