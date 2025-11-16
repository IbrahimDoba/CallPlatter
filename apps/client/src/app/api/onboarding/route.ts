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

    // NOTE: AI agent settings are now stored directly in ElevenLabsAgent
    // The settings (firstMessage, voice, askFor* flags) will be passed to
    // the ElevenLabs agent creation below and stored in the elevenlabs_agents table

    // IMPORTANT: Do NOT create subscriptions here!
    // Polar is the single source of truth for subscriptions.
    // The Polar webhook (subscription.created) will create/update the subscription
    // when the user completes checkout or starts a trial through Polar.

    // Check if subscription exists (created by Polar webhook)
    const existingSubscription = await db.subscription.findUnique({
      where: { businessId: businessId }
    });

    if (existingSubscription) {
      console.log('Subscription exists for business:', businessId, {
        status: existingSubscription.status,
        planType: existingSubscription.planType,
        currentPeriodEnd: existingSubscription.currentPeriodEnd,
        trialEndsAt: existingSubscription.trialEndsAt,
        polarSubscriptionId: existingSubscription.polarSubscriptionId,
      });
    } else {
      // No subscription yet - this is expected if user hasn't completed Polar checkout
      // The subscription will be created when Polar sends the webhook
      console.log('No subscription found for business:', businessId);
      console.log('Subscription will be created when Polar webhook is received after checkout.');

      // Store Polar customer ID if available (for webhook matching)
      const onboardingProgress = await db.onboardingProgress.findUnique({
        where: { userId: session.user.id },
        select: { polarCustomerId: true }
      });

      if (onboardingProgress?.polarCustomerId) {
        // Update user with Polar customer ID for webhook matching
        await db.user.update({
          where: { id: session.user.id },
          data: { polarCustomerId: onboardingProgress.polarCustomerId }
        });
        console.log('Updated user with Polar customer ID:', onboardingProgress.polarCustomerId);
      }
    }

    // Update user onboarding status
    await db.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        businessId,
      },
    });

    // Create ElevenLabs agent for the business
    // This is MANDATORY - the agent must be created for calls to work
    let elevenLabsAgentId: string | null = null;
    const serverUrl = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001').replace(/\/$/, '');

    console.log('Creating ElevenLabs agent via server API:', `${serverUrl}/api/elevenlabs-management/create`);

    try {
      const agentResponse = await fetch(`${serverUrl}/api/elevenlabs-management/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': businessId,
        },
        body: JSON.stringify({
          businessName,
          businessDescription,
          voiceName: selectedVoice,
          firstMessage: greeting,
          // Agent settings - stored directly in ElevenLabsAgent
          askForName: true,
          askForPhone: true,
          askForEmail: true,
          askForCompany: false,
          askForAddress: false,
        }),
      });

      const agentResponseText = await agentResponse.text();
      console.log('ElevenLabs agent creation response:', agentResponse.status, agentResponseText);

      if (agentResponse.ok) {
        try {
          const agentData = JSON.parse(agentResponseText);
          elevenLabsAgentId = agentData.data?.agentId || null;

          if (!elevenLabsAgentId) {
            console.error('ElevenLabs agent created but no agentId returned:', agentData);
            return NextResponse.json(
              { error: 'Failed to create AI agent: No agent ID returned' },
              { status: 500 }
            );
          }

          console.log('ElevenLabs agent created successfully:', elevenLabsAgentId);
        } catch (parseError) {
          console.error('Failed to parse ElevenLabs agent response:', parseError);
          return NextResponse.json(
            { error: 'Failed to create AI agent: Invalid response' },
            { status: 500 }
          );
        }
      } else {
        console.error('Failed to create ElevenLabs agent:', agentResponse.status, agentResponseText);
        return NextResponse.json(
          { error: `Failed to create AI agent: ${agentResponseText}` },
          { status: 500 }
        );
      }
    } catch (agentError) {
      console.error('Error creating ElevenLabs agent:', agentError);
      return NextResponse.json(
        { error: `Failed to create AI agent: ${agentError instanceof Error ? agentError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

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
      businessId: businessId,
      elevenLabsAgentId: elevenLabsAgentId,
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
