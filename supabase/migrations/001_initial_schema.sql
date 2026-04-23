-- ============================================================
-- EMPREENDA LEGAL — Schema Principal
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'colaborador', 'parceiro', 'cliente');
CREATE TYPE partner_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE lead_status AS ENUM ('new', 'in_progress', 'closed', 'lost');
CREATE TYPE event_type AS ENUM ('profile_view', 'quote_click', 'quote_submit', 'favorite');

-- ============================================================
-- CATEGORIAS
-- ============================================================

CREATE TABLE public.categories (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  icon       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.categories (name, slug, icon) VALUES
  ('Advocacia / Legalização',    'advocacia-legalizacao',    '⚖️'),
  ('Contabilidade / Fiscal',     'contabilidade-fiscal',     '📊'),
  ('Marketing / Vendas',         'marketing-vendas',         '📣'),
  ('Imobiliário',                'imobiliario',              '🏢'),
  ('Crédito / Financeiro',       'credito-financeiro',       '💰'),
  ('RH / Recrutamento',          'rh-recrutamento',          '👥'),
  ('Tecnologia / Automação',     'tecnologia-automacao',     '🤖'),
  ('Consultoria Empresarial',    'consultoria-empresarial',  '🎯');

-- ============================================================
-- PROFILES (estende auth.users do Supabase)
-- ============================================================

CREATE TABLE public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email      TEXT NOT NULL,
  full_name  TEXT,
  avatar_url TEXT,
  whatsapp   TEXT,
  role       user_role NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARTNERS (empresa parceira)
-- ============================================================

CREATE TABLE public.partners (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  company_name   TEXT NOT NULL,
  slug           TEXT UNIQUE,
  description    TEXT,
  logo_url       TEXT,
  category_id    UUID REFERENCES public.categories(id),
  countries      TEXT[] DEFAULT '{}',
  youtube_url    TEXT,
  whatsapp       TEXT NOT NULL,
  email          TEXT,
  website        TEXT,
  instagram      TEXT,
  status         partner_status DEFAULT 'pending',
  profile_views  INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- POSTS
-- ============================================================

CREATE TABLE public.posts (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  summary    TEXT,
  content    TEXT,
  image_url  TEXT,
  published  BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEADS (solicitações de orçamento)
-- ============================================================

CREATE TABLE public.leads (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id        UUID REFERENCES public.profiles(id),
  partner_id       UUID REFERENCES public.partners(id),
  client_name      TEXT NOT NULL,
  client_email     TEXT NOT NULL,
  client_whatsapp  TEXT NOT NULL,
  needs            TEXT NOT NULL,
  status           lead_status DEFAULT 'new',
  origin           TEXT DEFAULT 'partner_profile',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FAVORITES
-- ============================================================

CREATE TABLE public.favorites (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, partner_id)
);

-- ============================================================
-- CLICKS / EVENTOS DE RASTREAMENTO
-- ============================================================

CREATE TABLE public.clicks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_posts_partner_id ON public.posts(partner_id);
CREATE INDEX idx_posts_expires_at ON public.posts(expires_at);
CREATE INDEX idx_posts_published   ON public.posts(published);
CREATE INDEX idx_leads_client_id   ON public.leads(client_id);
CREATE INDEX idx_leads_partner_id  ON public.leads(partner_id);
CREATE INDEX idx_leads_status      ON public.leads(status);
CREATE INDEX idx_leads_created_at  ON public.leads(created_at DESC);
CREATE INDEX idx_favorites_client  ON public.favorites(client_id);
CREATE INDEX idx_clicks_partner    ON public.clicks(partner_id);
CREATE INDEX idx_clicks_event      ON public.clicks(event_type);
CREATE INDEX idx_clicks_created    ON public.clicks(created_at DESC);
CREATE INDEX idx_partners_status   ON public.partners(status);
CREATE INDEX idx_partners_category ON public.partners(category_id);

-- ============================================================
-- TRIGGERS — updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER — criar profile automaticamente ao cadastrar
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNÇÃO — incrementar visualizações do parceiro
-- ============================================================

CREATE OR REPLACE FUNCTION increment_partner_views(partner_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.partners
  SET profile_views = profile_views + 1
  WHERE id = partner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VIEW — posts ativos (não expirados e publicados)
-- ============================================================

CREATE OR REPLACE VIEW public.active_posts AS
SELECT
  p.*,
  pt.company_name  AS partner_name,
  pt.logo_url      AS partner_logo,
  pt.slug          AS partner_slug,
  c.name           AS category_name,
  c.slug           AS category_slug
FROM public.posts p
JOIN public.partners pt ON p.partner_id = pt.id
JOIN public.categories c ON pt.category_id = c.id
WHERE p.published = TRUE
  AND p.expires_at > NOW()
  AND pt.status = 'approved';

-- ============================================================
-- VIEW — métricas gerais para o admin
-- ============================================================

CREATE OR REPLACE VIEW public.admin_metrics AS
SELECT
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'cliente')    AS total_clients,
  (SELECT COUNT(*) FROM public.partners)                           AS total_partners,
  (SELECT COUNT(*) FROM public.partners WHERE status = 'approved') AS approved_partners,
  (SELECT COUNT(*) FROM public.partners WHERE status = 'pending')  AS pending_partners,
  (SELECT COUNT(*) FROM public.leads WHERE DATE(created_at) = CURRENT_DATE) AS leads_today,
  (SELECT COUNT(*) FROM public.leads WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())) AS leads_month,
  (SELECT COUNT(*) FROM public.posts WHERE published = TRUE AND expires_at > NOW()) AS active_posts,
  (SELECT COUNT(*) FROM public.leads WHERE status = 'closed')      AS total_closings;
