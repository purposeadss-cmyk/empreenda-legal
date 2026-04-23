import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function formatWhatsApp(whatsapp: string): string {
  return whatsapp.replace(/\D/g, '')
}

export function buildWhatsAppUrl(whatsapp: string, message: string): string {
  const number = formatWhatsApp(whatsapp)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${number}?text=${encoded}`
}

export function buildOrcamentoMessage(
  clientName: string,
  companyName: string,
  needs: string
): string {
  return `Olá! Sou ${clientName} e encontrei sua empresa *${companyName}* na plataforma *Empreenda Legal*.

Gostaria de solicitar um orçamento para:
"${needs}"

Aguardo retorno. Obrigado!`
}

export function getAvatarUrl(name: string | null, url: string | null): string {
  if (url) return url
  const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=C9A84C&color=fff&bold=true`
}

export function getLeadStatusLabel(status: string): string {
  const map: Record<string, string> = {
    new: 'Novo',
    in_progress: 'Em andamento',
    closed: 'Fechado',
    lost: 'Perdido',
  }
  return map[status] ?? status
}

export function getLeadStatusColor(status: string): string {
  const map: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}

export function getPartnerStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
  }
  return map[status] ?? status
}

export function getPartnerStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}
