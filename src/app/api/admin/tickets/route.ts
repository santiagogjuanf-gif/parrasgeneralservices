import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const category = searchParams.get('category')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(userId && { userId: parseInt(userId, 10) }),
      ...(category && { category }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(new Date(to).setHours(23, 59, 59, 999)) }),
            },
          }
        : {}),
    },
    include: {
      user: { select: { id: true, fullName: true, username: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tickets)
}
