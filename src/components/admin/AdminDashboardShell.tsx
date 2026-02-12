'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, MessageSquare, FileText, LogOut, Menu, X } from 'lucide-react'

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

  // Derive the admin base path from current URL
  const adminBase = pathname.split('/dashboard')[0]

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        router.push(adminBase)
      })
  }, [router, adminBase])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(adminBase)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: '#0B7A3B', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const navItems = [
    { href: `${adminBase}/dashboard`, label: 'Overview', icon: LayoutDashboard },
    { href: `${adminBase}/dashboard/contacts`, label: 'Contacts', icon: MessageSquare },
    { href: `${adminBase}/dashboard/blog`, label: 'Blog Posts', icon: FileText },
  ]

  const isActive = (href: string) => pathname === href || (href !== `${adminBase}/dashboard` && pathname.startsWith(href))

  const sidebar = (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#0F172A' }}>
      <div className="px-4 py-5">
        <p className="text-lg font-bold text-white">PGS Admin</p>
        <p className="mt-0.5 text-xs" style={{ color: '#94A3B8' }}>{user?.fullName}</p>
      </div>
      <nav className="flex-1 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: active ? '#1E293B' : 'transparent',
                color: active ? '#FFFFFF' : '#94A3B8',
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t px-2 py-3" style={{ borderColor: '#1E293B' }}>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
          style={{ color: '#94A3B8' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-60 lg:hidden">
            {sidebar}
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1">
        <header className="flex items-center gap-3 border-b bg-white px-4 py-3 lg:px-6" style={{ borderColor: '#E2E8F0' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 lg:hidden"
            style={{ color: '#0F172A' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-lg font-semibold" style={{ color: '#0F172A' }}>
            {navItems.find((item) => isActive(item.href))?.label || 'Dashboard'}
          </h1>
        </header>
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
