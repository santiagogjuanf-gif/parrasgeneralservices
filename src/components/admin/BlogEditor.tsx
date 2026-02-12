'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAdminLang } from './AdminDashboardShell'

interface PostData {
  slug: string
  category: string
  tags: string
  coverImageUrl: string
  status: string
  titleEn: string
  titleFr: string
  titleEs: string
  excerptEn: string
  excerptFr: string
  excerptEs: string
  contentEn: string
  contentFr: string
  contentEs: string
}

const emptyPost: PostData = {
  slug: '', category: '', tags: '', coverImageUrl: '', status: 'DRAFT',
  titleEn: '', titleFr: '', titleEs: '',
  excerptEn: '', excerptFr: '', excerptEs: '',
  contentEn: '', contentFr: '', contentEs: '',
}

const CATEGORIES = ['Cleaning Tips', 'Industry News', 'Company Updates', 'Health & Safety']

export default function BlogEditor({ postId }: { postId?: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useAdminLang()
  const [post, setPost] = useState<PostData>(emptyPost)
  const [activeTab, setActiveTab] = useState<'en' | 'fr' | 'es'>('en')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(!!postId)

  const blogListPath = pathname.replace(/\/(new|\d+\/edit)$/, '')

  useEffect(() => {
    if (postId) {
      fetch(`/api/admin/blog/${postId}`)
        .then((r) => r.json())
        .then((data) => {
          setPost({
            slug: data.slug || '', category: data.category || '', tags: data.tags || '',
            coverImageUrl: data.coverImageUrl || '', status: data.status || 'DRAFT',
            titleEn: data.titleEn || '', titleFr: data.titleFr || '', titleEs: data.titleEs || '',
            excerptEn: data.excerptEn || '', excerptFr: data.excerptFr || '', excerptEs: data.excerptEs || '',
            contentEn: data.contentEn || '', contentFr: data.contentFr || '', contentEs: data.contentEs || '',
          })
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [postId])

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      const url = postId ? `/api/admin/blog/${postId}` : '/api/admin/blog'
      const method = postId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save'); setSaving(false); return }
      router.push(blogListPath)
    } catch {
      setError(t('editor.error.connection'))
      setSaving(false)
    }
  }

  const update = (field: keyof PostData, value: string) => {
    setPost((prev) => ({ ...prev, [field]: value }))
  }

  const generateSlug = () => {
    if (post.titleEn) {
      update('slug', post.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
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

  const inputClass = 'w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'

  return (
    <motion.div className="mx-auto max-w-4xl"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.push(blogListPath)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100"
          style={{ color: '#64748B' }}>
          <ArrowLeft size={16} />
          {t('editor.back')}
        </button>
        <div className="flex items-center gap-3">
          <select value={post.status} onChange={(e) => update('status', e.target.value)}
            className="rounded-xl border px-4 py-2.5 text-sm" style={{ borderColor: '#E2E8F0' }}>
            <option value="DRAFT">{t('editor.draft')}</option>
            <option value="PUBLISHED">{t('editor.published')}</option>
          </select>
          <motion.button onClick={handleSave} disabled={saving}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <Save size={16} className="relative" />
            <span className="relative">{saving ? t('editor.saving') : t('editor.save')}</span>
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
          {error}
        </div>
      )}

      {/* Meta fields */}
      <div className="mb-6 rounded-2xl border bg-white p-6" style={{ borderColor: '#E2E8F0' }}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>
          {t('editor.settings')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('editor.slug')}</label>
            <div className="flex gap-2">
              <input type="text" value={post.slug}
                onChange={(e) => update('slug', e.target.value)}
                placeholder="my-post-slug" className={inputClass} style={{ borderColor: '#E2E8F0' }} />
              <button onClick={generateSlug} type="button"
                className="rounded-xl border px-4 py-2 text-xs font-medium transition-colors hover:bg-gray-50"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                {t('editor.auto')}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('editor.category')}</label>
            <select value={post.category} onChange={(e) => update('category', e.target.value)}
              className={inputClass} style={{ borderColor: '#E2E8F0' }}>
              <option value="">{t('editor.selectCategory')}</option>
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('editor.tags')}</label>
            <input type="text" value={post.tags} onChange={(e) => update('tags', e.target.value)}
              placeholder="cleaning, tips, office" className={inputClass} style={{ borderColor: '#E2E8F0' }} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('editor.coverImage')}</label>
            <input type="text" value={post.coverImageUrl} onChange={(e) => update('coverImageUrl', e.target.value)}
              placeholder="https://..." className={inputClass} style={{ borderColor: '#E2E8F0' }} />
          </div>
        </div>
      </div>

      {/* Language tabs */}
      <div className="rounded-2xl border bg-white" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex border-b" style={{ borderColor: '#E2E8F0' }}>
          {(['en', 'fr', 'es'] as const).map((l) => (
            <button key={l} onClick={() => setActiveTab(l)}
              className="relative px-6 py-3.5 text-sm font-medium uppercase transition-colors"
              style={{ color: activeTab === l ? '#0B7A3B' : '#94A3B8' }}>
              {l}
              {activeTab === l && (
                <motion.div className="absolute inset-x-0 bottom-0 h-[2px]"
                  style={{ background: 'linear-gradient(90deg, #0B7A3B, #10B981)' }}
                  layoutId="editor-tab"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('editor.titleField')}</label>
            <input type="text"
              value={post[`title${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof PostData] as string}
              onChange={(e) => update(`title${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof PostData, e.target.value)}
              className={inputClass} style={{ borderColor: '#E2E8F0' }} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('editor.excerpt')}</label>
            <textarea
              value={post[`excerpt${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof PostData] as string}
              onChange={(e) => update(`excerpt${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof PostData, e.target.value)}
              rows={2} className={inputClass} style={{ borderColor: '#E2E8F0' }} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#334155' }}>{t('editor.content')}</label>
            <textarea
              value={post[`content${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof PostData] as string}
              onChange={(e) => update(`content${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof PostData, e.target.value)}
              rows={16} className={`${inputClass} font-mono`} style={{ borderColor: '#E2E8F0' }} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
