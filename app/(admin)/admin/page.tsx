'use client'

import Link from 'next/link'
import {
  Users, Building2, MessageSquare, FileText,
  TrendingUp, AlertCircle, CheckCircle2, ArrowUpRight,
  Eye, MousePointerClick, Zap,
} from 'lucide-react'
import BarChart from '@/components/demo/BarChart'
import DonutChart from '@/components/demo/DonutChart'
import {
  DEMO_ADMIN_METRICS,
  DEMO_PARTNERS,
  DEMO_LEADS,
  DEMO_MONTHLY_LEADS,
  DEMO_LEAD_STATUS_SEGMENTS,
} from '@/lib/demo-data'
import { formatDateTime, getLeadStatusLabel, getLeadStatusColor } from '@/lib/utils'

const kpis = [
  {
    label: 'Clientes cadastrados',
    value: '1.247',
    icon: Users,
    change: '+12%',
    up: true,
    sub: 'vs. mês anterior',
  },
  {
    label: 'Parceiros aprovados',
    value: '34',
    icon: CheckCircle2,
    change: '+3',
    up: true,
    sub: 'este mês',
    gold: true,
  },
  {
    label: 'Leads gerados',
    value: '186',
    icon: MessageSquare,
    change: '+57%',
    up: true,
    sub: 'este mês',
    gold: true,
  },
  {
    label: 'Fechamentos',
    value: '47',
    icon: TrendingUp,
    change: '+8',
    up: true,
    sub: 'negócios fechados',
  },
  {
    label: 'Posts ativos',
    value: '89',
    icon: FileText,
    change: '+14',
    up: true,
    sub: 'publicações',
  },
  {
    label: 'Taxa de conversão',
    value: '25,3%',
    icon: Zap,
    change: '+3,1pp',
    up: true,
    sub: 'lead → fechamento',
    gold: true,
  },
]

const recentLeads = DEMO_LEADS.slice(0, 6)

export default function AdminPage() {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="p-8 space-y-8 animate-fade-in">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-500 text-sm mb-1">{greeting}, Mariana 👋</p>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1 text-sm">
            Visão geral da plataforma • {now.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-400">7 leads hoje</span>
          </div>
          <Link
            href="/parceiro"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/20 transition-all"
          >
            <Building2 size={15} />
            Ver como Parceiro
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(({ label, value, icon: Icon, change, up, sub, gold }) => (
          <div
            key={label}
            className={`rounded-2xl p-5 border flex flex-col gap-3 transition-all duration-300 hover:scale-[1.02] ${
              gold
                ? 'bg-gradient-to-br from-gold-500/10 via-gold-500/5 to-transparent border-gold-500/25'
                : 'bg-dark-900 border-dark-700 hover:border-dark-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-dark-400 leading-tight">{label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${gold ? 'bg-gold-500/20' : 'bg-dark-800'}`}>
                <Icon size={16} className={gold ? 'text-gold-400' : 'text-dark-400'} />
              </div>
            </div>
            <div>
              <p className={`text-2xl font-bold ${gold ? 'text-gold-400' : 'text-white'}`}>{value}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>{change}</span>
                <span className="text-xs text-dark-500">{sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Bar chart — ocupa 3/5 */}
        <div className="lg:col-span-3 bg-dark-900 border border-dark-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-white">Leads por mês</h2>
              <p className="text-xs text-dark-500 mt-0.5">Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full">
              <TrendingUp size={12} />
              +342% vs. início
            </div>
          </div>
          <BarChart data={DEMO_MONTHLY_LEADS} height={150} />
        </div>

        {/* Donut chart — ocupa 2/5 */}
        <div className="lg:col-span-2 bg-dark-900 border border-dark-700 rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-white">Status dos leads</h2>
            <p className="text-xs text-dark-500 mt-0.5">Distribuição atual</p>
          </div>
          <DonutChart
            segments={DEMO_LEAD_STATUS_SEGMENTS}
            size={130}
            centerLabel="leads"
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* Partners list — 2/5 */}
        <div className="lg:col-span-2 bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">Parceiros</h2>
            <div className="flex items-center gap-2">
              {/* Pending badge */}
              <span className="flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-full">
                <AlertCircle size={11} />
                2 pendentes
              </span>
            </div>
          </div>
          <div className="divide-y divide-dark-800">
            {DEMO_PARTNERS.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center gap-3 px-6 py-3.5 hover:bg-dark-800/40 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-dark-300">
                    {partner.company_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{partner.company_name}</p>
                  <p className="text-xs text-dark-500 truncate">{partner.category}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {partner.status === 'approved' ? (
                    <>
                      <span className="text-xs text-dark-500">{partner.leads} leads</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle2 size={9} />
                        Ativo
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gold-500 text-dark-950 hover:opacity-90 transition-opacity">
                        Aprovar
                      </button>
                      <button className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-dark-700 text-dark-300 hover:bg-dark-600 transition-colors">
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads recentes — 3/5 */}
        <div className="lg:col-span-3 bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">Leads recentes</h2>
            <span className="text-xs text-dark-500">Últimas solicitações</span>
          </div>
          <div className="divide-y divide-dark-800">
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-start gap-4 px-6 py-4 hover:bg-dark-800/40 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-dark-300">
                    {lead.client_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{lead.client_name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${getLeadStatusColor(lead.status)}`}>
                      {getLeadStatusLabel(lead.status)}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5 line-clamp-1">{lead.needs}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-dark-600">
                    <span>{lead.partner}</span>
                    <span>•</span>
                    <span>{new Date(lead.created_at).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
