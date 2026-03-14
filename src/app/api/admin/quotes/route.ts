import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function nextQuoteNumber(lastNumber: string | null): string {
  const year = new Date().getFullYear()
  if (!lastNumber) return `Q-${year}-001`
  const parts = lastNumber.split('-')
  const num = parseInt(parts[2] || '0', 10) + 1
  return `Q-${year}-${String(num).padStart(3, '0')}`
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn || !['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const quotes = await prisma.quote.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(quotes)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn || !['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()

  const last = await prisma.quote.findFirst({ orderBy: { createdAt: 'desc' }, select: { quoteNumber: true } })
  const quoteNumber = nextQuoteNumber(last?.quoteNumber ?? null)

  const DEFAULT_COMMITMENT = `At Parra's General Services, our goal is long-term professional relationships based on reliability, quality, and trust. We are committed to delivering consistent and high-standard cleaning services that support your business operations and maintain a safe, clean environment for staff and customers.\n\nPricing is negotiable, as our priority is establishing a strong working relationship and becoming your trusted service provider. We are fully prepared to begin services at any date you decide — whether immediately, within a week, or at a future scheduled time that best fits your needs.`

  const DEFAULT_TERMS = JSON.stringify([
    'This quote includes all labour, standard cleaning supplies, and scheduled floor maintenance.',
    'This is a fixed monthly contract rate.',
    'Payment terms to be agreed upon prior to service start date.',
  ])

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      quoteDate: body.quoteDate || new Date().toISOString().split('T')[0],
      clientName: body.clientName,
      clientAddress: body.clientAddress,
      clientPhone: body.clientPhone || null,
      clientEmail: body.clientEmail || null,
      serviceType: body.serviceType,
      scopeItems: JSON.stringify(body.scopeItems || []),
      pricingOptions: JSON.stringify(body.pricingOptions || []),
      commitment: body.commitment || DEFAULT_COMMITMENT,
      termsItems: body.termsItems || DEFAULT_TERMS,
      status: 'DRAFT',
      notes: body.notes || null,
    },
  })

  return NextResponse.json(quote, { status: 201 })
}
