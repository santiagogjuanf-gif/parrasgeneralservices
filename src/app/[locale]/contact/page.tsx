import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import ContactContent from '@/components/contact/ContactContent'
import { SITE_URL } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })

  const descriptions: Record<string, string> = {
    en: 'Contact Parras General Services for a free commercial cleaning quote in Ontario, Canada. Call +1 (519) 385-5713 or fill out our form — we respond quickly.',
    es: 'Contacte a Parras General Services para un presupuesto gratuito de limpieza comercial en Ontario, Canadá. Llame al +1 (519) 385-5713 o complete nuestro formulario.',
    fr: 'Contactez Parras General Services pour un devis de nettoyage commercial gratuit en Ontario, Canada. Appelez le +1 (519) 385-5713 ou remplissez notre formulaire.',
  }

  return {
    title: t('hero.title'),
    description: descriptions[locale] || descriptions.en,
    keywords: ['contact cleaning company Ontario', 'free cleaning quote Canada', 'limpieza comercial presupuesto gratis'],
    alternates: { canonical: `${SITE_URL}/${locale}/contact` },
    openGraph: {
      url: `${SITE_URL}/${locale}/contact`,
      title: t('hero.title'),
      description: descriptions[locale] || descriptions.en,
    },
  }
}

export default function ContactPage() {
  return <ContactContent />
}
