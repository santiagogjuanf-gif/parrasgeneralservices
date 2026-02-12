'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAdminLang } from './AdminDashboardShell'

interface Post {
  id: number
  slug: string
  titleEn: string
  titleEs: string
  category: string
  status: string
  publishedAt: string | null
  createdAt: string
}

export default function BlogTable() {
  const router = useRouter()
  const pathname = usePathname()
  const { lang, t } = useAdminLang()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = () => {
    setLoading(true)
    fetch('/api/admin/blog')
      .then((r) => r.json())
      .then((data) => { setPosts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchPosts() }, [])

  const deletePost = async (id: number) => {
    if (!confirm(t('blog.deleteConfirm'))) return
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const toggleStatus = async (post: Post) => {
    const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p)))
  }

  const getTitle = (post: Post) => {
    if (lang === 'es' && post.titleEs) return post.titleEs
    return post.titleEn || post.slug
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm" style={{ color: '#94A3B8' }}>{posts.length} {t('blog.posts')}</p>
        <motion.button
          onClick={() => router.push(`${pathname}/new`)}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Plus size={16} className="relative" />
          <span className="relative">{t('blog.newPost')}</span>
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div className="h-8 w-8 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #0B7A3B, #10B981)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        </div>
      ) : posts.length === 0 ? (
        <motion.div className="rounded-2xl border bg-white p-16 text-center"
          style={{ borderColor: '#E2E8F0' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: '#EFF6FF' }}>
            <FileText size={28} style={{ color: '#2563EB' }} />
          </div>
          <p className="text-lg font-semibold" style={{ color: '#0F172A' }}>{t('blog.empty')}</p>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>{t('blog.emptyDesc')}</p>
        </motion.div>
      ) : (
        <motion.div className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          style={{ borderColor: '#E2E8F0' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC' }}>
                  <th className="px-5 py-3.5 font-medium" style={{ color: '#64748B' }}>{t('blog.titleCol')}</th>
                  <th className="px-5 py-3.5 font-medium" style={{ color: '#64748B' }}>{t('blog.category')}</th>
                  <th className="px-5 py-3.5 font-medium" style={{ color: '#64748B' }}>{t('blog.status')}</th>
                  <th className="px-5 py-3.5 font-medium" style={{ color: '#64748B' }}>{t('blog.date')}</th>
                  <th className="px-5 py-3.5 font-medium" style={{ color: '#64748B' }}>{t('blog.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, i) => (
                  <motion.tr key={post.id} className="border-t" style={{ borderColor: '#F1F5F9' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium" style={{ color: '#0F172A' }}>{getTitle(post)}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>/{post.slug}</p>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: '#334155' }}>{post.category}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: post.status === 'PUBLISHED' ? '#E7F6ED' : '#FEF9E7',
                          color: post.status === 'PUBLISHED' ? '#0B7A3B' : '#92400E',
                        }}>
                        {post.status === 'PUBLISHED' ? t('editor.published') : t('editor.draft')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#94A3B8' }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleStatus(post)}
                          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                          title={post.status === 'PUBLISHED' ? t('blog.unpublish') : t('blog.publish')}
                          style={{ color: '#64748B' }}>
                          {post.status === 'PUBLISHED' ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => router.push(`${pathname}/${post.id}/edit`)}
                          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                          style={{ color: '#64748B' }}>
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deletePost(post.id)}
                          className="rounded-lg p-2 transition-colors hover:bg-red-50"
                          style={{ color: '#EF4444' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
