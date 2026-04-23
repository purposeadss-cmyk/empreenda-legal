'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, MessageSquare,
  Users, FileText, LogOut, Settings
} from 'lucide-react'
import { useAuth } from '@/components/shared/AuthProvider'
import Logo from './Logo'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/parceiros',  label: 'Parceiros',  icon: Building2 },
  { href: '/admin/leads',      label: 'Leads',      icon: MessageSquare },
  { href: '/admin/usuarios',   label: 'Usuários',   icon: Users },
  { href: '/admin/posts',      label: 'Posts',      icon: FileText },
]

export default function AdminSidebar() {
  const { profile, signOut } = useAuth()
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-dark-950 border-r border-dark-800 flex flex-col">
      <div className="p-6 border-b border-dark-800">
        <Logo size="sm" />
        <div className="mt-1">
          <span className="text-xs text-gold-500 font-medium uppercase tracking-widest">Painel Administrativo</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname.startsWith(href)
                ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                : 'text-dark-300 hover:text-white hover:bg-dark-800'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <Avatar name={profile?.full_name ?? null} url={profile?.avatar_url ?? null} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
            <p className="text-xs text-gold-500 font-medium">Administrador</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-all"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
