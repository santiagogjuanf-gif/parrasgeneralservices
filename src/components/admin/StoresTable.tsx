'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Pencil, X, UserPlus, Store, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminLang } from './AdminDashboardShell'
import ConfirmModal from './ConfirmModal'

interface StoreTask { id?: number; label: string; count?: number | null }
interface StoreWorker { id: number; userId: number; user: { id: number; fullName: string; role: string } }
interface StoreRow {
  id: number; name: string; address: string; days: string
  tasks: StoreTask[]
  workers: StoreWorker[]
}
interface WorkerOption { id: number; fullName: string; role: string }

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LABELS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function StatusBadge({ days, lang }: { days: string; lang: string }) {
  const active = days.split(',').filter(Boolean)
  const labels = lang === 'es' ? DAY_LABELS_ES : DAY_LABELS
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((d, i) => (
        <span key={i} className="rounded px-1.5 py-0.5 text-[10px] font-medium"
          style={active.includes(String(i))
            ? { backgroundColor: '#D1FAE5', color: '#065F46' }
            : { backgroundColor: '#F1F5F9', color: '#94A3B8' }}>
          {d}
        </span>
      ))}
    </div>
  )
}

const PRESET_TASKS_ES = [
  { label: 'Lavado general con máquina', count: null },
  { label: 'Pulido de pisos', count: null },
  { label: 'Limpieza de baños', count: 1 },
  { label: 'Limpieza de oficinas', count: 1 },
  { label: 'Limpieza de estacionamiento', count: null },
  { label: 'Limpieza de vidrios', count: null },
]

const PRESET_TASKS_EN = [
  { label: 'General machine wash', count: null },
  { label: 'Floor polishing', count: null },
  { label: 'Bathroom cleaning', count: 1 },
  { label: 'Office cleaning', count: 1 },
  { label: 'Parking lot cleaning', count: null },
  { label: 'Window cleaning', count: null },
]

const PAGE_SIZE = 10

export default function StoresTable() {
  const { t, lang } = useAdminLang()
  const [stores, setStores] = useState<StoreRow[]>([])
  const [workers, setWorkers] = useState<WorkerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<StoreRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [assignStoreId, setAssignStoreId] = useState<number | null>(null)
  const [assignUserId, setAssignUserId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [page, setPage] = useState(1)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const [form, setForm] = useState({
    name: '', address: '',
    days: ['1', '2', '3', '4', '5'],
    tasks: [] as StoreTask[],
  })

  const load = async () => {
    try {
      const [sr, wr] = await Promise.all([
        fetch('/api/admin/stores').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
      ])
      if (Array.isArray(sr)) setStores(sr)
      if (Array.isArray(wr)) setWorkers(wr.filter((u: WorkerOption) => u.role === 'WORKER'))
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', address: '', days: ['1','2','3','4','5'], tasks: [] })
    setError('')
    setShowForm(true)
  }

  const openEdit = (s: StoreRow) => {
    setEditing(s)
    setForm({
      name: s.name,
      address: s.address,
      days: s.days.split(',').filter(Boolean),
      tasks: s.tasks.map(t => ({ id: t.id, label: t.label, count: t.count })),
    })
    setError('')
    setShowForm(true)
  }

  const toggleDay = (d: string) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d],
    }))
  }

  const addTask = () => setForm(f => ({ ...f, tasks: [...f.tasks, { label: '', count: null }] }))
  const addPreset = (preset: StoreTask) => setForm(f => ({ ...f, tasks: [...f.tasks, { ...preset }] }))
  const removeTask = (i: number) => setForm(f => ({ ...f, tasks: f.tasks.filter((_, idx) => idx !== i) }))
  const updateTask = (i: number, field: 'label' | 'count', val: string) =>
    setForm(f => ({ ...f, tasks: f.tasks.map((t, idx) => idx === i ? { ...t, [field]: field === 'count' ? (val === '' ? null : Number(val)) : val } : t) }))

  const handleSave = async () => {
    setError('')
    if (!form.name.trim() || !form.address.trim()) { setError(t('stores.errorRequired')); return }
    setSaving(true)
    const body = { name: form.name.trim(), address: form.address.trim(), days: form.days.join(','), tasks: form.tasks.filter(t => t.label.trim()) }
    const url = editing ? `/api/admin/stores/${editing.id}` : '/api/admin/stores'
    const method = editing ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Error'); setSaving(false); return }
      setShowForm(false)
      load()
    } catch { setError('Connection error') }
    setSaving(false)
  }

  const handleDelete = (id: number) => setConfirmDeleteId(id)

  const doDelete = async () => {
    if (confirmDeleteId === null) return
    await fetch(`/api/admin/stores/${confirmDeleteId}`, { method: 'DELETE' })
    setConfirmDeleteId(null)
    load()
  }

  const handleAssign = async () => {
    if (!assignUserId || !assignStoreId) return
    setAssigning(true)
    await fetch(`/api/admin/stores/${assignStoreId}/workers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: Number(assignUserId) }),
    })
    setAssigning(false)
    setAssignStoreId(null)
    setAssignUserId('')
    load()
  }

  const handleRemoveWorker = async (storeId: number, userId: number) => {
    await fetch(`/api/admin/stores/${storeId}/workers`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    load()
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <motion.div className="h-8 w-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
    </div>
  )

  const dayLabels = lang === 'es' ? DAY_LABELS_ES : DAY_LABELS
  const presetTasks = lang === 'es' ? PRESET_TASKS_ES : PRESET_TASKS_EN
  const totalPages = Math.ceil(stores.length / PAGE_SIZE)
  const pagedStores = stores.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <ConfirmModal
        open={confirmDeleteId !== null}
        message={t('stores.deleteConfirm')}
        onConfirm={doDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>{t('stores.title')}</h2>
          <p className="text-sm" style={{ color: '#94A3B8' }}>{stores.length} {t('stores.count')}</p>
        </div>
        <motion.button onClick={openCreate}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Plus size={16} className="relative" /><span className="relative">{t('stores.add')}</span>
        </motion.button>
      </div>

      {/* Table */}
      {stores.length === 0 ? (
        <motion.div className="rounded-2xl border bg-white p-12 text-center" style={{ borderColor: '#E2E8F0' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Store size={40} style={{ color: '#CBD5E1' }} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold" style={{ color: '#0F172A' }}>{t('stores.empty')}</h3>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>{t('stores.emptyDesc')}</p>
        </motion.div>
      ) : (
        <motion.div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: '#E2E8F0' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{t('stores.nameCol')}</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{t('stores.addressCol')}</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{t('stores.days')}</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{t('stores.workersCol')}</th>
                  <th className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{t('stores.actionsCol')}</th>
                </tr>
              </thead>
              <tbody>
                {pagedStores.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-gray-50" style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td className="px-6 py-4 font-medium" style={{ color: '#0F172A' }}>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}>
                          <Store size={14} className="text-white" />
                        </div>
                        {s.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#64748B' }}>{s.address}</td>
                    <td className="px-6 py-4"><StatusBadge days={s.days} lang={lang} /></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {s.workers.length === 0 ? (
                          <span className="text-xs" style={{ color: '#94A3B8' }}>{t('stores.noWorkers')}</span>
                        ) : (
                          s.workers.map(w => (
                            <span key={w.id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                              style={{ backgroundColor: '#F0FDF4', color: '#0B7A3B' }}>
                              {w.user.fullName}
                              <button onClick={() => handleRemoveWorker(s.id, w.userId)} className="ml-0.5 hover:text-red-500">
                                <X size={10} />
                              </button>
                            </span>
                          ))
                        )}
                        <button onClick={() => { setAssignStoreId(s.id); setAssignUserId('') }}
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors hover:border-emerald-400 hover:text-emerald-600"
                          style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                          <UserPlus size={10} />{t('stores.assign')}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="rounded-lg p-2 transition-colors hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="rounded-lg p-2 transition-colors hover:bg-red-50"
                          style={{ color: '#EF4444' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 border-t px-6 py-3" style={{ borderColor: '#E2E8F0' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className="h-8 w-8 rounded-lg text-sm font-medium transition-colors"
                  style={p === page
                    ? { background: 'linear-gradient(135deg, #0B7A3B, #10B981)', color: '#fff' }
                    : { color: '#64748B', backgroundColor: 'transparent' }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Assign Worker Modal */}
      <AnimatePresence>
        {assignStoreId !== null && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setAssignStoreId(null)}>
            <motion.div className="mx-4 w-full max-w-sm rounded-2xl border bg-white p-6"
              style={{ borderColor: '#E2E8F0' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold" style={{ color: '#0F172A' }}>{t('stores.assignWorker')}</h3>
                <button onClick={() => setAssignStoreId(null)}><X size={18} style={{ color: '#64748B' }} /></button>
              </div>
              <select value={assignUserId} onChange={e => setAssignUserId(e.target.value)}
                className="mb-4 w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ borderColor: '#E2E8F0' }}>
                <option value="">{t('stores.selectWorker')}</option>
                {workers
                  .filter(w => {
                    const store = stores.find(s => s.id === assignStoreId)
                    return store ? !store.workers.some(sw => sw.userId === w.id) : true
                  })
                  .map(w => <option key={w.id} value={w.id}>{w.fullName}</option>)}
              </select>
              <div className="flex justify-end gap-3">
                <button onClick={() => setAssignStoreId(null)}
                  className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>{t('stores.cancel')}</button>
                <motion.button onClick={handleAssign} disabled={!assignUserId || assigning}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  {assigning ? '…' : t('stores.assign')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm py-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mx-4 w-full max-w-lg rounded-2xl border bg-white p-6"
              style={{ borderColor: '#E2E8F0' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: '#0F172A' }}>
                  {editing ? t('stores.edit') : t('stores.add')}
                </h3>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-gray-100">
                  <X size={18} style={{ color: '#64748B' }} />
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('stores.name')}</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('stores.address')}</label>
                  <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full rounded-xl border px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }} />
                </div>

                {/* Days */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: '#334155' }}>{t('stores.days')}</label>
                  <div className="flex flex-wrap gap-2">
                    {dayLabels.map((d, i) => (
                      <button key={i} type="button" onClick={() => toggleDay(String(i))}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                        style={form.days.includes(String(i))
                          ? { backgroundColor: '#0B7A3B', color: '#fff' }
                          : { backgroundColor: '#F1F5F9', color: '#64748B' }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Tasks */}
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: '#334155' }}>{t('stores.tasks')}</label>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {presetTasks.map((p, i) => (
                      <button key={i} type="button" onClick={() => addPreset(p)}
                        className="rounded-lg border px-2.5 py-1 text-xs transition-colors hover:border-emerald-400 hover:text-emerald-600"
                        style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                        + {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {form.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                        <input type="text" value={task.label} onChange={e => updateTask(i, 'label', e.target.value)}
                          placeholder={t('stores.taskLabel')}
                          className="flex-1 rounded-lg border px-3 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          style={{ borderColor: '#E2E8F0' }} />
                        <input type="number" value={task.count ?? ''} onChange={e => updateTask(i, 'count', e.target.value)}
                          placeholder="#"
                          className="w-16 rounded-lg border px-2 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          style={{ borderColor: '#E2E8F0' }} />
                        <button onClick={() => removeTask(i)} className="text-red-400 hover:text-red-600">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addTask} type="button"
                    className="mt-2 flex items-center gap-1 text-xs font-medium transition-colors hover:text-emerald-600"
                    style={{ color: '#64748B' }}>
                    <Plus size={12} />{t('stores.addTask')}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowForm(false)}
                  className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>{t('stores.cancel')}</button>
                <motion.button onClick={handleSave} disabled={saving}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  {saving ? t('stores.saving') : t('stores.save')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
