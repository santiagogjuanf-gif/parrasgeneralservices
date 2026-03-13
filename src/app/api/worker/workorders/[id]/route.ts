import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { saveUpload } from '@/lib/upload'
import { sendPushToUser } from '@/lib/push'

export async function GET(
  _request: NextRequest,
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
    include: {
      store: { select: { id: true, name: true, address: true } },
      worker: { select: { id: true, fullName: true, username: true } },
      tasks: true,
      photos: true,
    },
  })

  if (!workOrder) {
    return NextResponse.json({ error: 'Work order not found.' }, { status: 404 })
  }

  const isAdminOrBoss = ['ADMIN', 'BOSS'].includes(session.role!)
  if (!isAdminOrBoss && workOrder.workerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(workOrder)
}

export async function PATCH(
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
    include: { tasks: true, photos: true },
  })

  if (!workOrder) {
    return NextResponse.json({ error: 'Work order not found.' }, { status: 404 })
  }

  const isAdminOrBoss = ['ADMIN', 'BOSS'].includes(session.role!)
  if (!isAdminOrBoss && workOrder.workerId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const {
    tasks,
    status,
    latitude,
    longitude,
    markComplete,
  } = body as {
    tasks?: { id: number; completed: boolean }[]
    status?: string
    latitude?: number
    longitude?: number
    markComplete?: boolean
  }

  // Update individual tasks if provided
  if (tasks && tasks.length > 0) {
    await Promise.all(
      tasks.map((t) =>
        prisma.workOrderTask.update({
          where: { id: t.id },
          data: { completed: t.completed },
        })
      )
    )
  }

  // Build data for work order update
  const updateData: Record<string, unknown> = {}
  if (status !== undefined) updateData.status = status
  if (latitude !== undefined) updateData.latitude = latitude
  if (longitude !== undefined) updateData.longitude = longitude

  if (markComplete) {
    // Re-fetch updated tasks
    const updatedTasks = await prisma.workOrderTask.findMany({
      where: { workOrderId },
    })
    const updatedPhotos = await prisma.workOrderPhoto.findMany({
      where: { workOrderId },
    })

    const allTasksDone = updatedTasks.every((t: { completed: boolean }) => t.completed)
    const hasEnoughPhotos = updatedPhotos.length >= 5

    if (allTasksDone && hasEnoughPhotos) {
      updateData.status = 'COMPLETED'
      updateData.completedAt = new Date()
    } else {
      updateData.status = 'INCOMPLETE'
    }

    // Notify ADMIN and BOSS users
    const adminBossUsers = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'BOSS'] } },
      select: { id: true },
    })

    const workerInfo = await prisma.user.findUnique({
      where: { id: workOrder.workerId },
      select: { fullName: true },
    })

    const storeInfo = await prisma.store.findUnique({
      where: { id: workOrder.storeId },
      select: { name: true },
    })

    const completionStatus = updateData.status === 'COMPLETED' ? 'COMPLETED' : 'INCOMPLETE'
    const notifPayload = {
      title: `Work Order ${completionStatus}`,
      body: `${workerInfo?.fullName ?? 'Worker'} marked work order for ${storeInfo?.name ?? 'store'} as ${completionStatus}.`,
      url: `/admin/workorders/${workOrderId}`,
    }

    await Promise.all(
      adminBossUsers.map((u: { id: number }) => sendPushToUser(u.id, notifPayload))
    )
  }

  const updated = await prisma.workOrder.update({
    where: { id: workOrderId },
    data: updateData,
    include: {
      store: { select: { id: true, name: true, address: true } },
      worker: { select: { id: true, fullName: true, username: true } },
      tasks: true,
      photos: true,
    },
  })

  return NextResponse.json(updated)
}

export async function PUT(
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

  return NextResponse.json({ photos: allPhotos, newPhotos: savedPhotos })
}
