'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'
import { CallList } from '@/components/module/call/CallList'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { CallEntry } from '@/types/calls'

// Define the call type to match your CallList component

export default function CallsPage() {
  const { data: session } = useSession()
  const [calls, setCalls] = useState<CallEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  const transformApiData = useCallback((apiData: any[]): CallEntry[] => {
    return apiData.map(call => ({
      id: call.id,
      customerName: call.customerName,
      customerEmail: call.customerEmail,
      customerPhone: call.customerPhone,
      customerAddress: call.customerAddress,
      transcript: call.transcript,
      summary: call.summary,
      intent: call.intent,
      callType: call.callType,
      status: call.status,
      duration: call.duration,
      audioFileUrl: call.audioFileUrl,
      twilioCallSid: call.twilioCallSid,
      businessId: call.businessId,
      createdAt: call.createdAt,
      updatedAt: call.updatedAt,
      logs: call.logs || []
    }))
  }, [])

  const fetchCalls = useCallback(async () => {
    if (!session?.user?.businessId) return
    
    try {
      const result = await api.callsExtended.list(currentPage, itemsPerPage)
      
      // Transform the API data to match your CallEntry interface
      const transformedCalls = transformApiData(result.calls)

      setCalls(transformedCalls)
      setTotalItems(result.total)
      setTotalPages(Math.ceil(result.total / itemsPerPage))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
    }, [currentPage, session?.user?.businessId, transformApiData])

  useEffect(() => {
    fetchCalls()
  }, [fetchCalls])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchCalls()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your call history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg inline-block">
          <p className="text-red-600 dark:text-red-400 font-medium">Error loading calls</p>
          <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-3"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Call History</h1>
          <p className="text-muted-foreground">
            {totalItems} call{totalItems !== 1 ? 's' : ''} in total
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <CallList 
        calls={calls}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
      />
    </div>
  )
}