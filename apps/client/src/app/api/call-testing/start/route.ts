import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
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
    
    // Forward the request to the backend server with business ID
    const response = await fetch(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/api/call-testing/start`, {
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
    console.error('Error starting test call:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start test call' },
      { status: 500 }
    );
  }
}
