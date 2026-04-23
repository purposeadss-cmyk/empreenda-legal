'use client'

import { useEffect, useState } from 'react'
import { Search, CheckCircle, XCircle, Eye, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Partner } from '@/lib/types'
import { formatDate, getPartnerStatusLabel, getPartnerStatusColor } from '@/lib/utils'
import { PARTNER_STATUSES } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminParceirosPage() {
  const supabase = createClient()
  const [partners, setPartners] = useState<(Partner & { category?: { name: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPartners = async () => {
    setLoading(true)
    let query = supabase
      .from('partners')
      .select('*, category:categories(name), profile:profiles(full_name, email)')
      .order('created_at', { ascending: false })

    if (statusFilter) query = query.eq('status', statusFilter)
    if (search.trim()) query = query.ilike('company_name', `%${search.trim()}%`)

    const { data } = await query
    if (data) setPartners(data as (Partner & { category?: { name: string } })[])
    setLoading(false)
  }

  useEffect(() => { fetchPartners() }, [search, statusFilter])

  const updateStatus = async (partnerId: string, status: 'approved' | 'rejected') => {
    setActionLoading(partnerId)
    await supabase.from('partners').update({ status }).eq('id', partnerId)
    setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, status } : p))
    setActionLoading(null)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Gestão de Parceiros</h1>
        <p className="text-dark-400 mt-1">Aprovar, rejeitar e gerenciar parceiros</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empresa..."
            className="w-full bg-dark-900 border border-dark-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500 min-w-[180px]"
        >
          <option value="">Todos os status</option>
          {PARTNER_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" label="Carregando parceiros..." className="mx-auto" />
        </div>
      ) : partners.length === 0 ? (
        <EmptyState icon={Building2} title="Nenhum parceiro encontrado" description="Ajuste os filtros para ver outros resultados." />
      ) : (
        <div className="space-y-3">
          {partners.map((partner) => {
            const profile = (partner as Partner & { profile?: { full_name: string; email: string } }).profile
            return (
              <div key={partner.id} className="bg-dark-900 border border-dark-700 rounded-xl p-5 flex items-center gap-4 hover:border-dark-600 transition-all">
                <Avatar name={partner.company_name} url={partner.logo_url} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white">{partner.company_name}</p>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getPartnerStatusColor(partner.status)}`}>
                      {getPartnerStatusLabel(partner.status)}
                    </span>
                    {partner.category && (
                      <Badge variant="gold" size="sm">{partner.category.name}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-dark-500">
                    {profile && <span>{profile.email}</span>}
                    <span>Cadastrado em {formatDate(partner.created_at)}</span>
                    <span>{partner.profile_views} visualizações</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {partner.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(partner.id, 'approved')}
                        loading={actionLoading === partner.id}
                      >
                        <CheckCircle size={14} />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => updateStatus(partner.id, 'rejected')}
                        loading={actionLoading === partner.id}
                      >
                        <XCircle size={14} />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  {partner.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => updateStatus(partner.id, 'rejected')}
                      loading={actionLoading === partner.id}
                    >
                      <XCircle size={14} />
                      Revogar
                    </Button>
                  )}
                  {partner.status === 'rejected' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateStatus(partner.id, 'approved')}
                      loading={actionLoading === partner.id}
                    >
                      <CheckCircle size={14} />
                      Reativar
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
