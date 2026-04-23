'use client'

import { useEffect, useState } from 'react'
import { FileText, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Post, Partner } from '@/lib/types'
import { formatDate, timeAgo } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminPostsPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<(Post & { partner?: Partner & { category?: { name: string } } })[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all')

  useEffect(() => {
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, partner:partners(id, company_name, logo_url, category:categories(name))')
      .order('created_at', { ascending: false })

    if (filter === 'active') {
      query = query.eq('published', true).gt('expires_at', new Date().toISOString())
    } else if (filter === 'expired') {
      query = query.lt('expires_at', new Date().toISOString())
    }

    query.then(({ data }) => {
      if (data) setPosts(data as (Post & { partner?: Partner })[])
      setLoading(false)
    })
  }, [filter, supabase])

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Gestão de Posts</h1>
        <p className="text-dark-400 mt-1">Todas as publicações da plataforma</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'expired'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-gold-500 text-dark-950'
                : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
            }`}
          >
            {{ all: 'Todos', active: 'Ativos', expired: 'Expirados' }[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" label="Carregando posts..." className="mx-auto" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum post encontrado" />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const expired = isExpired(post.expires_at)
            return (
              <div key={post.id} className={`bg-dark-900 border rounded-xl p-5 flex items-start gap-4 ${expired ? 'border-dark-700 opacity-70' : 'border-dark-700 hover:border-dark-600'} transition-all`}>
                {post.partner && (
                  <Avatar
                    name={post.partner.company_name}
                    url={post.partner.logo_url}
                    size="md"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-white">{post.title}</p>
                    {expired
                      ? <Badge variant="danger" size="sm">Expirado</Badge>
                      : <Badge variant="success" size="sm">Ativo</Badge>
                    }
                    {!post.published && <Badge variant="warning" size="sm">Rascunho</Badge>}
                  </div>
                  {post.summary && (
                    <p className="text-dark-400 text-sm line-clamp-1 mb-2">{post.summary}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-dark-500">
                    {post.partner && (
                      <span className="text-gold-500/80">{post.partner.company_name}</span>
                    )}
                    <span>Publicado {timeAgo(post.created_at)}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      Expira {formatDate(post.expires_at)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
