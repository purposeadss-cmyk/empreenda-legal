'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Phone, Mail, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/shared/AuthProvider'
import type { Lead, Partner } from '@/lib/types'
import { formatDateTime, getLeadStatusLabel, getLeadStatusColor } from '@/lib/utils'
import { LEAD_STATUSES } from '@/lib/constants'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function LeadsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

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
        fetchLeads(p.id)
      })
  }, [user, supabase])

  const fetchLeads = async (partnerId: string, status?: string) => {
    setLoading(true)
    let query = supabase
      .from('leads')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data } = await query
    if (data) setLeads(data as Lead[])
    setLoading(false)
  }

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    await supabase.from('leads').update({ status: newStatus }).eq('id', leadId)
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus as Lead['status'] } : l))
  }

  useEffect(() => {
    if (partner) fetchLeads(partner.id, filter || undefined)
  }, [filter, partner])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-dark-400 mt-1">Solicitações de orçamento recebidas</p>
        </div>
        <div className="w-48">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            <option value="">Todos os status</option>
            {LEAD_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" label="Carregando leads..." className="mx-auto" />
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Nenhum lead recebido"
          description="Quando clientes solicitarem orçamento, os leads aparecerão aqui."
        />
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-dark-900 border border-dark-700 rounded-xl p-6 hover:border-dark-600 transition-all">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold text-white text-lg">{lead.client_name}</p>
                  <p className="text-dark-400 text-sm mt-0.5">{formatDateTime(lead.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getLeadStatusColor(lead.status)}`}>
                    {getLeadStatusLabel(lead.status)}
                  </span>
                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold-500 cursor-pointer"
                  >
                    {LEAD_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-dark-800 rounded-xl p-4 mb-4">
                <p className="text-sm text-dark-300 font-medium mb-1">Necessidade:</p>
                <p className="text-sm text-white leading-relaxed">{lead.needs}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-dark-400">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gold-500" />
                  <a href={`mailto:${lead.client_email}`} className="hover:text-white transition-colors">
                    {lead.client_email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gold-500" />
                  <a href={`tel:${lead.client_whatsapp}`} className="hover:text-white transition-colors">
                    {lead.client_whatsapp}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
