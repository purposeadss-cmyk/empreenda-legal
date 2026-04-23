import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Building2 } from 'lucide-react'
import type { ActivePost } from '@/lib/types'
import { timeAgo, truncate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'

interface PostCardProps {
  post: ActivePost
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden hover:border-gold-500/30 transition-all duration-300 group">
      {post.image_url && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={post.partner_name} url={post.partner_logo} size="sm" />
          <div>
            <Link
              href={`/parceiros/${post.partner_slug ?? post.partner_id}`}
              className="text-sm font-medium text-white hover:text-gold-400 transition-colors"
            >
              {post.partner_name}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="gold" size="sm">{post.category_name}</Badge>
            </div>
          </div>
        </div>

        <h2 className="font-semibold text-white text-lg mb-2 group-hover:text-gold-400 transition-colors line-clamp-2">
          {post.title}
        </h2>

        {post.summary && (
          <p className="text-dark-400 text-sm leading-relaxed line-clamp-3 mb-4">
            {post.summary}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-dark-500">
          <Calendar size={12} />
          <span>{timeAgo(post.created_at)}</span>
        </div>
      </div>
    </article>
  )
}
