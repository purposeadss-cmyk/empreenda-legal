'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { RegisterFormData } from '@/lib/types'
import Logo from '@/components/layout/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function CadastroPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>()

  const onSubmit = async (data: RegisterFormData) => {
    setAuthError(null)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role: 'cliente',
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setAuthError('Este email já está cadastrado. Tente fazer login.')
      } else {
        setAuthError('Erro ao criar conta. Tente novamente.')
      }
      return
    }

    // Atualizar whatsapp no perfil
    const { data: { session } } = await supabase.auth.getSession()
    if (session && data.whatsapp) {
      await supabase
        .from('profiles')
        .update({ whatsapp: data.whatsapp })
        .eq('id', session.user.id)
    }

    setSuccess(true)
    setTimeout(() => router.push('/feed'), 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Conta criada!</h2>
          <p className="text-dark-400">Redirecionando para a plataforma...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left */}
      <div className="hidden lg:flex flex-1 bg-gradient-dark relative overflow-hidden items-center justify-center p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-sm">
          <Logo size="lg" className="mb-12" />
          <h2 className="text-3xl font-bold text-white mb-4">
            O seu negócio merece os{' '}
            <span className="text-gold-gradient">melhores parceiros</span>
          </h2>
          <p className="text-dark-300 leading-relaxed">
            Acesse uma rede curada de especialistas prontos para apoiar a sua jornada empreendedora em Portugal.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo size="md" href="/" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Criar conta</h1>
          <p className="text-dark-400 text-sm mb-8">Acesso gratuito à plataforma de parceiros</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              type="text"
              placeholder="Seu nome"
              error={errors.full_name?.message}
              {...register('full_name', { required: 'Nome obrigatório' })}
            />

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email obrigatório',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' },
              })}
            />

            <Input
              label="WhatsApp (com código do país)"
              type="tel"
              placeholder="+351 912 345 678"
              hint="Ex: +351 para Portugal, +55 para Brasil"
              error={errors.whatsapp?.message}
              {...register('whatsapp', { required: 'WhatsApp obrigatório' })}
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Senha obrigatória',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-dark-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {authError}
              </div>
            )}

            <Button type="submit" fullWidth loading={isSubmitting} size="lg">
              Criar conta
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-dark-400 text-sm mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-gold-400 hover:text-gold-300 font-medium">
              Entrar
            </Link>
          </p>

          <p className="text-center text-dark-500 text-xs mt-8">
            <Link href="/" className="hover:text-dark-300">
              ← Voltar ao início
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
