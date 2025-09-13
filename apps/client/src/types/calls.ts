export interface CallEntry {
  id: string
  customerName?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  customerAddress?: string | null
  transcript?: string | null
  summary?: string | null
  intent?: string | null
  callType: "PHONE" | "VIDEO" | "TEST"
  status: "COMPLETED" | "MISSED" | "IN_PROGRESS" | "TEST"
  duration: number
  audioFileUrl?: string | null
  twilioCallSid?: string
  businessId: string
  createdAt: string
  updatedAt: string
  logs?: Array<{
    id: string
    message: string
    sender: "ai" | "user"
    audioChunk?: string
    createdAt?: string
  }>
}