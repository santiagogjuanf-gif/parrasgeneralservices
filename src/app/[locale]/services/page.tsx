import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import ServicesContent from '@/components/services/ServicesContent'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'services' })
  return {
    title: t('hero.title'),
    description: t('hero.subtitle'),
  }
}

export default function ServicesPage() {
  return <ServicesContent />
}
