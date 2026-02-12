import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const post = await prisma.blogPost.findUnique({
    where: { id: parseInt(id) },
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json(post)
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
  const body = await request.json()
  const {
    slug, category, tags, coverImageUrl, status,
    titleEn, titleFr, titleEs,
    excerptEn, excerptFr, excerptEs,
    contentEn, contentFr, contentEs,
  } = body

  const existing = await prisma.blogPost.findUnique({ where: { id: parseInt(id) } })
  if (!existing) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Check slug uniqueness if changed
  if (slug && slug !== existing.slug) {
    const slugTaken = await prisma.blogPost.findUnique({ where: { slug } })
    if (slugTaken) {
      return NextResponse.json(
        { error: 'A post with this slug already exists.' },
        { status: 409 }
      )
    }
  }

  const wasPublished = existing.status === 'PUBLISHED'
  const isNowPublished = status === 'PUBLISHED'

  const post = await prisma.blogPost.update({
    where: { id: parseInt(id) },
    data: {
      slug: slug ?? existing.slug,
      category: category ?? existing.category,
      tags: tags ?? existing.tags,
      coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : existing.coverImageUrl,
      status: status ?? existing.status,
      publishedAt: !wasPublished && isNowPublished ? new Date() : existing.publishedAt,
      titleEn: titleEn ?? existing.titleEn,
      titleFr: titleFr ?? existing.titleFr,
      titleEs: titleEs ?? existing.titleEs,
      excerptEn: excerptEn ?? existing.excerptEn,
      excerptFr: excerptFr ?? existing.excerptFr,
      excerptEs: excerptEs ?? existing.excerptEs,
      contentEn: contentEn ?? existing.contentEn,
      contentFr: contentFr ?? existing.contentFr,
      contentEs: contentEs ?? existing.contentEs,
    },
  })

  return NextResponse.json(post)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  await prisma.blogPost.delete({
    where: { id: parseInt(id) },
  })

  return NextResponse.json({ success: true })
}
