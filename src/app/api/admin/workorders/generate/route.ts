import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const today = new Date()
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const todayDayNumber = today.getDay()
  const todayStr = today.toISOString().split('T')[0]

  const stores = await prisma.store.findMany({
    include: {
      tasks: true,
      workers: true,
    },
  })

  let created = 0

  for (const store of stores) {
    const scheduledDays = store.days.split(',').map((d: string) => parseInt(d.trim(), 10))
    if (!scheduledDays.includes(todayDayNumber)) {
      continue
    }

    for (const storeWorker of store.workers) {
      const existing = await prisma.workOrder.findFirst({
        where: {
          storeId: store.id,
          workerId: storeWorker.userId,
          date: todayStr,
        },
      })

      if (existing) {
        continue
      }

      await prisma.workOrder.create({
        data: {
          storeId: store.id,
          workerId: storeWorker.userId,
          date: todayStr,
          tasks: {
            create: store.tasks.map((t: { label: string; count: number | null }) => ({
              label: t.label,
              count: t.count ?? null,
            })),
          },
        },
      })

      created++
    }
  }

  return NextResponse.json({ created })
}
