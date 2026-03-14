import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import ServicesContent from '@/components/services/ServicesContent'
import { SITE_URL } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'services' })

  const descriptions: Record<string, string> = {
    en: 'Professional commercial cleaning services in Ontario, Canada: office cleaning, disinfection, floor care, carpet cleaning, window washing, and more. Request a free quote.',
    es: 'Servicios profesionales de limpieza comercial en Ontario, Canadá: limpieza de oficinas, desinfección, cuidado de pisos, alfombras, ventanas y más. Solicite un presupuesto gratis.',
    fr: 'Services professionnels de nettoyage commercial en Ontario, Canada : nettoyage de bureaux, désinfection, entretien des planchers, tapis, vitres et plus. Demandez un devis gratuit.',
  }

  const keywords: Record<string, string[]> = {
    en: ['cleaning services Ontario', 'office cleaning Canada', 'commercial cleaning near me', 'disinfection services', 'floor care Ontario', 'janitorial company'],
    es: ['servicios de limpieza Ontario', 'limpieza de oficinas Canadá', 'empresa de limpieza cerca de mí', 'servicio de desinfección', 'cuidado de pisos Ontario'],
    fr: ['services de nettoyage Ontario', 'nettoyage de bureaux Canada', 'entreprise de nettoyage près de chez moi', 'désinfection Ontario'],
  }

  return {
    title: t('hero.title'),
    description: descriptions[locale] || descriptions.en,
    keywords: keywords[locale] || keywords.en,
    alternates: { canonical: `${SITE_URL}/${locale}/services` },
    openGraph: {
      url: `${SITE_URL}/${locale}/services`,
      title: t('hero.title'),
      description: descriptions[locale] || descriptions.en,
    },
  }
}

export default function ServicesPage() {
  return <ServicesContent />
}
