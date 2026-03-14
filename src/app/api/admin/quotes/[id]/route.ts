import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn || !['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const quote = await prisma.quote.findUnique({ where: { id: parseInt(id, 10) } })
  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(quote)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn || !['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()

  const data: Record<string, unknown> = {}
  const fields = ['quoteDate', 'clientName', 'clientAddress', 'clientPhone', 'clientEmail',
    'serviceType', 'commitment', 'status', 'notes']
  for (const f of fields) {
    if (body[f] !== undefined) data[f] = body[f]
  }
  if (body.scopeItems !== undefined) data.scopeItems = JSON.stringify(body.scopeItems)
  if (body.pricingOptions !== undefined) data.pricingOptions = JSON.stringify(body.pricingOptions)
  if (body.termsItems !== undefined) data.termsItems = JSON.stringify(body.termsItems)

  const quote = await prisma.quote.update({ where: { id: parseInt(id, 10) }, data })
  return NextResponse.json(quote)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn || !['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await prisma.quote.delete({ where: { id: parseInt(id, 10) } })
  return NextResponse.json({ success: true })
}
