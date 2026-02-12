import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    slug, category, tags, coverImageUrl, status,
    titleEn, titleFr, titleEs,
    excerptEn, excerptFr, excerptEs,
    contentEn, contentFr, contentEs,
  } = body

  if (!slug || !category || !titleEn) {
    return NextResponse.json(
      { error: 'Slug, category, and English title are required.' },
      { status: 400 }
    )
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json(
      { error: 'A post with this slug already exists.' },
      { status: 409 }
    )
  }

  const post = await prisma.blogPost.create({
    data: {
      slug,
      category,
      tags: tags || '',
      coverImageUrl: coverImageUrl || null,
      status: status || 'DRAFT',
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
      titleEn: titleEn || '',
      titleFr: titleFr || '',
      titleEs: titleEs || '',
      excerptEn: excerptEn || '',
      excerptFr: excerptFr || '',
      excerptEs: excerptEs || '',
      contentEn: contentEn || '',
      contentFr: contentFr || '',
      contentEs: contentEs || '',
    },
  })

  return NextResponse.json(post, { status: 201 })
}
