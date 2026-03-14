import { prisma } from '@/lib/prisma'

export async function generateTodayWorkOrders(): Promise<number> {
  const today = new Date()
  const todayDayNumber = today.getDay()
  const todayStr = today.toISOString().split('T')[0]

  const stores = await prisma.store.findMany({
    include: { tasks: true, workers: true },
  })

  let created = 0

  for (const store of stores) {
    const scheduledDays = store.days.split(',').map((d: string) => parseInt(d.trim(), 10))
    if (!scheduledDays.includes(todayDayNumber)) continue

    for (const storeWorker of store.workers) {
      const existing = await prisma.workOrder.findFirst({
        where: { storeId: store.id, workerId: storeWorker.userId, date: todayStr },
      })
      if (existing) continue

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

  return created
}
