'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import {
  CheckCircle,
  ClipboardCheck,
  Sparkles,
  Calendar,
  Search,
  Building2,
  Wrench,
  Shield,
  Layers,
  Sofa,
  HardHat,
  Store,
  ChevronDown,
} from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

/* ── Data arrays ── */

const whyPoints = ['point1', 'point2', 'point3', 'point4'] as const

const steps = [
  { key: '1', icon: ClipboardCheck },
  { key: '2', icon: Sparkles },
  { key: '3', icon: Calendar },
  { key: '4', icon: Search },
] as const

const services = [
  { key: 'office', icon: Building2 },
  { key: 'janitorial', icon: Wrench },
  { key: 'disinfection', icon: Shield },
  { key: 'floor', icon: Layers },
  { key: 'carpet', icon: Sofa },
  { key: 'postConstruction', icon: HardHat },
  { key: 'retail', icon: Store },
] as const

const commitmentPoints = ['point1', 'point2', 'point3', 'point4', 'point5'] as const

const faqKeys = ['1', '2', '3', '4', '5', '6'] as const

/* ── Component ── */

export default function ServicesContent() {
  const t = useTranslations('services')
  const locale = useLocale()
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const toggleFaq = (key: string) => {
    setOpenFaq((prev) => (prev === key ? null : key))
  }

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

      {/* ── A Clean Space Changes Everything ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
              {t('whyCleanliness.title')}
            </h2>
            <div className="mt-3 h-1 w-12 rounded-full bg-[#D4A11E]" />
          </AnimatedSection>

          <ul className="mt-10 space-y-5">
            {whyPoints.map((key, i) => (
              <AnimatedSection key={key} delay={i * 0.06}>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0B7A3B]" />
                  <span className="text-base leading-relaxed text-[#334155] md:text-lg">
                    {t(`whyCleanliness.${key}`)}
                  </span>
                </li>
              </AnimatedSection>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How We Work ── */}
      <section className="bg-[#F6F8FA]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
              {t('howWeWork.title')}
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#D4A11E]" />
          </AnimatedSection>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <AnimatedSection key={step.key} delay={i * 0.08}>
                  <div className="relative h-full rounded-xl border border-[#E2E8F0] bg-white p-7">
                    {/* Step number */}
                    <span className="font-[family-name:var(--font-montserrat)] text-4xl font-bold text-[#E2E8F0]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="mt-4 mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#E7F6ED]">
                      <Icon className="h-5 w-5 text-[#0B7A3B]" />
                    </div>
                    <h3 className="font-[family-name:var(--font-montserrat)] text-lg font-semibold text-[#0F172A]">
                      {t(`howWeWork.step${step.key}Title`)}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-[#0B7A3B]">
                      {t(`howWeWork.step${step.key}Desc`)}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[#334155]">
                      {t(`howWeWork.step${step.key}Detail`)}
                    </p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((svc, i) => {
              const Icon = svc.icon
              return (
                <AnimatedSection key={svc.key} delay={i * 0.06}>
                  <div className="group flex h-full flex-col rounded-xl border border-[#E2E8F0] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#E7F6ED]">
                      <Icon className="h-6 w-6 text-[#0B7A3B]" />
                    </div>
                    <h3 className="font-[family-name:var(--font-montserrat)] text-lg font-semibold text-[#0F172A]">
                      {t(`grid.${svc.key}`)}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#334155]">
                      {t(`grid.${svc.key}Desc`)}
                    </p>

                    {/* Includes list */}
                    <div className="mt-5 border-t border-[#E2E8F0] pt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#0B7A3B]">
                        {t('grid.includes')}
                      </p>
                      <ul className="space-y-1.5">
                        {[1, 2, 3].map((n) => (
                          <li key={n} className="flex items-center gap-2 text-sm text-[#334155]">
                            <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-[#0B7A3B]" />
                            {t(`grid.${svc.key}Inc${n}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Our Commitment ── */}
      <section className="bg-[#F6F8FA]">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
              {t('commitment.title')}
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#D4A11E]" />
          </AnimatedSection>

          <ul className="mt-10 space-y-4">
            {commitmentPoints.map((key, i) => (
              <AnimatedSection key={key} delay={i * 0.06}>
                <li className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#0B7A3B]" />
                  <span className="text-base font-medium text-[#0F172A]">
                    {t(`commitment.${key}`)}
                  </span>
                </li>
              </AnimatedSection>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-[#0F172A] md:text-4xl">
              {t('faq.title')}
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#D4A11E]" />
          </AnimatedSection>

          <div className="mt-12 divide-y divide-[#E2E8F0]">
            {faqKeys.map((key, i) => {
              const isOpen = openFaq === key
              return (
                <AnimatedSection key={key} delay={i * 0.05}>
                  <div>
                    <button
                      onClick={() => toggleFaq(key)}
                      className="flex w-full items-center justify-between py-5 text-left"
                    >
                      <span className="pr-4 text-base font-medium text-[#0F172A] md:text-lg">
                        {t(`faq.q${key}`)}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 flex-shrink-0 text-[#334155] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-200 ${
                        isOpen ? 'max-h-96 pb-5' : 'max-h-0'
                      }`}
                    >
                      <p className="text-sm leading-relaxed text-[#334155] md:text-base">
                        {t(`faq.a${key}`)}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-[#0F172A]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center">
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold tracking-tight text-white md:text-4xl">
              {t('ctaBanner.title')}
            </h2>
            <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-[#D4A11E]" />
            <Link
              href={`/${locale}/contact`}
              className="mt-8 inline-block rounded-lg bg-[#0B7A3B] px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#096832]"
            >
              {t('ctaBanner.button')}
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
