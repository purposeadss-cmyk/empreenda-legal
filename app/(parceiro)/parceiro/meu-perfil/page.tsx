'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/shared/AuthProvider'
import type { Partner, Category, PartnerProfileFormData } from '@/lib/types'
import { COUNTRIES } from '@/lib/constants'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Avatar from '@/components/ui/Avatar'

export default function MeuPerfilPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [saved, setSaved] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PartnerProfileFormData>()

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('partners').select('*').eq('user_id', user.id).single(),
      supabase.from('categories').select('*').order('name'),
    ]).then(([{ data: p }, { data: cats }]) => {
      if (p) {
        setPartner(p as Partner)
        setSelectedCountries(p.countries ?? [])
        reset({
          company_name: p.company_name,
          description: p.description ?? '',
          category_id: p.category_id ?? '',
          youtube_url: p.youtube_url ?? '',
          whatsapp: p.whatsapp,
          email: p.email ?? '',
          website: p.website ?? '',
          instagram: p.instagram ?? '',
          countries: [],
        })
      }
      if (cats) setCategories(cats as Category[])
    })
  }, [user, supabase, reset])

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    )
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !partner) return
    setLogoUploading(true)
    const file = e.target.files[0]
    const path = `logos/${partner.id}_${Date.now()}.${file.name.split('.').pop()}`

    const { data, error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(data.path)
      await supabase.from('partners').update({ logo_url: urlData.publicUrl }).eq('id', partner.id)
      setPartner({ ...partner, logo_url: urlData.publicUrl })
    }
    setLogoUploading(false)
  }

  const onSubmit = async (data: PartnerProfileFormData) => {
    if (!partner) return
    await supabase
      .from('partners')
      .update({
        company_name: data.company_name,
        description: data.description,
        category_id: data.category_id || null,
        countries: selectedCountries,
        youtube_url: data.youtube_url || null,
        whatsapp: data.whatsapp,
        email: data.email || null,
        website: data.website || null,
        instagram: data.instagram || null,
      })
      .eq('id', partner.id)

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!partner) return <div className="py-20 text-center text-dark-400">Carregando...</div>

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
        <p className="text-dark-400 mt-1">Edite as informações da sua empresa</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo */}
        <Card>
          <CardHeader><h2 className="font-semibold text-white">Logo da empresa</h2></CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar name={partner.company_name} url={partner.logo_url} size="xl" />
              <div>
                <label className="cursor-pointer">
                  <Button type="button" variant="secondary" size="sm" loading={logoUploading} onClick={() => {}}>
                    <Upload size={14} />
                    {logoUploading ? 'Enviando...' : 'Alterar logo'}
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                <p className="text-xs text-dark-500 mt-2">PNG, JPG ou WebP. Máx. 2MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados básicos */}
        <Card>
          <CardHeader><h2 className="font-semibold text-white">Dados da empresa</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nome da empresa *"
              error={errors.company_name?.message}
              {...register('company_name', { required: 'Nome obrigatório' })}
            />
            <Textarea
              label="Descrição"
              placeholder="Descreva sua empresa, especialidades e diferenciais..."
              rows={4}
              {...register('description')}
            />
            <Select
              label="Categoria"
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              placeholder="Selecione a categoria"
              {...register('category_id')}
            />
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader><h2 className="font-semibold text-white">Contato</h2></CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="WhatsApp *"
              placeholder="+351 912 345 678"
              error={errors.whatsapp?.message}
              {...register('whatsapp', { required: 'WhatsApp obrigatório' })}
            />
            <Input
              label="Email comercial"
              type="email"
              placeholder="contato@empresa.com"
              {...register('email')}
            />
            <Input
              label="Site"
              type="url"
              placeholder="https://suaempresa.com"
              {...register('website')}
            />
            <Input
              label="Instagram"
              placeholder="@suaempresa"
              {...register('instagram')}
            />
            <Input
              label="YouTube (URL do vídeo)"
              placeholder="https://youtube.com/watch?v=..."
              hint="Vídeo de apresentação exibido no perfil"
              {...register('youtube_url')}
            />
          </CardContent>
        </Card>

        {/* Países */}
        <Card>
          <CardHeader><h2 className="font-semibold text-white">Países atendidos</h2></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => toggleCountry(country)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedCountries.includes(country)
                      ? 'bg-gold-500 text-dark-950'
                      : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" loading={isSubmitting}>
          <Save size={18} />
          {saved ? 'Salvo com sucesso!' : 'Salvar alterações'}
        </Button>
      </form>
    </div>
  )
}
