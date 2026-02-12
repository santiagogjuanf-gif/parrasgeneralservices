import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://parrasgeneral.com'
const LOCALES = ['en', 'fr', 'es']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ['', '/about', '/services', '/contact', '/blog', '/privacy']

  const staticEntries = LOCALES.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
      priority: page === '' ? 1.0 : 0.8,
    }))
  )

  let blogEntries: MetadataRoute.Sitemap = []

  try {
    const { prisma } = await import('@/lib/prisma')
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    })

    blogEntries = LOCALES.flatMap((locale) =>
      posts.map((post) => ({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    )
  } catch {
    // Database not available during build
  }

  return [...staticEntries, ...blogEntries]
}
