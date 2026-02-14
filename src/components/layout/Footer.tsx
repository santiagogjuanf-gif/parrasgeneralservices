'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()
  const year = new Date().getFullYear()

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/services`, label: t('services') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]

  return (
    <footer style={{ backgroundColor: '#0F172A' }}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href={`/${locale}`} className="inline-flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Parras General Services"
                width={140}
                height={36}
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-lg font-semibold text-white">
              Parras General Services
            </p>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {t('tagline')}
            </p>
            <p
              className="mt-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
              style={{ borderColor: '#334155', color: '#D4A11E' }}
            >
              <MapPin size={12} />
              {t('mexicanOwned')}
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('navigation')}
            </h3>
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: '#94A3B8' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('contactUs')}
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="tel:+1 (519) 385-5713"
                  className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
                  style={{ color: '#94A3B8' }}
                >
                  <Phone size={14} />
                  +1 (519) 385-5713
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@parrasgeneralservices.ca"
                  className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
                  style={{ color: '#94A3B8' }}
                >
                  <Mail size={14} />
                  info@parrasgeneralservices.ca
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('legal')}
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: '#94A3B8' }}
                >
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: '#94A3B8' }}
                >
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 border-t pt-6"
          style={{ borderColor: '#1E293B' }}
        >
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-sm" style={{ color: '#64748B' }}>
              &copy; {year} Parras General Services&trade;. {t('allRightsReserved')}
            </p>
            <p className="text-sm" style={{ color: '#64748B' }}>
              {t('designedBy')}{' '}
              <a
                href="https://www.cerberusdev.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:underline"
                style={{ color: '#94A3B8' }}
              >
                Cerberus Dev
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
