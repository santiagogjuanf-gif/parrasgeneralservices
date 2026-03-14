import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { existsSync } from 'fs'
import archiver from 'archiver'
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
  const userId = searchParams.get('userId')
  const category = searchParams.get('category')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(userId && { userId: parseInt(userId, 10) }),
      ...(category && { category }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(new Date(to).setHours(23, 59, 59, 999)) }),
            },
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  const chunks: Buffer[] = []
  await new Promise<void>((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 6 } })
    archive.on('data', (chunk: Buffer) => chunks.push(chunk))
    archive.on('end', resolve)
    archive.on('error', reject)

    for (const ticket of tickets) {
      const filePath = join(process.cwd(), 'public', ticket.path)
      if (existsSync(filePath)) {
        archive.file(filePath, {
          name: `${ticket.category}_${ticket.createdAt.toISOString().split('T')[0]}_${ticket.filename}`,
        })
      }
    }

    archive.finalize()
  })

  const buffer = Buffer.concat(chunks)
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="tickets.zip"',
    },
  })
}
