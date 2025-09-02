export interface CallEntry {
  id: string
  contact: string
  duration: string
  timestamp: string
  status: "TEST" | "COMPLETED" | "MISSED" | "IN_PROGRESS"
  summary?: string
  transcript?: Array<{
    speaker: "agent" | "caller"
    message: string
    timestamp?: string
  }>
  customerPhone?: string
  customerName?: string
  audioFileUrl?: string  // Added this field
  logs?: Array<{
    id: string
    message: string
    sender: "ai" | "user"
    audioChunk?: string
    createdAt?: string
  }>
  createdAt?: string  // Also added this for consistency with CallDetailPanel
}