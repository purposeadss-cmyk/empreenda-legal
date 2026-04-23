'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MessageCircle, CheckCircle2 } from 'lucide-react'
import type { Partner, OrcamentoFormData } from '@/lib/types'
import { buildOrcamentoMessage, buildWhatsAppUrl } from '@/lib/utils'
import { useAuth } from '@/components/shared/AuthProvider'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

interface OrcamentoModalProps {
  isOpen: boolean
  onClose: () => void
  partner: Partner
}

export default function OrcamentoModal({ isOpen, onClose, partner }: OrcamentoModalProps) {
  const { profile } = useAuth()
  const [step, setStep] = useState<'form' | 'success'>('form')

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<OrcamentoFormData>({
    defaultValues: { whatsapp: profile?.whatsapp ?? '' },
  })

  const onSubmit = async (data: OrcamentoFormData) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: partner.id,
          client_whatsapp: data.whatsapp,
          needs: data.needs,
        }),
      })

      if (!res.ok) throw new Error('Erro ao registrar lead')

      setStep('success')

      // Redirecionar ao WhatsApp após 1.5s
      setTimeout(() => {
        const message = buildOrcamentoMessage(
          profile?.full_name ?? 'Cliente',
          partner.company_name,
          data.needs
        )
        const url = buildWhatsAppUrl(partner.whatsapp, message)
        window.open(url, '_blank')
        handleClose()
      }, 1500)
    } catch {
      // Mesmo com erro no registro, redirecionar ao WhatsApp
      const message = buildOrcamentoMessage(
        profile?.full_name ?? 'Cliente',
        partner.company_name,
        data.needs
      )
      const url = buildWhatsAppUrl(partner.whatsapp, message)
      window.open(url, '_blank')
      handleClose()
    }
  }

  const handleClose = () => {
    setStep('form')
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Solicitar orçamento" size="md">
      {step === 'success' ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Lead registrado!</h3>
          <p className="text-dark-400 text-sm">Abrindo WhatsApp do parceiro...</p>
        </div>
      ) : (
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-dark-800 border border-dark-700 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <MessageCircle size={20} className="text-gold-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{partner.company_name}</p>
              <p className="text-xs text-dark-400">Você será redirecionado ao WhatsApp do parceiro</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Seu WhatsApp"
              type="tel"
              placeholder="+351 912 345 678"
              hint="O parceiro usará para entrar em contato"
              error={errors.whatsapp?.message}
              {...register('whatsapp', { required: 'WhatsApp obrigatório' })}
            />

            <Textarea
              label="Qual é a sua necessidade?"
              placeholder="Descreva brevemente o que você precisa..."
              rows={4}
              error={errors.needs?.message}
              {...register('needs', {
                required: 'Descreva sua necessidade',
                minLength: { value: 10, message: 'Mínimo 10 caracteres' },
              })}
            />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" fullWidth onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" fullWidth loading={isSubmitting}>
                <MessageCircle size={16} />
                Enviar no WhatsApp
              </Button>
            </div>
          </form>

          <p className="text-xs text-dark-500 text-center mt-4">
            Sua solicitação será registrada antes do redirecionamento
          </p>
        </div>
      )}
    </Modal>
  )
}
