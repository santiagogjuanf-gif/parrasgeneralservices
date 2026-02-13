'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'pgs-mascot-seen'

export default function MascotCleaner() {
  const [show, setShow] = useState(false)
  const [phase, setPhase] = useState<'cleaning' | 'done'>('cleaning')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = sessionStorage.getItem(STORAGE_KEY)
    if (!seen) {
      setShow(true)
      // Animation lasts ~4s, then fade out
      const timer = setTimeout(() => setPhase('done'), 4000)
      const hide = setTimeout(() => {
        setShow(false)
        sessionStorage.setItem(STORAGE_KEY, '1')
      }, 4800)
      return () => { clearTimeout(timer); clearTimeout(hide) }
    }
  }, [])

  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'done' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Dirt overlay — gets "cleaned" by a reveal mask that follows the mascot */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(139,119,80,0.18) 0%, rgba(120,100,60,0.12) 50%, rgba(139,119,80,0.18) 100%)',
              backdropFilter: 'blur(1px)',
            }}
            animate={{ clipPath: ['inset(0 0% 0 0)', 'inset(0 0% 0 100%)'] }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          />

          {/* Sparkle trail behind mascot */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ top: `${40 + i * 5}%` }}
              initial={{ left: '-5%', opacity: 0 }}
              animate={{ left: '105%', opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 4,
                ease: 'easeInOut',
                delay: i * 0.15,
                opacity: { duration: 4, times: [0, 0.1, 0.8, 1] },
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z"
                  fill={i % 2 === 0 ? '#D4A11E' : '#0B7A3B'}
                  opacity={0.7}
                />
              </svg>
            </motion.div>
          ))}

          {/* Mascot character moving left to right — centered vertically */}
          <motion.div
            className="absolute"
            style={{ top: '50%', marginTop: -110, width: 220, height: 220 }}
            initial={{ left: '-250px' }}
            animate={{ left: 'calc(100% + 50px)' }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/mascot-cleaner.png"
              alt="Parras mascot cleaning"
              width={220}
              height={220}
              style={{ objectFit: 'contain' }}
            />
          </motion.div>

          {/* Clean shine line that follows */}
          <motion.div
            className="absolute top-0 h-full w-[3px]"
            style={{
              background: 'linear-gradient(180deg, transparent 10%, rgba(11,122,59,0.3) 30%, rgba(212,161,30,0.4) 50%, rgba(11,122,59,0.3) 70%, transparent 90%)',
              boxShadow: '0 0 20px rgba(11,122,59,0.2)',
            }}
            initial={{ left: '-10px' }}
            animate={{ left: 'calc(100% + 10px)' }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
