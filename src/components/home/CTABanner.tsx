'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import AnimatedSection from '@/components/ui/AnimatedSection'

export default function CTABanner() {
  const t = useTranslations('home')
  const locale = useLocale()

  return (
    <section className="bg-[#0F172A] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center">
          <h2 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-white sm:text-3xl">
            {t('cta.title')}
          </h2>

          <div className="mt-8">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center rounded-lg bg-[#0B7A3B] px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#096832]"
            >
              {t('cta.button')}
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
