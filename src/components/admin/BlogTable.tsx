'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

interface Post {
  id: number
  slug: string
  titleEn: string
  category: string
  status: string
  publishedAt: string | null
  createdAt: string
}

export default function BlogTable() {
  const router = useRouter()
  const pathname = usePathname()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = () => {
    setLoading(true)
    fetch('/api/admin/blog')
      .then((r) => r.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchPosts() }, [])

  const deletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return
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
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p))
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm" style={{ color: '#94A3B8' }}>{posts.length} posts</p>
        <button
          onClick={() => router.push(`${pathname}/new`)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: '#0B7A3B' }}
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: '#0B7A3B', borderTopColor: 'transparent' }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-lg font-semibold" style={{ color: '#0F172A' }}>No blog posts yet</p>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>Create your first post to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: '#E2E8F0' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC' }}>
                  <th className="px-4 py-3 font-medium" style={{ color: '#64748B' }}>Title</th>
                  <th className="px-4 py-3 font-medium" style={{ color: '#64748B' }}>Category</th>
                  <th className="px-4 py-3 font-medium" style={{ color: '#64748B' }}>Status</th>
                  <th className="px-4 py-3 font-medium" style={{ color: '#64748B' }}>Date</th>
                  <th className="px-4 py-3 font-medium" style={{ color: '#64748B' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-t" style={{ borderColor: '#F1F5F9' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: '#0F172A' }}>{post.titleEn || post.slug}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>/{post.slug}</p>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#334155' }}>{post.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: post.status === 'PUBLISHED' ? '#E7F6ED' : '#FEF9E7',
                          color: post.status === 'PUBLISHED' ? '#0B7A3B' : '#92400E',
                        }}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#94A3B8' }}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleStatus(post)}
                          className="rounded-md p-1.5 transition-colors hover:bg-[#F6F8FA]"
                          title={post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          style={{ color: '#64748B' }}
                        >
                          {post.status === 'PUBLISHED' ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => router.push(`${pathname}/${post.id}/edit`)}
                          className="rounded-md p-1.5 transition-colors hover:bg-[#F6F8FA]"
                          style={{ color: '#64748B' }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="rounded-md p-1.5 transition-colors hover:bg-red-50"
                          style={{ color: '#EF4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
