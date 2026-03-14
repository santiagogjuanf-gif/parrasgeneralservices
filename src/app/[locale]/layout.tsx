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
import { SITE_URL, SEO_COPY, buildLocalBusinessSchema } from '@/lib/seo'
import '../globals.css'

const LOCALES = ['en', 'es', 'fr'] as const
type Locale = (typeof LOCALES)[number]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = (LOCALES.includes(locale as Locale) ? locale : 'en') as Locale
  const copy = SEO_COPY[l]

  // Alternate URLs for hreflang
  const alternates: Record<string, string> = {}
  LOCALES.forEach((loc) => { alternates[loc] = `${SITE_URL}/${loc}` })
  alternates['x-default'] = `${SITE_URL}/en`

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: copy.title,
      template: `%s | Parras General Services`,
    },
    description: copy.description,
    keywords: copy.keywords,
    authors: [{ name: 'Parras General Services' }],
    creator: 'Parras General Services',
    publisher: 'Parras General Services',
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    alternates: {
      canonical: `${SITE_URL}/${l}`,
      languages: alternates,
    },
    openGraph: {
      type: 'website',
      locale: l === 'es' ? 'es_CA' : l === 'fr' ? 'fr_CA' : 'en_CA',
      alternateLocale: l !== 'en' ? ['en_CA'] : ['es_CA', 'fr_CA'],
      url: `${SITE_URL}/${l}`,
      siteName: 'Parras General Services',
      title: copy.title,
      description: copy.description,
      images: [
        {
          url: copy.ogImage,
          width: 1200,
          height: 630,
          alt: 'Parras General Services – Commercial Cleaning in Ontario, Canada',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [copy.ogImage],
    },
    icons: {
      icon: [
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      shortcut: '/icons/icon-192.png',
    },
    verification: {
      // google: 'YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN',  ← add once verified
    },
  }
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
  const schema = buildLocalBusinessSchema(locale)

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* LocalBusiness JSON-LD — helps Google understand who we are and where */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
