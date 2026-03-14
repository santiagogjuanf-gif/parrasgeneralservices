'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Eye, X, MapPin, ClipboardList, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminLang } from './AdminDashboardShell'
import type { AdminKey } from '@/lib/admin-i18n'

interface WorkOrderRow {
  id: number
  date: string
  status: string
  latitude: number | null
  longitude: number | null
  _count: { photos: number }
  store: { name: string; address: string }
  worker: { fullName: string }
  tasks: { id: number; label: string; count: number | null; completed: boolean }[]
  photos: { id: number; path: string; filename: string }[]
}

function StatusBadge({ status, t }: { status: string; t: (k: AdminKey) => string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PENDING: { bg: '#EFF6FF', color: '#3B82F6', label: t('workorders.statusPending') },
    IN_PROGRESS: { bg: '#FFFBEB', color: '#D97706', label: t('workorders.statusInProgress') },
    COMPLETED: { bg: '#F0FDF4', color: '#0B7A3B', label: t('workorders.statusCompleted') },
    INCOMPLETE: { bg: '#FFF1F2', color: '#E11D48', label: t('workorders.statusIncomplete') },
  }
  const s = map[status] || map.PENDING
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
  )
}

const PAGE_SIZE = 10

export default function WorkOrdersAdmin() {
  const { t } = useAdminLang()
  const [orders, setOrders] = useState<WorkOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [detail, setDetail] = useState<WorkOrderRow | null>(null)
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = filterStatus ? `?status=${filterStatus}` : ''
      const data = await fetch(`/api/admin/workorders${qs}`).then(r => r.json())
      if (Array.isArray(data)) setOrders(data)
    } catch { /* ignore */ }
    setLoading(false)
  }, [filterStatus])

  useEffect(() => { load(); setPage(1) }, [load])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/workorders/generate', { method: 'POST' })
      const data = await res.json()
      showToast(`${data.created} ${t('workorders.generated')}`)
      load()
    } catch { /* ignore */ }
    setGenerating(false)
  }

  const handleDelete = (id: number) => { setConfirmDeleteId(id) }

  const doDelete = async () => {
    if (confirmDeleteId === null) return
    await fetch(`/api/admin/workorders/${confirmDeleteId}`, { method: 'DELETE' })
    setConfirmDeleteId(null)
    load()
  }

  const openDetail = async (id: number) => {
    const data = await fetch(`/api/admin/workorders/${id}`).then(r => r.json())
    setDetail(data)
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <motion.div className="h-8 w-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
    </div>
  )

  const totalPages = Math.ceil(orders.length / PAGE_SIZE)
  const pagedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>{t('workorders.title')}</h2>
          <p className="text-sm" style={{ color: '#94A3B8' }}>{orders.length} orders</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ borderColor: '#E2E8F0' }}>
            <option value="">{t('workorders.filterAll')}</option>
            <option value="PENDING">{t('workorders.statusPending')}</option>
            <option value="IN_PROGRESS">{t('workorders.statusInProgress')}</option>
            <option value="COMPLETED">{t('workorders.statusCompleted')}</option>
            <option value="INCOMPLETE">{t('workorders.statusIncomplete')}</option>
          </select>
          <motion.button onClick={handleGenerate} disabled={generating}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <RefreshCw size={15} className={generating ? 'animate-spin' : ''} />
            {t('workorders.generate')}
          </motion.button>
        </div>
      </div>

      {orders.length === 0 ? (
        <motion.div className="rounded-2xl border bg-white p-12 text-center" style={{ borderColor: '#E2E8F0' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ClipboardList size={40} style={{ color: '#CBD5E1' }} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold" style={{ color: '#0F172A' }}>{t('workorders.empty')}</h3>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>{t('workorders.emptyDesc')}</p>
        </motion.div>
      ) : (
        <motion.div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: '#E2E8F0' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {[t('workorders.store'), t('workorders.worker'), t('workorders.date'), t('workorders.status'), t('workorders.photos'), t('workorders.location'), t('workorders.actions')].map(h => (
                    <th key={h} className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedOrders.map(o => (
                  <tr key={o.id} className="transition-colors hover:bg-gray-50" style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td className="px-6 py-4 font-medium" style={{ color: '#0F172A' }}>
                      <div>{o.store.name}</div>
                      <div className="text-xs" style={{ color: '#94A3B8' }}>{o.store.address}</div>
                    </td>
                    <td className="px-6 py-4" style={{ color: '#64748B' }}>{o.worker.fullName}</td>
                    <td className="px-6 py-4" style={{ color: '#64748B' }}>{o.date}</td>
                    <td className="px-6 py-4"><StatusBadge status={o.status} t={t} /></td>
                    <td className="px-6 py-4 text-center" style={{ color: '#64748B' }}>
                      {(o._count?.photos ?? o.photos?.length ?? 0)}
                    </td>
                    <td className="px-6 py-4">
                      {o.latitude && o.longitude ? (
                        <a href={`https://maps.google.com/?q=${o.latitude},${o.longitude}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:text-emerald-600"
                          style={{ color: '#3B82F6' }}>
                          <MapPin size={13} />{t('workorders.viewMap')}
                        </a>
                      ) : (
                        <span className="text-xs" style={{ color: '#CBD5E1' }}>{t('workorders.noLocation')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDetail(o.id)} className="rounded-lg p-2 transition-colors hover:bg-blue-50" style={{ color: '#3B82F6' }}>
                          <Eye size={15} />
                        </button>
                        <button onClick={() => handleDelete(o.id)} className="rounded-lg p-2 transition-colors hover:bg-red-50" style={{ color: '#EF4444' }}>
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

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="fixed bottom-6 right-6 z-[90] rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl"
            style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}>
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDeleteId !== null && (
          <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mx-4 w-full max-w-sm rounded-2xl border bg-white p-6" style={{ borderColor: '#E2E8F0' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="mb-1 text-base font-bold" style={{ color: '#0F172A' }}>{t('workorders.deleteConfirm')}</h3>
              <p className="text-sm" style={{ color: '#94A3B8' }}>ID #{confirmDeleteId}</p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>{t('workorders.close')}</button>
                <button onClick={doDelete}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white"
                  style={{ backgroundColor: '#EF4444' }}>{t('workorders.delete')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detail && (
          <motion.div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm py-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDetail(null)}>
            <motion.div className="mx-4 w-full max-w-lg rounded-2xl border bg-white p-6" style={{ borderColor: '#E2E8F0' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold" style={{ color: '#0F172A' }}>{detail.store.name}</h3>
                <button onClick={() => setDetail(null)}><X size={18} style={{ color: '#64748B' }} /></button>
              </div>
              <div className="mb-3 text-sm" style={{ color: '#64748B' }}>
                <p>{detail.store.address}</p>
                <p>{t('workorders.worker')}: <strong style={{ color: '#0F172A' }}>{detail.worker.fullName}</strong></p>
                <p>{t('workorders.date')}: <strong style={{ color: '#0F172A' }}>{detail.date}</strong></p>
                <div className="mt-1"><StatusBadge status={detail.status} t={t} /></div>
              </div>
              {detail.latitude && detail.longitude && (
                <a href={`https://maps.google.com/?q=${detail.latitude},${detail.longitude}`} target="_blank" rel="noopener noreferrer"
                  className="mb-3 inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#3B82F6' }}>
                  <MapPin size={14} />{t('workorders.viewMap')}
                </a>
              )}
              <h4 className="mb-2 text-sm font-semibold" style={{ color: '#0F172A' }}>{t('workorders.tasks')}</h4>
              <div className="mb-4 space-y-1.5">
                {detail.tasks?.map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <div className={`h-4 w-4 flex-shrink-0 rounded flex items-center justify-center ${task.completed ? 'bg-emerald-500' : 'border-2'}`}
                      style={task.completed ? {} : { borderColor: '#CBD5E1' }}>
                      {task.completed && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span style={{ color: task.completed ? '#0F172A' : '#94A3B8' }}>
                      {task.label}{task.count ? ` (${task.count})` : ''}
                    </span>
                  </div>
                ))}
              </div>
              {detail.photos?.length > 0 && (
                <>
                  <h4 className="mb-2 text-sm font-semibold" style={{ color: '#0F172A' }}>{t('workorders.photos')} ({detail.photos.length})</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {detail.photos.map(p => (
                      <a key={p.id} href={p.path} target="_blank" rel="noopener noreferrer">
                        <img src={p.path} alt={p.filename} className="h-24 w-full rounded-lg object-cover" />
                      </a>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-4 flex justify-end">
                <button onClick={() => setDetail(null)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>{t('workorders.close')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
