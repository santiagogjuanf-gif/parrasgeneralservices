'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, FileText, Eye, Clock } from 'lucide-react'

interface Stats {
  totalContacts: number
  newContacts: number
  totalPosts: number
  publishedPosts: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({ totalContacts: 0, newContacts: 0, totalPosts: 0, publishedPosts: 0 })

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/contacts').then((r) => r.json()),
      fetch('/api/admin/blog').then((r) => r.json()),
    ]).then(([contacts, posts]) => {
      setStats({
        totalContacts: Array.isArray(contacts) ? contacts.length : 0,
        newContacts: Array.isArray(contacts) ? contacts.filter((c: { status: string }) => c.status === 'NEW').length : 0,
        totalPosts: Array.isArray(posts) ? posts.length : 0,
        publishedPosts: Array.isArray(posts) ? posts.filter((p: { status: string }) => p.status === 'PUBLISHED').length : 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Total Contacts', value: stats.totalContacts, icon: MessageSquare, color: '#0B7A3B', bg: '#E7F6ED' },
    { label: 'New Contacts', value: stats.newContacts, icon: Clock, color: '#D4A11E', bg: '#FEF9E7' },
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Published', value: stats.publishedPosts, icon: Eye, color: '#7C3AED', bg: '#F5F3FF' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: '#E2E8F0' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: card.bg }}>
                <Icon size={20} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: '#0F172A' }}>{card.value}</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{card.label}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
