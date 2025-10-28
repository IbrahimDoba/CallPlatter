import type { NextRequest } from 'next/server';
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

    // Get onboarding progress
    const progress = await db.onboardingProgress.findUnique({
      where: { userId: session.user.id }
    });

    if (!progress) {
      return NextResponse.json({
        success: true,
        progress: null
      });
    }

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
