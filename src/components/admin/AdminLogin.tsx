'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type AdminLocale,
  getAdminT,
  getTimeGreeting,
  getStoredAdminLocale,
  setStoredAdminLocale,
} from '@/lib/admin-i18n'

export default function AdminLogin() {
  const router = useRouter()
  const [lang, setLang] = useState<AdminLocale>('en')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [welcomeName, setWelcomeName] = useState('')

  useEffect(() => {
    setLang(getStoredAdminLocale())
  }, [])

  const t = getAdminT(lang)

  const toggleLang = () => {
    const next = lang === 'en' ? 'es' : 'en'
    setLang(next)
    setStoredAdminLocale(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      setWelcomeName(data.user?.fullName || username)
      setSuccess(true)

      setTimeout(() => {
        const currentPath = window.location.pathname.replace(/\/$/, '')
        const role = data.user?.role
        if (role === 'WORKER') {
          router.push(`${currentPath}/worker`)
        } else {
          router.push(`${currentPath}/dashboard`)
        }
      }, 2200)
    } catch {
      setError(t('login.error.connection'))
      setLoading(false)
    }
  }

  // Welcome overlay
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute h-[600px] w-[600px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', top: '10%', left: '20%' }}
            animate={{ scale: [1, 1.3, 1], x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute h-[500px] w-[500px] rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #0B7A3B 0%, transparent 70%)', bottom: '10%', right: '15%' }}
            animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}>
          <motion.div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #0B7A3B 0%, #10B981 100%)' }}
            initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}>
            <Shield size={36} className="text-white" />
          </motion.div>

          <motion.h1 className="mb-2 text-3xl font-bold text-white md:text-4xl"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}>
            {getTimeGreeting(lang)}, {welcomeName}!
          </motion.h1>

          <motion.p style={{ color: '#94A3B8' }} className="text-lg"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}>
            {t('login.redirecting')}
          </motion.p>

          <motion.div className="mx-auto mt-8 h-1 w-48 overflow-hidden rounded-full"
            style={{ backgroundColor: '#1E293B' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <motion.div className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #0B7A3B, #10B981)' }}
              initial={{ width: '0%' }} animate={{ width: '100%' }}
              transition={{ delay: 0.8, duration: 1.4, ease: 'easeInOut' }} />
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute h-[500px] w-[500px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', top: '-10%', left: '-5%' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute h-[400px] w-[400px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0B7A3B 0%, transparent 70%)', bottom: '-5%', right: '-5%' }}
          animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, -40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute h-[300px] w-[300px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)', top: '40%', right: '20%' }}
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
      </div>

      {/* Language toggle */}
      <motion.button onClick={toggleLang}
        className="absolute right-6 top-6 z-20 flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase backdrop-blur-md transition-colors hover:border-white/30"
        style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#94A3B8', backgroundColor: 'rgba(255,255,255,0.05)' }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
        {lang === 'en' ? 'Español' : 'English'}
      </motion.button>

      {/* Login card */}
      <motion.div className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}>
        <div className="rounded-2xl border p-8 shadow-2xl backdrop-blur-xl md:p-10"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderColor: 'rgba(255,255,255,0.1)',
            boxShadow: '0 0 80px rgba(16,185,129,0.06), 0 25px 50px rgba(0,0,0,0.3)',
          }}>

          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #0B7A3B 0%, #10B981 100%)' }}
              initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}>
              <Lock size={28} className="text-white" />
            </motion.div>
            <motion.h1 className="text-2xl font-bold text-white"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              {t('login.title')}
            </motion.h1>
            <motion.p className="mt-1 text-sm" style={{ color: '#94A3B8' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              {t('login.subtitle')}
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#CBD5E1' }}>
                {t('login.username')}
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                  className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                  autoComplete="username" placeholder="admin" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#CBD5E1' }}>
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  className="w-full rounded-xl border py-3 pl-11 pr-12 text-sm text-white placeholder-slate-500 transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                  autoComplete="current-password" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-0.5"
                  style={{ color: '#64748B' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p className="rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}
                  initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0B7A3B 0%, #10B981 100%)' }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                    {t('login.loading')}
                  </>
                ) : (
                  <>
                    {t('login.submit')}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </motion.button>
          </form>
        </div>

        <motion.p className="mt-6 text-center text-xs" style={{ color: '#475569' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          Parras General Services &copy; {new Date().getFullYear()}
        </motion.p>
      </motion.div>
    </div>
  )
}
