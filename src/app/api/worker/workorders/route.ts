import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.userId!

  // Get today and last 30 days
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const todayStr = today.toISOString().split('T')[0]
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  const workOrders = await prisma.workOrder.findMany({
    where: {
      workerId: userId,
      date: {
        gte: thirtyDaysAgoStr,
        lte: todayStr,
      },
    },
    include: {
      store: { select: { id: true, name: true, address: true } },
      tasks: true,
      _count: { select: { photos: true } },
    },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(workOrders)
}
