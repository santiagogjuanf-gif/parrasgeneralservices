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
  const storeId = searchParams.get('storeId')
  const workerId = searchParams.get('workerId')
  const status = searchParams.get('status')
  const date = searchParams.get('date')

  const workOrders = await prisma.workOrder.findMany({
    where: {
      ...(storeId && { storeId: parseInt(storeId, 10) }),
      ...(workerId && { workerId: parseInt(workerId, 10) }),
      ...(status && { status }),
      ...(date && { date }),
    },
    include: {
      store: { select: { id: true, name: true, address: true } },
      worker: { select: { id: true, fullName: true, username: true } },
      _count: { select: { photos: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(workOrders)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { storeId, workerId, date } = body as {
    storeId: number
    workerId: number
    date: string
  }

  if (!storeId || !workerId || !date) {
    return NextResponse.json({ error: 'storeId, workerId, and date are required.' }, { status: 400 })
  }

  // Fetch store tasks to copy
  const storeTasks = await prisma.storeTask.findMany({ where: { storeId } })

  const workOrder = await prisma.workOrder.create({
    data: {
      storeId,
      workerId,
      date,
      tasks: {
        create: storeTasks.map((t: { label: string; count: number | null }) => ({ label: t.label, count: t.count ?? null })),
      },
    },
    include: {
      store: { select: { id: true, name: true, address: true } },
      worker: { select: { id: true, fullName: true, username: true } },
      tasks: true,
      _count: { select: { photos: true } },
    },
  })

  return NextResponse.json(workOrder, { status: 201 })
}
