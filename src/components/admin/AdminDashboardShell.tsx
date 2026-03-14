'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, MessageSquare, FileText, Users, LogOut, Menu, X, Globe, ChevronRight, Store, ClipboardList, Receipt } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type AdminLocale,
  getAdminT,
  getTimeFarewell,
  getStoredAdminLocale,
  setStoredAdminLocale,
} from '@/lib/admin-i18n'

interface User {
  userId: number
  username: string
  fullName: string
  role: string
}

export default function AdminDashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [lang, setLang] = useState<AdminLocale>('en')
  const [showFarewell, setShowFarewell] = useState(false)

  const adminBase = pathname.split('/dashboard')[0]
  const t = getAdminT(lang)

  useEffect(() => {
    setLang(getStoredAdminLocale())
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((data) => { setUser(data); setLoading(false) })
      .catch(() => router.replace(adminBase))
  }, [router, adminBase])

  const toggleLang = useCallback(() => {
    const next = lang === 'en' ? 'es' : 'en'
    setLang(next)
    setStoredAdminLocale(next)
  }, [lang])

  const handleLogout = async () => {
    setShowFarewell(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    setTimeout(() => router.replace(adminBase), 2400)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#0F172A' }}>
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="h-10 w-10 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
          <p className="text-sm" style={{ color: '#94A3B8' }}>Loading...</p>
        </motion.div>
      </div>
    )
  }

  const isAdmin = user?.role === 'ADMIN'
  const isBoss = user?.role === 'BOSS'

  const navItems = [
    ...(isAdmin ? [
      { href: `${adminBase}/dashboard`, label: t('sidebar.overview'), icon: LayoutDashboard },
      { href: `${adminBase}/dashboard/contacts`, label: t('sidebar.contacts'), icon: MessageSquare },
      { href: `${adminBase}/dashboard/blog`, label: t('sidebar.blog'), icon: FileText },
      { href: `${adminBase}/dashboard/users`, label: t('sidebar.users'), icon: Users },
    ] : []),
    ...(isAdmin || isBoss ? [
      { href: `${adminBase}/dashboard/stores`, label: t('sidebar.stores'), icon: Store },
      { href: `${adminBase}/dashboard/workorders`, label: t('sidebar.workorders'), icon: ClipboardList },
      { href: `${adminBase}/dashboard/tickets`, label: t('sidebar.tickets'), icon: Receipt },
    ] : []),
  ]

  const isActive = (href: string) =>
    pathname === href || (href !== `${adminBase}/dashboard` && pathname.startsWith(href))

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const sidebar = (
    <div className="flex h-full flex-col" style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)' }}>
      {/* Top gradient accent */}
      <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #0B7A3B, #10B981, #0B7A3B)' }} />

      {/* User section */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.fullName}</p>
            <p className="truncate text-xs" style={{ color: '#64748B' }}>{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>
          {lang === 'en' ? 'Menu' : 'Menú'}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="group relative mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
              style={{ color: active ? '#FFFFFF' : '#94A3B8' }}>
              {active && (
                <motion.div className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(11,122,59,0.3), rgba(16,185,129,0.15))' }}
                  layoutId="sidebar-active"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
              )}
              <Icon size={18} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
              {active && (
                <ChevronRight size={14} className="relative z-10 ml-auto" style={{ color: '#10B981' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Language + Logout */}
      <div className="border-t px-3 py-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={toggleLang}
          className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
          style={{ color: '#94A3B8' }}>
          <Globe size={18} />
          {lang === 'en' ? 'Español' : 'English'}
        </button>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-red-500/10"
          style={{ color: '#EF4444' }}>
          <LogOut size={18} />
          {t('sidebar.signOut')}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Farewell overlay */}
      <AnimatePresence>
        {showFarewell && user && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 overflow-hidden">
              <motion.div className="absolute h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', top: '20%', left: '30%' }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
            <motion.div className="relative z-10 text-center"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5 }}>
              <motion.div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
                initial={{ rotate: 0 }} animate={{ rotate: 360 }}
                transition={{ duration: 0.8, type: 'spring' }}>
                <LogOut size={28} className="text-white" />
              </motion.div>
              <motion.h2 className="mb-2 text-3xl font-bold text-white"
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}>
                {getTimeFarewell(lang)}, {user.fullName.split(' ')[0]}!
              </motion.h2>
              <motion.p className="text-lg" style={{ color: '#94A3B8' }}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}>
                {t('farewell.sub')}
              </motion.p>
              <motion.div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full"
                style={{ backgroundColor: '#1E293B' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #0B7A3B, #10B981)' }}
                  initial={{ width: '0%' }} animate={{ width: '100%' }}
                  transition={{ delay: 0.7, duration: 1.6, ease: 'easeInOut' }} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
        {/* Desktop sidebar */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <div className="fixed inset-y-0 left-0 w-64">{sidebar}</div>
        </aside>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)} />
              <motion.div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                {sidebar}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {/* Header bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur-md lg:px-6"
            style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100 lg:hidden"
                style={{ color: '#0F172A' }}>
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-lg font-semibold" style={{ color: '#0F172A' }}>
                  {navItems.find((item) => isActive(item.href))?.label || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Desktop lang toggle */}
              <button onClick={toggleLang}
                className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 sm:flex"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                <Globe size={14} />
                {lang.toUpperCase()}
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}>
                {initials}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6">
            <AdminLangContext.Provider value={{ lang, t, currentRole: user?.role ?? '' }}>
              {children}
            </AdminLangContext.Provider>
          </main>
        </div>
      </div>
    </>
  )
}

// Context to share lang with child pages
import { createContext, useContext } from 'react'
import type { AdminKey } from '@/lib/admin-i18n'

interface AdminLangCtx {
  lang: AdminLocale
  t: (key: AdminKey) => string
  currentRole: string
}

export const AdminLangContext = createContext<AdminLangCtx>({
  lang: 'en',
  t: (key) => key,
  currentRole: '',
})

export function useAdminLang() {
  return useContext(AdminLangContext)
}
