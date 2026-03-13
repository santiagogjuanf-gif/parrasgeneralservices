import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const workOrderId = parseInt(id, 10)

  const workOrder = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: {
      store: { select: { id: true, name: true, address: true } },
      worker: { select: { id: true, fullName: true, username: true } },
      tasks: true,
      photos: true,
    },
  })

  if (!workOrder) {
    return NextResponse.json({ error: 'Work order not found.' }, { status: 404 })
  }

  return NextResponse.json(workOrder)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const workOrderId = parseInt(id, 10)

  const workOrder = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
  })

  if (!workOrder) {
    return NextResponse.json({ error: 'Work order not found.' }, { status: 404 })
  }

  await prisma.workOrder.delete({ where: { id: workOrderId } })

  return NextResponse.json({ success: true })
}
