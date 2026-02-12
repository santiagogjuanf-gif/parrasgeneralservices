'use client'

import { useState, useEffect } from 'react'
import { Trash2, ChevronDown } from 'lucide-react'

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
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContacts = () => {
    setLoading(true)
    fetch('/api/admin/contacts')
      .then((r) => r.json())
      .then((data) => {
        setContacts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
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
    if (!confirm('Are you sure you want to delete this contact?')) return
    await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' })
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: '#0B7A3B', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-12 text-center" style={{ borderColor: '#E2E8F0' }}>
        <p className="text-lg font-semibold" style={{ color: '#0F172A' }}>No contacts yet</p>
        <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>Contact submissions will appear here.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: '#E2E8F0' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC' }}>
              <th className="px-4 py-3 font-medium" style={{ color: '#64748B' }}>Name</th>
              <th className="px-4 py-3 font-medium" style={{ color: '#64748B' }}>Email</th>
              <th className="px-4 py-3 font-medium" style={{ color: '#64748B' }}>Service</th>
              <th className="px-4 py-3 font-medium" style={{ color: '#64748B' }}>Status</th>
              <th className="px-4 py-3 font-medium" style={{ color: '#64748B' }}>Date</th>
              <th className="px-4 py-3 font-medium" style={{ color: '#64748B' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => {
              const sc = statusColors[contact.status] || statusColors.NEW
              return (
                <tr key={contact.id} className="border-t" style={{ borderColor: '#F1F5F9' }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: '#0F172A' }}>{contact.name}</p>
                    {contact.companyName && (
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{contact.companyName}</p>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: '#334155' }}>{contact.email}</td>
                  <td className="px-4 py-3" style={{ color: '#334155' }}>{contact.serviceType}</td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={contact.status}
                        onChange={(e) => updateStatus(contact.id, e.target.value)}
                        className="appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-medium focus:outline-none"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: sc.text }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="rounded-md p-1.5 transition-colors hover:bg-red-50"
                      style={{ color: '#EF4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
