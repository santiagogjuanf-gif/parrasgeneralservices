'use client'

import { useTranslations } from 'next-intl'
import { Shield, Award, Heart, MessageSquare, HardHat } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

const values = [
  { key: 'responsibility', icon: Shield },
  { key: 'qualityVal', icon: Award },
  { key: 'respect', icon: Heart },
  { key: 'communication', icon: MessageSquare },
  { key: 'safety', icon: HardHat },
] as const

export default function AboutContent() {
  const t = useTranslations('about')

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-[#F6F8FA]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
              {t('hero.title')}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#334155] md:text-xl">
              {t('hero.subtitle')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Who We Are ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
              {t('whoWeAre.title')}
            </h2>
            <div className="mt-3 h-1 w-12 rounded-full bg-[#D4A11E]" />
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-[#334155] md:text-lg">
              {t('whoWeAre.text')}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="bg-[#F6F8FA]">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-16 md:grid-cols-2">
            <AnimatedSection>
              <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
                {t('mission.title')}
              </h2>
              <div className="mt-3 h-1 w-12 rounded-full bg-[#D4A11E]" />
              <p className="mt-6 text-base leading-relaxed text-[#334155] md:text-lg">
                {t('mission.text')}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
                {t('vision.title')}
              </h2>
              <div className="mt-3 h-1 w-12 rounded-full bg-[#D4A11E]" />
              <p className="mt-6 text-base leading-relaxed text-[#334155] md:text-lg">
                {t('vision.text')}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
              {t('values.title')}
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#D4A11E]" />
          </AnimatedSection>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <AnimatedSection key={v.key} delay={i * 0.07}>
                  <div className="group h-full rounded-xl border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#E7F6ED]">
                      <Icon className="h-6 w-6 text-[#0B7A3B]" />
                    </div>
                    <h3 className="font-[family-name:var(--font-montserrat)] text-lg font-semibold text-[#0F172A]">
                      {t(`values.${v.key}`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#334155]">
                      {t(`values.${v.key}Desc`)}
                    </p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Built with Pride ── */}
      <section className="bg-[#F6F8FA]">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
              {t('different.title')}
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#D4A11E]" />
            <p className="mt-6 text-base leading-relaxed text-[#334155] md:text-lg">
              {t('different.text')}
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
