import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { saveUpload } from '@/lib/upload'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const workOrderId = parseInt(id, 10)

  const workOrder = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
  })

  if (!workOrder) {
    return NextResponse.json({ error: 'Work order not found.' }, { status: 404 })
  }

  const isAdminOrBoss = ['ADMIN', 'BOSS'].includes(session.role!)
  if (!isAdminOrBoss && workOrder.workerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const files = formData.getAll('photos') as File[]

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No photos provided.' }, { status: 400 })
  }

  const savedPhotos = await Promise.all(
    files.map(async (file) => {
      const { filename, path } = await saveUpload(file, 'reports')
      return prisma.workOrderPhoto.create({
        data: { workOrderId, filename, path },
      })
    })
  )

  // Update status to IN_PROGRESS if PENDING
  if (workOrder.status === 'PENDING') {
    await prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: 'IN_PROGRESS' },
    })
  }

  const allPhotos = await prisma.workOrderPhoto.findMany({
    where: { workOrderId },
  })

  return NextResponse.json({ photos: allPhotos, newPhotos: savedPhotos }, { status: 201 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const workOrderId = parseInt(id, 10)

  const workOrder = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
  })

  if (!workOrder) {
    return NextResponse.json({ error: 'Work order not found.' }, { status: 404 })
  }

  const isAdminOrBoss = ['ADMIN', 'BOSS'].includes(session.role!)
  if (!isAdminOrBoss && workOrder.workerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { photoId } = body as { photoId: number }

  if (!photoId) {
    return NextResponse.json({ error: 'photoId is required.' }, { status: 400 })
  }

  const photo = await prisma.workOrderPhoto.findUnique({
    where: { id: photoId },
  })

  if (!photo || photo.workOrderId !== workOrderId) {
    return NextResponse.json({ error: 'Photo not found.' }, { status: 404 })
  }

  // Delete file from disk
  const filePath = join(process.cwd(), 'public', photo.path)
  if (existsSync(filePath)) {
    await unlink(filePath).catch(() => {})
  }

  await prisma.workOrderPhoto.delete({ where: { id: photoId } })

  return NextResponse.json({ success: true })
}
