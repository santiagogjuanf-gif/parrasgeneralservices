import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import QuotePrintView from '@/components/admin/QuotePrintView'

export default async function QuotePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quote = await prisma.quote.findUnique({ where: { id: parseInt(id, 10) } })
  if (!quote) notFound()
  return <QuotePrintView quote={quote} />
}
