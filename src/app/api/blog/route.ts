import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const where: Record<string, unknown> = { status: 'PUBLISHED' }

  if (category) {
    where.category = category
  }

  if (search) {
    const titleField = `title${locale.charAt(0).toUpperCase() + locale.slice(1)}`
    where[titleField] = { contains: search }
  }

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      category: true,
      tags: true,
      coverImageUrl: true,
      publishedAt: true,
      titleEn: true,
      titleFr: true,
      titleEs: true,
      excerptEn: true,
      excerptFr: true,
      excerptEs: true,
    },
  })

  const formatted = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    category: post.category,
    tags: post.tags ? post.tags.split(',').map((t: string) => t.trim()) : [],
    coverImageUrl: post.coverImageUrl,
    publishedAt: post.publishedAt,
    title: post[`title${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof post] || post.titleEn,
    excerpt: post[`excerpt${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof post] || post.excerptEn,
  }))

  return NextResponse.json(formatted)
}
