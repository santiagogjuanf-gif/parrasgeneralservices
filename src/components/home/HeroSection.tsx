'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'

export default function HeroSection() {
  const t = useTranslations('home')
  const locale = useLocale()

  return (
    <section className="relative overflow-hidden bg-[#F6F8FA]">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-[#E7F6ED]/40" />

      {/* Decorative sparkle dots */}
      <div className="pointer-events-none absolute top-16 right-12 h-2 w-2 animate-pulse rounded-full bg-[#0B7A3B]/20" />
      <div className="pointer-events-none absolute top-32 right-32 h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4A11E]/30 [animation-delay:0.5s]" />
      <div className="pointer-events-none absolute bottom-24 left-16 h-2 w-2 animate-pulse rounded-full bg-[#0B7A3B]/15 [animation-delay:1s]" />
      <div className="pointer-events-none absolute bottom-40 left-40 h-1 w-1 animate-pulse rounded-full bg-[#D4A11E]/25 [animation-delay:1.5s]" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#334155]">
            {t('hero.subtitle')}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center rounded-lg bg-[#0B7A3B] px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#096832]"
            >
              {t('hero.cta')}
            </Link>

            <Link
              href={`/${locale}/services`}
              className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-white px-7 py-3.5 text-base font-semibold text-[#334155] shadow-sm transition-colors duration-200 hover:bg-[#F6F8FA]"
            >
              {t('hero.secondary')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
