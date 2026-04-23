'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Phone, Mail, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/lib/types'
import { formatDateTime, getLeadStatusLabel, getLeadStatusColor } from '@/lib/utils'
import { LEAD_STATUSES } from '@/lib/constants'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminLeadsPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<(Lead & { partner?: { company_name: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [partnerFilter, setPartnerFilter] = useState('')
  const [partners, setPartners] = useState<{ id: string; company_name: string }[]>([])

  useEffect(() => {
    supabase.from('partners').select('id, company_name').eq('status', 'approved').order('company_name')
      .then(({ data }) => { if (data) setPartners(data) })
  }, [supabase])

  useEffect(() => {
    setLoading(true)
    let query = supabase
      .from('leads')
      .select('*, partner:partners(company_name)')
      .order('created_at', { ascending: false })

    if (statusFilter) query = query.eq('status', statusFilter)
    if (partnerFilter) query = query.eq('partner_id', partnerFilter)

    query.then(({ data }) => {
      if (data) setLeads(data as (Lead & { partner?: { company_name: string } })[])
      setLoading(false)
    })
  }, [supabase, statusFilter, partnerFilter])

  const updateStatus = async (leadId: string, status: string) => {
    await supabase.from('leads').update({ status }).eq('id', leadId)
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: status as Lead['status'] } : l))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Gestão de Leads</h1>
        <p className="text-dark-400 mt-1">Todas as solicitações de orçamento</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="">Todos os status</option>
          {LEAD_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="">Todos os parceiros</option>
          {partners.map(p => (
            <option key={p.id} value={p.id}>{p.company_name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" label="Carregando leads..." className="mx-auto" />
        </div>
      ) : leads.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Nenhum lead encontrado" description="Ajuste os filtros para ver outros resultados." />
      ) : (
        <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700 bg-dark-800">
                  <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Cliente</th>
                  <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Parceiro</th>
                  <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Contato</th>
                  <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Necessidade</th>
                  <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">{lead.client_name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-400">
                      {lead.partner?.company_name ?? '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs text-dark-400 flex items-center gap-1">
                          <Mail size={11} /> {lead.client_email}
                        </p>
                        <p className="text-xs text-dark-400 flex items-center gap-1">
                          <Phone size={11} /> {lead.client_whatsapp}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-400 max-w-[200px]">
                      <p className="line-clamp-2">{lead.needs}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gold-500 ${getLeadStatusColor(lead.status)}`}
                      >
                        {LEAD_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-xs text-dark-500 whitespace-nowrap">
                      {formatDateTime(lead.created_at)}
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
