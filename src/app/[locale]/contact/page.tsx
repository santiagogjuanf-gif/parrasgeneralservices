import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import ContactContent from '@/components/contact/ContactContent'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  return {
    title: t('hero.title'),
    description: t('hero.subtitle'),
  }
}

export default function ContactPage() {
  return <ContactContent />
}
