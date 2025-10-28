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

    const {
      currentStep,
      businessName,
      businessDescription,
      selectedVoice,
      selectedAccent,
      greeting,
      recordingConsent,
      selectedPlan,
      trialActivated,
      polarCustomerId,
      selectedPhoneNumber,
      selectedPhoneNumberId
    } = await request.json();

    // Upsert onboarding progress
    const progress = await db.onboardingProgress.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        currentStep: currentStep || 1,
        businessName,
        businessDescription,
        selectedVoice,
        selectedAccent,
        greeting,
        recordingConsent: recordingConsent === true,
        selectedPlan,
        trialActivated: trialActivated || false,
        polarCustomerId,
        selectedPhoneNumber,
        selectedPhoneNumberId
      },
      update: {
        currentStep: currentStep || 1,
        businessName,
        businessDescription,
        selectedVoice,
        selectedAccent,
        greeting,
        recordingConsent: recordingConsent === true,
        selectedPlan,
        trialActivated: trialActivated || false,
        polarCustomerId,
        selectedPhoneNumber,
        selectedPhoneNumberId
      }
    });

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Error saving onboarding progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
