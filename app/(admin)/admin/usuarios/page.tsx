'use client'

import { useEffect, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { ROLES } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const roleBadge: Record<string, 'gold' | 'info' | 'success' | 'default'> = {
  admin: 'gold',
  colaborador: 'info',
  parceiro: 'success',
  cliente: 'default',
}

const roleLabel: Record<string, string> = {
  admin: 'Admin',
  colaborador: 'Colaborador',
  parceiro: 'Parceiro',
  cliente: 'Cliente',
}

export default function AdminUsuariosPage() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (roleFilter) query = query.eq('role', roleFilter)

    query.then(({ data }) => {
      if (data) {
        let filtered = data as Profile[]
        if (search.trim()) {
          filtered = filtered.filter(p =>
            p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.email.toLowerCase().includes(search.toLowerCase())
          )
        }
        setProfiles(filtered)
      }
      setLoading(false)
    })
  }, [search, roleFilter, supabase])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <p className="text-dark-400 mt-1">Todos os usuários cadastrados na plataforma</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full bg-dark-900 border border-dark-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="">Todos os perfis</option>
          {ROLES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" label="Carregando usuários..." className="mx-auto" />
        </div>
      ) : profiles.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum usuário encontrado" description="Ajuste os filtros para ver outros resultados." />
      ) : (
        <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700 bg-dark-800">
                <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Usuário</th>
                <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Email</th>
                <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">WhatsApp</th>
                <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Perfil</th>
                <th className="text-left text-xs font-medium text-dark-400 px-6 py-3">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={profile.full_name} url={profile.avatar_url} size="sm" />
                      <span className="text-sm font-medium text-white">{profile.full_name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-400">{profile.email}</td>
                  <td className="px-6 py-4 text-sm text-dark-400">{profile.whatsapp || '-'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={roleBadge[profile.role] ?? 'default'} size="sm">
                      {roleLabel[profile.role] ?? profile.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-500">{formatDate(profile.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
