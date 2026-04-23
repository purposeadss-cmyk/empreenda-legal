'use client'

import { useState, useEffect } from 'react'
import { Search, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Partner, Category } from '@/lib/types'
import PartnerCard from '@/components/parceiro/PartnerCard'
import Input from '@/components/ui/Input'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Building2 } from 'lucide-react'

export default function ParceirosPage() {
  const supabase = createClient()
  const [partners, setPartners] = useState<Partner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data as Category[])
    })
  }, [supabase])

  useEffect(() => {
    setLoading(true)
    let query = supabase
      .from('partners')
      .select('*, category:categories(id, name, slug)')
      .eq('status', 'approved')
      .order('company_name')

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }
    if (search.trim()) {
      query = query.ilike('company_name', `%${search.trim()}%`)
    }

    query.then(({ data }) => {
      if (data) setPartners(data as Partner[])
      setLoading(false)
    })
  }, [supabase, search, selectedCategory])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Parceiros</h1>
        <p className="text-dark-400 mt-1">Empresas homologadas prontas para atender você</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome da empresa..."
            className="w-full bg-dark-900 border border-dark-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent hover:border-dark-600 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-dark-900 border border-dark-700 rounded-lg pl-10 pr-8 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500 hover:border-dark-600 transition-colors min-w-[220px]"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              !selectedCategory
                ? 'bg-gold-500 text-dark-950'
                : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gold-500 text-dark-950'
                  : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" label="Carregando parceiros..." className="mx-auto" />
        </div>
      ) : partners.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhum parceiro encontrado"
          description="Tente ajustar os filtros ou buscar por outro nome."
          action={search || selectedCategory ? { label: 'Limpar filtros', onClick: () => { setSearch(''); setSelectedCategory('') } } : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}
    </div>
  )
}
