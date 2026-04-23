import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Eye, MousePointerClick, MessageSquare, TrendingUp } from 'lucide-react'
import StatsCard from '@/components/ui/StatsCard'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatDateTime, getLeadStatusLabel, getLeadStatusColor } from '@/lib/utils'

export const metadata = { title: 'Dashboard Parceiro' }

export default async function PartnerDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Buscar parceiro do usuário logado
  const { data: partner } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!partner) {
    return (
      <div className="text-center py-20">
        <p className="text-dark-400">Perfil de parceiro não encontrado.</p>
      </div>
    )
  }

  // Buscar métricas
  const [{ count: leadsCount }, { count: closingsCount }, { count: clicksCount }] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id).eq('status', 'closed'),
    supabase.from('clicks').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id).eq('event_type', 'quote_click'),
  ])

  // Últimos leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('partner_id', partner.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">Visão geral do seu desempenho na plataforma</p>
      </div>

      {/* Status badge */}
      {partner.status === 'pending' && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          ⚠️ Seu perfil está aguardando aprovação. Assim que aprovado, você aparecerá para os clientes.
        </div>
      )}
      {partner.status === 'rejected' && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          ❌ Seu perfil foi rejeitado. Entre em contato com o suporte para mais informações.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Visualizações do perfil"
          value={partner.profile_views}
          icon={Eye}
        />
        <StatsCard
          title="Cliques em orçamento"
          value={clicksCount ?? 0}
          icon={MousePointerClick}
          gold
        />
        <StatsCard
          title="Leads recebidos"
          value={leadsCount ?? 0}
          icon={MessageSquare}
        />
        <StatsCard
          title="Fechamentos"
          value={closingsCount ?? 0}
          icon={TrendingUp}
          gold
        />
      </div>

      {/* Recent leads */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-white">Leads recentes</h2>
        </CardHeader>
        <CardContent className="p-0">
          {!recentLeads || recentLeads.length === 0 ? (
            <p className="text-dark-400 text-sm p-6">Nenhum lead recebido ainda.</p>
          ) : (
            <div className="divide-y divide-dark-700">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-dark-800/50 transition-colors">
                  <div>
                    <p className="font-medium text-white text-sm">{lead.client_name}</p>
                    <p className="text-dark-400 text-xs mt-0.5 line-clamp-1">{lead.needs}</p>
                    <p className="text-dark-500 text-xs mt-1">{formatDateTime(lead.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${getLeadStatusColor(lead.status)}`}>
                    {getLeadStatusLabel(lead.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
