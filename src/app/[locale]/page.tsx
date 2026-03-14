import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import TrustBadges from '@/components/home/TrustBadges'
import HowWeWork from '@/components/home/HowWeWork'
import ServicesPreview from '@/components/home/ServicesPreview'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import CTABanner from '@/components/home/CTABanner'
import { SITE_URL, SEO_COPY } from '@/lib/seo'

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

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical: `${SITE_URL}/${l}`,
      languages: Object.fromEntries(LOCALES.map((loc) => [loc, `${SITE_URL}/${loc}`])),
    },
    openGraph: {
      url: `${SITE_URL}/${l}`,
      title: copy.title,
      description: copy.description,
    },
  }
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <HowWeWork />
      <ServicesPreview />
      <WhyChooseUs />
      <CTABanner />
    </>
  )
}
