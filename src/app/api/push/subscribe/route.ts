import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { endpoint, p256dh, auth } = body as {
    endpoint: string
    p256dh: string
    auth: string
  }

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'endpoint, p256dh, and auth are required.' }, { status: 400 })
  }

  const subscription = await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: {
      p256dh,
      auth,
      userId: session.userId!,
    },
    create: {
      userId: session.userId!,
      endpoint,
      p256dh,
      auth,
    },
  })

  return NextResponse.json(subscription, { status: 201 })
}
