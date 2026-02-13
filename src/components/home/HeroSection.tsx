'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'

/* ── Sparkle star SVG ── */
function SparkleStar({ size = 20, color = '#D4A11E' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z"
        fill={color}
      />
    </svg>
  )
}

/* ── Sparkle positions — scattered for the "freshly cleaned" shine effect ── */
const sparkles = [
  { x: '8%',  y: '15%', size: 18, color: '#D4A11E', delay: 0,   duration: 2.4 },
  { x: '85%', y: '12%', size: 14, color: '#0B7A3B', delay: 0.6, duration: 2.8 },
  { x: '70%', y: '75%', size: 20, color: '#D4A11E', delay: 1.2, duration: 2.2 },
  { x: '15%', y: '70%', size: 12, color: '#0B7A3B', delay: 0.3, duration: 3.0 },
  { x: '92%', y: '45%', size: 16, color: '#D4A11E', delay: 1.8, duration: 2.6 },
  { x: '5%',  y: '45%', size: 10, color: '#0B7A3B', delay: 0.9, duration: 2.0 },
  { x: '45%', y: '8%',  size: 12, color: '#D4A11E', delay: 1.5, duration: 2.4 },
  { x: '55%', y: '85%', size: 14, color: '#0B7A3B', delay: 0.4, duration: 2.8 },
  { x: '30%', y: '20%', size: 10, color: '#D4A11E', delay: 2.0, duration: 2.2 },
  { x: '75%', y: '30%', size: 11, color: '#0B7A3B', delay: 1.0, duration: 2.6 },
]

/* ── Shine sweep — a diagonal light sweep across the hero ── */
function ShineSweep() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div
        className="absolute top-0 h-full w-[200px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          transform: 'skewX(-20deg)',
        }}
        animate={{ left: ['-200px', '120%'] }}
        transition={{ duration: 3, delay: 1, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

export default function HeroSection() {
  const t = useTranslations('home')
  const locale = useLocale()

  return (
    <section className="relative overflow-hidden bg-[#F6F8FA]">
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-[#E7F6ED]/40" />

      {/* Sparkle stars — twinkle animation */}
      {sparkles.map((s, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute"
          style={{ left: s.x, top: s.y }}
          animate={{
            scale: [0, 1, 0.3, 1, 0],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0, 1, 0.4, 1, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: 'easeInOut',
          }}
        >
          <SparkleStar size={s.size} color={s.color} />
        </motion.div>
      ))}

      {/* Shine sweep — diagonal light beam */}
      <ShineSweep />

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
