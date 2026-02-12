'use client'

import { useState, useEffect } from 'react'
import { Trash2, ChevronDown, Inbox } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAdminLang } from './AdminDashboardShell'

interface Contact {
  id: number
  name: string
  email: string
  phone: string | null
  companyName: string | null
  serviceType: string
  message: string
  status: string
  createdAt: string
}

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']

const statusColors: Record<string, { bg: string; text: string }> = {
  NEW: { bg: '#DBEAFE', text: '#1D4ED8' },
  CONTACTED: { bg: '#FEF9E7', text: '#92400E' },
  IN_PROGRESS: { bg: '#E7F6ED', text: '#0B7A3B' },
  COMPLETED: { bg: '#F0FDF4', text: '#166534' },
  ARCHIVED: { bg: '#F1F5F9', text: '#64748B' },
}

export default function ContactsTable() {
  const { t } = useAdminLang()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContacts = () => {
    setLoading(true)
    fetch('/api/admin/contacts')
      .then((r) => r.json())
      .then((data) => { setContacts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchContacts() }, [])

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  const deleteContact = async (id: number) => {
    if (!confirm(t('contacts.deleteConfirm'))) return
    await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' })
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <motion.div className="h-8 w-8 rounded-lg"
          style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <motion.div className="rounded-2xl border bg-white p-16 text-center"
        style={{ borderColor: '#E2E8F0' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: '#F0FDF4' }}>
          <Inbox size={28} style={{ color: '#0B7A3B' }} />
        </div>
        <p className="text-lg font-semibold" style={{ color: '#0F172A' }}>{t('contacts.empty')}</p>
        <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>{t('contacts.emptyDesc')}</p>
      </motion.div>
    )
  }

  return (
    <motion.div className="overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={{ borderColor: '#E2E8F0' }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC' }}>
              <th className="px-5 py-3.5 font-medium" style={{ color: '#64748B' }}>{t('contacts.name')}</th>
              <th className="px-5 py-3.5 font-medium" style={{ color: '#64748B' }}>{t('contacts.email')}</th>
              <th className="px-5 py-3.5 font-medium" style={{ color: '#64748B' }}>{t('contacts.service')}</th>
              <th className="px-5 py-3.5 font-medium" style={{ color: '#64748B' }}>{t('contacts.status')}</th>
              <th className="px-5 py-3.5 font-medium" style={{ color: '#64748B' }}>{t('contacts.date')}</th>
              <th className="px-5 py-3.5 font-medium" style={{ color: '#64748B' }}>{t('contacts.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, i) => {
              const sc = statusColors[contact.status] || statusColors.NEW
              return (
                <motion.tr key={contact.id} className="border-t" style={{ borderColor: '#F1F5F9' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium" style={{ color: '#0F172A' }}>{contact.name}</p>
                    {contact.companyName && (
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{contact.companyName}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: '#334155' }}>{contact.email}</td>
                  <td className="px-5 py-3.5" style={{ color: '#334155' }}>{contact.serviceType}</td>
                  <td className="px-5 py-3.5">
                    <div className="relative inline-block">
                      <select value={contact.status}
                        onChange={(e) => updateStatus(contact.id, e.target.value)}
                        className="appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-medium focus:outline-none"
                        style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: sc.text }} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => deleteContact(contact.id)}
                      className="rounded-lg p-2 transition-colors hover:bg-red-50"
                      style={{ color: '#EF4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
