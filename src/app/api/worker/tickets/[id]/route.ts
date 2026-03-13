import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
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

  const { id } = await params
  const ticketId = parseInt(id, 10)

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      user: { select: { id: true, fullName: true, username: true } },
    },
  })

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
  }

  const isAdminOrBoss = ['ADMIN', 'BOSS'].includes(session.role!)
  if (!isAdminOrBoss && ticket.userId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(ticket)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const ticketId = parseInt(id, 10)

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
  }

  const isAdminOrBoss = ['ADMIN', 'BOSS'].includes(session.role!)
  if (!isAdminOrBoss && ticket.userId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { category, otherLabel, amount, notes } = body as {
    category?: string
    otherLabel?: string
    amount?: number
    notes?: string
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      ...(category !== undefined && { category }),
      ...(otherLabel !== undefined && { otherLabel }),
      ...(amount !== undefined && { amount }),
      ...(notes !== undefined && { notes }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const ticketId = parseInt(id, 10)

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 })
  }

  const isAdminOrBoss = ['ADMIN', 'BOSS'].includes(session.role!)
  if (!isAdminOrBoss && ticket.userId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete file from disk
  const filePath = join(process.cwd(), 'public', ticket.path)
  if (existsSync(filePath)) {
    await unlink(filePath).catch(() => {})
  }

  await prisma.ticket.delete({ where: { id: ticketId } })

  return NextResponse.json({ success: true })
}
