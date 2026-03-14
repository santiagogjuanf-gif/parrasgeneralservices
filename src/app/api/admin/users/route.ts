import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, username: true, fullName: true, role: true, createdAt: true, forcePasswordChange: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { username, password, fullName, role, forcePasswordChange } = await request.json()

  if (!username || !password || !fullName) {
    return NextResponse.json({ error: 'Username, password, and full name are required.' }, { status: 400 })
  }

  const validRoles = ['ADMIN', 'BOSS', 'WORKER']
  const userRole = validRoles.includes(role) ? role : 'WORKER'

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json({ error: 'Username already exists.' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      fullName,
      role: userRole,
      forcePasswordChange: forcePasswordChange === true,
    },
    select: { id: true, username: true, fullName: true, role: true, createdAt: true, forcePasswordChange: true },
  })

  return NextResponse.json(user, { status: 201 })
}
