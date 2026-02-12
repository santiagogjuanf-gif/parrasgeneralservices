import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'

  const post = await prisma.blogPost.findUnique({
    where: { slug, status: 'PUBLISHED' },
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const capLocale = locale.charAt(0).toUpperCase() + locale.slice(1)

  return NextResponse.json({
    id: post.id,
    slug: post.slug,
    category: post.category,
    tags: post.tags ? post.tags.split(',').map((t: string) => t.trim()) : [],
    coverImageUrl: post.coverImageUrl,
    publishedAt: post.publishedAt,
    title: post[`title${capLocale}` as keyof typeof post] || post.titleEn,
    excerpt: post[`excerpt${capLocale}` as keyof typeof post] || post.excerptEn,
    content: post[`content${capLocale}` as keyof typeof post] || post.contentEn,
  })
}
