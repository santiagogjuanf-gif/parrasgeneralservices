'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { Menu, X, Globe, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const LOCALES = ['en', 'fr', 'es'] as const
const LOCALE_LABELS: Record<string, string> = { en: 'EN', fr: 'FR', es: 'ES' }

export default function Navbar() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/services', label: t('services') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ]

  const isActive = useCallback(
    (href: string) => {
      if (href === '/') return pathname === '/' || pathname === `/${locale}`
      return pathname === href || pathname === `/${locale}${href}` || pathname.startsWith(`/${locale}${href}/`)
    },
    [pathname, locale],
  )

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
    setMobileOpen(false)
  }

  return (
    <>
      {/* ─── Header ─── */}
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={false}
        animate={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,1)',
          backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'blur(0px)',
          boxShadow: scrolled
            ? '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)'
            : '0 0 0 rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'blur(0px)' }}
      >
        {/* Thin accent line at top */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#0B7A3B] via-[#10B981] to-[#0B7A3B]" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* ── Logo ── */}
          <Link href={`/${locale}`} className="group relative flex-shrink-0">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
              <Image
                src="/images/logo.png"
                alt="Parras General Services"
                width={160}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </motion.div>
          </Link>

          {/* ── Desktop nav links ── */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={`/${locale}${link.href === '/' ? '' : link.href}`}
                    className="group relative px-4 py-2 text-[0.9rem] font-medium transition-colors"
                    style={{ color: active ? '#0B7A3B' : '#334155' }}
                  >
                    <span className="relative z-10">{link.label}</span>

                    {/* Hover background */}
                    <motion.span
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: '#F0FDF4' }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />

                    {/* Active indicator – animated underline */}
                    {active && (
                      <motion.span
                        className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                        style={{ backgroundColor: '#0B7A3B' }}
                        layoutId="nav-underline"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* ── Desktop right section ── */}
          <div className="hidden items-center gap-3 lg:flex">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 rounded-full border px-1 py-0.5" style={{ borderColor: '#E2E8F0' }}>
              <Globe size={14} className="ml-1.5" style={{ color: '#64748B' }} />
              {LOCALES.map((loc) => (
                <motion.button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className="relative rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors"
                  style={{ color: locale === loc ? '#FFFFFF' : '#334155' }}
                  aria-label={`Switch to ${loc}`}
                  whileHover={locale !== loc ? { scale: 1.08 } : {}}
                  whileTap={{ scale: 0.95 }}
                >
                  {locale === loc && (
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: '#0B7A3B' }}
                      layoutId="lang-pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{LOCALE_LABELS[loc]}</span>
                </motion.button>
              ))}
            </div>

            {/* CTA Button */}
            <Link href={`/${locale}/contact`}>
              <motion.span
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: '#0B7A3B' }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {/* Shimmer effect */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">{t('freeQuote')}</span>
                <ArrowRight size={15} className="relative transition-transform duration-200 group-hover:translate-x-0.5" />
              </motion.span>
            </Link>
          </div>

          {/* ── Mobile hamburger ── */}
          <motion.button
            className="flex items-center justify-center rounded-lg p-2 lg:hidden"
            style={{ color: '#0F172A' }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={24} />
          </motion.button>
        </nav>
      </motion.header>

      {/* ─── Mobile slide-in panel ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: '#E2E8F0' }}>
                <Image
                  src="/images/logo.png"
                  alt="Parras General Services"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                />
                <motion.button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                  style={{ color: '#0F172A' }}
                  aria-label="Close menu"
                  whileTap={{ scale: 0.9, rotate: 90 }}
                >
                  <X size={22} />
                </motion.button>
              </div>

              <div className="flex h-[calc(100%-65px)] flex-col justify-between px-5 py-6">
                <div>
                  {/* Mobile nav links – staggered entry */}
                  <ul className="flex flex-col gap-1">
                    {navLinks.map((link, i) => {
                      const active = isActive(link.href)
                      return (
                        <motion.li
                          key={link.href}
                          initial={{ opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + i * 0.05, duration: 0.25, ease: 'easeOut' }}
                        >
                          <Link
                            href={`/${locale}${link.href === '/' ? '' : link.href}`}
                            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors"
                            style={{
                              color: active ? '#0B7A3B' : '#0F172A',
                              backgroundColor: active ? '#F0FDF4' : 'transparent',
                            }}
                            onClick={() => setMobileOpen(false)}
                          >
                            {active && (
                              <span className="h-5 w-[3px] rounded-full" style={{ backgroundColor: '#0B7A3B' }} />
                            )}
                            {link.label}
                          </Link>
                        </motion.li>
                      )
                    })}
                  </ul>

                  {/* Mobile language switcher */}
                  <motion.div
                    className="mt-8 flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Globe size={16} style={{ color: '#64748B' }} />
                    <span className="text-sm font-medium" style={{ color: '#64748B' }}>
                      {t('language')}
                    </span>
                    <div className="flex items-center gap-1 rounded-full border p-0.5" style={{ borderColor: '#E2E8F0' }}>
                      {LOCALES.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => switchLocale(loc)}
                          className="rounded-full px-3 py-1.5 text-xs font-semibold uppercase transition-all"
                          style={{
                            backgroundColor: locale === loc ? '#0B7A3B' : 'transparent',
                            color: locale === loc ? '#FFFFFF' : '#334155',
                          }}
                          aria-label={`Switch to ${loc}`}
                        >
                          {LOCALE_LABELS[loc]}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href={`/${locale}/contact`}
                    className="flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-center text-base font-semibold text-white transition-colors"
                    style={{ backgroundColor: '#0B7A3B' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('freeQuote')}
                    <ArrowRight size={18} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-[58px]" />
    </>
  )
}
