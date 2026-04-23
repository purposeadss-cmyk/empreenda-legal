import { createClient } from '@/lib/supabase/server'
import type { ActivePost } from '@/lib/types'
import PostCard from '@/components/parceiro/PostCard'
import EmptyState from '@/components/ui/EmptyState'
import { Rss } from 'lucide-react'

export const metadata = { title: 'Feed' }

export default async function FeedPage() {
  const supabase = createClient()

  const { data: posts } = await supabase
    .from('active_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Feed</h1>
        <p className="text-dark-400 mt-1">Publicações recentes dos parceiros homologados</p>
      </div>

      {!posts || posts.length === 0 ? (
        <EmptyState
          icon={Rss}
          title="Nenhuma publicação disponível"
          description="Em breve os parceiros começarão a publicar conteúdos relevantes para você."
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post as ActivePost} />
          ))}
        </div>
      )}
    </div>
  )
}
