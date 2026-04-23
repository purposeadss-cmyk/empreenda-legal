'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Partner } from '@/lib/types'
import PartnerCard from '@/components/parceiro/PartnerCard'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/components/shared/AuthProvider'

export default function FavoritosPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    supabase
      .from('favorites')
      .select('partner:partners(*, category:categories(id, name, slug))')
      .eq('client_id', user.id)
      .then(({ data }) => {
        if (data) {
          setPartners(data.map((f: { partner: Partner }) => f.partner).filter(Boolean))
        }
        setLoading(false)
      })
  }, [user, supabase])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Favoritos</h1>
        <p className="text-dark-400 mt-1">Parceiros que você salvou</p>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" label="Carregando favoritos..." className="mx-auto" />
        </div>
      ) : partners.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nenhum favorito ainda"
          description="Explore os parceiros disponíveis e salve os que mais te interessam."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}
    </div>
  )
}
