'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const LOCALES = ['en', 'fr', 'es'] as const

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/services`, label: t('services') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
    setMobileOpen(false)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-200 bg-white ${
          scrolled ? 'shadow-md' : 'shadow-none'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="Parras General Services"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#F6F8FA]"
                  style={{ color: '#334155' }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop right section */}
          <div className="hidden items-center gap-3 lg:flex">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 rounded-md border p-0.5" style={{ borderColor: '#E2E8F0' }}>
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={`rounded px-2 py-1 text-xs font-semibold uppercase transition-colors ${
                    locale === loc
                      ? 'text-white'
                      : 'hover:bg-[#F6F8FA]'
                  }`}
                  style={{
                    backgroundColor: locale === loc ? '#0B7A3B' : 'transparent',
                    color: locale === loc ? '#FFFFFF' : '#334155',
                  }}
                  aria-label={`Switch to ${loc}`}
                >
                  {loc}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              href={`/${locale}/contact`}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#0B7A3B' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#096832')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0B7A3B')}
            >
              {t('freeQuote')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex items-center justify-center rounded-md p-2 lg:hidden"
            style={{ color: '#0F172A' }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </header>

      {/* Mobile slide-in panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: '#E2E8F0' }}>
                <Image
                  src="/images/logo.png"
                  alt="Parras General Services"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md p-2"
                  style={{ color: '#0F172A' }}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col px-4 py-6">
                {/* Mobile nav links */}
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-[#F6F8FA]"
                        style={{ color: '#0F172A' }}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Mobile language switcher */}
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: '#334155' }}>
                    {t('language')}:
                  </span>
                  <div className="flex items-center gap-1 rounded-md border p-0.5" style={{ borderColor: '#E2E8F0' }}>
                    {LOCALES.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        className={`rounded px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                          locale === loc
                            ? 'text-white'
                            : 'hover:bg-[#F6F8FA]'
                        }`}
                        style={{
                          backgroundColor: locale === loc ? '#0B7A3B' : 'transparent',
                          color: locale === loc ? '#FFFFFF' : '#334155',
                        }}
                        aria-label={`Switch to ${loc}`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile CTA */}
                <Link
                  href={`/${locale}/contact`}
                  className="mt-6 block rounded-lg px-5 py-3 text-center text-base font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#0B7A3B' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {t('freeQuote')}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  )
}
