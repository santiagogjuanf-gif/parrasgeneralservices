'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Plus, Pencil, Trash2, X, FileText, Printer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminLang } from './AdminDashboardShell'
import ConfirmModal from './ConfirmModal'

interface PricingRow {
  planOption: string
  detail: string
  monthlyRate: string
}

interface QuoteRow {
  id: number
  quoteNumber: string
  quoteDate: string
  clientName: string
  clientAddress: string
  clientPhone: string | null
  clientEmail: string | null
  serviceType: string
  scopeItems: string
  pricingOptions: string
  commitment: string
  termsItems: string
  status: string
  notes: string | null
  createdAt: string
}

const STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED']

const DEFAULT_COMMITMENT = `At Parra's General Services, our goal is long-term professional relationships based on reliability, quality, and trust. We are committed to delivering consistent and high-standard cleaning services that support your business operations and maintain a safe, clean environment for staff and customers.\n\nPricing is negotiable, as our priority is establishing a strong working relationship and becoming your trusted service provider. We are fully prepared to begin services at any date you decide — whether immediately, within a week, or at a future scheduled time that best fits your needs.`

const DEFAULT_TERMS = [
  'This quote includes all labour, standard cleaning supplies, and scheduled floor maintenance.',
  'This is a fixed monthly contract rate.',
  'Payment terms to be agreed upon prior to service start date.',
]

function statusColor(s: string) {
  return s === 'ACCEPTED'
    ? { bg: '#F0FDF4', color: '#0B7A3B' }
    : s === 'SENT'
    ? { bg: '#EFF6FF', color: '#3B82F6' }
    : s === 'DECLINED'
    ? { bg: '#FFF1F2', color: '#E11D48' }
    : { bg: '#F8FAFC', color: '#64748B' }
}

function StatusBadge({ status }: { status: string }) {
  const { bg, color } = statusColor(status)
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: bg, color }}
    >
      {status}
    </span>
  )
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const EMPTY_FORM = {
  quoteDate: todayISO(),
  clientName: '',
  clientAddress: '',
  clientPhone: '',
  clientEmail: '',
  serviceType: 'Monthly Cleaning Agreement',
  scopeItems: [''] as string[],
  pricingOptions: [{ planOption: '', detail: '', monthlyRate: '' }] as PricingRow[],
  commitment: DEFAULT_COMMITMENT,
  termsItems: [...DEFAULT_TERMS] as string[],
  notes: '',
}

const inputCls =
  'w-full rounded-xl border px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500'
const inputStyle = { borderColor: '#E2E8F0' }
const sectionLabelCls = 'mb-3 text-xs font-semibold uppercase tracking-widest'
const sectionLabelStyle = { color: '#475569' }

export default function QuotesAdmin() {
  const { lang } = useAdminLang()
  const pathname = usePathname()
  const adminBase = pathname.split('/dashboard')[0]

  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const [previewId, setPreviewId] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Open / close native <dialog> when previewId changes
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (previewId !== null) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [previewId])
  const [form, setForm] = useState({ ...EMPTY_FORM, scopeItems: [''], pricingOptions: [{ planOption: '', detail: '', monthlyRate: '' }], termsItems: [...DEFAULT_TERMS] })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setPage(1)
    try {
      const qs = filterStatus ? `?status=${filterStatus}` : ''
      const data = await fetch(`/api/admin/quotes${qs}`).then((r) => r.json())
      if (Array.isArray(data)) setQuotes(data)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [filterStatus])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setForm({
      quoteDate: todayISO(),
      clientName: '',
      clientAddress: '',
      clientPhone: '',
      clientEmail: '',
      serviceType: 'Monthly Cleaning Agreement',
      scopeItems: [''],
      pricingOptions: [{ planOption: '', detail: '', monthlyRate: '' }],
      commitment: DEFAULT_COMMITMENT,
      termsItems: [...DEFAULT_TERMS],
      notes: '',
    })
    setFormError('')
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(q: QuoteRow) {
    function parseArr<T>(raw: string, fallback: T[]): T[] {
      try {
        let val: unknown = JSON.parse(raw)
        // handle double-encoded strings (old bad data in DB)
        if (typeof val === 'string') val = JSON.parse(val)
        return Array.isArray(val) ? (val as T[]) : fallback
      } catch { return fallback }
    }

    const scopeItems = parseArr<string>(q.scopeItems, [''])
    const pricingOptions = parseArr<PricingRow>(q.pricingOptions, [{ planOption: '', detail: '', monthlyRate: '' }])
    const termsItems = parseArr<string>(q.termsItems, [...DEFAULT_TERMS])

    setForm({
      quoteDate: q.quoteDate ?? todayISO(),
      clientName: q.clientName ?? '',
      clientAddress: q.clientAddress ?? '',
      clientPhone: q.clientPhone ?? '',
      clientEmail: q.clientEmail ?? '',
      serviceType: q.serviceType ?? 'Monthly Cleaning Agreement',
      scopeItems,
      pricingOptions,
      commitment: q.commitment ?? DEFAULT_COMMITMENT,
      termsItems,
      notes: q.notes ?? '',
    })
    setFormError('')
    setEditingId(q.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.clientName.trim()) { setFormError('Client name is required.'); return }
    if (!form.clientAddress.trim()) { setFormError('Client address is required.'); return }
    if (!form.serviceType.trim()) { setFormError('Service type is required.'); return }
    setFormError('')
    setSaving(true)
    try {
      const body = { ...form }
      if (editingId !== null) {
        await fetch(`/api/admin/quotes/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        await fetch('/api/admin/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      setShowForm(false)
      load()
    } catch {
      setFormError('An error occurred. Please try again.')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (confirmDeleteId === null) return
    await fetch(`/api/admin/quotes/${confirmDeleteId}`, { method: 'DELETE' })
    setConfirmDeleteId(null)
    load()
  }

  async function handleStatusChange(id: number, status: string) {
    await fetch(`/api/admin/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  function addScopeItem() {
    setForm((f) => ({ ...f, scopeItems: [...f.scopeItems, ''] }))
  }

  function removeScopeItem(i: number) {
    setForm((f) => ({ ...f, scopeItems: f.scopeItems.filter((_, idx) => idx !== i) }))
  }

  function addPricingRow() {
    setForm((f) => ({
      ...f,
      pricingOptions: [...f.pricingOptions, { planOption: '', detail: '', monthlyRate: '' }],
    }))
  }

  function removePricingRow(i: number) {
    setForm((f) => ({ ...f, pricingOptions: f.pricingOptions.filter((_, idx) => idx !== i) }))
  }

  return (
    <div>
      <ConfirmModal
        open={confirmDeleteId !== null}
        message="Delete this quote?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>
            {lang === 'es' ? 'Cotizaciones' : 'Quotes'}
          </h2>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            {quotes.length} {lang === 'es' ? 'cotizaciones' : 'quotes'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ borderColor: '#E2E8F0' }}
          >
            <option value="">{lang === 'es' ? 'Todos' : 'All'}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <motion.button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={15} />
            {lang === 'es' ? 'Nueva Cotización' : 'New Quote'}
          </motion.button>
        </div>
      </div>

      {/* Quote list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div
            className="h-8 w-8 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      ) : quotes.length === 0 ? (
        <motion.div
          className="rounded-2xl border bg-white p-12 text-center"
          style={{ borderColor: '#E2E8F0' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FileText size={40} style={{ color: '#CBD5E1' }} className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold" style={{ color: '#0F172A' }}>
            {lang === 'es' ? 'No hay cotizaciones' : 'No quotes yet'}
          </h3>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>
            {lang === 'es' ? 'Crea tu primera cotización.' : 'Create your first quote.'}
          </p>
        </motion.div>
      ) : (() => {
        const totalPages = Math.ceil(quotes.length / PAGE_SIZE)
        const paginated = quotes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        return (
          <>
            <div className="space-y-3">
              {paginated.map((q) => (
                <motion.div
                  key={q.id}
                  className="rounded-2xl border bg-white p-4"
                  style={{ borderColor: '#E2E8F0' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs" style={{ color: '#94A3B8' }}>
                          {q.quoteNumber}
                        </span>
                        <StatusBadge status={q.status} />
                      </div>
                      <p className="mt-1 font-semibold" style={{ color: '#0F172A' }}>
                        {q.clientName}
                      </p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>
                        {q.clientAddress}
                      </p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>
                        {q.serviceType} · {formatDate(q.quoteDate)}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q.id, e.target.value)}
                        className="rounded-lg border px-2 py-1 text-xs text-black focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        style={{ borderColor: '#E2E8F0' }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setPreviewId(q.id)}
                        className="rounded-lg p-2 transition-colors hover:bg-green-50"
                        title="Preview / Print PDF"
                      >
                        <Printer size={15} style={{ color: '#10B981' }} />
                      </button>
                      <button
                        onClick={() => openEdit(q)}
                        className="rounded-lg p-2 transition-colors hover:bg-blue-50"
                        title="Edit"
                      >
                        <Pencil size={15} style={{ color: '#3B82F6' }} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(q.id)}
                        className="rounded-lg p-2 transition-colors hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={15} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs" style={{ color: '#94A3B8' }}>
                  {lang === 'es'
                    ? `Página ${page} de ${totalPages} · ${quotes.length} cotizaciones`
                    : `Page ${page} of ${totalPages} · ${quotes.length} quotes`}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 disabled:opacity-40"
                    style={{ borderColor: '#E2E8F0', color: '#64748B' }}
                  >
                    {lang === 'es' ? 'Anterior' : 'Previous'}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        borderColor: p === page ? '#10B981' : '#E2E8F0',
                        color: p === page ? '#10B981' : '#64748B',
                        backgroundColor: p === page ? '#F0FDF4' : 'transparent',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 disabled:opacity-40"
                    style={{ borderColor: '#E2E8F0', color: '#64748B' }}
                  >
                    {lang === 'es' ? 'Siguiente' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </>
        )
      })()}

      {/* ── PDF Preview — native <dialog> (browser top-layer, above everything) ── */}
      <dialog
        ref={dialogRef}
        onCancel={() => setPreviewId(null)}
        style={{
          padding: 0, border: 'none', borderRadius: 0,
          width: '100vw', height: '100vh',
          maxWidth: '100vw', maxHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          backgroundColor: '#1a1a1a',
        }}
      >
        {/* Toolbar */}
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '10px 20px',
          background: 'linear-gradient(135deg, #0B7A3B, #10B981)',
        }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
            {lang === 'es' ? 'Vista previa de cotización' : 'Quote Preview'}
          </span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => {
                const url = `${adminBase}/dashboard/quotes/${previewId}/print?autoprint=1`
                window.open(url, '_blank', 'width=900,height=1000')
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                backgroundColor: '#fff', color: '#0B7A3B', border: 'none',
                borderRadius: 12, padding: '6px 16px',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              <Printer size={14} />
              {lang === 'es' ? 'Imprimir / Guardar PDF' : 'Print / Save PDF'}
            </button>
            <button
              onClick={() => setPreviewId(null)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex',
              }}
            >
              <X size={18} color="#fff" />
            </button>
          </div>
        </div>

        {/* iframe */}
        {previewId !== null && (
          <iframe
            ref={iframeRef}
            src={`${adminBase}/dashboard/quotes/${previewId}/print`}
            style={{ flex: 1, width: '100%', border: 'none', backgroundColor: '#e8e8e8' }}
            title="Quote Preview"
          />
        )}
      </dialog>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex min-h-full items-start justify-center p-4 py-8">
              <motion.div
                className="w-full max-w-2xl rounded-2xl border bg-white"
                style={{ borderColor: '#E2E8F0' }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                {/* Modal header */}
                <div
                  className="flex items-center justify-between border-b px-6 py-4"
                  style={{ borderColor: '#E2E8F0' }}
                >
                  <h3 className="font-bold" style={{ color: '#0F172A' }}>
                    {editingId
                      ? lang === 'es' ? 'Editar Cotización' : 'Edit Quote'
                      : lang === 'es' ? 'Nueva Cotización' : 'New Quote'}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="rounded-lg p-1 transition-colors hover:bg-gray-100"
                  >
                    <X size={18} style={{ color: '#64748B' }} />
                  </button>
                </div>

                <div className="space-y-5 p-6">
                  {/* CLIENT INFO */}
                  <section>
                    <h4 className={sectionLabelCls} style={sectionLabelStyle}>
                      Client / Cliente
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input
                          className={inputCls}
                          style={inputStyle}
                          placeholder="Client Name *"
                          value={form.clientName}
                          onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          className={inputCls}
                          style={inputStyle}
                          placeholder="Client Address *"
                          value={form.clientAddress}
                          onChange={(e) => setForm((f) => ({ ...f, clientAddress: e.target.value }))}
                        />
                      </div>
                      <input
                        className={inputCls}
                        style={inputStyle}
                        placeholder="Phone"
                        value={form.clientPhone}
                        onChange={(e) => setForm((f) => ({ ...f, clientPhone: e.target.value }))}
                      />
                      <input
                        className={inputCls}
                        style={inputStyle}
                        placeholder="Email"
                        type="email"
                        value={form.clientEmail}
                        onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
                      />
                    </div>
                  </section>

                  {/* QUOTE INFO */}
                  <section>
                    <h4 className={sectionLabelCls} style={sectionLabelStyle}>
                      Quote / Cotización
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className={inputCls}
                        style={inputStyle}
                        type="date"
                        value={form.quoteDate}
                        onChange={(e) => setForm((f) => ({ ...f, quoteDate: e.target.value }))}
                      />
                      <input
                        className={inputCls}
                        style={inputStyle}
                        placeholder="Service Type *"
                        value={form.serviceType}
                        onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
                      />
                    </div>
                  </section>

                  {/* SCOPE OF WORK */}
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className={sectionLabelCls} style={sectionLabelStyle}>
                        Scope of Work
                      </h4>
                      <button
                        onClick={addScopeItem}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: '#10B981' }}
                      >
                        <Plus size={12} />
                        Add item
                      </button>
                    </div>
                    {form.scopeItems.map((item, i) => (
                      <div key={i} className="mb-2 flex gap-2">
                        <input
                          className={inputCls}
                          style={inputStyle}
                          placeholder={`Service item ${i + 1}`}
                          value={item}
                          onChange={(e) => {
                            const updated = [...form.scopeItems]
                            updated[i] = e.target.value
                            setForm((f) => ({ ...f, scopeItems: updated }))
                          }}
                        />
                        <button
                          onClick={() => removeScopeItem(i)}
                          className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-red-50"
                        >
                          <Trash2 size={14} style={{ color: '#EF4444' }} />
                        </button>
                      </div>
                    ))}
                  </section>

                  {/* PRICING OPTIONS */}
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className={sectionLabelCls} style={sectionLabelStyle}>
                        Pricing Options
                      </h4>
                      <button
                        onClick={addPricingRow}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: '#10B981' }}
                      >
                        <Plus size={12} />
                        Add row
                      </button>
                    </div>
                    {form.pricingOptions.map((row, i) => (
                      <div key={i} className="mb-2 grid grid-cols-3 gap-2">
                        <input
                          className={inputCls}
                          style={inputStyle}
                          placeholder="Option 1"
                          value={row.planOption}
                          onChange={(e) => {
                            const updated = [...form.pricingOptions]
                            updated[i] = { ...updated[i], planOption: e.target.value }
                            setForm((f) => ({ ...f, pricingOptions: updated }))
                          }}
                        />
                        <input
                          className={inputCls}
                          style={inputStyle}
                          placeholder="4 times per year"
                          value={row.detail}
                          onChange={(e) => {
                            const updated = [...form.pricingOptions]
                            updated[i] = { ...updated[i], detail: e.target.value }
                            setForm((f) => ({ ...f, pricingOptions: updated }))
                          }}
                        />
                        <div className="flex gap-1">
                          <input
                            className={inputCls}
                            style={inputStyle}
                            placeholder="$4,780 CAD/mo"
                            value={row.monthlyRate}
                            onChange={(e) => {
                              const updated = [...form.pricingOptions]
                              updated[i] = { ...updated[i], monthlyRate: e.target.value }
                              setForm((f) => ({ ...f, pricingOptions: updated }))
                            }}
                          />
                          <button
                            onClick={() => removePricingRow(i)}
                            className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-red-50"
                          >
                            <Trash2 size={14} style={{ color: '#EF4444' }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </section>

                  {/* COMMITMENT */}
                  <section>
                    <h4 className={sectionLabelCls} style={sectionLabelStyle}>
                      Professional Commitment
                    </h4>
                    <textarea
                      className={inputCls}
                      style={inputStyle}
                      rows={6}
                      value={form.commitment}
                      onChange={(e) => setForm((f) => ({ ...f, commitment: e.target.value }))}
                    />
                  </section>

                  {/* TERMS & CONDITIONS */}
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className={sectionLabelCls} style={sectionLabelStyle}>
                        Terms &amp; Conditions
                      </h4>
                      <button
                        onClick={() =>
                          setForm((f) => ({ ...f, termsItems: [...f.termsItems, ''] }))
                        }
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: '#10B981' }}
                      >
                        <Plus size={12} />
                        Add
                      </button>
                    </div>
                    {form.termsItems.map((item, i) => (
                      <div key={i} className="mb-2 flex gap-2">
                        <input
                          className={inputCls}
                          style={inputStyle}
                          placeholder={`Term ${i + 1}`}
                          value={item}
                          onChange={(e) => {
                            const updated = [...form.termsItems]
                            updated[i] = e.target.value
                            setForm((f) => ({ ...f, termsItems: updated }))
                          }}
                        />
                        <button
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              termsItems: f.termsItems.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-red-50"
                        >
                          <Trash2 size={14} style={{ color: '#EF4444' }} />
                        </button>
                      </div>
                    ))}
                  </section>

                  {/* INTERNAL NOTES */}
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-semibold"
                      style={{ color: '#475569' }}
                    >
                      Internal Notes
                    </label>
                    <textarea
                      className={inputCls}
                      style={inputStyle}
                      rows={2}
                      placeholder="Optional internal notes..."
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                  </div>

                  {formError && (
                    <p className="text-sm text-red-500">{formError}</p>
                  )}

                  {/* Footer buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#E2E8F0', color: '#64748B' }}
                    >
                      {lang === 'es' ? 'Cancelar' : 'Cancel'}
                    </button>
                    <motion.button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                      whileHover={{ scale: saving ? 1 : 1.02 }}
                      whileTap={{ scale: saving ? 1 : 0.98 }}
                    >
                      {saving
                        ? lang === 'es' ? 'Guardando...' : 'Saving...'
                        : editingId
                        ? lang === 'es' ? 'Actualizar Cotización' : 'Update Quote'
                        : lang === 'es' ? 'Crear Cotización' : 'Create Quote'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
