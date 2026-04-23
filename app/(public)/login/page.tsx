'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { LoginFormData } from '@/lib/types'
import Logo from '@/components/layout/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null)
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setAuthError('Email ou senha inválidos. Tente novamente.')
      return
    }

    // Buscar role do perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    const role = profile?.role ?? 'cliente'

    if (role === 'admin' || role === 'colaborador') {
      router.push('/admin/dashboard')
    } else if (role === 'parceiro') {
      router.push('/parceiro/dashboard')
    } else {
      router.push('/feed')
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-dark relative overflow-hidden items-center justify-center p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-sm">
          <Logo size="lg" className="mb-12" />
          <blockquote className="text-xl text-white/80 font-light leading-relaxed italic">
            "A plataforma que conecta empreendedores globais com parceiros especializados em Portugal."
          </blockquote>
          <div className="mt-8 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-gold-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo size="md" href="/" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h1>
          <p className="text-dark-400 text-sm mb-8">Entre na sua conta para acessar a plataforma</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', { required: 'Senha obrigatória' })}
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
              Entrar
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-dark-400 text-sm mt-6">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-gold-400 hover:text-gold-300 font-medium">
              Cadastre-se gratuitamente
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
