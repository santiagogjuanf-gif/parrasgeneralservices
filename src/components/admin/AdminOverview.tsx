'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { MessageSquare, FileText, Eye, Clock, Users, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAdminLang } from './AdminDashboardShell'
import { getTimeGreeting } from '@/lib/admin-i18n'

interface Stats {
  totalContacts: number
  newContacts: number
  totalPosts: number
  publishedPosts: number
  totalUsers: number
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(0)

  useEffect(() => {
    if (value === 0) return
    const duration = 800
    const start = ref.current
    const diff = value - start
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + diff * eased)
      setDisplay(current)
      if (progress < 1) requestAnimationFrame(step)
      else ref.current = value
    }
    requestAnimationFrame(step)
  }, [value])

  return <>{display}</>
}

export default function AdminOverview() {
  const { lang, t } = useAdminLang()
  const router = useRouter()
  const pathname = usePathname()
  const adminBase = pathname.replace(/\/dashboard.*/, '')
  const [stats, setStats] = useState<Stats>({ totalContacts: 0, newContacts: 0, totalPosts: 0, publishedPosts: 0, totalUsers: 0 })
  const [userName, setUserName] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUserName(d.fullName || '')).catch(() => {})

    Promise.all([
      fetch('/api/admin/contacts').then((r) => r.json()),
      fetch('/api/admin/blog').then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()),
    ]).then(([contacts, posts, users]) => {
      setStats({
        totalContacts: Array.isArray(contacts) ? contacts.length : 0,
        newContacts: Array.isArray(contacts) ? contacts.filter((c: { status: string }) => c.status === 'NEW').length : 0,
        totalPosts: Array.isArray(posts) ? posts.length : 0,
        publishedPosts: Array.isArray(posts) ? posts.filter((p: { status: string }) => p.status === 'PUBLISHED').length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
      })
    })
  }, [])

  const cards = [
    { label: t('overview.totalContacts'), value: stats.totalContacts, icon: MessageSquare, gradient: 'linear-gradient(135deg, #0B7A3B, #10B981)', bg: '#F0FDF4', href: `${adminBase}/dashboard/contacts` },
    { label: t('overview.newContacts'), value: stats.newContacts, icon: Clock, gradient: 'linear-gradient(135deg, #D97706, #F59E0B)', bg: '#FFFBEB', href: `${adminBase}/dashboard/contacts` },
    { label: t('overview.totalPosts'), value: stats.totalPosts, icon: FileText, gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)', bg: '#EFF6FF', href: `${adminBase}/dashboard/blog` },
    { label: t('overview.published'), value: stats.publishedPosts, icon: Eye, gradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', bg: '#F5F3FF', href: `${adminBase}/dashboard/blog` },
    { label: t('overview.totalUsers'), value: stats.totalUsers, icon: Users, gradient: 'linear-gradient(135deg, #0891B2, #06B6D4)', bg: '#ECFEFF', href: `${adminBase}/dashboard/users` },
  ]

  return (
    <div>
      {/* Welcome section */}
      <motion.div className="mb-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <motion.div className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
            initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <TrendingUp size={22} className="text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
              {getTimeGreeting(lang)}{userName ? `, ${userName.split(' ')[0]}` : ''}!
            </h2>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              {t('overview.subtitle')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label}
              onClick={() => router.push(card.href)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border bg-white p-6"
              style={{ borderColor: '#E2E8F0' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
              whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
              {/* Gradient accent top */}
              <div className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: card.gradient }} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>{card.label}</p>
                  <p className="mt-2 text-3xl font-bold" style={{ color: '#0F172A' }}>
                    <AnimatedNumber value={card.value} />
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: card.bg }}>
                  <Icon size={20} style={{ color: card.gradient.includes('#0B7A3B') ? '#0B7A3B' : card.gradient.includes('#D97706') ? '#D97706' : card.gradient.includes('#2563EB') ? '#2563EB' : '#7C3AED' }} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
