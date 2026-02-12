'use client'

import { useTranslations } from 'next-intl'
import AnimatedSection from '@/components/ui/AnimatedSection'

const sections = [
  { titleKey: 'section1Title', textKey: 'section1Text' },
  { titleKey: 'section2Title', textKey: 'section2Text' },
  { titleKey: 'section3Title', textKey: 'section3Text' },
  { titleKey: 'section4Title', textKey: 'section4Text' },
  { titleKey: 'section5Title', textKey: 'section5Text' },
  { titleKey: 'section6Title', textKey: 'section6Text' },
] as const

export default function PrivacyContent() {
  const t = useTranslations('privacy')

  return (
    <>
      {/* Hero */}
      <section className="bg-[#F6F8FA]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 text-sm text-[#94A3B8]">{t('lastUpdated')}</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <AnimatedSection>
            <p className="text-base leading-relaxed text-[#334155] md:text-lg">
              {t('intro')}
            </p>
          </AnimatedSection>

          <div className="mt-12 space-y-10">
            {sections.map((section, i) => (
              <AnimatedSection key={section.titleKey} delay={i * 0.05}>
                <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-bold text-[#0F172A] md:text-2xl">
                  {t(section.titleKey)}
                </h2>
                <div className="mt-2 h-1 w-10 rounded-full bg-[#D4A11E]" />
                <p className="mt-4 text-base leading-relaxed text-[#334155]">
                  {t(section.textKey)}
                </p>
              </AnimatedSection>
            ))}
          </div>

          {/* Contact info */}
          <AnimatedSection delay={0.3} className="mt-10">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F6F8FA] p-6">
              <p className="font-semibold text-[#0F172A]">Parras General Services</p>
              <p className="mt-1 text-sm text-[#334155]">info@parrasgeneral.com</p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
