'use client'

import { useTranslations } from 'next-intl'
import { ClipboardCheck, Sparkles, Calendar, Search } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

const steps = [
  { num: 1, key: 'step1', Icon: ClipboardCheck },
  { num: 2, key: 'step2', Icon: Sparkles },
  { num: 3, key: 'step3', Icon: Calendar },
  { num: 4, key: 'step4', Icon: Search },
] as const

export default function HowWeWork() {
  const t = useTranslations('home')

  return (
    <section className="bg-[#F6F8FA] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <AnimatedSection className="mb-14 text-center">
          <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#0F172A]">
            {t('howWeWork.title')}
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#D4A11E]" />
        </AnimatedSection>

        {/* Steps grid */}
        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* Connector line (visible on lg+ only) */}
          <div className="pointer-events-none absolute top-14 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] hidden h-px bg-[#E2E8F0] lg:block" />

          {steps.map(({ num, key, Icon }, index) => (
            <AnimatedSection key={key} delay={index * 0.08}>
              <div className="relative flex flex-col items-center text-center">
                {/* Number circle */}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#0B7A3B] text-lg font-bold text-white">
                  {num}
                </div>

                {/* Icon */}
                <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#E7F6ED]">
                  <Icon className="h-5 w-5 text-[#0B7A3B]" strokeWidth={1.8} />
                </div>

                {/* Text */}
                <h3 className="mt-4 font-[family-name:var(--font-montserrat)] text-base font-semibold text-[#0F172A]">
                  {t(`howWeWork.${key}Title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#334155]">
                  {t(`howWeWork.${key}Desc`)}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
