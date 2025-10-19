import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@repo/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If user doesn't have a businessId, we'll create one during onboarding
    let businessId = session.user.businessId;

    const body = await request.json();
    console.log('Onboarding request body:', body);
    
    const {
      businessName,
      businessDescription,
      selectedVoice,
      selectedAccent,
      greeting,
      recordingConsent,
      selectedPhoneNumber,
      selectedPhoneNumberId
    } = body;

    // TODO: Use selectedAccent after running database migration
    console.log('Selected accent:', selectedAccent);

    // Validate required fields
    if (!businessName || !businessDescription || !selectedVoice || !greeting || !selectedPhoneNumber || !selectedPhoneNumberId) {
      console.log('Missing required fields:', {
        businessName: !!businessName,
        businessDescription: !!businessDescription,
        selectedVoice: !!selectedVoice,
        greeting: !!greeting,
        selectedPhoneNumber: !!selectedPhoneNumber,
        selectedPhoneNumberId: !!selectedPhoneNumberId
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!recordingConsent) {
      return NextResponse.json(
        { error: 'Recording consent is required' },
        { status: 400 }
      );
    }

    // Check if phone number is available and assign it
    const phoneNumberRecord = await db.phoneNumber.findUnique({
      where: { id: selectedPhoneNumberId },
    });

    if (!phoneNumberRecord) {
      return NextResponse.json(
        { error: 'Selected phone number not found' },
        { status: 400 }
      );
    }

    if (phoneNumberRecord.isAssigned) {
      return NextResponse.json(
        { error: 'Selected phone number is already assigned' },
        { status: 400 }
      );
    }

    // Create or update business
    if (!businessId) {
      // Create new business
      const business = await db.business.create({
        data: {
          name: businessName,
          description: businessDescription,
          phoneNumber: selectedPhoneNumber,
          phoneNumberId: selectedPhoneNumberId,
        }
      });
      businessId = business.id;
      
      // Update user with businessId
      await db.user.update({
        where: { id: session.user.id },
        data: { businessId: businessId }
      });
    } else {
      // Update existing business
      await db.business.update({
        where: { id: businessId },
        data: {
          name: businessName,
          description: businessDescription,
          phoneNumber: selectedPhoneNumber,
          phoneNumberId: selectedPhoneNumberId,
        }
      });
    }

    // Assign the phone number to the business
    await db.phoneNumber.update({
      where: { id: selectedPhoneNumberId },
      data: {
        isAssigned: true,
        assignedTo: businessId,
      },
    });

    // Update or create AI agent config
    await db.aIAgentConfig.upsert({
      where: { businessId: businessId },
      update: {
        firstMessage: greeting,
        voice: selectedVoice,
        accent: selectedAccent, 
        askForName: true,
        askForPhone: true,
        askForEmail: true,
        askForCompany: false,
        askForAddress: false,
      },
      create: {
        businessId: businessId,
        firstMessage: greeting,
        voice: selectedVoice,
        accent: selectedAccent, 
        askForName: true,
        askForPhone: true,
        askForEmail: true,
        askForCompany: false,
        askForAddress: false,
      }
    });

    // Mark user as having completed onboarding
    await db.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true }
    });

    console.log('Onboarding completed successfully for user:', session.user.id, 'business:', businessId);

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      businessId: businessId
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current onboarding status
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompleted: true }
    });

    return NextResponse.json({ 
      onboardingCompleted: user?.onboardingCompleted || false 
    });

  } catch (error) {
    console.error('Get onboarding status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
