import { createClient } from '@/lib/supabase/server'
import {
  Users, Building2, MessageSquare, FileText,
  TrendingUp, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'
import StatsCard from '@/components/ui/StatsCard'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatDateTime, getLeadStatusLabel, getLeadStatusColor, getPartnerStatusColor, getPartnerStatusLabel } from '@/lib/utils'

export const metadata = { title: 'Dashboard Admin' }

export default async function AdminDashboard() {
  const supabase = createClient()

  // Métricas gerais
  const { data: metrics } = await supabase.from('admin_metrics').select('*').single()

  // Top parceiros por leads
  const { data: topPartners } = await supabase
    .from('leads')
    .select('partner_id, partners(company_name, logo_url, category_id)')
    .then(async ({ data }) => {
      if (!data) return { data: [] }
      const counts: Record<string, { name: string; count: number }> = {}
      data.forEach((lead: { partner_id: string; partners: { company_name: string } | null }) => {
        if (!lead.partner_id) return
        const name = (lead.partners as { company_name: string } | null)?.company_name ?? 'Desconhecido'
        counts[lead.partner_id] = {
          name,
          count: (counts[lead.partner_id]?.count ?? 0) + 1,
        }
      })
      return {
        data: Object.entries(counts)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 5)
          .map(([id, v]) => ({ id, ...v })),
      }
    })

  // Parceiros pendentes
  const { data: pendingPartners } = await supabase
    .from('partners')
    .select('id, company_name, created_at, category:categories(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  // Leads recentes
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*, partner:partners(company_name)')
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Administrativo</h1>
        <p className="text-dark-400 mt-1">Visão geral da plataforma</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Clientes cadastrados"
          value={metrics?.total_clients ?? 0}
          icon={Users}
        />
        <StatsCard
          title="Parceiros aprovados"
          value={metrics?.approved_partners ?? 0}
          icon={CheckCircle2}
          gold
        />
        <StatsCard
          title="Pendentes de aprovação"
          value={metrics?.pending_partners ?? 0}
          icon={AlertCircle}
        />
        <StatsCard
          title="Posts ativos"
          value={metrics?.active_posts ?? 0}
          icon={FileText}
        />
        <StatsCard
          title="Leads hoje"
          value={metrics?.leads_today ?? 0}
          icon={MessageSquare}
          gold
        />
        <StatsCard
          title="Leads no mês"
          value={metrics?.leads_month ?? 0}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total de fechamentos"
          value={metrics?.total_closings ?? 0}
          icon={CheckCircle2}
          gold
        />
        <StatsCard
          title="Total de parceiros"
          value={metrics?.total_partners ?? 0}
          icon={Building2}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Top parceiros */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-white">Top parceiros por leads</h2>
          </CardHeader>
          <CardContent className="p-0">
            {(!topPartners || topPartners.length === 0) ? (
              <p className="text-dark-400 text-sm p-6">Sem dados ainda.</p>
            ) : (
              <div className="divide-y divide-dark-700">
                {topPartners.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 px-6 py-3">
                    <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-white truncate">{p.name}</span>
                    <span className="text-sm font-semibold text-gold-400">{p.count} leads</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parceiros pendentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Parceiros aguardando aprovação</h2>
              <a href="/admin/parceiros" className="text-xs text-gold-400 hover:text-gold-300">
                Ver todos →
              </a>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(!pendingPartners || pendingPartners.length === 0) ? (
              <p className="text-dark-400 text-sm p-6">Nenhum parceiro pendente.</p>
            ) : (
              <div className="divide-y divide-dark-700">
                {pendingPartners.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">{p.company_name}</p>
                      <p className="text-xs text-dark-500">{formatDateTime(p.created_at)}</p>
                    </div>
                    <Badge variant="warning" size="sm">Pendente</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent leads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Leads recentes</h2>
            <a href="/admin/leads" className="text-xs text-gold-400 hover:text-gold-300">
              Ver todos →
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Cliente</th>
                <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Parceiro</th>
                <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Necessidade</th>
                <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {(!recentLeads || recentLeads.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-dark-400 text-sm">
                    Nenhum lead ainda.
                  </td>
                </tr>
              ) : recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">{lead.client_name}</td>
                  <td className="px-6 py-4 text-sm text-dark-400">
                    {(lead.partner as { company_name: string } | null)?.company_name ?? '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-400 max-w-[200px] truncate">{lead.needs}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getLeadStatusColor(lead.status)}`}>
                      {getLeadStatusLabel(lead.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-dark-500">{formatDateTime(lead.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
