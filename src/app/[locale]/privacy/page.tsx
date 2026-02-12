import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import PrivacyContent from '@/components/privacy/PrivacyContent'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })
  return {
    title: t('title'),
  }
}

export default function PrivacyPage() {
  return <PrivacyContent />
}
