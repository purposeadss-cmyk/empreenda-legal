'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, FileText, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/shared/AuthProvider'
import type { Post, Partner } from '@/lib/types'
import { formatDate, timeAgo } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function PostsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single()
      .then(({ data: p }) => {
        if (!p) return
        setPartner(p as Partner)
        supabase
          .from('posts')
          .select('*')
          .eq('partner_id', p.id)
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            if (data) setPosts(data as Post[])
            setLoading(false)
          })
      })
  }, [user, supabase])

  const deletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return
    await supabase.from('posts').delete().eq('id', postId)
    setPosts(posts.filter(p => p.id !== postId))
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Posts</h1>
          <p className="text-dark-400 mt-1">Gerencie suas publicações</p>
        </div>
        <Link href="/parceiro/posts/novo">
          <Button>
            <Plus size={16} />
            Novo post
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" label="Carregando posts..." className="mx-auto" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum post publicado"
          description="Crie seu primeiro post e ele aparecerá no feed dos clientes."
          action={{ label: 'Criar post', onClick: () => {} }}
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const expired = isExpired(post.expires_at)
            return (
              <div
                key={post.id}
                className={`bg-dark-900 border rounded-xl p-5 flex items-start justify-between gap-4 ${
                  expired ? 'border-dark-700 opacity-60' : 'border-dark-700 hover:border-dark-600'
                } transition-all`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white truncate">{post.title}</h3>
                    {expired ? (
                      <Badge variant="danger" size="sm">Expirado</Badge>
                    ) : (
                      <Badge variant="success" size="sm">Ativo</Badge>
                    )}
                    {!post.published && <Badge variant="warning" size="sm">Rascunho</Badge>}
                  </div>
                  {post.summary && (
                    <p className="text-dark-400 text-sm line-clamp-1">{post.summary}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
                    <span>Publicado {timeAgo(post.created_at)}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      Expira em {formatDate(post.expires_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
