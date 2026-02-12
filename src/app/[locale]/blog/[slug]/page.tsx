import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import BlogPostView from '@/components/blog/BlogPost'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug } })

  if (!post) {
    return { title: 'Post Not Found' }
  }

  const capLocale = locale.charAt(0).toUpperCase() + locale.slice(1)
  const title = (post[`title${capLocale}` as keyof typeof post] as string) || post.titleEn
  const description = (post[`excerpt${capLocale}` as keyof typeof post] as string) || post.excerptEn

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <BlogPostView slug={slug} />
}
