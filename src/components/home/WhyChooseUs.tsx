'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

const pointKeys = ['point1', 'point2', 'point3', 'point4', 'point5'] as const

export default function WhyChooseUs() {
  const t = useTranslations('home')

  return (
    <section className="bg-[#F6F8FA] py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <AnimatedSection className="mb-10 text-center">
          <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#0F172A]">
            {t('whyChoose.title')}
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#D4A11E]" />
        </AnimatedSection>

        {/* Bullet points */}
        <AnimatedSection delay={0.08}>
          <ul className="space-y-4">
            {pointKeys.map((key) => (
              <li key={key} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0B7A3B]"
                  strokeWidth={2}
                />
                <span className="text-base leading-relaxed text-[#334155]">
                  {t(`whyChoose.${key}`)}
                </span>
              </li>
            ))}
          </ul>
        </AnimatedSection>
      </div>
    </section>
  )
}
