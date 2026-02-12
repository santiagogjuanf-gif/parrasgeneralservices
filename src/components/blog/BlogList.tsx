'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Search, Calendar, ArrowRight } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

interface BlogPost {
  id: number
  slug: string
  category: string
  tags: string[]
  coverImageUrl: string | null
  publishedAt: string
  title: string
  excerpt: string
}

export default function BlogList() {
  const t = useTranslations('blog')
  const locale = useLocale()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({ locale })
    if (category) params.set('category', category)
    if (search) params.set('search', search)

    setLoading(true)
    fetch(`/api/blog?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [locale, category, search])

  const categories = [...new Set(posts.map((p) => p.category))].filter(Boolean)

  return (
    <>
      {/* Hero */}
      <section className="bg-[#F6F8FA]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#334155] md:text-xl">
              {t('subtitle')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder={t('search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#E2E8F0] py-2.5 pl-10 pr-4 text-sm focus:border-[#0B7A3B] focus:outline-none focus:ring-1 focus:ring-[#0B7A3B]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory('')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  !category
                    ? 'bg-[#0B7A3B] text-white'
                    : 'bg-[#F6F8FA] text-[#334155] hover:bg-[#E2E8F0]'
                }`}
              >
                {t('allCategories')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    category === cat
                      ? 'bg-[#0B7A3B] text-white'
                      : 'bg-[#F6F8FA] text-[#334155] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0B7A3B] border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <AnimatedSection className="py-20 text-center">
              <p className="text-xl font-semibold text-[#0F172A]">{t('noResults')}</p>
              <p className="mt-2 text-[#334155]">{t('noResultsDesc')}</p>
            </AnimatedSection>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <AnimatedSection key={post.id} delay={i * 0.05}>
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {post.coverImageUrl ? (
                      <div className="relative h-48 w-full overflow-hidden bg-[#F6F8FA]">
                        <Image
                          src={post.coverImageUrl}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-[#F6F8FA]">
                        <span className="text-4xl font-bold text-[#E2E8F0]">PGS</span>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <span className="inline-block self-start rounded-full bg-[#E7F6ED] px-3 py-1 text-xs font-medium text-[#0B7A3B]">
                        {post.category}
                      </span>
                      <h2 className="mt-3 font-[family-name:var(--font-montserrat)] text-lg font-semibold text-[#0F172A] line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#334155] line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8]">
                          <Calendar size={12} />
                          {new Date(post.publishedAt).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0B7A3B]">
                          {t('readMore')}
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
