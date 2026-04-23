'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Save, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/shared/AuthProvider'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'

interface ProfileFormData {
  full_name: string
  whatsapp: string
}

export default function PerfilPage() {
  const { profile, refreshProfile } = useAuth()
  const supabase = createClient()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    values: {
      full_name: profile?.full_name ?? '',
      whatsapp: profile?.whatsapp ?? '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) return
    await supabase
      .from('profiles')
      .update({ full_name: data.full_name, whatsapp: data.whatsapp })
      .eq('id', profile.id)

    await refreshProfile()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Meu perfil</h1>
        <p className="text-dark-400 mt-1">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar name={profile?.full_name ?? null} url={profile?.avatar_url ?? null} size="lg" />
            <div>
              <p className="font-semibold text-white text-lg">{profile?.full_name}</p>
              <p className="text-dark-400 text-sm">{profile?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-xs text-gold-400 font-medium">
                <User size={12} />
                Cliente
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              error={errors.full_name?.message}
              {...register('full_name', { required: 'Nome obrigatório' })}
            />
            <Input
              label="Email"
              type="email"
              value={profile?.email ?? ''}
              disabled
              hint="O email não pode ser alterado"
            />
            <Input
              label="WhatsApp"
              type="tel"
              placeholder="+351 912 345 678"
              error={errors.whatsapp?.message}
              {...register('whatsapp')}
            />
            <div className="pt-2">
              <Button type="submit" loading={isSubmitting}>
                <Save size={16} />
                {saved ? 'Salvo!' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
