export const SITE_NAME = 'Empreenda Legal'
export const SITE_TAGLINE = 'by Seja Legal Global'
export const SITE_DESCRIPTION = 'Plataforma premium de parceiros homologados para empreendedores globais'

export const COUNTRIES = [
  'Portugal',
  'Brasil',
  'Espanha',
  'França',
  'Itália',
  'Alemanha',
  'Reino Unido',
  'Holanda',
  'Bélgica',
  'Suíça',
  'Luxemburgo',
  'Irlanda',
  'Estados Unidos',
  'Canadá',
  'Austrália',
  'Japão',
  'Emirados Árabes',
]

export const LEAD_STATUSES = [
  { value: 'new',         label: 'Novo' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'closed',      label: 'Fechado' },
  { value: 'lost',        label: 'Perdido' },
] as const

export const PARTNER_STATUSES = [
  { value: 'pending',  label: 'Pendente' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'rejected', label: 'Rejeitado' },
] as const

export const ROLES = [
  { value: 'admin',       label: 'Administrador' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'parceiro',    label: 'Parceiro' },
  { value: 'cliente',     label: 'Cliente' },
] as const

export const POST_EXPIRY_DAYS = 30

export const ITEMS_PER_PAGE = 20
