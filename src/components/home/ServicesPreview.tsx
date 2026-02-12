'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Building2, Shield, Layers, HardHat, Armchair, Store } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

const services = [
  { key: 'office', Icon: Building2 },
  { key: 'disinfection', Icon: Shield },
  { key: 'floor', Icon: Layers },
  { key: 'postConstruction', Icon: HardHat },
  { key: 'carpet', Icon: Armchair },
  { key: 'retail', Icon: Store },
] as const

export default function ServicesPreview() {
  const t = useTranslations('home')
  const locale = useLocale()

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <AnimatedSection className="mb-14 text-center">
          <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#0F172A]">
            {t('services.title')}
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#D4A11E]" />
        </AnimatedSection>

        {/* Service cards grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ key, Icon }, index) => (
            <AnimatedSection key={key} delay={index * 0.06}>
              <Link
                href={`/${locale}/services`}
                className="group flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E7F6ED]">
                  <Icon className="h-6 w-6 text-[#0B7A3B]" strokeWidth={1.8} />
                </div>

                <h3 className="mt-5 font-[family-name:var(--font-montserrat)] text-lg font-semibold text-[#0F172A]">
                  {t(`services.${key}`)}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-[#334155]">
                  {t(`services.${key}Desc`)}
                </p>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
