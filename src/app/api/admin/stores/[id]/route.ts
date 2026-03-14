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
  const storeId = parseInt(id, 10)

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      tasks: true,
      workers: {
        include: {
          user: { select: { id: true, fullName: true, username: true, role: true } },
        },
      },
    },
  })

  if (!store) {
    return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
  }

  return NextResponse.json(store)
}

export async function PUT(
  request: NextRequest,
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
  const storeId = parseInt(id, 10)

  const body = await request.json()
  const { name, address, days, tasks } = body as {
    name?: string
    address?: string
    days?: string
    tasks?: { label: string; count?: number }[]
  }

  const existing = await prisma.store.findUnique({ where: { id: storeId } })
  if (!existing) {
    return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
  }

  // If tasks are provided, replace them
  if (tasks !== undefined) {
    await prisma.storeTask.deleteMany({ where: { storeId } })
  }

  const store = await prisma.store.update({
    where: { id: storeId },
    data: {
      ...(name !== undefined && { name }),
      ...(address !== undefined && { address }),
      ...(days !== undefined && { days }),
      ...(tasks !== undefined && {
        tasks: {
          create: tasks.map((t) => ({ label: t.label, count: t.count ?? null })),
        },
      }),
    },
    include: {
      tasks: true,
      workers: {
        include: {
          user: { select: { id: true, fullName: true, username: true, role: true } },
        },
      },
    },
  })

  return NextResponse.json(store)
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
  const storeId = parseInt(id, 10)

  const existing = await prisma.store.findUnique({ where: { id: storeId } })
  if (!existing) {
    return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
  }

  await prisma.store.delete({ where: { id: storeId } })

  return NextResponse.json({ success: true })
}
