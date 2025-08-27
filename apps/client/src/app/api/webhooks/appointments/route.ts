import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (in production, you'd verify the webhook signature)
    // const signature = request.headers.get('x-webhook-signature');
    
    console.log("Webhook received:", body);

    // Process the webhook data
    const { event, data } = body;

    switch (event) {
      case 'appointment.created':
        // Handle new appointment
        console.log("New appointment created:", data);
        break;
      
      case 'appointment.updated':
        // Handle appointment update
        console.log("Appointment updated:", data);
        break;
      
      case 'call.received':
        // Handle new call
        console.log("New call received:", data);
        break;
      
      default:
        console.log("Unknown event type:", event);
    }

    return NextResponse.json({ 
      success: true,
      message: "Webhook processed successfully" 
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Error processing webhook" 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Webhook verification endpoint
  return NextResponse.json({ 
    message: "Webhook endpoint is active",
    status: "healthy"
  });
}
