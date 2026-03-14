'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (newPassword !== confirm) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Error al cambiar contraseña.')
        setLoading(false)
        return
      }
      // Redirect based on role from /api/auth/me
      const me = await fetch('/api/auth/me').then(r => r.json())
      if (me.role === 'ADMIN' || me.role === 'BOSS') {
        router.push(window.location.pathname.replace('/change-password', '/dashboard'))
      } else {
        router.push(window.location.pathname.replace('/change-password', '/worker'))
      }
    } catch {
      setError('Error de conexión.')
    }
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
      <motion.div className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="rounded-2xl border p-8 backdrop-blur-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #0B7A3B 0%, #10B981 100%)' }}>
              <ShieldCheck size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Cambiar Contraseña</h1>
            <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>
              Por seguridad, debes establecer una nueva contraseña.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#CBD5E1' }}>
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                <input type={show ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password"
                  className="w-full rounded-xl border py-3 pl-11 pr-12 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                  placeholder="Mínimo 6 caracteres" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#CBD5E1' }}>
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
                <input type={show ? 'text' : 'password'} value={confirm}
                  onChange={e => setConfirm(e.target.value)} required autoComplete="new-password"
                  className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                  placeholder="Repite la contraseña" />
              </div>
            </div>
            <motion.button type="submit" disabled={loading}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0B7A3B 0%, #10B981 100%)' }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {loading ? 'Guardando…' : 'Cambiar Contraseña'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
