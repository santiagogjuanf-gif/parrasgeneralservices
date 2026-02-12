'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WhatsAppButton() {
  const t = useTranslations('whatsapp')
  const [hovered, setHovered] = useState(false)

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  const defaultMessage = t('defaultMessage')

  const handleClick = () => {
    const encoded = encodeURIComponent(defaultMessage)
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank', 'noopener,noreferrer')
  }

  if (!phoneNumber) return null

  return (
    <div className="fixed bottom-24 right-6 z-50 flex items-center gap-2">
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="whitespace-nowrap rounded-lg bg-white px-3 py-2 text-sm font-medium shadow-lg"
            style={{ color: '#0F172A', borderColor: '#E2E8F0', border: '1px solid #E2E8F0' }}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {t('tooltip')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ backgroundColor: '#25D366', focusVisibleRingColor: '#25D366' }}
        aria-label={t('tooltip')}
      >
        <MessageCircle size={26} fill="white" stroke="white" />

        {/* Pulse animation ring */}
        <span
          className="absolute inset-0 animate-ping rounded-full opacity-30"
          style={{ backgroundColor: '#25D366', animationDuration: '2.5s' }}
        />
      </button>

      {/* Reduced motion: disable pulse via CSS */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-ping {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
