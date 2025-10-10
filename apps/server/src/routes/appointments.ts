import { Router } from "express";
import { db } from "@repo/db";
import { z } from "zod";
import { validateSession, SessionAuthenticatedRequest } from "../middleware/sessionAuth";
import { logger } from "../utils/logger";
import OpenAI from "openai";

const router: Router = Router();


// Lazy initialization of OpenAI client
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    logger.error("OpenAI API key is not set");
    throw new Error("OpenAI API key is not configured");
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}



const appointmentSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 characters"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  customerEmail: z.string().email().optional(),
  service: z.string().optional(),
  notes: z.string().optional(),
});

const updateAppointmentStatusSchema = z.object({
  status: z.string().min(1, "Status is required"),
});

const generateAppointmentFromCallSchema = z.object({
  callId: z.string().min(1, "Call ID is required"),
});

const generateAppointmentFromSummarySchema = z.object({
  callId: z.string().min(1, "Call ID is required"),
  summary: z.string().min(1, "Summary is required"),
});

// Apply session validation to all routes
router.use(validateSession);

// GET /api/appointments
router.get("/", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const businessId = req.user.businessId;

    // Get all appointments for the business
    const appointments = await db.appointment.findMany({
      where: { businessId },
      orderBy: { appointmentTime: "asc" },
    });

    logger.info("Fetched appointments", { 
      businessId, 
      count: appointments.length,
      userId: req.user.id 
    });

    return res.json({ appointments });
  } catch (error) {
    logger.error("Error fetching appointments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/appointments
router.post("/", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { customerName, customerPhone, appointmentTime, customerEmail, service, notes } = appointmentSchema.parse(req.body);
    const businessId = req.user.businessId;

    // Ensure appointment time is in 2025
    const appointmentDate = new Date(appointmentTime);
    if (appointmentDate.getFullYear() !== 2025) {
      appointmentDate.setFullYear(2025);
    }

    // Create the appointment
    const appointment = await db.appointment.create({
      data: {
        businessId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        appointmentTime: appointmentDate,
        service: service || null,
        notes: notes || null,
        status: 'PENDING',
      },
    });

    logger.info("Created appointment", { 
      appointmentId: appointment.id,
      businessId, 
      customerName,
      userId: req.user.id 
    });

    return res.status(201).json({
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    logger.error("Error creating appointment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/appointments/:id/status
router.put("/:id/status", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const appointmentId = req.params.id;
    const { status } = updateAppointmentStatusSchema.parse(req.body);

    // First check if appointment exists and belongs to user's business
    const existingAppointment = await db.appointment.findFirst({
      where: {
        id: appointmentId,
        businessId: req.user.businessId,
      },
    });

    if (!existingAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: { status: status as 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' },
    });

    logger.info("Updated appointment status", {
      appointmentId,
      status,
      businessId: req.user.businessId,
      userId: req.user.id,
    });

    return res.json({
      success: true,
      data: updatedAppointment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    logger.error("Error updating appointment status:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// POST /api/appointments/generate-from-call
router.post("/generate-from-call", async (req: SessionAuthenticatedRequest, res) => {
  try {
    if (!req.user?.businessId) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized" 
      });
    }

    const { callId } = generateAppointmentFromCallSchema.parse(req.body);

    // Fetch the call with its logs and business info
    const call = await db.call.findUnique({
      where: { 
        id: callId,
        businessId: req.user.businessId // Ensure user can only access their business calls
      },
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
    });

    if (!call) {
      return res.status(404).json({ 
        success: false, 
        error: 'Call not found' 
      });
    }

    if (!call.logs || call.logs.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No call logs found' 
      });
    }

    // Format the conversation for OpenAI
    const conversationText = call.logs
      .map((log: any) => `${log.sender.toUpperCase()}: ${log.message}`)
      .join('\n\n');

    // Get current date information for accurate relative date calculation
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentDayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false });

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

Respond with JSON containing:
{
  "shouldCreateAppointment": boolean,
  "appointmentData": {
    "customerName": "full name from conversation",
    "customerPhone": "phone number from conversation", 
    "customerEmail": "email from conversation or null",
    "appointmentTime": "ISO datetime in 2025 (YYYY-MM-DDTHH:MM:SSZ) or null if no time discussed",
    "service": "specific service/product requested",
    "notes": "all collected details, preferences, special requirements"
  },
  "dateCalculation": "explanation of how you calculated the date from today ${currentDate}"
}

Only set shouldCreateAppointment to true if customer explicitly requested service AND you have at least name and phone.`;

    // Generate appointment data using OpenAI
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
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
      max_tokens: 500,
      temperature: 0.1,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    if (!responseText) {
      return res.status(500).json({ 
        success: false, 
        error: 'No response from OpenAI' 
      });
    }

    // Parse the JSON response
    let aiResponse: any;
    try {
      aiResponse = JSON.parse(responseText);
    } catch (parseError) {
      logger.error('Failed to parse OpenAI response:', responseText);
      return res.status(500).json({ 
        success: false, 
        error: 'Invalid response format from AI' 
      });
    }

    logger.info('AI appointment analysis:', { 
      aiResponse, 
      dateCalculation: aiResponse.dateCalculation,
      callId,
      businessId: req.user.businessId 
    });

    // If AI determined no appointment should be created
    if (!aiResponse.shouldCreateAppointment) {
      return res.json({
        success: true,
        shouldCreateAppointment: false,
        callId: call.id,
        message: `No appointment needed: ${aiResponse.reasoning || 'Customer did not request appointment'}`
      });
    }

    // Extract and validate appointment data
    const appointmentData = aiResponse.appointmentData;
    if (!appointmentData) {
      return res.status(400).json({ 
        success: false, 
        error: 'No appointment data provided by AI' 
      });
    }

    // Helper function to generate a default appointment time
    const generateDefaultAppointmentTime = (): string => {
      const today = new Date();
      const tomorrow = new Date(2025, today.getMonth(), today.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      const dayOfWeek = tomorrow.getDay();
      if (dayOfWeek === 0) { // Sunday
        tomorrow.setDate(tomorrow.getDate() + 1);
      } else if (dayOfWeek === 6) { // Saturday
        tomorrow.setDate(tomorrow.getDate() + 2);
      }
      
      return tomorrow.toISOString();
    };

    // Use fallback values from call record
    const finalAppointmentData = {
      customerName: appointmentData.customerName || call.customerName || 'Unknown Customer',
      customerPhone: appointmentData.customerPhone || call.customerPhone || 'Unknown Phone',
      customerEmail: appointmentData.customerEmail || null,
      appointmentTime: appointmentData.appointmentTime || generateDefaultAppointmentTime(),
      service: appointmentData.service || null,
      notes: appointmentData.notes || `Generated from call on ${new Date(call.createdAt).toLocaleDateString()}`
    };

    // Validate required fields
    if (!finalAppointmentData.customerName || !finalAppointmentData.customerPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required customer information' 
      });
    }

    // Ensure appointment time is in 2025 and validate the date
    const appointmentDate = new Date(finalAppointmentData.appointmentTime);
    if (appointmentDate.getFullYear() !== 2025) {
      appointmentDate.setFullYear(2025);
      finalAppointmentData.appointmentTime = appointmentDate.toISOString();
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
    });

    logger.info('Appointment created from call:', {
      appointmentId: appointment.id,
      callId: call.id,
      businessId: req.user.businessId,
      appointmentTime: finalAppointmentData.appointmentTime
    });

    return res.json({
      success: true,
      shouldCreateAppointment: true,
      appointment,
      appointmentData: finalAppointmentData,
      callId: call.id
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    logger.error('Error generating appointment from call:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(500).json({ 
          success: false, 
          error: 'OpenAI API key not configured' 
        });
      }
      if (error.message.includes('quota')) {
        return res.status(429).json({ 
          success: false, 
          error: 'OpenAI API quota exceeded' 
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;
