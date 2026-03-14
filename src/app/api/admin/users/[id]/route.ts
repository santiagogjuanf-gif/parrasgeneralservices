import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn || !['ADMIN', 'BOSS'].includes(session.role!)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const userId = parseInt(id, 10)
  const body = await request.json()

  // Fetch target user to check their current role
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // BOSS cannot edit ADMIN users or assign ADMIN role
  if (session.role === 'BOSS') {
    if (target.role === 'ADMIN') return NextResponse.json({ error: 'Forbidden: cannot edit admin users.' }, { status: 403 })
    if (body.role === 'ADMIN') return NextResponse.json({ error: 'Forbidden: cannot assign admin role.' }, { status: 403 })
  }

  const validRoles = ['ADMIN', 'BOSS', 'WORKER']
  const updateData: Record<string, unknown> = {}

  if (body.fullName !== undefined) updateData.fullName = body.fullName
  if (body.username !== undefined) updateData.username = body.username
  if (body.role !== undefined && validRoles.includes(body.role)) updateData.role = body.role
  if (body.forcePasswordChange !== undefined) updateData.forcePasswordChange = body.forcePasswordChange
  if (body.password) {
    updateData.passwordHash = await bcrypt.hash(body.password, 10)
    updateData.forcePasswordChange = body.forcePasswordChange ?? true
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, username: true, fullName: true, role: true, createdAt: true, forcePasswordChange: true },
  })

  return NextResponse.json(user)
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
  const userId = parseInt(id, 10)

  if (userId === session.userId) {
    return NextResponse.json({ error: 'Cannot delete your own account.' }, { status: 400 })
  }

  // BOSS cannot delete ADMIN users
  if (session.role === 'BOSS') {
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
    if (target?.role === 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: cannot delete admin users.' }, { status: 403 })
    }
  }

  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ success: true })
}
