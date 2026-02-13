import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import TermsContent from '@/components/terms/TermsContent'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'terms' })
  return {
    title: t('title'),
  }
}

export default function TermsPage() {
  return <TermsContent />
}
