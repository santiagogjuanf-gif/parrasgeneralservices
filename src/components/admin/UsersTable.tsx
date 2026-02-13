'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Shield, UserIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminLang } from './AdminDashboardShell'

interface UserRow {
  id: number
  username: string
  fullName: string
  role: string
  createdAt: string
}

export default function UsersTable() {
  const { t } = useAdminLang()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', role: 'STAFF' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setUsers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    setError('')
    if (!formData.username || !formData.password || !formData.fullName) {
      setError(t('users.errorRequired'))
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setSaving(false); return }
      setShowForm(false)
      setFormData({ username: '', password: '', fullName: '', role: 'STAFF' })
      load()
    } catch {
      setError('Connection error')
    }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('users.deleteConfirm'))) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <motion.div className="h-8 w-8 rounded-lg"
          style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>{t('users.title')}</h2>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            {users.length} {t('users.usersCount')}
          </p>
        </div>
        <motion.button onClick={() => setShowForm(true)}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Plus size={16} className="relative" />
          <span className="relative">{t('users.addUser')}</span>
        </motion.button>
      </div>

      {/* Create user modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}>
            <motion.div className="mx-4 w-full max-w-md rounded-2xl border bg-white p-6"
              style={{ borderColor: '#E2E8F0' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: '#0F172A' }}>{t('users.addUser')}</h3>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-gray-100">
                  <X size={18} style={{ color: '#64748B' }} />
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('users.fullName')}</label>
                  <input type="text" value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('users.username')}</label>
                  <input type="text" value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('users.password')}</label>
                  <input type="password" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('users.role')}</label>
                  <select value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }}>
                    <option value="STAFF">{t('users.roleStaff')}</option>
                    <option value="ADMIN">{t('users.roleAdmin')}</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowForm(false)}
                  className="rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                  {t('users.cancel')}
                </button>
                <motion.button onClick={handleCreate} disabled={saving}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  {saving ? t('users.creating') : t('users.create')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {users.length === 0 ? (
        <motion.div className="rounded-2xl border bg-white p-12 text-center"
          style={{ borderColor: '#E2E8F0' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <UserIcon size={40} style={{ color: '#CBD5E1' }} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold" style={{ color: '#0F172A' }}>{t('users.empty')}</h3>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>{t('users.emptyDesc')}</p>
        </motion.div>
      ) : (
        <motion.div className="overflow-hidden rounded-2xl border bg-white"
          style={{ borderColor: '#E2E8F0' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{t('users.nameCol')}</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{t('users.usernameCol')}</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{t('users.roleCol')}</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{t('users.dateCol')}</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{t('users.actionsCol')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-gray-50"
                    style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td className="px-6 py-4 font-medium" style={{ color: '#0F172A' }}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                          style={{ background: u.role === 'ADMIN' ? 'linear-gradient(135deg, #7C3AED, #8B5CF6)' : 'linear-gradient(135deg, #0B7A3B, #10B981)' }}>
                          {u.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        {u.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4" style={{ color: '#64748B' }}>{u.username}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={u.role === 'ADMIN'
                          ? { backgroundColor: '#F5F3FF', color: '#7C3AED' }
                          : { backgroundColor: '#F0FDF4', color: '#0B7A3B' }}>
                        <Shield size={12} />
                        {u.role === 'ADMIN' ? t('users.roleAdmin') : t('users.roleStaff')}
                      </span>
                    </td>
                    <td className="px-6 py-4" style={{ color: '#94A3B8' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(u.id)}
                        className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
