import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const userId = parseInt(id, 10)
  const body = await request.json()

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
  if (!session.isLoggedIn || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const userId = parseInt(id, 10)

  if (userId === session.userId) {
    return NextResponse.json({ error: 'Cannot delete your own account.' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ success: true })
}
