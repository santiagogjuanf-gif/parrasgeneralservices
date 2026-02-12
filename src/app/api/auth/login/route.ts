import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { allowed } = checkRateLimit(`login:${ip}`)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    )
  }

  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required.' },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid credentials.' },
      { status: 401 }
    )
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json(
      { error: 'Invalid credentials.' },
      { status: 401 }
    )
  }

  const session = await getSession()
  session.userId = user.id
  session.username = user.username
  session.fullName = user.fullName
  session.role = user.role
  session.isLoggedIn = true
  await session.save()

  return NextResponse.json({
    success: true,
    user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
  })
}
