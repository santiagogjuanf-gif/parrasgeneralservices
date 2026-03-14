'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Receipt, MapPin, Camera, X, Check, Plus, ChevronRight, LogOut, Globe, Upload, Trash2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  getAdminT, getStoredAdminLocale, setStoredAdminLocale, getTimeFarewell,
  type AdminLocale, type AdminKey,
} from '@/lib/admin-i18n'

interface WorkTask { id: number; label: string; count: number | null; completed: boolean }
interface WorkPhoto { id: number; path: string; filename: string }
interface WorkOrder {
  id: number; date: string; status: string
  latitude: number | null; longitude: number | null
  store: { name: string; address: string }
  tasks: WorkTask[]
  photos: WorkPhoto[]
}
interface Ticket {
  id: number; category: string; otherLabel: string | null
  amount: number | null; path: string; filename: string; notes: string | null; createdAt: string
}

const CATEGORIES = ['GASOLINA', 'COMIDA', 'MATERIAL', 'HERRAMIENTA', 'OTRO']

function catLabel(cat: string, other: string | null, lang: string) {
  const en: Record<string, string> = { GASOLINA: 'Gas', COMIDA: 'Food', MATERIAL: 'Material', HERRAMIENTA: 'Tools', OTRO: other || 'Other' }
  const es: Record<string, string> = { GASOLINA: 'Gasolina', COMIDA: 'Comida', MATERIAL: 'Material', HERRAMIENTA: 'Herramienta', OTRO: other || 'Otro' }
  return (lang === 'es' ? es : en)[cat] || cat
}

function StatusBadge({ status, t }: { status: string; t: (k: AdminKey) => string }) {
  const map: Record<string, { bg: string; color: string; key: string }> = {
    PENDING: { bg: '#EFF6FF', color: '#3B82F6', key: 'worker.statusPending' },
    IN_PROGRESS: { bg: '#FFFBEB', color: '#D97706', key: 'worker.statusInProgress' },
    COMPLETED: { bg: '#F0FDF4', color: '#0B7A3B', key: 'worker.statusCompleted' },
    INCOMPLETE: { bg: '#FFF1F2', color: '#E11D48', key: 'worker.statusIncomplete' },
  }
  const s = map[status] || map.PENDING
  return <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: s.bg, color: s.color }}>{t(s.key as any)}</span>
}

export default function WorkerDashboard({ user }: { user: { fullName: string; role: string } }) {
  const router = useRouter()
  const [lang, setLang] = useState<AdminLocale>('en')
  const [tab, setTab] = useState<'jobs' | 'tickets'>('jobs')
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [activeOrder, setActiveOrder] = useState<WorkOrder | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [locationStatus, setLocationStatus] = useState<'idle' | 'capturing' | 'ok' | 'denied'>('idle')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketForm, setTicketForm] = useState({ category: '', otherLabel: '', amount: '', notes: '' })
  const [ticketFile, setTicketFile] = useState<File | null>(null)
  const [savingTicket, setSavingTicket] = useState(false)
  const [ticketError, setTicketError] = useState('')
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null)
  const [showFarewell, setShowFarewell] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const ticketFileRef = useRef<HTMLInputElement>(null)
  const ticketGalleryRef = useRef<HTMLInputElement>(null)
  const ticketPage = 1
  const PAGE = 10
  const [confirmTicketId, setConfirmTicketId] = useState<number | null>(null)
  const [orderToast, setOrderToast] = useState('')

  useEffect(() => { setLang(getStoredAdminLocale()) }, [])

  const t = getAdminT(lang)

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true)
    try {
      const data = await fetch('/api/worker/workorders').then(r => r.json())
      if (Array.isArray(data)) setOrders(data)
    } catch { /* ignore */ }
    setLoadingOrders(false)
  }, [])

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true)
    try {
      const data = await fetch('/api/worker/tickets').then(r => r.json())
      if (Array.isArray(data)) setTickets(data)
    } catch { /* ignore */ }
    setLoadingTickets(false)
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])
  useEffect(() => { if (tab === 'tickets') loadTickets() }, [tab, loadTickets])

  // Register push subscription
  useEffect(() => {
    const registerPush = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
      try {
        const reg = await navigator.serviceWorker.ready
        const existing = await reg.pushManager.getSubscription()
        if (existing) {
          await saveSub(existing)
          return
        }
        const keyRes = await fetch('/api/push/vapid-public-key')
        const { publicKey } = await keyRes.json()
        if (!publicKey) return
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
        })
        await saveSub(sub)
      } catch { /* ignore */ }
    }
    const saveSub = async (sub: PushSubscription) => {
      const json = sub.toJSON()
      if (!json.keys) return
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth }),
      })
    }
    registerPush()
  }, [])

  const captureLocation = () => {
    if (!navigator.geolocation) { setLocationStatus('denied'); return }
    setLocationStatus('capturing')
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationStatus('ok') },
      () => setLocationStatus('denied'),
      { timeout: 10000 }
    )
  }

  const openOrder = async (o: WorkOrder) => {
    setActiveOrder({ ...o, photos: [] })
    setOrderError('')
    setPendingPhotos([])
    setLocationStatus('idle')
    setCoords(null)
    captureLocation()
    try {
      const full = await fetch(`/api/worker/workorders/${o.id}`).then(r => r.json())
      if (full?.id) {
        setActiveOrder(prev => prev ? { ...prev, photos: full.photos ?? [], tasks: full.tasks ?? prev.tasks } : null)
      }
    } catch { /* ignore */ }
  }

  const toggleTask = (taskId: number) => {
    if (!activeOrder) return
    setActiveOrder(o => o ? {
      ...o,
      tasks: o.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
    } : null)
  }

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return
    setPendingPhotos(prev => [...prev, ...Array.from(files)])
  }

  const handleUploadPhotos = async () => {
    if (!activeOrder || pendingPhotos.length === 0) return
    setUploadingPhotos(true)
    const fd = new FormData()
    pendingPhotos.forEach(f => fd.append('photos', f))
    try {
      const res = await fetch(`/api/worker/workorders/${activeOrder.id}/photos`, { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.photos) {
        setActiveOrder(o => o ? { ...o, photos: data.photos } : null)
        setPendingPhotos([])
      }
    } catch { /* ignore */ }
    setUploadingPhotos(false)
  }

  const handleRemovePending = (i: number) => setPendingPhotos(p => p.filter((_, idx) => idx !== i))

  const handleRemoveUploadedPhoto = async (photoId: number) => {
    if (!activeOrder) return
    await fetch(`/api/worker/workorders/${activeOrder.id}/photos`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId }),
    })
    setActiveOrder(o => o ? { ...o, photos: o.photos.filter(p => p.id !== photoId) } : null)
  }

  const showToast = (msg: string) => {
    setOrderToast(msg)
    setTimeout(() => setOrderToast(''), 3000)
  }

  const handleSaveProgress = async () => {
    if (!activeOrder) return
    setSavingOrder(true)
    await fetch(`/api/worker/workorders/${activeOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: activeOrder.tasks.map(t => ({ id: t.id, completed: t.completed })),
        status: 'IN_PROGRESS',
        ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
      }),
    })
    setSavingOrder(false)
    showToast(t('worker.saveProgress'))
    loadOrders()
  }

  const handleMarkComplete = async () => {
    if (!activeOrder) return
    setOrderError('')
    const allDone = activeOrder.tasks.every(t => t.completed)
    const photoCount = activeOrder.photos.length
    if (!allDone) { setOrderError(t('worker.errorTasks')); return }
    if (photoCount < 5) { setOrderError(t('worker.errorMinPhotos')); return }
    setSavingOrder(true)
    await fetch(`/api/worker/workorders/${activeOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: activeOrder.tasks.map(t => ({ id: t.id, completed: t.completed })),
        markComplete: true,
        ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
      }),
    })
    setSavingOrder(false)
    setActiveOrder(null)
    loadOrders()
  }

  const handleSaveTicket = async () => {
    setTicketError('')
    if (!ticketFile) { setTicketError(t('tickets.errorPhoto')); return }
    if (!ticketForm.category) { setTicketError(t('tickets.errorCategory')); return }
    setSavingTicket(true)
    const fd = new FormData()
    fd.append('photo', ticketFile)
    fd.append('category', ticketForm.category)
    if (ticketForm.otherLabel) fd.append('otherLabel', ticketForm.otherLabel)
    if (ticketForm.amount) fd.append('amount', ticketForm.amount)
    if (ticketForm.notes) fd.append('notes', ticketForm.notes)
    try {
      const res = await fetch('/api/worker/tickets', { method: 'POST', body: fd })
      if (res.ok) {
        setShowTicketForm(false)
        setTicketForm({ category: '', otherLabel: '', amount: '', notes: '' })
        setTicketFile(null)
        loadTickets()
      } else {
        const d = await res.json()
        setTicketError(d.error || 'Error')
      }
    } catch { setTicketError('Connection error') }
    setSavingTicket(false)
  }

  const handleDeleteTicket = async (id: number) => {
    setConfirmTicketId(id)
  }

  const doDeleteTicket = async () => {
    if (confirmTicketId === null) return
    await fetch(`/api/worker/tickets/${confirmTicketId}`, { method: 'DELETE' })
    setConfirmTicketId(null)
    loadTickets()
  }

  const handleLogout = async () => {
    setShowFarewell(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    setTimeout(() => router.replace(window.location.pathname.split('/worker')[0]), 2200)
  }

  const toggleLang = () => {
    const next = lang === 'en' ? 'es' : 'en'
    setLang(next)
    setStoredAdminLocale(next)
  }

  const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const pagedTickets = tickets.slice((ticketPage - 1) * PAGE, ticketPage * PAGE)

  return (
    <>
      {/* Farewell */}
      <AnimatePresence>
        {showFarewell && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}>
                <LogOut size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{getTimeFarewell(lang)}, {user.fullName.split(' ')[0]}!</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#F8FAFC' }}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/90 px-4 py-3 backdrop-blur-md"
          style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}>
              {initials}
            </div>
            <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>{user.fullName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang}
              className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
              style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
              <Globe size={13} />{lang.toUpperCase()}
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-red-50 hover:text-red-600"
              style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
              <LogOut size={13} />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex border-b bg-white" style={{ borderColor: '#E2E8F0' }}>
          {(['jobs', 'tickets'] as const).map(tb => (
            <button key={tb} onClick={() => setTab(tb)}
              className="relative flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors"
              style={{ color: tab === tb ? '#0B7A3B' : '#94A3B8' }}>
              {tb === 'jobs' ? <Briefcase size={16} /> : <Receipt size={16} />}
              {tb === 'jobs' ? t('worker.myJobs') : t('worker.myTickets')}
              {tab === tb && (
                <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #0B7A3B, #10B981)' }}
                  layoutId="worker-tab" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-4">
          {/* JOBS TAB */}
          {tab === 'jobs' && (
            <div>
              {loadingOrders ? (
                <div className="flex justify-center py-16">
                  <motion.div className="h-8 w-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                </div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center">
                  <Briefcase size={40} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                  <p className="font-semibold" style={{ color: '#0F172A' }}>{t('worker.noJobs')}</p>
                  <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>{t('worker.noJobsDesc')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(o => (
                    <motion.button key={o.id} onClick={() => openOrder(o)}
                      className="flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left transition-shadow hover:shadow-md"
                      style={{ borderColor: '#E2E8F0' }}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                          style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}>
                          <Briefcase size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: '#0F172A' }}>{o.store.name}</p>
                          <p className="flex items-center gap-1 text-xs" style={{ color: '#94A3B8' }}>
                            <MapPin size={11} />{o.store.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={o.status} t={t} />
                        <ChevronRight size={16} style={{ color: '#CBD5E1' }} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TICKETS TAB */}
          {tab === 'tickets' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                  {tickets.length} {t('tickets.count')}
                </p>
                <motion.button onClick={() => { setShowTicketForm(true); setTicketError('') }}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Plus size={15} />{t('tickets.add')}
                </motion.button>
              </div>

              {loadingTickets ? (
                <div className="flex justify-center py-16">
                  <motion.div className="h-8 w-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                </div>
              ) : tickets.length === 0 ? (
                <div className="py-16 text-center">
                  <Receipt size={40} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                  <p className="font-semibold" style={{ color: '#0F172A' }}>{t('tickets.empty')}</p>
                  <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>{t('tickets.emptyDesc')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pagedTickets.map(tk => (
                    <div key={tk.id} className="flex items-center justify-between rounded-2xl border bg-white p-4"
                      style={{ borderColor: '#E2E8F0' }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                          {catLabel(tk.category, tk.otherLabel, lang)}
                        </p>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>
                          {new Date(tk.createdAt).toLocaleDateString()}
                          {tk.amount ? ` · $${tk.amount}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setDetailTicket(tk)} className="rounded-lg p-2 hover:bg-blue-50" style={{ color: '#3B82F6' }}>
                          <Eye size={15} />
                        </button>
                        <button onClick={() => handleDeleteTicket(tk.id)} className="rounded-lg p-2 hover:bg-red-50" style={{ color: '#EF4444' }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Work Order Detail Sheet */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div className="fixed inset-0 z-50 flex flex-col bg-white"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: '#E2E8F0' }}>
              <div>
                <h2 className="font-bold" style={{ color: '#0F172A' }}>{activeOrder.store.name}</h2>
                <p className="flex items-center gap-1 text-xs" style={{ color: '#94A3B8' }}>
                  <MapPin size={11} />{activeOrder.store.address}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={activeOrder.status} t={t} />
                <button onClick={() => setActiveOrder(null)} className="rounded-lg p-1.5 hover:bg-gray-100">
                  <X size={18} style={{ color: '#64748B' }} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Location */}
              <div className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
                style={{ borderColor: '#E2E8F0' }}>
                <MapPin size={16} style={{ color: locationStatus === 'ok' ? '#0B7A3B' : locationStatus === 'denied' ? '#EF4444' : '#94A3B8' }} />
                <span style={{ color: '#64748B' }}>
                  {locationStatus === 'capturing' ? t('worker.locationCapturing')
                    : locationStatus === 'ok' ? t('worker.locationCaptured')
                    : locationStatus === 'denied' ? t('worker.locationDenied')
                    : t('worker.location')}
                </span>
                {locationStatus === 'denied' && (
                  <button onClick={captureLocation} className="ml-auto text-xs underline" style={{ color: '#3B82F6' }}>Retry</button>
                )}
              </div>

              {/* Tasks */}
              <div>
                <h3 className="mb-3 text-sm font-semibold" style={{ color: '#0F172A' }}>{t('worker.tasks')}</h3>
                <div className="space-y-2">
                  {activeOrder.tasks.map(task => (
                    <button key={task.id} onClick={() => toggleTask(task.id)}
                      className="flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all"
                      style={{ borderColor: task.completed ? '#10B981' : '#E2E8F0', backgroundColor: task.completed ? '#F0FDF4' : '#fff' }}>
                      <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md transition-all`}
                        style={{ backgroundColor: task.completed ? '#10B981' : '#F1F5F9', border: task.completed ? 'none' : '2px solid #CBD5E1' }}>
                        {task.completed && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#0F172A' }}>
                        {task.label}{task.count ? ` (${task.count})` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                    {t('worker.photos')} — {activeOrder.photos.length} {t('worker.photosUploaded')}
                  </h3>
                  <span className="text-xs" style={{ color: activeOrder.photos.length >= 5 ? '#0B7A3B' : '#D97706' }}>
                    {t('worker.minPhotos')}
                  </span>
                </div>

                {/* Uploaded photos list */}
                {activeOrder.photos.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    {activeOrder.photos.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5"
                        style={{ borderColor: '#E2E8F0' }}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                          <span className="text-xs truncate max-w-[200px]" style={{ color: '#64748B' }}>{p.filename}</span>
                        </div>
                        <button onClick={() => handleRemoveUploadedPhoto(p.id)} className="text-red-400 hover:text-red-600">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending photos list */}
                {pendingPhotos.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    {pendingPhotos.map((f, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border px-3 py-2.5 border-dashed"
                        style={{ borderColor: '#D97706', backgroundColor: '#FFFBEB' }}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#D97706' }} />
                          <span className="text-xs truncate max-w-[200px]" style={{ color: '#64748B' }}>{f.name}</span>
                        </div>
                        <button onClick={() => handleRemovePending(i)} className="text-red-400 hover:text-red-600">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <motion.button onClick={handleUploadPhotos} disabled={uploadingPhotos}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                      whileTap={{ scale: 0.97 }}>
                      <Upload size={15} />
                      {uploadingPhotos ? t('worker.saving') : `Upload ${pendingPhotos.length} photo${pendingPhotos.length !== 1 ? 's' : ''}`}
                    </motion.button>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" multiple capture="environment"
                  className="hidden" onChange={e => handlePhotoSelect(e.target.files)} />
                <input ref={galleryInputRef} type="file" accept="image/*" multiple
                  className="hidden" onChange={e => handlePhotoSelect(e.target.files)} />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-medium transition-colors hover:border-emerald-400 hover:text-emerald-600"
                    style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                    <Camera size={16} />{lang === 'es' ? 'Cámara' : 'Camera'}
                  </button>
                  <button onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-medium transition-colors hover:border-emerald-400 hover:text-emerald-600"
                    style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                    <Upload size={16} />{lang === 'es' ? 'Galería' : 'Gallery'}
                  </button>
                </div>
              </div>

              {orderError && (
                <div className="rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>{orderError}</div>
              )}
            </div>

            {/* Sheet Footer */}
            <div className="border-t bg-white px-4 py-4 space-y-2" style={{ borderColor: '#E2E8F0' }}>
              <button onClick={handleSaveProgress} disabled={savingOrder}
                className="flex w-full items-center justify-center rounded-xl border py-3 text-sm font-semibold transition-colors hover:bg-gray-50 disabled:opacity-50"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                {t('worker.saveProgress')}
              </button>
              <motion.button onClick={handleMarkComplete} disabled={savingOrder}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Check size={16} />{savingOrder ? t('worker.saving') : t('worker.markComplete')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Ticket Modal */}
      <AnimatePresence>
        {showTicketForm && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowTicketForm(false)}>
            <motion.div className="w-full max-w-md rounded-t-3xl border bg-white p-6 sm:rounded-2xl" style={{ borderColor: '#E2E8F0' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: '#0F172A' }}>{t('tickets.add')}</h3>
                <button onClick={() => setShowTicketForm(false)}><X size={18} style={{ color: '#64748B' }} /></button>
              </div>

              {ticketError && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>{ticketError}</div>
              )}

              <div className="space-y-4">
                {/* Photo */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('tickets.photo')}</label>
                  <input ref={ticketFileRef} type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={e => setTicketFile(e.target.files?.[0] || null)} />
                  <input ref={ticketGalleryRef} type="file" accept="image/*" className="hidden"
                    onChange={e => setTicketFile(e.target.files?.[0] || null)} />
                  {ticketFile ? (
                    <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: '#E2E8F0' }}>
                      <span className="text-sm truncate" style={{ color: '#0F172A' }}>{ticketFile.name}</span>
                      <button onClick={() => setTicketFile(null)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => ticketFileRef.current?.click()}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-medium transition-colors hover:border-emerald-400 hover:text-emerald-600"
                        style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                        <Camera size={16} />{lang === 'es' ? 'Cámara' : 'Camera'}
                      </button>
                      <button onClick={() => ticketGalleryRef.current?.click()}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm font-medium transition-colors hover:border-emerald-400 hover:text-emerald-600"
                        style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                        <Upload size={16} />{lang === 'es' ? 'Galería' : 'Gallery'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('tickets.category')}</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setTicketForm(f => ({ ...f, category: c }))}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                        style={ticketForm.category === c
                          ? { backgroundColor: '#0B7A3B', color: '#fff' }
                          : { backgroundColor: '#F1F5F9', color: '#64748B' }}>
                        {catLabel(c, null, lang)}
                      </button>
                    ))}
                  </div>
                  {ticketForm.category === 'OTRO' && (
                    <input type="text" value={ticketForm.otherLabel}
                      onChange={e => setTicketForm(f => ({ ...f, otherLabel: e.target.value }))}
                      placeholder={t('tickets.otherLabel')}
                      className="mt-2 w-full rounded-xl border px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{ borderColor: '#E2E8F0' }} />
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('tickets.amount')}</label>
                  <input type="number" step="0.01" value={ticketForm.amount}
                    onChange={e => setTicketForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="$0.00"
                    className="w-full rounded-xl border px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ borderColor: '#E2E8F0' }} />
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('tickets.notes')}</label>
                  <textarea value={ticketForm.notes} onChange={e => setTicketForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2} placeholder="..."
                    className="w-full rounded-xl border px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    style={{ borderColor: '#E2E8F0' }} />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => setShowTicketForm(false)}
                  className="flex-1 rounded-xl border py-3 text-sm font-medium hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>{t('tickets.cancel')}</button>
                <motion.button onClick={handleSaveTicket} disabled={savingTicket}
                  className="flex-1 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {savingTicket ? t('tickets.saving') : t('tickets.save')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {orderToast && (
          <motion.div className="fixed bottom-24 left-1/2 z-[90] -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}>
            ✓ {orderToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Ticket Modal */}
      <AnimatePresence>
        {confirmTicketId !== null && (
          <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mx-4 w-full max-w-sm rounded-2xl border bg-white p-6" style={{ borderColor: '#E2E8F0' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className="mb-2 text-base font-bold" style={{ color: '#0F172A' }}>{t('tickets.deleteConfirm')}</h3>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setConfirmTicketId(null)}
                  className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>{t('tickets.cancel')}</button>
                <button onClick={doDeleteTicket}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white"
                  style={{ backgroundColor: '#EF4444' }}>{t('tickets.delete')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {detailTicket && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDetailTicket(null)}>
            <motion.div className="mx-4 w-full max-w-sm rounded-2xl border bg-white p-6" style={{ borderColor: '#E2E8F0' }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold" style={{ color: '#0F172A' }}>{catLabel(detailTicket.category, detailTicket.otherLabel, lang)}</h3>
                <button onClick={() => setDetailTicket(null)}><X size={18} style={{ color: '#64748B' }} /></button>
              </div>
              <a href={detailTicket.path} target="_blank" rel="noopener noreferrer">
                <img src={detailTicket.path} alt={detailTicket.filename}
                  className="mb-4 w-full rounded-xl object-contain max-h-64" style={{ backgroundColor: '#F8FAFC' }} />
              </a>
              <div className="space-y-1 text-sm" style={{ color: '#64748B' }}>
                <p>{new Date(detailTicket.createdAt).toLocaleDateString()}</p>
                {detailTicket.amount && <p>${detailTicket.amount}</p>}
                {detailTicket.notes && <p>{detailTicket.notes}</p>}
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={() => setDetailTicket(null)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>{t('tickets.close')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}
