// ============================================================
// EMPREENDA LEGAL — Tipos centrais
// ============================================================

export type UserRole = 'admin' | 'colaborador' | 'parceiro' | 'cliente'
export type PartnerStatus = 'pending' | 'approved' | 'rejected'
export type LeadStatus = 'new' | 'in_progress' | 'closed' | 'lost'
export type EventType = 'profile_view' | 'quote_click' | 'quote_submit' | 'favorite'

// ============================================================
// ENTITIES
// ============================================================

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  whatsapp: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export interface Partner {
  id: string
  user_id: string | null
  company_name: string
  slug: string | null
  description: string | null
  logo_url: string | null
  category_id: string | null
  countries: string[]
  youtube_url: string | null
  whatsapp: string
  email: string | null
  website: string | null
  instagram: string | null
  status: PartnerStatus
  profile_views: number
  created_at: string
  updated_at: string
  // joins
  category?: Category
  profile?: Profile
}

export interface Post {
  id: string
  partner_id: string
  title: string
  summary: string | null
  content: string | null
  image_url: string | null
  published: boolean
  expires_at: string
  created_at: string
  updated_at: string
  // joins
  partner?: Partner
}

export interface ActivePost extends Post {
  partner_name: string
  partner_logo: string | null
  partner_slug: string | null
  category_name: string
  category_slug: string
}

export interface Lead {
  id: string
  client_id: string | null
  partner_id: string | null
  client_name: string
  client_email: string
  client_whatsapp: string
  needs: string
  status: LeadStatus
  origin: string
  created_at: string
  updated_at: string
  // joins
  partner?: Partner
  client?: Profile
}

export interface Favorite {
  id: string
  client_id: string
  partner_id: string
  created_at: string
  partner?: Partner
}

export interface Click {
  id: string
  client_id: string | null
  partner_id: string
  event_type: EventType
  metadata: Record<string, unknown>
  created_at: string
}

// ============================================================
// FORMULÁRIOS
// ============================================================

export interface OrcamentoFormData {
  whatsapp: string
  needs: string
}

export interface PartnerProfileFormData {
  company_name: string
  description: string
  category_id: string
  countries: string[]
  youtube_url: string
  whatsapp: string
  email: string
  website: string
  instagram: string
}

export interface PostFormData {
  title: string
  summary: string
  content: string
  image_url: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  full_name: string
  email: string
  password: string
  whatsapp: string
}

// ============================================================
// DASHBOARD METRICS
// ============================================================

export interface AdminMetrics {
  total_clients: number
  total_partners: number
  approved_partners: number
  pending_partners: number
  leads_today: number
  leads_month: number
  active_posts: number
  total_closings: number
}

export interface PartnerMetrics {
  profile_views: number
  quote_clicks: number
  leads_received: number
  closings: number
}

// ============================================================
// API RESPONSES
// ============================================================

export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
}
