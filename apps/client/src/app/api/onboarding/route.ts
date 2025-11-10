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
      selectedPhoneNumber,
      selectedPhoneNumberId,
      // selectedPlan, // Will be used when implementing Polar integration
      // trialActivated, // Will be used when implementing Polar integration  
      // polarCustomerId // Will be used when implementing Polar integration
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

    // Recording consent is optional - no validation needed

    // Create or update business
    if (!businessId) {
      const business = await db.business.create({
        data: {
          name: businessName,
          description: businessDescription,
          phoneNumber: selectedPhoneNumber, // Required field
        },
      });
      businessId = business.id;
    } else {
      await db.business.update({
        where: { id: businessId },
        data: {
          name: businessName,
          description: businessDescription,
          phoneNumber: selectedPhoneNumber, // Required field
        },
      });
    }

    // Create phone number record with Twilio details
    const phoneNumberRecord = await db.phoneNumber.create({
      data: {
        number: selectedPhoneNumber,
        countryCode: selectedPhoneNumber.substring(0, 4),
        assignedTo: businessId,
        isAssigned: true,
      },
    });

    // Update business with phone number
    await db.business.update({
      where: { id: businessId },
      data: {
        phoneNumberId: phoneNumberRecord.id,
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

    // Check if user has a subscription from Polar webhook
    // If not, create a default trial subscription
    const existingSubscription = await db.subscription.findUnique({
      where: { businessId: businessId }
    });

    if (!existingSubscription) {
      console.log('No subscription found, checking for Polar customer ID...');
      
      // Check if user has a Polar customer ID (from onboarding progress or user record)
      const userWithPolarId = await db.user.findUnique({
        where: { id: session.user.id },
        select: { polarCustomerId: true }
      });
      
      // Also check onboarding progress for Polar customer ID
      const onboardingProgress = await db.onboardingProgress.findUnique({
        where: { userId: session.user.id },
        select: { polarCustomerId: true, selectedPlan: true, trialActivated: true }
      });
      
      const polarCustomerId = userWithPolarId?.polarCustomerId || onboardingProgress?.polarCustomerId;
      const selectedPlan = onboardingProgress?.selectedPlan;
      const trialActivated = onboardingProgress?.trialActivated;
      
      console.log('Polar customer ID:', polarCustomerId, 'Selected plan:', selectedPlan, 'Trial activated:', trialActivated);
      
      if (polarCustomerId && selectedPlan) {
        // User has Polar customer ID and selected plan, create subscription based on their choice
        const planType = selectedPlan.toUpperCase() as "STARTER" | "BUSINESS" | "ENTERPRISE";
        const isTrial = trialActivated || selectedPlan.toLowerCase() === 'business';
        
        await db.subscription.create({
          data: {
            businessId: businessId,
            planType,
            status: isTrial ? "TRIAL" : "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + (isTrial ? 14 : 30) * 24 * 60 * 60 * 1000),
            minutesIncluded: planType === "STARTER" ? 40 : planType === "BUSINESS" ? 110 : 300,
            minutesUsed: 0,
            overageRate: planType === "STARTER" ? 0.89 : planType === "BUSINESS" ? 0.61 : 0.44,
            trialEndsAt: isTrial ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
            trialActivated: isTrial,
            polarCustomerId: polarCustomerId,
          }
        });
        
        console.log(`Created ${isTrial ? 'trial' : 'active'} subscription for business ${businessId} with plan ${planType}`);
      } else {
        // No Polar customer ID, create default trial subscription
        console.log('No Polar customer ID found, creating default trial subscription for business:', businessId);
        
        await db.subscription.create({
          data: {
            businessId: businessId,
            planType: "STARTER", // Default to STARTER plan
            status: "TRIAL",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            minutesIncluded: 40, // Starter plan minutes
            minutesUsed: 0,
            overageRate: 0.89, // USD overage rate
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
            trialActivated: true,
          }
        });
        
        console.log('Created default trial subscription for business:', businessId);
      }
    } else {
      console.log('Subscription already exists for business:', businessId, 'status:', existingSubscription.status);
    }

    // Update user onboarding status
    await db.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        businessId,
      },
    });

    // Clean up onboarding progress
    await db.onboardingProgress.delete({
      where: { userId: session.user.id }
    }).catch(error => {
      // Ignore error if no progress record exists
      console.log('No onboarding progress to clean up:', error.message);
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
