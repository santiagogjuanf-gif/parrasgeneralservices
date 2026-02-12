'use client'

import { useTranslations } from 'next-intl'
import { Clock, Users, CheckCircle, ThumbsUp } from 'lucide-react'
import AnimatedSection from '@/components/ui/AnimatedSection'

const badges = [
  { key: 'reliable', Icon: Clock },
  { key: 'trained', Icon: Users },
  { key: 'quality', Icon: CheckCircle },
  { key: 'satisfaction', Icon: ThumbsUp },
] as const

export default function TrustBadges() {
  const t = useTranslations('home')

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {badges.map(({ key, Icon }) => (
              <div
                key={key}
                className="flex flex-col items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-6 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F6ED]">
                  <Icon className="h-6 w-6 text-[#0B7A3B]" strokeWidth={1.8} />
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">
                  {t(`trust.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
