'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/shared/AuthProvider'
import type { PostFormData } from '@/lib/types'
import { POST_EXPIRY_DAYS } from '@/lib/constants'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

export default function NovoPostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PostFormData>()

  const onSubmit = async (data: PostFormData) => {
    if (!user) return
    setError(null)

    const { data: partner } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!partner) {
      setError('Perfil de parceiro não encontrado.')
      return
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + POST_EXPIRY_DAYS)

    const { error: insertError } = await supabase.from('posts').insert({
      partner_id: partner.id,
      title: data.title,
      summary: data.summary || null,
      content: data.content || null,
      image_url: data.image_url || null,
      published: true,
      expires_at: expiresAt.toISOString(),
    })

    if (insertError) {
      setError('Erro ao publicar post. Tente novamente.')
      return
    }

    router.push('/parceiro/posts')
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/parceiro/posts">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Novo post</h1>
          <p className="text-dark-400 text-sm mt-0.5">Posts ficam ativos por 30 dias</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Título *"
              placeholder="Título da publicação"
              error={errors.title?.message}
              {...register('title', { required: 'Título obrigatório' })}
            />
            <Textarea
              label="Resumo"
              placeholder="Breve resumo que aparece nos cards do feed..."
              rows={2}
              {...register('summary')}
            />
            <Textarea
              label="Conteúdo"
              placeholder="Conteúdo completo da publicação..."
              rows={6}
              {...register('content')}
            />
            <Input
              label="URL da imagem (opcional)"
              type="url"
              placeholder="https://..."
              hint="Link de uma imagem para ilustrar o post"
              {...register('image_url')}
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link href="/parceiro/posts">
                <Button type="button" variant="ghost">Cancelar</Button>
              </Link>
              <Button type="submit" loading={isSubmitting}>
                <Send size={16} />
                Publicar post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
