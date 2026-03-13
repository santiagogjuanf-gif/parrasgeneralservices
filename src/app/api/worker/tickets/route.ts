import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { saveUpload } from '@/lib/upload'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.userId! },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tickets)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const category = formData.get('category') as string | null
  const otherLabel = formData.get('otherLabel') as string | null
  const amountStr = formData.get('amount') as string | null
  const notes = formData.get('notes') as string | null
  const photo = formData.get('photo') as File | null

  if (!category) {
    return NextResponse.json({ error: 'category is required.' }, { status: 400 })
  }

  if (!photo) {
    return NextResponse.json({ error: 'photo is required.' }, { status: 400 })
  }

  const { filename, path } = await saveUpload(photo, 'tickets')

  const ticket = await prisma.ticket.create({
    data: {
      userId: session.userId!,
      category,
      otherLabel: otherLabel ?? null,
      amount: amountStr ? parseFloat(amountStr) : null,
      notes: notes ?? null,
      filename,
      path,
    },
  })

  return NextResponse.json(ticket, { status: 201 })
}
