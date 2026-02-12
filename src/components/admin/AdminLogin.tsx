'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

      // Navigate to dashboard using the current admin path
      const currentPath = window.location.pathname
      const adminBase = currentPath.replace(/\/$/, '')
      router.push(`${adminBase}/dashboard`)
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full max-w-sm">
        <div className="rounded-xl border bg-white p-8 shadow-sm" style={{ borderColor: '#E2E8F0' }}>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#E7F6ED' }}>
              <Lock className="h-6 w-6" style={{ color: '#0B7A3B' }} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Admin Login</h1>
            <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>Parras General Services</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: '#334155' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#E2E8F0' }}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: '#334155' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#E2E8F0' }}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#0B7A3B' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
