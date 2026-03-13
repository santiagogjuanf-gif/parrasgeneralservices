import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const stores = await prisma.store.findMany({
    include: {
      tasks: true,
      workers: {
        include: {
          user: {
            select: { id: true, fullName: true, username: true, role: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(stores)
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
  const { name, address, days, tasks } = body as {
    name: string
    address: string
    days?: string
    tasks?: { label: string; count?: number }[]
  }

  if (!name || !address) {
    return NextResponse.json({ error: 'Name and address are required.' }, { status: 400 })
  }

  const store = await prisma.store.create({
    data: {
      name,
      address,
      days: days ?? '1,2,3,4,5',
      tasks: tasks && tasks.length > 0
        ? {
            create: tasks.map((t) => ({ label: t.label, count: t.count ?? null })),
          }
        : undefined,
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

  return NextResponse.json(store, { status: 201 })
}
