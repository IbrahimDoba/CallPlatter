import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.businessId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated or business ID not found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const businessId = session.user.businessId;
    const { sessionId } = await params; // <- This is the key change
    
    // Forward the request to the backend server with business ID
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/api/call-testing/${sessionId}/voice-input`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.API_KEY || 'test-key',
        'X-Business-ID': businessId, // Pass business ID in header
      },
      body: JSON.stringify({
        ...body,
        businessId, // Also include in body for validation
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Backend responded with status: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing voice input:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process voice input' },
      { status: 500 }
    );
  }
}