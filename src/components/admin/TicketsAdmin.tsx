'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye, Trash2, X, Download, Receipt } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminLang } from './AdminDashboardShell'
import type { AdminKey } from '@/lib/admin-i18n'

interface TicketRow {
  id: number
  category: string
  otherLabel: string | null
  amount: number | null
  filename: string
  path: string
  notes: string | null
  createdAt: string
  user: { id: number; fullName: string }
}
interface WorkerOption { id: number; fullName: string }

const CATEGORIES = ['GASOLINA', 'COMIDA', 'MATERIAL', 'HERRAMIENTA', 'OTRO']

function catLabel(cat: string, other: string | null, t: (k: AdminKey) => string) {
  const map: Record<string, string> = {
    GASOLINA: t('tickets.catGas'),
    COMIDA: t('tickets.catFood'),
    MATERIAL: t('tickets.catMaterial'),
    HERRAMIENTA: t('tickets.catTool'),
    OTRO: other || t('tickets.catOther'),
  }
  return map[cat] || cat
}

function catColor(cat: string) {
  const map: Record<string, { bg: string; color: string }> = {
    GASOLINA: { bg: '#FEF3C7', color: '#D97706' },
    COMIDA: { bg: '#FCE7F3', color: '#DB2777' },
    MATERIAL: { bg: '#EDE9FE', color: '#7C3AED' },
    HERRAMIENTA: { bg: '#FEF2F2', color: '#DC2626' },
    OTRO: { bg: '#F1F5F9', color: '#64748B' },
  }
  return map[cat] || map.OTRO
}

export default function TicketsAdmin() {
  const { t } = useAdminLang()
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [workers, setWorkers] = useState<WorkerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [filterWorker, setFilterWorker] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [detail, setDetail] = useState<TicketRow | null>(null)
  const [downloading, setDownloading] = useState(false)
  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterWorker) params.set('userId', filterWorker)
      if (filterCat) params.set('category', filterCat)
      if (fromDate) params.set('from', fromDate)
      if (toDate) params.set('to', toDate)
      const [td, wd] = await Promise.all([
        fetch(`/api/admin/tickets?${params}`).then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
      ])
      if (Array.isArray(td)) setTickets(td)
      if (Array.isArray(wd)) setWorkers(wd)
    } catch { /* ignore */ }
    setLoading(false)
    setPage(1)
  }, [filterWorker, filterCat, fromDate, toDate])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: number) => {
    if (!confirm(t('tickets.deleteConfirm'))) return
    await fetch(`/api/worker/tickets/${id}`, { method: 'DELETE' })
    load()
  }

  const handleDownload = async () => {
    setDownloading(true)
    const params = new URLSearchParams()
    if (filterWorker) params.set('userId', filterWorker)
    if (filterCat) params.set('category', filterCat)
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    try {
      const res = await fetch(`/api/admin/tickets/download?${params}`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tickets_${fromDate || 'all'}_${toDate || 'all'}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Download failed') }
    setDownloading(false)
  }

  const paginated = tickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE))

  if (loading) return (
    <div className="flex justify-center py-20">
      <motion.div className="h-8 w-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
    </div>
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>{t('tickets.title')}</h2>
          <p className="text-sm" style={{ color: '#94A3B8' }}>{tickets.length} {t('tickets.count')}</p>
        </div>
        <motion.button onClick={handleDownload} disabled={downloading || tickets.length === 0}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Download size={15} className={downloading ? 'animate-bounce' : ''} />
          {t('tickets.download')}
        </motion.button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4" style={{ borderColor: '#E2E8F0' }}>
        <select value={filterWorker} onChange={e => setFilterWorker(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
          style={{ borderColor: '#E2E8F0' }}>
          <option value="">{t('tickets.filterWorker')}</option>
          {workers.map(w => <option key={w.id} value={w.id}>{w.fullName}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
          style={{ borderColor: '#E2E8F0' }}>
          <option value="">{t('tickets.filterCategory')}</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{catLabel(c, null, t)}</option>)}
        </select>
        <div className="flex items-center gap-2 text-sm" style={{ color: '#64748B' }}>
          <span>{t('tickets.from')}</span>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ borderColor: '#E2E8F0' }} />
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: '#64748B' }}>
          <span>{t('tickets.to')}</span>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ borderColor: '#E2E8F0' }} />
        </div>
      </div>

      {tickets.length === 0 ? (
        <motion.div className="rounded-2xl border bg-white p-12 text-center" style={{ borderColor: '#E2E8F0' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Receipt size={40} style={{ color: '#CBD5E1' }} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold" style={{ color: '#0F172A' }}>{t('tickets.empty')}</h3>
        </motion.div>
      ) : (
        <>
          <motion.div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: '#E2E8F0' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    {[t('tickets.dateCol'), t('tickets.workerCol'), t('tickets.categoryCol'), t('tickets.amountCol'), t('tickets.actionsCol')].map(h => (
                      <th key={h} className="px-6 py-4 font-semibold" style={{ color: '#64748B' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(tk => {
                    const c = catColor(tk.category)
                    return (
                      <tr key={tk.id} className="transition-colors hover:bg-gray-50" style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td className="px-6 py-4" style={{ color: '#64748B' }}>
                          {new Date(tk.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium" style={{ color: '#0F172A' }}>{tk.user.fullName}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{ backgroundColor: c.bg, color: c.color }}>
                            {catLabel(tk.category, tk.otherLabel, t)}
                          </span>
                        </td>
                        <td className="px-6 py-4" style={{ color: '#64748B' }}>
                          {tk.amount ? `$${tk.amount.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setDetail(tk)} className="rounded-lg p-2 hover:bg-blue-50" style={{ color: '#3B82F6' }}>
                              <Eye size={15} />
                            </button>
                            <button onClick={() => handleDelete(tk.id)} className="rounded-lg p-2 hover:bg-red-50" style={{ color: '#EF4444' }}>
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

      {/* Detail Modal */}
      <AnimatePresence>
        {detail && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDetail(null)}>
            <motion.div className="mx-4 w-full max-w-sm rounded-2xl border bg-white p-6" style={{ borderColor: '#E2E8F0' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold" style={{ color: '#0F172A' }}>{catLabel(detail.category, detail.otherLabel, t)}</h3>
                <button onClick={() => setDetail(null)}><X size={18} style={{ color: '#64748B' }} /></button>
              </div>
              <a href={detail.path} target="_blank" rel="noopener noreferrer">
                <img src={detail.path} alt={detail.filename}
                  className="mb-4 w-full rounded-xl object-contain max-h-64" style={{ backgroundColor: '#F8FAFC' }} />
              </a>
              <div className="space-y-2 text-sm" style={{ color: '#64748B' }}>
                <p><strong style={{ color: '#0F172A' }}>Worker:</strong> {detail.user.fullName}</p>
                <p><strong style={{ color: '#0F172A' }}>{t('tickets.dateCol')}:</strong> {new Date(detail.createdAt).toLocaleDateString()}</p>
                {detail.amount && <p><strong style={{ color: '#0F172A' }}>{t('tickets.amount')}:</strong> ${detail.amount.toFixed(2)}</p>}
                {detail.notes && <p><strong style={{ color: '#0F172A' }}>{t('tickets.notes')}:</strong> {detail.notes}</p>}
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={() => setDetail(null)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>{t('tickets.close')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
