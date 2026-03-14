import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get('x-cron-secret')
  const expectedSecret = process.env.CRON_SECRET || 'pgs-cron-2024'

  if (cronSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Find old work orders with their photos
  const oldWorkOrders = await prisma.workOrder.findMany({
    where: {
      createdAt: { lt: thirtyDaysAgo },
    },
    include: {
      photos: true,
    },
  })

  // Delete physical photo files
  for (const workOrder of oldWorkOrders) {
    for (const photo of workOrder.photos) {
      const relativePath = photo.path.replace(/^\/api\/uploads\//, '/uploads/')
      const filePath = join(process.cwd(), 'public', relativePath)
      if (existsSync(filePath)) {
        await unlink(filePath).catch(() => {})
      }
    }
  }

  // Delete work orders (tasks and photos cascade via Prisma schema)
  const { count: deleted } = await prisma.workOrder.deleteMany({
    where: {
      createdAt: { lt: thirtyDaysAgo },
    },
  })

  return NextResponse.json({
    deleted,
    message: `Deleted ${deleted} work order(s) older than 30 days.`,
  })
}
