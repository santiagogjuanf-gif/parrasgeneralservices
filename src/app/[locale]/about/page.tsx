import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import AboutContent from '@/components/about/AboutContent'
import { SITE_URL } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  const descriptions: Record<string, string> = {
    en: 'Parras General Services is a trusted commercial cleaning company in Ontario, Canada, founded in 2019. Learn about our mission, values, and commitment to quality.',
    es: 'Parras General Services es una empresa confiable de limpieza comercial en Ontario, Canadá, fundada en 2019. Conoce nuestra misión, valores y compromiso con la calidad.',
    fr: 'Parras General Services est une entreprise de nettoyage commercial de confiance en Ontario, Canada, fondée en 2019. Découvrez notre mission et nos valeurs.',
  }

  return {
    title: t('hero.title'),
    description: descriptions[locale] || descriptions.en,
    keywords: ['about Parras General Services', 'cleaning company Ontario', 'commercial cleaning Canada since 2019'],
    alternates: { canonical: `${SITE_URL}/${locale}/about` },
    openGraph: {
      url: `${SITE_URL}/${locale}/about`,
      title: t('hero.title'),
      description: descriptions[locale] || descriptions.en,
    },
  }
}

export default function AboutPage() {
  return <AboutContent />
}
