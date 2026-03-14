'use client'

import { useState, useEffect } from 'react'
import { Trash2, ChevronDown, Inbox, Eye, X, MapPin, Mail, Phone, Calendar, Clock, Building2, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminLang } from './AdminDashboardShell'
import ConfirmModal from './ConfirmModal'

interface Contact {
  id: number
  name: string
  email: string
  phone: string | null
  companyName: string | null
  serviceType: string
  requestedDate: string | null
  contactTimePreference: string
  addressLine1: string
  addressLine2: string | null
  city: string
  province: string
  postalCode: string
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

const statusKeyMap: Record<string, string> = {
  NEW: 'contacts.statusNew',
  CONTACTED: 'contacts.statusContacted',
  IN_PROGRESS: 'contacts.statusInProgress',
  COMPLETED: 'contacts.statusCompleted',
  ARCHIVED: 'contacts.statusArchived',
}

export default function ContactsTable() {
  const { t } = useAdminLang()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const getStatusLabel = (status: string) => {
    const key = statusKeyMap[status]
    return key ? t(key as Parameters<typeof t>[0]) : status
  }

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

  const deleteContact = (id: number) => setConfirmDeleteId(id)

  const doDeleteContact = async () => {
    if (confirmDeleteId === null) return
    await fetch(`/api/admin/contacts/${confirmDeleteId}`, { method: 'DELETE' })
    setContacts((prev) => prev.filter((c) => c.id !== confirmDeleteId))
    if (selectedContact?.id === confirmDeleteId) setSelectedContact(null)
    setConfirmDeleteId(null)
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
    <>
      <ConfirmModal
        open={confirmDeleteId !== null}
        message={t('contacts.deleteConfirm')}
        onConfirm={doDeleteContact}
        onCancel={() => setConfirmDeleteId(null)}
      />
      {/* Detail Modal */}
      <AnimatePresence>
        {selectedContact && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedContact(null)}>
            <motion.div className="mx-4 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border bg-white p-6"
              style={{ borderColor: '#E2E8F0' }}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: '#0F172A' }}>{t('contacts.details')}</h3>
                <button onClick={() => setSelectedContact(null)} className="rounded-lg p-1 hover:bg-gray-100">
                  <X size={18} style={{ color: '#64748B' }} />
                </button>
              </div>

              {/* Contact name & status */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold" style={{ color: '#0F172A' }}>{selectedContact.name}</p>
                  {selectedContact.companyName && (
                    <p className="flex items-center gap-1 text-sm" style={{ color: '#64748B' }}>
                      <Building2 size={14} /> {selectedContact.companyName}
                    </p>
                  )}
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: (statusColors[selectedContact.status] || statusColors.NEW).bg, color: (statusColors[selectedContact.status] || statusColors.NEW).text }}>
                  {getStatusLabel(selectedContact.status)}
                </span>
              </div>

              {/* Info grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#F8FAFC' }}>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#94A3B8' }}>
                      <Mail size={12} /> {t('contacts.email')}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{selectedContact.email}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#F8FAFC' }}>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#94A3B8' }}>
                      <Phone size={12} /> {t('contacts.phone')}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#0F172A' }}>
                      {selectedContact.phone || t('contacts.notProvided')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#F8FAFC' }}>
                    <p className="mb-1 text-xs font-medium" style={{ color: '#94A3B8' }}>{t('contacts.service')}</p>
                    <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{selectedContact.serviceType}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#F8FAFC' }}>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#94A3B8' }}>
                      <Calendar size={12} /> {t('contacts.requestedDate')}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#0F172A' }}>
                      {selectedContact.requestedDate || t('contacts.notProvided')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#F8FAFC' }}>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#94A3B8' }}>
                      <Clock size={12} /> {t('contacts.contactTime')}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#0F172A' }}>{selectedContact.contactTimePreference}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#F8FAFC' }}>
                    <p className="mb-1 text-xs font-medium" style={{ color: '#94A3B8' }}>{t('contacts.date')}</p>
                    <p className="text-sm font-medium" style={{ color: '#0F172A' }}>
                      {new Date(selectedContact.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl p-3" style={{ backgroundColor: '#F8FAFC' }}>
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#94A3B8' }}>
                    <MapPin size={12} /> {t('contacts.address')}
                  </p>
                  <p className="text-sm font-medium" style={{ color: '#0F172A' }}>
                    {selectedContact.addressLine1}
                    {selectedContact.addressLine2 && <>, {selectedContact.addressLine2}</>}
                    <br />
                    {selectedContact.city}, {selectedContact.province} {selectedContact.postalCode}
                  </p>
                </div>

                <div className="rounded-xl p-3" style={{ backgroundColor: '#F8FAFC' }}>
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#94A3B8' }}>
                    <MessageSquare size={12} /> {t('contacts.message')}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: '#0F172A' }}>
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 flex justify-end">
                <button onClick={() => setSelectedContact(null)}
                  className="rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                  {t('contacts.close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
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
                            <option key={s} value={s}>{getStatusLabel(s)}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: sc.text }} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedContact(contact)}
                          className="rounded-lg p-2 transition-colors hover:bg-emerald-50"
                          style={{ color: '#0B7A3B' }}
                          title={t('contacts.viewDetails')}>
                          <Eye size={16} />
                        </button>
                        <button onClick={() => deleteContact(contact.id)}
                          className="rounded-lg p-2 transition-colors hover:bg-red-50"
                          style={{ color: '#EF4444' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  )
}
