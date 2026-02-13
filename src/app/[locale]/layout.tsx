import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CookieConsent from '@/components/layout/CookieConsent'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import BackToTop from '@/components/layout/BackToTop'
import MascotCleaner from '@/components/ui/MascotCleaner'
import '../globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Parras General Services | Commercial Cleaning in Canada',
    template: '%s | Parras General Services',
  },
  description: 'Professional commercial cleaning and maintenance services in Canada. Office cleaning, disinfection, floor care, and more.',
  keywords: ['commercial cleaning', 'office cleaning', 'janitorial services', 'Canada', 'cleaning company'],
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ backgroundColor: '#FFFFFF', color: '#0F172A', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
          <BackToTop />
          <CookieConsent />
          <MascotCleaner />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
