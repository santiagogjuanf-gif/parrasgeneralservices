import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { SERVER_TOKEN } from '@/lib/server-token'

export async function GET() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // If the server restarted, SERVER_TOKEN changed — invalidate stale sessions
  if (session.serverToken !== SERVER_TOKEN) {
    await session.destroy()
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  return NextResponse.json({
    userId: session.userId,
    username: session.username,
    fullName: session.fullName,
    role: session.role,
  })
}
