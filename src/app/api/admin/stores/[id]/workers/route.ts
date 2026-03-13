import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(
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
  const { userId } = body as { userId: number }

  if (!userId) {
    return NextResponse.json({ error: 'userId is required.' }, { status: 400 })
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } })
  if (!store) {
    return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  const existing = await prisma.storeWorker.findUnique({
    where: { storeId_userId: { storeId, userId } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Worker already assigned to this store.' }, { status: 409 })
  }

  const storeWorker = await prisma.storeWorker.create({
    data: { storeId, userId },
    include: {
      user: { select: { id: true, fullName: true, username: true, role: true } },
    },
  })

  return NextResponse.json(storeWorker, { status: 201 })
}

export async function DELETE(
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
  const { userId } = body as { userId: number }

  if (!userId) {
    return NextResponse.json({ error: 'userId is required.' }, { status: 400 })
  }

  const storeWorker = await prisma.storeWorker.findUnique({
    where: { storeId_userId: { storeId, userId } },
  })
  if (!storeWorker) {
    return NextResponse.json({ error: 'Worker assignment not found.' }, { status: 404 })
  }

  await prisma.storeWorker.delete({
    where: { storeId_userId: { storeId, userId } },
  })

  return NextResponse.json({ success: true })
}
