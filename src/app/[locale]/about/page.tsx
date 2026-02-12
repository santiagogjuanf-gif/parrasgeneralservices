import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import AboutContent from '@/components/about/AboutContent'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return {
    title: t('hero.title'),
    description: t('hero.subtitle'),
  }
}

export default function AboutPage() {
  return <AboutContent />
}
