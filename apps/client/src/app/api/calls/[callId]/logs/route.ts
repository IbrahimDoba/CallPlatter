import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCallLogs } from '@/app/actions/callLogs'

export async function GET(
  request: Request,
  { params }: { params: { callId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businessId = session.user.businessId

    const result = await getCallLogs(params.callId, businessId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    return NextResponse.json({ logs: result.logs })
  } catch (error) {
    console.error('Error fetching call logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch call logs' },
      { status: 500 }
    )
  }
}
