'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, User, FileText,
  MessageSquare, ChevronRight, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEMO_PARTNER } from '@/lib/demo-data'

const navItems = [
  { href: '/parceiro',         label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/parceiro/perfil',  label: 'Meu perfil', icon: User },
  { href: '/parceiro/posts',   label: 'Posts',      icon: FileText },
  { href: '/parceiro/leads',   label: 'Leads',      icon: MessageSquare, badge: 2 },
]

export default function DemoPartnerSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-dark-950 border-r border-dark-800 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 pt-7 pb-5 border-b border-dark-800">
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-bold text-white tracking-tight">
            Empreenda <span className="text-gold-500">Legal</span>
          </span>
          <span className="text-[9px] text-dark-500 tracking-widest uppercase font-medium mt-0.5">
            by Seja Legal Global
          </span>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-dark-300 bg-dark-800 border border-dark-700 px-2.5 py-1 rounded-full">
            Área Parceiro
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-gold-500/12 text-gold-400 border border-gold-500/20'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/70'
              )}
            >
              <Icon size={17} className={active ? 'text-gold-400' : 'text-dark-500 group-hover:text-dark-300'} />
              <span className="flex-1">{label}</span>
              {badge && !active && (
                <span className="w-5 h-5 rounded-full bg-gold-500 text-dark-950 text-[10px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
              {active && <ChevronRight size={14} className="text-gold-500/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Partner info */}
      <div className="p-4 border-t border-dark-800">
        <Link
          href="/admin"
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium text-dark-500 hover:text-dark-300 hover:bg-dark-800/50 transition-all mb-3"
        >
          ← Voltar ao Admin
        </Link>

        <div className="px-2 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-500/15 border border-gold-500/25 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gold-400">LP</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{DEMO_PARTNER.company_name}</p>
              <p className="text-[10px] text-dark-500 truncate">{DEMO_PARTNER.owner_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-0.5">
            <CheckCircle2 size={12} className="text-green-400" />
            <span className="text-[11px] text-green-400 font-medium">Perfil aprovado</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
