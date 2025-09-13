"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Phone, Clock, MessageSquare, ChevronRight as ViewIcon } from "lucide-react"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { CallDetailPanel } from "@/components/module/call/CallDetailsSlider"
import type { CallEntry } from "@/types/calls"
import { formatPhoneNumber } from "@/lib/phoneUtils"


interface CallListProps {
  calls: CallEntry[]
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
}

export function CallList({
  calls,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemsPerPage = 10,
}: CallListProps) {
  const [selectedCall, setSelectedCall] = useState<CallEntry | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const handleCallClick = (call: CallEntry) => {
    console.log('[CallList] Selected call:', { 
      id: call.id, 
      hasAudioFileUrl: !!call.audioFileUrl,
      audioFileUrl: call.audioFileUrl 
    });
    setSelectedCall(call)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    // Delay clearing selected call to allow animation to complete
    setTimeout(() => setSelectedCall(null), 300)
  }

  const formatDuration = (duration: number): string => {
    // If duration is in seconds, convert to MM:SS
    const seconds = Math.floor(duration)
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }


  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'MISSED':
        return 'destructive'
      case 'TEST':
      default:
        return 'secondary'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return timestamp
    }
  }

  if (calls.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No calls yet</h3>
        <p className="text-muted-foreground mt-1">Your call history will appear here.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {/* Call Entries */}
        <div className="space-y-2">
          {calls.map((call) => (
            <Card 
              key={call.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCallClick(call)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  {/* Left: Contact info with status badge */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-semibold  text-[#1c1917]">
                        {formatPhoneNumber(call.customerPhone || '')}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Duration and Date */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(call.duration)}</span>
                    </div>
                    <span>{formatTimestamp(call.createdAt)}</span>
                  </div>

                  {/* Right: View button with icon */}
                  <Button variant="ghost" size="sm" className="gap-1 shrink-0">
                    View
                    <ViewIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => onPageChange(currentPage + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            {totalItems === 0 ? '0' : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </span>
        </div>
      </div>

      <CallDetailPanel isOpen={isPanelOpen} onClose={handleClosePanel} call={selectedCall} />
    </>
  )
}