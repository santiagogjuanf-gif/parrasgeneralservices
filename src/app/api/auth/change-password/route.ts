import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { newPassword } = await request.json()
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash, forcePasswordChange: false },
  })

  return NextResponse.json({ success: true })
}
