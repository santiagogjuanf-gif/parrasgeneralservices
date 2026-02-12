import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CookieConsent from '@/components/layout/CookieConsent'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import BackToTop from '@/components/layout/BackToTop'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Parras General Services | Commercial Cleaning in Canada',
    template: '%s | Parras General Services',
  },
  description: 'Professional commercial cleaning and maintenance services. Mexican-owned in Canada. Office cleaning, disinfection, floor care, and more.',
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
    <html lang={locale} className={`${montserrat.variable} ${inter.variable}`}>
      <body className={`${inter.className} antialiased`} style={{ backgroundColor: '#FFFFFF', color: '#0F172A' }}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
          <BackToTop />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
