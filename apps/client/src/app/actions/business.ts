'use server'

import { db } from '@repo/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getBusinessInfo() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the user's business
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        business: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    if (!user?.business) {
      return { 
        success: false, 
        error: 'No business found for this user' 
      }
    }

    return { 
      success: true, 
      business: user.business
    }
  } catch (error) {
    console.error('Error in getBusinessInfo:', error)
    return {
      success: false,
      error: 'An error occurred while fetching business information'
    }
  }
}
