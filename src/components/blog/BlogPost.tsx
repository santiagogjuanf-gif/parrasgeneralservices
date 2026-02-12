'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Calendar, ArrowLeft, Tag } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import AnimatedSection from '@/components/ui/AnimatedSection'

interface Post {
  id: number
  slug: string
  category: string
  tags: string[]
  coverImageUrl: string | null
  publishedAt: string
  title: string
  excerpt: string
  content: string
}

export default function BlogPost({ slug }: { slug: string }) {
  const t = useTranslations('blog')
  const locale = useLocale()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/blog/${slug}?locale=${locale}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        setPost(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug, locale])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0B7A3B] border-t-transparent" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold text-[#0F172A]">{t('noResults')}</p>
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-[#0B7A3B] hover:underline"
        >
          <ArrowLeft size={16} />
          {t('title')}
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <section className="bg-[#F6F8FA]">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <Link
              href={`/${locale}/blog`}
              className="mb-6 inline-flex items-center gap-2 text-sm text-[#0B7A3B] hover:underline"
            >
              <ArrowLeft size={16} />
              {t('title')}
            </Link>

            <span className="mb-4 inline-block rounded-full bg-[#E7F6ED] px-3 py-1 text-xs font-medium text-[#0B7A3B]">
              {post.category}
            </span>

            <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-[#94A3B8]">
                <Calendar size={14} />
                {t('publishedOn')}{' '}
                {new Date(post.publishedAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Tag size={14} className="text-[#94A3B8]" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-2.5 py-0.5 text-xs text-[#334155]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Cover Image */}
      {post.coverImageUrl && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-4 aspect-[2/1] overflow-hidden rounded-xl">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <article className="prose prose-lg max-w-none prose-headings:font-[family-name:var(--font-montserrat)] prose-headings:text-[#0F172A] prose-p:text-[#334155] prose-a:text-[#0B7A3B] prose-strong:text-[#0F172A]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </article>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F6F8FA]">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <h2 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-[#0F172A] md:text-3xl">
              {t('needHelp')}
            </h2>
            <p className="mt-2 text-[#334155]">{t('needHelpDesc')}</p>
            <Link
              href={`/${locale}/contact`}
              className="mt-6 inline-block rounded-lg bg-[#0B7A3B] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#096832]"
            >
              {t('contactUs')}
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
