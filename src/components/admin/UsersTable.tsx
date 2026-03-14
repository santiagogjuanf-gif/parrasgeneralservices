'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Shield, UserIcon, X, Pencil, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminLang } from './AdminDashboardShell'

interface UserRow {
  id: number
  username: string
  fullName: string
  role: string
  createdAt: string
  forcePasswordChange: boolean
}

const ROLES = ['WORKER', 'BOSS', 'ADMIN'] as const
const PAGE_SIZE = 10

function roleColor(role: string) {
  if (role === 'ADMIN') return { bg: '#F5F3FF', color: '#7C3AED', avatar: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }
  if (role === 'BOSS') return { bg: '#FEF3C7', color: '#D97706', avatar: 'linear-gradient(135deg, #D97706, #F59E0B)' }
  return { bg: '#F0FDF4', color: '#0B7A3B', avatar: 'linear-gradient(135deg, #0B7A3B, #10B981)' }
}

export default function UsersTable() {
  const { t } = useAdminLang()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ username: '', password: '', fullName: '', role: 'WORKER', forcePasswordChange: false })
  const [showCreatePw, setShowCreatePw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState('')

  // Edit modal
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [editForm, setEditForm] = useState({ fullName: '', username: '', role: 'WORKER', password: '', forcePasswordChange: false })
  const [showEditPw, setShowEditPw] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const load = async () => {
    try {
      const data = await fetch('/api/admin/users').then(r => r.json())
      if (Array.isArray(data)) setUsers(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const paginated = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))

  const roleName = (role: string) => {
    if (role === 'ADMIN') return t('users.roleAdmin')
    if (role === 'BOSS') return t('users.roleBoss')
    return t('users.roleWorker')
  }

  const handleCreate = async () => {
    setCreateError('')
    if (!createForm.username || !createForm.password || !createForm.fullName) {
      setCreateError(t('users.errorRequired'))
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error); setSaving(false); return }
      setShowCreate(false)
      setCreateForm({ username: '', password: '', fullName: '', role: 'WORKER', forcePasswordChange: false })
      load()
    } catch { setCreateError('Connection error') }
    setSaving(false)
  }

  const openEdit = (u: UserRow) => {
    setEditing(u)
    setEditForm({ fullName: u.fullName, username: u.username, role: u.role, password: '', forcePasswordChange: u.forcePasswordChange })
    setEditError('')
    setShowEditPw(false)
  }

  const handleEdit = async () => {
    if (!editing) return
    setEditError('')
    if (!editForm.fullName || !editForm.username) { setEditError(t('users.errorRequired')); return }
    setEditSaving(true)
    try {
      const body: Record<string, unknown> = {
        fullName: editForm.fullName,
        username: editForm.username,
        role: editForm.role,
        forcePasswordChange: editForm.forcePasswordChange,
      }
      if (editForm.password) body.password = editForm.password
      const res = await fetch(`/api/admin/users/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setEditError(data.error); setEditSaving(false); return }
      setEditing(null)
      load()
    } catch { setEditError('Connection error') }
    setEditSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('users.deleteConfirm'))) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <motion.div className="h-8 w-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>{t('users.title')}</h2>
          <p className="text-sm" style={{ color: '#94A3B8' }}>{users.length} {t('users.usersCount')}</p>
        </div>
        <motion.button onClick={() => { setShowCreate(true); setCreateError('') }}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Plus size={16} className="relative" /><span className="relative">{t('users.addUser')}</span>
        </motion.button>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <motion.div className="rounded-2xl border bg-white p-12 text-center" style={{ borderColor: '#E2E8F0' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <UserIcon size={40} style={{ color: '#CBD5E1' }} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold" style={{ color: '#0F172A' }}>{t('users.empty')}</h3>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>{t('users.emptyDesc')}</p>
        </motion.div>
      ) : (
        <>
          <motion.div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: '#E2E8F0' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    {[t('users.nameCol'), t('users.usernameCol'), t('users.roleCol'), t('users.dateCol'), t('users.actionsCol')].map(h => (
                      <th key={h} className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(u => {
                    const c = roleColor(u.role)
                    return (
                      <tr key={u.id} className="transition-colors hover:bg-gray-50" style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td className="px-6 py-4 font-medium" style={{ color: '#0F172A' }}>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                              style={{ background: c.avatar }}>
                              {u.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              {u.fullName}
                              {u.forcePasswordChange && (
                                <span className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium"
                                  style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                                  <RefreshCw size={9} className="inline mr-0.5" />pw
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4" style={{ color: '#64748B' }}>{u.username}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{ backgroundColor: c.bg, color: c.color }}>
                            <Shield size={12} />{roleName(u.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4" style={{ color: '#94A3B8' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(u)} className="rounded-lg p-2 hover:bg-blue-50" style={{ color: '#3B82F6' }}>
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDelete(u.id)} className="rounded-lg p-2 hover:bg-red-50" style={{ color: '#EF4444' }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className="h-8 w-8 rounded-lg text-sm font-medium transition-colors"
                  style={p === page
                    ? { background: 'linear-gradient(135deg, #0B7A3B, #10B981)', color: '#fff' }
                    : { backgroundColor: '#F1F5F9', color: '#64748B' }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── CREATE MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mx-4 w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: '#E2E8F0' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: '#0F172A' }}>{t('users.addUser')}</h3>
                <button onClick={() => setShowCreate(false)} className="rounded-lg p-1 hover:bg-gray-100">
                  <X size={18} style={{ color: '#64748B' }} />
                </button>
              </div>

              {createError && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>{createError}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('users.fullName')}</label>
                  <input type="text" value={createForm.fullName}
                    onChange={e => setCreateForm(f => ({ ...f, fullName: e.target.value }))}
                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('users.username')}</label>
                  <input type="text" value={createForm.username}
                    onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))}
                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('users.password')}</label>
                  <div className="relative">
                    <input type={showCreatePw ? 'text' : 'password'} value={createForm.password}
                      onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                      autoComplete="new-password"
                      className="w-full rounded-xl border px-4 py-3 pr-12 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{ borderColor: '#E2E8F0' }} />
                    <button type="button" onClick={() => setShowCreatePw(!showCreatePw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                      {showCreatePw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('users.role')}</label>
                  <select value={createForm.role}
                    onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }}>
                    {ROLES.map(r => <option key={r} value={r}>{roleName(r)}</option>)}
                  </select>
                </div>
                <label className="flex cursor-pointer items-center gap-3">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-md transition-all ${createForm.forcePasswordChange ? 'bg-emerald-500' : 'border-2'}`}
                    style={createForm.forcePasswordChange ? {} : { borderColor: '#CBD5E1' }}
                    onClick={() => setCreateForm(f => ({ ...f, forcePasswordChange: !f.forcePasswordChange }))}>
                    {createForm.forcePasswordChange && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <span className="text-sm" style={{ color: '#334155' }}>
                    Pedir cambio de contraseña al iniciar sesión
                  </span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowCreate(false)}
                  className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>{t('users.cancel')}</button>
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

      {/* ── EDIT MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {editing && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mx-4 w-full max-w-md rounded-2xl border bg-white p-6" style={{ borderColor: '#E2E8F0' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: '#0F172A' }}>Editar usuario</h3>
                <button onClick={() => setEditing(null)} className="rounded-lg p-1 hover:bg-gray-100">
                  <X size={18} style={{ color: '#64748B' }} />
                </button>
              </div>

              {editError && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>{editError}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('users.fullName')}</label>
                  <input type="text" value={editForm.fullName}
                    onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('users.username')}</label>
                  <input type="text" value={editForm.username}
                    onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('users.role')}</label>
                  <select value={editForm.role}
                    onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }}>
                    {ROLES.map(r => <option key={r} value={r}>{roleName(r)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>
                    Nueva contraseña <span style={{ color: '#94A3B8' }}>(dejar vacío para no cambiar)</span>
                  </label>
                  <div className="relative">
                    <input type={showEditPw ? 'text' : 'password'} value={editForm.password}
                      onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                      autoComplete="new-password" placeholder="••••••••"
                      className="w-full rounded-xl border px-4 py-3 pr-12 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{ borderColor: '#E2E8F0' }} />
                    <button type="button" onClick={() => setShowEditPw(!showEditPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
                      {showEditPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-3">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-md transition-all ${editForm.forcePasswordChange ? 'bg-emerald-500' : 'border-2'}`}
                    style={editForm.forcePasswordChange ? {} : { borderColor: '#CBD5E1' }}
                    onClick={() => setEditForm(f => ({ ...f, forcePasswordChange: !f.forcePasswordChange }))}>
                    {editForm.forcePasswordChange && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <span className="text-sm" style={{ color: '#334155' }}>
                    Pedir cambio de contraseña al iniciar sesión
                  </span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setEditing(null)}
                  className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>{t('users.cancel')}</button>
                <motion.button onClick={handleEdit} disabled={editSaving}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  {editSaving ? 'Guardando…' : 'Guardar cambios'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
