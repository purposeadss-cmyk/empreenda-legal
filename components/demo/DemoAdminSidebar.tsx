'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, MessageSquare,
  Users, FileText, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin',           label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/parceiros', label: 'Parceiros',  icon: Building2 },
  { href: '/admin/leads',     label: 'Leads',      icon: MessageSquare },
  { href: '/admin/usuarios',  label: 'Usuários',   icon: Users },
  { href: '/admin/posts',     label: 'Posts',      icon: FileText },
]

export default function DemoAdminSidebar() {
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
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-500 bg-gold-500/10 border border-gold-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            Painel Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
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
              {active && <ChevronRight size={14} className="text-gold-500/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Demo badge + switch */}
      <div className="p-4 border-t border-dark-800 space-y-3">
        <Link
          href="/parceiro"
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-800 transition-all border border-dark-700 hover:border-dark-600"
        >
          <Building2 size={16} />
          Ver como Parceiro
          <ChevronRight size={13} className="ml-auto" />
        </Link>

        {/* Admin info */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-gold-400">MF</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Mariana Fonseca</p>
            <p className="text-[10px] text-gold-500">Administradora</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
