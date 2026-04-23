'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import {
  Globe, Instagram, Mail, Phone, Heart, MessageCircle,
  MapPin, ExternalLink, Play
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Partner, Post } from '@/lib/types'
import { extractYouTubeId, timeAgo } from '@/lib/utils'
import { useAuth } from '@/components/shared/AuthProvider'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import OrcamentoModal from '@/components/parceiro/OrcamentoModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function PartnerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const supabase = createClient()

  const [partner, setPartner] = useState<Partner & { category?: { name: string } } | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [orcamentoOpen, setOrcamentoOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPartner = async () => {
      // Tentar buscar por slug primeiro, depois por id
      let query = supabase
        .from('partners')
        .select('*, category:categories(id, name, slug)')
        .eq('status', 'approved')

      const { data: bySlug } = await query.eq('slug', id).single()
      const partnerData = bySlug ?? (await query.eq('id', id).single()).data

      if (partnerData) {
        setPartner(partnerData as Partner & { category?: { name: string } })

        // Registrar visualização
        fetch('/api/clicks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partner_id: partnerData.id, event_type: 'profile_view' }),
        })

        // Buscar posts
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('partner_id', partnerData.id)
          .eq('published', true)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(6)

        if (postsData) setPosts(postsData as Post[])

        // Verificar favorito
        if (user) {
          const { data: fav } = await supabase
            .from('favorites')
            .select('id')
            .eq('client_id', user.id)
            .eq('partner_id', partnerData.id)
            .single()
          setIsFavorite(!!fav)
        }
      }
      setLoading(false)
    }

    fetchPartner()
  }, [id, user, supabase])

  const toggleFavorite = async () => {
    if (!partner || !user) return
    if (isFavorite) {
      await supabase.from('favorites').delete()
        .eq('client_id', user.id).eq('partner_id', partner.id)
      setIsFavorite(false)
    } else {
      await supabase.from('favorites').insert({ client_id: user.id, partner_id: partner.id })
      setIsFavorite(true)
      // Registrar evento
      fetch('/api/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner_id: partner.id, event_type: 'favorite' }),
      })
    }
  }

  const handleOrcamentoClick = () => {
    if (!partner) return
    fetch('/api/clicks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner_id: partner.id, event_type: 'quote_click' }),
    })
    setOrcamentoOpen(true)
  }

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" label="Carregando perfil..." className="mx-auto" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="py-20 text-center">
        <p className="text-dark-400">Parceiro não encontrado.</p>
      </div>
    )
  }

  const youtubeId = partner.youtube_url ? extractYouTubeId(partner.youtube_url) : null

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header card */}
        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar name={partner.company_name} url={partner.logo_url} size="xl" />

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">{partner.company_name}</h1>
                  {partner.category && (
                    <Badge variant="gold" size="md" className="mt-2">{partner.category.name}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isFavorite
                        ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                        : 'bg-dark-800 border-dark-700 text-dark-400 hover:text-white'
                    }`}
                  >
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <Button onClick={handleOrcamentoClick} size="lg">
                    <MessageCircle size={18} />
                    Solicitar orçamento
                  </Button>
                </div>
              </div>

              {partner.description && (
                <p className="text-dark-300 mt-4 leading-relaxed">{partner.description}</p>
              )}

              {/* Countries */}
              {partner.countries.length > 0 && (
                <div className="flex items-center gap-2 mt-4 text-sm text-dark-400">
                  <MapPin size={14} className="text-gold-500" />
                  <span>Atende: {partner.countries.join(', ')}</span>
                </div>
              )}

              {/* Contact links */}
              <div className="flex flex-wrap gap-3 mt-4">
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-gold-400 transition-colors">
                    <Globe size={14} />
                    Site
                    <ExternalLink size={12} />
                  </a>
                )}
                {partner.instagram && (
                  <a href={`https://instagram.com/${partner.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-gold-400 transition-colors">
                    <Instagram size={14} />
                    Instagram
                    <ExternalLink size={12} />
                  </a>
                )}
                {partner.email && (
                  <a href={`mailto:${partner.email}`}
                    className="flex items-center gap-1.5 text-sm text-dark-400 hover:text-gold-400 transition-colors">
                    <Mail size={14} />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* YouTube video */}
        {youtubeId && (
          <div className="bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-dark-700 flex items-center gap-2">
              <Play size={16} className="text-gold-400" />
              <h2 className="font-semibold text-white">Vídeo de apresentação</h2>
            </div>
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Vídeo do parceiro"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Posts */}
        {posts.length > 0 && (
          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6">
            <h2 className="font-semibold text-white mb-4">Publicações recentes</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="flex gap-4 p-4 rounded-xl bg-dark-800 border border-dark-700">
                  {post.image_url && (
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={post.image_url} alt={post.title} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-white text-sm">{post.title}</h3>
                    {post.summary && (
                      <p className="text-dark-400 text-xs mt-1 line-clamp-2">{post.summary}</p>
                    )}
                    <p className="text-dark-500 text-xs mt-2">{timeAgo(post.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-gold-500/10 to-transparent border border-gold-500/20 flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">Pronto para dar o próximo passo?</p>
            <p className="text-dark-400 text-sm">Solicite um orçamento agora mesmo</p>
          </div>
          <Button onClick={handleOrcamentoClick} size="lg">
            <MessageCircle size={18} />
            Solicitar orçamento
          </Button>
        </div>
      </div>

      {orcamentoOpen && (
        <OrcamentoModal
          isOpen={orcamentoOpen}
          onClose={() => setOrcamentoOpen(false)}
          partner={partner}
        />
      )}
    </>
  )
}
