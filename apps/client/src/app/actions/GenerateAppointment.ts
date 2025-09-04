'use server'

import { db } from '@repo/db'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface AppointmentData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  appointmentTime: string // ISO string
  service?: string
  notes?: string
}

interface GenerateAppointmentResult {
  success: boolean
  appointment?: any
  appointmentData?: AppointmentData
  error?: string
  callId?: string
  shouldCreateAppointment?: boolean
}
export async function generateAppointmentFromCall(callId: string): Promise<GenerateAppointmentResult> {
  try {
    if (!callId) {
      return { success: false, error: 'Call ID is required' }
    }

    // Fetch the call with its logs and business info
    const call = await db.call.findUnique({
      where: { id: callId },
      include: {
        logs: {
          orderBy: { timestamp: 'asc' }
        },
        business: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        }
      }
    })

    if (!call) {
      return { success: false, error: 'Call not found' }
    }

    if (!call.logs || call.logs.length === 0) {
      return { success: false, error: 'No call logs found' }
    }

    // Format the conversation for OpenAI
    const conversationText = call.logs
      .map(log => `${log.sender.toUpperCase()}: ${log.message}`)
      .join('\n\n')

    // Get current date information for accurate relative date calculation
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD format
    const currentDayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' })
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false })

    // Create the prompt for appointment extraction
    const prompt = `You are an AI assistant that analyzes customer service call transcripts to determine if an appointment should be scheduled and extract appointment details.

Business: ${call.business.name}
Customer: ${call.customerName || 'Unknown'}
Customer Phone: ${call.customerPhone || 'Unknown'}

CURRENT DATE AND TIME CONTEXT:
- Today's date: ${currentDate} (${currentDayOfWeek})
- Current time: ${currentTime}

CONVERSATION:
${conversationText}

Analyze this conversation and determine:
1. Does the customer want to schedule an appointment? (yes/no)
2. If yes, extract the appointment details

IMPORTANT DATE CALCULATION RULES:
- Calculate all relative dates based on TODAY'S DATE: ${currentDate}
- "tomorrow" = ${new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
- "next week" = the same day of week in the following week
- "next Monday/Tuesday/etc" = the next occurrence of that weekday from today
- "in 2 weeks" = exactly 14 days from today
- Always use year 2025 for all appointments
- If no specific time is mentioned, use 10:00 AM as default

Examples of correct date calculations from today (${currentDate}):
- "tomorrow at 2pm" → next day at 14:00
- "next Monday" → the next Monday after today
- "next week Friday" → Friday of next week
- "in 2 weeks on Wednesday" → Wednesday exactly 2 weeks from today
- "this Friday" → this coming Friday (or next Friday if today is already Friday)

Respond with JSON containing:
{
  "shouldCreateAppointment": boolean,
  "appointmentData": {
    "customerName": "full name from conversation",
    "customerPhone": "phone number from conversation", 
    "customerEmail": "email from conversation or null",
    "customerAddress": "complete address if mentioned or null",
    "appointmentTime": "ISO datetime in 2025 (YYYY-MM-DDTHH:MM:SSZ) or null if no time discussed",
    "service": "specific service/product requested",
    "notes": "all collected details, preferences, special requirements"
  },
  "completeness": {
    "hasName": boolean,
    "hasPhone": boolean, 
    "hasEmail": boolean,
    "hasAddress": boolean,
    "hasServiceDetails": boolean
  },
  "dateCalculation": "explanation of how you calculated the date from today ${currentDate}"
}

Only set shouldCreateAppointment to true if customer explicitly requested service AND you have at least name and phone.

Important:
- Calculate ALL dates relative to TODAY: ${currentDate}
- Always use year 2025 for any extracted dates
- If no specific time was mentioned, set appointmentTime to null
- Use the customer info from the call record if not mentioned in conversation
- Be conservative - only create appointments when clearly requested
- Show your date calculation reasoning in the dateCalculation field`

    // Generate appointment data using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional assistant that analyzes customer service calls to identify appointment requests. Always respond with valid JSON only. Pay careful attention to date calculations based on the provided current date.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500, // Increased to accommodate date calculation explanation
      temperature: 0.1, // Very low temperature for consistent date extraction
    })

    const responseText = completion.choices[0]?.message?.content?.trim()
    if (!responseText) {
      return { success: false, error: 'No response from OpenAI' }
    }

    // Parse the JSON response
    let aiResponse: any
    try {
      aiResponse = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      return { success: false, error: 'Invalid response format from AI' }
    }

    console.log('AI appointment analysis:', aiResponse)
    console.log('Date calculation reasoning:', aiResponse.dateCalculation)

    // If AI determined no appointment should be created
    if (!aiResponse.shouldCreateAppointment) {
      return {
        success: true,
        shouldCreateAppointment: false,
        callId: call.id,
        error: `No appointment needed: ${aiResponse.reasoning || 'Customer did not request appointment'}`
      }
    }

    // Extract and validate appointment data
    const appointmentData = aiResponse.appointmentData
    if (!appointmentData) {
      return { success: false, error: 'No appointment data provided by AI' }
    }

    // Use fallback values from call record
    const finalAppointmentData: AppointmentData = {
      customerName: appointmentData.customerName || call.customerName || 'Unknown Customer',
      customerPhone: appointmentData.customerPhone || call.customerPhone || 'Unknown Phone',
      customerEmail: appointmentData.customerEmail || null,
      appointmentTime: appointmentData.appointmentTime || generateDefaultAppointmentTime(),
      service: appointmentData.service || null,
      notes: appointmentData.notes || `Generated from call on ${new Date(call.createdAt).toLocaleDateString()}`
    }

    // Validate required fields
    if (!finalAppointmentData.customerName || !finalAppointmentData.customerPhone) {
      return { success: false, error: 'Missing required customer information' }
    }

    // Ensure appointment time is in 2025 and validate the date
    const appointmentDate = new Date(finalAppointmentData.appointmentTime)
    if (appointmentDate.getFullYear() !== 2025) {
      appointmentDate.setFullYear(2025)
      finalAppointmentData.appointmentTime = appointmentDate.toISOString()
    }

    // Validate that the appointment date is not in the past
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate())
    
    if (appointmentDateOnly < todayStart) {
      console.warn('Appointment date is in the past, adjusting to next occurrence')
      // This shouldn't happen with proper calculation, but as a safety net
      appointmentDate.setDate(appointmentDate.getDate() + 7) // Move to next week
      finalAppointmentData.appointmentTime = appointmentDate.toISOString()
    }

    // Create the appointment
    const appointment = await db.appointment.create({
      data: {
        customerName: finalAppointmentData.customerName,
        customerPhone: finalAppointmentData.customerPhone,
        customerEmail: finalAppointmentData.customerEmail,
        appointmentTime: new Date(finalAppointmentData.appointmentTime),
        service: finalAppointmentData.service,
        notes: finalAppointmentData.notes,
        status: 'PENDING',
        businessId: call.businessId
      }
    })

    console.log('Appointment created from call:', appointment.id)
    console.log('Final appointment time:', finalAppointmentData.appointmentTime)

    return {
      success: true,
      shouldCreateAppointment: true,
      appointment,
      appointmentData: finalAppointmentData,
      callId: call.id
    }

  } catch (error) {
    console.error('Error generating appointment from call:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return { success: false, error: 'OpenAI API key not configured' }
      }
      if (error.message.includes('quota')) {
        return { success: false, error: 'OpenAI API quota exceeded' }
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function generateAppointmentFromSummary(callId: string, summary: string) {
  try {
    const call = await db.call.findUnique({
      where: { id: callId },
      include: {
        business: { select: { id: true, name: true } }
      }
    })

    if (!call) return { success: false, error: 'Call not found' }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Based on this call summary, determine if an appointment should be created and extract details:

Business: ${call.business.name}
Call Summary: ${summary}
Customer: ${call.customerName || 'Unknown'}
Phone: ${call.customerPhone || 'Unknown'}

IMPORTANT: When extracting appointment times, always use the year 2025 if no year is specified. For example:
- "tomorrow at 2pm" becomes the next day in 2025 at 2pm
- "January 15th" becomes "2025-01-15T10:00:00Z" (default to 10am if no time given)
- "next Monday" becomes the next Monday in 2025

Respond with JSON:
{
  "shouldCreateAppointment": boolean,
  "appointmentData": {
    "customerName": "name from summary or call record",
    "customerPhone": "phone from summary or call record", 
    "customerEmail": "email if mentioned in summary or null",
    "appointmentTime": "ISO datetime in 2025 - if specific time mentioned use it, otherwise default to tomorrow 10am in 2025",
    "service": "service type requested",
    "notes": "appointment details from summary"
  },
  "reasoning": "why appointment should/shouldn't be created"
}

Only create appointment if summary indicates customer requested service/booking.`
      }],
      max_tokens: 300,
      temperature: 0.2,
    })

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}')
    
    if (!response.shouldCreateAppointment) {
      return { 
        success: false, 
        error: response.reasoning || 'No appointment needed based on summary' 
      }
    }

    const data = response.appointmentData
    
    // Default to tomorrow 10am in 2025 if no specific time provided
    const defaultTime = generateDefaultAppointmentTime()

    let appointmentTime = new Date(defaultTime)
    if (data.appointmentTime) {
      appointmentTime = new Date(data.appointmentTime)
      // Ensure the year is 2025 if it was parsed as a different year
      if (appointmentTime.getFullYear() !== 2025) {
        appointmentTime.setFullYear(2025)
      }
    }

    const appointment = await db.appointment.create({
      data: {
        customerName: data.customerName || call.customerName || 'Unknown',
        customerPhone: data.customerPhone || call.customerPhone || 'Unknown',
        customerEmail: data.customerEmail || null,
        appointmentTime,
        service: data.service || null,
        notes: data.notes || `Generated from call summary on ${new Date().toLocaleDateString()}`,
        status: 'PENDING',
        businessId: call.businessId
      }
    })

    return { success: true, appointment, shouldCreateAppointment: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Helper function to generate a default appointment time (next business day at 10 AM in 2025)
function generateDefaultAppointmentTime(): string {
  // Get current date but set year to 2025
  const today = new Date()
  const tomorrow = new Date(2025, today.getMonth(), today.getDate() + 1)
  
  // Set to 10 AM
  tomorrow.setHours(10, 0, 0, 0)
  
  // If tomorrow is weekend, move to next Monday
  const dayOfWeek = tomorrow.getDay()
  if (dayOfWeek === 0) { // Sunday
    tomorrow.setDate(tomorrow.getDate() + 1)
  } else if (dayOfWeek === 6) { // Saturday
    tomorrow.setDate(tomorrow.getDate() + 2)
  }
  
  return tomorrow.toISOString()
}

// Function to get appointments for a business
export async function getAppointmentsForBusiness(businessId: string) {
  try {
    const appointments = await db.appointment.findMany({
      where: { businessId },
      orderBy: { appointmentTime: 'asc' },
      include: {
        business: {
          select: {
            name: true
          }
        }
      }
    })

    return {
      success: true,
      appointments
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Manual appointment creation (for the existing form)
export async function createAppointment(appointmentData: {
  customerName: string
  customerPhone: string
  customerEmail?: string
  appointmentTime: string
  service?: string
  notes?: string
  businessId: string
}) {
  try {
    // Ensure appointment time is in 2025
    const appointmentDate = new Date(appointmentData.appointmentTime)
    if (appointmentDate.getFullYear() !== 2025) {
      appointmentDate.setFullYear(2025)
    }

    const appointment = await db.appointment.create({
      data: {
        customerName: appointmentData.customerName,
        customerPhone: appointmentData.customerPhone,
        customerEmail: appointmentData.customerEmail || null,
        appointmentTime: appointmentDate,
        service: appointmentData.service || null,
        notes: appointmentData.notes || null,
        status: 'PENDING',
        businessId: appointmentData.businessId
      }
    })

    return {
      success: true,
      appointment
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}