import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@repo/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a business with a phone number
    const businessId = session.user.businessId;

    if (!businessId) {
      return NextResponse.json({
        success: true,
        hasPhoneNumber: false,
        phoneNumber: null,
        phoneNumberId: null
      });
    }

    // Get business with phone number details
    const business = await db.business.findUnique({
      where: { id: businessId },
      select: {
        phoneNumber: true,
        phoneNumberId: true,
      }
    });

    if (!business) {
      return NextResponse.json({
        success: true,
        hasPhoneNumber: false,
        phoneNumber: null,
        phoneNumberId: null
      });
    }

    // Check if business has a phone number assigned
    const hasPhoneNumber = !!business.phoneNumber;
    const phoneNumber = business.phoneNumber || null;
    const phoneNumberId = business.phoneNumberId || null;

    return NextResponse.json({
      success: true,
      hasPhoneNumber,
      phoneNumber,
      phoneNumberId
    });

  } catch (error) {
    console.error('Error checking phone number:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
