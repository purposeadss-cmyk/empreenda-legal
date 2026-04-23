'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu, X, LogOut, User, Heart, Rss, Building2 } from 'lucide-react'
import { useAuth } from '@/components/shared/AuthProvider'
import Logo from './Logo'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/feed',      label: 'Feed',      icon: Rss },
  { href: '/parceiros', label: 'Parceiros',  icon: Building2 },
  { href: '/favoritos', label: 'Favoritos',  icon: Heart },
]

export default function ClientHeader() {
  const { profile, signOut } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-dark-950/95 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="md" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-gold-500/10 text-gold-400'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors">
              <Bell size={18} />
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-800 transition-colors"
              >
                <Avatar name={profile?.full_name ?? null} url={profile?.avatar_url ?? null} size="sm" />
                <span className="hidden md:block text-sm font-medium text-white max-w-[120px] truncate">
                  {profile?.full_name?.split(' ')[0] ?? 'Conta'}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-dark-900 border border-dark-700 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-dark-700">
                    <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
                    <p className="text-xs text-dark-400 truncate">{profile?.email}</p>
                  </div>
                  <Link
                    href="/perfil"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} />
                    Meu perfil
                  </Link>
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-dark-800 transition-colors"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-dark-800 bg-dark-950 px-4 py-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-gold-500/10 text-gold-400'
                  : 'text-dark-300 hover:text-white hover:bg-dark-800'
              )}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
