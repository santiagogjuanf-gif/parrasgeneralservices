'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, Shield, BarChart3, Megaphone, X } from 'lucide-react'

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'cookie-consent'

function getStoredPreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CookiePreferences) : null
  } catch {
    return null
  }
}

function savePreferences(prefs: CookiePreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export default function CookieConsent() {
  const t = useTranslations('cookie')
  const [visible, setVisible] = useState(false)
  const [showManage, setShowManage] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const stored = getStoredPreferences()
    if (!stored) {
      // Small delay so the banner slides in after page loads
      const timer = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = useCallback(() => {
    const prefs: CookiePreferences = { essential: true, analytics: true, marketing: true }
    savePreferences(prefs)
    setVisible(false)
  }, [])

  const handleEssentialOnly = useCallback(() => {
    const prefs: CookiePreferences = { essential: true, analytics: false, marketing: false }
    savePreferences(prefs)
    setVisible(false)
  }, [])

  const handleSavePreferences = useCallback(() => {
    savePreferences({ ...preferences, essential: true })
    setVisible(false)
  }, [preferences])

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4"
          initial={reducedMotion ? { opacity: 0 } : { y: '100%', opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: '100%', opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <div
            className="w-full max-w-2xl rounded-xl border bg-white p-5 shadow-2xl"
            style={{ borderColor: '#E2E8F0' }}
          >
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Cookie size={20} style={{ color: '#D4A11E' }} />
                <h3 className="text-base font-semibold" style={{ color: '#0F172A' }}>
                  {t('title')}
                </h3>
              </div>
              <button
                onClick={handleEssentialOnly}
                className="rounded-md p-1 transition-colors hover:bg-[#F6F8FA]"
                style={{ color: '#334155' }}
                aria-label={t('close')}
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-4 text-sm leading-relaxed" style={{ color: '#334155' }}>
              {t('description')}
            </p>

            {/* Manage Preferences Panel */}
            <AnimatePresence>
              {showManage && (
                <motion.div
                  className="mb-4 space-y-3 rounded-lg p-4"
                  style={{ backgroundColor: '#F6F8FA' }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {/* Essential */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={16} style={{ color: '#0B7A3B' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#0F172A' }}>
                          {t('essential')}
                        </p>
                        <p className="text-xs" style={{ color: '#64748B' }}>
                          {t('essentialDesc')}
                        </p>
                      </div>
                    </div>
                    <div
                      className="relative h-6 w-10 cursor-not-allowed rounded-full"
                      style={{ backgroundColor: '#0B7A3B' }}
                      title={t('alwaysOn')}
                    >
                      <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={16} style={{ color: '#334155' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#0F172A' }}>
                          {t('analytics')}
                        </p>
                        <p className="text-xs" style={{ color: '#64748B' }}>
                          {t('analyticsDesc')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setPreferences((prev) => ({ ...prev, analytics: !prev.analytics }))
                      }
                      className="relative h-6 w-10 rounded-full transition-colors"
                      style={{
                        backgroundColor: preferences.analytics ? '#0B7A3B' : '#CBD5E1',
                      }}
                      role="switch"
                      aria-checked={preferences.analytics}
                      aria-label={t('analytics')}
                    >
                      <span
                        className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all"
                        style={{
                          left: preferences.analytics ? 'calc(100% - 1.25rem)' : '0.25rem',
                        }}
                      />
                    </button>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone size={16} style={{ color: '#334155' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#0F172A' }}>
                          {t('marketing')}
                        </p>
                        <p className="text-xs" style={{ color: '#64748B' }}>
                          {t('marketingDesc')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setPreferences((prev) => ({ ...prev, marketing: !prev.marketing }))
                      }
                      className="relative h-6 w-10 rounded-full transition-colors"
                      style={{
                        backgroundColor: preferences.marketing ? '#0B7A3B' : '#CBD5E1',
                      }}
                      role="switch"
                      aria-checked={preferences.marketing}
                      aria-label={t('marketing')}
                    >
                      <span
                        className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all"
                        style={{
                          left: preferences.marketing ? 'calc(100% - 1.25rem)' : '0.25rem',
                        }}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              {!showManage ? (
                <button
                  onClick={() => setShowManage(true)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-[#F6F8FA]"
                  style={{ borderColor: '#E2E8F0', color: '#334155' }}
                >
                  {t('managePreferences')}
                </button>
              ) : (
                <button
                  onClick={handleSavePreferences}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-[#F6F8FA]"
                  style={{ borderColor: '#E2E8F0', color: '#334155' }}
                >
                  {t('savePreferences')}
                </button>
              )}

              <button
                onClick={handleEssentialOnly}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-[#F6F8FA]"
                style={{ borderColor: '#E2E8F0', color: '#334155' }}
              >
                {t('onlyEssential')}
              </button>

              <button
                onClick={handleAcceptAll}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: '#0B7A3B' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#096832')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0B7A3B')}
              >
                {t('acceptAll')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
