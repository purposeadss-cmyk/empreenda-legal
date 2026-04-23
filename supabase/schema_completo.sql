-- ============================================================
--
--   EMPREENDA LEGAL by Seja Legal Global
--   Schema Completo — Supabase PostgreSQL
--
--   Cole integralmente no SQL Editor do Supabase e execute.
--   Inclui: extensões, enums, tabelas, funções, triggers,
--           views, índices, RLS completo e seed de demonstração.
--
--   Senha de todos os usuários demo: Demo@1234
--
-- ============================================================


-- ============================================================
-- SEÇÃO 0 — LIMPEZA PARA RE-EXECUÇÃO SEGURA
-- ============================================================

DROP TABLE IF EXISTS public.clicks     CASCADE;
DROP TABLE IF EXISTS public.favorites  CASCADE;
DROP TABLE IF EXISTS public.leads      CASCADE;
DROP TABLE IF EXISTS public.posts      CASCADE;
DROP TABLE IF EXISTS public.partners   CASCADE;
DROP TABLE IF EXISTS public.profiles   CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

DROP TYPE IF EXISTS public.event_type      CASCADE;
DROP TYPE IF EXISTS public.lead_status     CASCADE;
DROP TYPE IF EXISTS public.partner_status  CASCADE;
DROP TYPE IF EXISTS public.user_role       CASCADE;

DROP VIEW IF EXISTS public.active_posts    CASCADE;
DROP VIEW IF EXISTS public.admin_metrics   CASCADE;

DROP FUNCTION IF EXISTS public.update_updated_at()          CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user()            CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role()                CASCADE;
DROP FUNCTION IF EXISTS public.get_my_partner_id()          CASCADE;
DROP FUNCTION IF EXISTS public.increment_partner_views(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.register_click(UUID, UUID, TEXT, JSONB) CASCADE;


-- ============================================================
-- SEÇÃO 1 — EXTENSÕES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"  WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto"   WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "unaccent"   WITH SCHEMA extensions;


-- ============================================================
-- SEÇÃO 2 — ENUMS
-- ============================================================

-- Perfis de acesso do sistema
CREATE TYPE public.user_role AS ENUM (
  'admin',        -- Controle total da plataforma
  'colaborador',  -- Acesso operacional, sem permissões destrutivas
  'parceiro',     -- Empresa homologada na plataforma
  'cliente'       -- Usuário final
);

-- Status de homologação do parceiro
CREATE TYPE public.partner_status AS ENUM (
  'pending',   -- Aguardando revisão pelo admin
  'approved',  -- Homologado, visível para clientes
  'rejected'   -- Reprovado, não visível
);

-- Status do ciclo de vida de um lead
CREATE TYPE public.lead_status AS ENUM (
  'new',         -- Recém-criado, não visualizado pelo parceiro
  'in_progress', -- Parceiro contactou ou está em negociação
  'closed',      -- Negócio fechado (sucesso)
  'lost'         -- Oportunidade perdida
);

-- Tipos de evento de rastreamento
CREATE TYPE public.event_type AS ENUM (
  'profile_view',       -- Cliente visualizou o perfil de um parceiro
  'quote_cta_click',    -- Cliente clicou no botão "Solicitar orçamento"
  'quote_form_submit',  -- Cliente enviou o formulário de orçamento
  'favorite_add'        -- Cliente adicionou parceiro aos favoritos
);


-- ============================================================
-- SEÇÃO 3 — TABELAS
-- (em ordem de dependência: sem FK → com FK)
-- ============================================================


-- ----------------------------------------------------------
-- 3.1 CATEGORIES
-- Cada parceiro pertence a uma categoria principal.
-- Pré-populada com as 8 categorias do MVP.
-- ----------------------------------------------------------
CREATE TABLE public.categories (
  id         UUID        NOT NULL DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  slug       TEXT        NOT NULL,
  icon       TEXT        NULL,           -- Emoji ou nome de ícone
  sort_order SMALLINT    NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_categories           PRIMARY KEY (id),
  CONSTRAINT uq_categories_name      UNIQUE (name),
  CONSTRAINT uq_categories_slug      UNIQUE (slug),
  CONSTRAINT chk_categories_slug     CHECK (slug ~ '^[a-z0-9-]+$')
);

COMMENT ON TABLE  public.categories          IS 'Categorias de serviço dos parceiros';
COMMENT ON COLUMN public.categories.slug     IS 'Identificador URL-safe, gerado a partir do nome';
COMMENT ON COLUMN public.categories.icon     IS 'Emoji ou identificador de ícone para UI';


-- ----------------------------------------------------------
-- 3.2 PROFILES
-- Estende auth.users do Supabase.
-- Criado automaticamente via trigger ao registrar.
-- ----------------------------------------------------------
CREATE TABLE public.profiles (
  id          UUID        NOT NULL,
  email       TEXT        NOT NULL,
  full_name   TEXT        NULL,
  avatar_url  TEXT        NULL,
  whatsapp    TEXT        NULL,           -- Formato: +55 11 98765-4321
  role        public.user_role NOT NULL DEFAULT 'cliente',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_profiles     PRIMARY KEY (id),
  CONSTRAINT fk_profiles_user FOREIGN KEY (id)
    REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT chk_profiles_email CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

COMMENT ON TABLE  public.profiles           IS 'Perfil público estendido de cada usuário autenticado';
COMMENT ON COLUMN public.profiles.role      IS 'admin | colaborador | parceiro | cliente';
COMMENT ON COLUMN public.profiles.whatsapp  IS 'WhatsApp com código de país. Ex: +351912345678';


-- ----------------------------------------------------------
-- 3.3 PARTNERS
-- Empresa parceira homologada na plataforma.
-- Vinculada a um profiles.id com role = parceiro.
-- ----------------------------------------------------------
CREATE TABLE public.partners (
  id             UUID              NOT NULL DEFAULT gen_random_uuid(),
  user_id        UUID              NULL,     -- NULL = parceiro sem acesso à plataforma ainda
  company_name   TEXT              NOT NULL,
  slug           TEXT              NULL,     -- URL-friendly, ex: advocacia-legal-pt
  description    TEXT              NULL,     -- Apresentação completa da empresa
  logo_url       TEXT              NULL,     -- URL pública no Supabase Storage
  category_id    UUID              NULL,
  countries      TEXT[]            NOT NULL DEFAULT '{}', -- Países atendidos
  youtube_url    TEXT              NULL,     -- URL do vídeo de apresentação
  whatsapp       TEXT              NOT NULL, -- Número para receber leads via WA
  email          TEXT              NULL,     -- Email comercial (opcional)
  website        TEXT              NULL,     -- URL do site
  instagram      TEXT              NULL,     -- Handle sem @
  status         public.partner_status NOT NULL DEFAULT 'pending',
  profile_views  INTEGER           NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_partners              PRIMARY KEY (id),
  CONSTRAINT uq_partners_user_id      UNIQUE (user_id),
  CONSTRAINT uq_partners_slug         UNIQUE (slug),
  CONSTRAINT fk_partners_user         FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT fk_partners_category     FOREIGN KEY (category_id)
    REFERENCES public.categories(id) ON DELETE SET NULL,
  CONSTRAINT chk_partners_slug        CHECK (slug IS NULL OR slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT chk_partners_views       CHECK (profile_views >= 0),
  CONSTRAINT chk_partners_youtube_url CHECK (
    youtube_url IS NULL OR youtube_url ~* '^https?://(www\.)?(youtube\.com|youtu\.be)/'
  )
);

COMMENT ON TABLE  public.partners               IS 'Empresas parceiras homologadas na plataforma';
COMMENT ON COLUMN public.partners.user_id       IS 'FK para profiles.id. NULL se parceiro ainda não tem conta';
COMMENT ON COLUMN public.partners.slug          IS 'Identificador URL-safe. Usado em /parceiros/{slug}';
COMMENT ON COLUMN public.partners.countries     IS 'Array de nomes de países atendidos pela empresa';
COMMENT ON COLUMN public.partners.status        IS 'pending = aguarda aprovação; approved = visível para clientes';
COMMENT ON COLUMN public.partners.profile_views IS 'Contador de visualizações do perfil. Incrementado via função';


-- ----------------------------------------------------------
-- 3.4 POSTS
-- Publicações dos parceiros exibidas no feed dos clientes.
-- Expiram automaticamente em 30 dias após criação.
-- ----------------------------------------------------------
CREATE TABLE public.posts (
  id         UUID        NOT NULL DEFAULT gen_random_uuid(),
  partner_id UUID        NOT NULL,
  title      TEXT        NOT NULL,
  summary    TEXT        NULL,   -- Resumo exibido nos cards do feed (máx recomendado: 200 chars)
  content    TEXT        NULL,   -- Conteúdo completo (HTML ou Markdown)
  image_url  TEXT        NULL,   -- Imagem de capa (URL externa ou Storage)
  published  BOOLEAN     NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_posts           PRIMARY KEY (id),
  CONSTRAINT fk_posts_partner   FOREIGN KEY (partner_id)
    REFERENCES public.partners(id) ON DELETE CASCADE,
  CONSTRAINT chk_posts_title    CHECK (char_length(title) BETWEEN 3 AND 200),
  CONSTRAINT chk_posts_expires  CHECK (expires_at > created_at)
);

COMMENT ON TABLE  public.posts            IS 'Publicações dos parceiros. Exibidas no feed dos clientes';
COMMENT ON COLUMN public.posts.published  IS 'FALSE = rascunho. Não aparece no feed mesmo se não expirado';
COMMENT ON COLUMN public.posts.expires_at IS 'Posts expiram em 30 dias por padrão. Após isso são invisíveis';


-- ----------------------------------------------------------
-- 3.5 LEADS
-- Solicitação de orçamento enviada por um cliente.
-- Nome e email do cliente são desnormalizados aqui para
-- garantir rastreabilidade mesmo se o perfil for deletado.
-- ----------------------------------------------------------
CREATE TABLE public.leads (
  id              UUID             NOT NULL DEFAULT gen_random_uuid(),
  client_id       UUID             NULL,    -- NULL se cliente deletar a conta
  partner_id      UUID             NULL,    -- NULL se parceiro for removido
  client_name     TEXT             NOT NULL,  -- Desnormalizado por rastreabilidade
  client_email    TEXT             NOT NULL,  -- Desnormalizado por rastreabilidade
  client_whatsapp TEXT             NOT NULL,
  needs           TEXT             NOT NULL,  -- Descrição da necessidade
  status          public.lead_status NOT NULL DEFAULT 'new',
  origin          TEXT             NOT NULL DEFAULT 'partner_profile',
  notes           TEXT             NULL,    -- Anotações internas do parceiro
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_leads               PRIMARY KEY (id),
  CONSTRAINT fk_leads_client        FOREIGN KEY (client_id)
    REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT fk_leads_partner       FOREIGN KEY (partner_id)
    REFERENCES public.partners(id) ON DELETE SET NULL,
  CONSTRAINT chk_leads_email        CHECK (client_email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
  CONSTRAINT chk_leads_needs        CHECK (char_length(needs) >= 10)
);

COMMENT ON TABLE  public.leads               IS 'Solicitações de orçamento. Cada row representa um lead gerado';
COMMENT ON COLUMN public.leads.client_id     IS 'FK nullable — desnormalizar nome/email garante rastreabilidade';
COMMENT ON COLUMN public.leads.client_name   IS 'Nome do cliente no momento do envio (desnormalizado)';
COMMENT ON COLUMN public.leads.client_email  IS 'Email do cliente no momento do envio (desnormalizado)';
COMMENT ON COLUMN public.leads.origin        IS 'Origem do lead: partner_profile | feed | favoritos';
COMMENT ON COLUMN public.leads.notes         IS 'Anotações privadas do parceiro sobre a negociação';


-- ----------------------------------------------------------
-- 3.6 FAVORITES
-- Liga cliente ↔ parceiro. Unique constraint impede duplicatas.
-- ----------------------------------------------------------
CREATE TABLE public.favorites (
  id         UUID        NOT NULL DEFAULT gen_random_uuid(),
  client_id  UUID        NOT NULL,
  partner_id UUID        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_favorites              PRIMARY KEY (id),
  CONSTRAINT uq_favorites_pair         UNIQUE (client_id, partner_id),
  CONSTRAINT fk_favorites_client       FOREIGN KEY (client_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_partner      FOREIGN KEY (partner_id)
    REFERENCES public.partners(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.favorites IS 'Parceiros salvos como favorito por clientes';


-- ----------------------------------------------------------
-- 3.7 CLICKS
-- Registro imutável de eventos de rastreamento.
-- Nenhum DELETE deve ser permitido — apenas INSERT.
-- ----------------------------------------------------------
CREATE TABLE public.clicks (
  id         UUID             NOT NULL DEFAULT gen_random_uuid(),
  client_id  UUID             NULL,    -- NULL se evento for de sessão não rastreável
  partner_id UUID             NOT NULL,
  event_type public.event_type NOT NULL,
  metadata   JSONB            NOT NULL DEFAULT '{}', -- Dados extras: lead_id, post_id, etc.
  created_at TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_clicks          PRIMARY KEY (id),
  CONSTRAINT fk_clicks_client   FOREIGN KEY (client_id)
    REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT fk_clicks_partner  FOREIGN KEY (partner_id)
    REFERENCES public.partners(id) ON DELETE CASCADE
);

COMMENT ON TABLE  public.clicks            IS 'Log imutável de eventos. Não deve ter UPDATE/DELETE';
COMMENT ON COLUMN public.clicks.metadata   IS 'Dados contextuais do evento. Ex: {"lead_id": "uuid", "page": "/parceiros/slug"}';
COMMENT ON COLUMN public.clicks.event_type IS 'profile_view | quote_cta_click | quote_form_submit | favorite_add';


-- ============================================================
-- SEÇÃO 4 — FUNÇÕES UTILITÁRIAS
-- ============================================================

-- ----------------------------------------------------------
-- 4.1 Atualiza updated_at automaticamente
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at IS 'Atualiza o campo updated_at antes de cada UPDATE';


-- ----------------------------------------------------------
-- 4.2 Cria profile automaticamente ao criar usuário no Auth
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role;
BEGIN
  -- Extrair role dos metadados, com fallback para 'cliente'
  BEGIN
    v_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN invalid_text_representation THEN
    v_role := 'cliente';
  END;

  IF v_role IS NULL THEN
    v_role := 'cliente';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      split_part(NEW.email, '@', 1)   -- Fallback: parte local do email
    ),
    v_role
  )
  ON CONFLICT (id) DO NOTHING;   -- Segurança contra re-execução

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS
  'Trigger AFTER INSERT em auth.users. Cria o profile correspondente automaticamente';


-- ----------------------------------------------------------
-- 4.3 Retorna a role do usuário autenticado atual
-- (usada nas policies RLS)
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_my_role IS
  'Retorna a user_role do usuário autenticado. Usada em policies RLS';


-- ----------------------------------------------------------
-- 4.4 Retorna o partner_id do usuário autenticado atual
-- (usada nas policies RLS dos parceiros)
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_partner_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.partners
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_my_partner_id IS
  'Retorna o partners.id vinculado ao usuário autenticado. Usada em policies RLS';


-- ----------------------------------------------------------
-- 4.5 Incrementa contador de visualizações de um parceiro
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_partner_views(p_partner_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.partners
  SET profile_views = profile_views + 1
  WHERE id = p_partner_id;
END;
$$;

COMMENT ON FUNCTION public.increment_partner_views IS
  'Incrementa atomicamente o contador profile_views do parceiro';


-- ----------------------------------------------------------
-- 4.6 Registra um evento de click e atualiza views se aplicável
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_click(
  p_partner_id UUID,
  p_client_id  UUID,
  p_event_type TEXT,
  p_metadata   JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_click_id UUID;
  v_event    public.event_type;
BEGIN
  BEGIN
    v_event := p_event_type::public.event_type;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION 'Tipo de evento inválido: %', p_event_type;
  END;

  INSERT INTO public.clicks (client_id, partner_id, event_type, metadata)
  VALUES (p_client_id, p_partner_id, v_event, COALESCE(p_metadata, '{}'))
  RETURNING id INTO v_click_id;

  -- Incrementar views apenas para profile_view
  IF v_event = 'profile_view' THEN
    PERFORM public.increment_partner_views(p_partner_id);
  END IF;

  RETURN v_click_id;
END;
$$;

COMMENT ON FUNCTION public.register_click IS
  'Insere evento em clicks e, se profile_view, incrementa o contador do parceiro';


-- ============================================================
-- SEÇÃO 5 — TRIGGERS
-- ============================================================

-- updated_at em profiles
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- updated_at em partners
CREATE TRIGGER trg_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- updated_at em posts
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- updated_at em leads
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Criar profile ao registrar no Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- SEÇÃO 6 — VIEWS
-- ============================================================

-- ----------------------------------------------------------
-- 6.1 active_posts — posts visíveis no feed dos clientes
-- Filtra: publicados + não expirados + parceiro aprovado
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW public.active_posts
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.partner_id,
  p.title,
  p.summary,
  p.content,
  p.image_url,
  p.published,
  p.expires_at,
  p.created_at,
  p.updated_at,
  -- Dados do parceiro (JOIN)
  pt.company_name   AS partner_name,
  pt.logo_url       AS partner_logo,
  pt.slug           AS partner_slug,
  pt.whatsapp       AS partner_whatsapp,
  -- Dados da categoria (JOIN)
  c.id              AS category_id,
  c.name            AS category_name,
  c.slug            AS category_slug,
  c.icon            AS category_icon
FROM public.posts p
INNER JOIN public.partners   pt ON pt.id = p.partner_id
INNER JOIN public.categories c  ON c.id  = pt.category_id
WHERE
  p.published  = TRUE
  AND p.expires_at > NOW()
  AND pt.status  = 'approved';

COMMENT ON VIEW public.active_posts IS
  'Posts visíveis no feed: publicados, não expirados e de parceiros aprovados';


-- ----------------------------------------------------------
-- 6.2 admin_metrics — KPIs gerais da plataforma para o admin
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW public.admin_metrics AS
SELECT
  -- Clientes
  (SELECT COUNT(*) FROM public.profiles  WHERE role = 'cliente')           AS total_clients,
  (SELECT COUNT(*) FROM public.profiles  WHERE role = 'parceiro')          AS total_partner_profiles,
  -- Parceiros
  (SELECT COUNT(*) FROM public.partners)                                    AS total_partners,
  (SELECT COUNT(*) FROM public.partners  WHERE status = 'approved')        AS approved_partners,
  (SELECT COUNT(*) FROM public.partners  WHERE status = 'pending')         AS pending_partners,
  (SELECT COUNT(*) FROM public.partners  WHERE status = 'rejected')        AS rejected_partners,
  -- Leads
  (SELECT COUNT(*) FROM public.leads
   WHERE created_at::date = CURRENT_DATE)                                   AS leads_today,
  (SELECT COUNT(*) FROM public.leads
   WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()))     AS leads_this_month,
  (SELECT COUNT(*) FROM public.leads)                                       AS leads_total,
  (SELECT COUNT(*) FROM public.leads     WHERE status = 'closed')          AS leads_closed,
  (SELECT COUNT(*) FROM public.leads     WHERE status = 'new')             AS leads_new,
  (SELECT COUNT(*) FROM public.leads     WHERE status = 'in_progress')     AS leads_in_progress,
  -- Posts
  (SELECT COUNT(*) FROM public.posts
   WHERE published = TRUE AND expires_at > NOW())                          AS active_posts,
  (SELECT COUNT(*) FROM public.posts)                                       AS total_posts,
  -- Clicks
  (SELECT COUNT(*) FROM public.clicks WHERE event_type = 'quote_form_submit') AS total_quote_submits,
  (SELECT COUNT(*) FROM public.clicks WHERE event_type = 'profile_view')      AS total_profile_views;

COMMENT ON VIEW public.admin_metrics IS
  'Métricas gerais da plataforma. Usado no dashboard do admin';


-- ----------------------------------------------------------
-- 6.3 partner_metrics — métricas individuais por parceiro
-- ----------------------------------------------------------
CREATE OR REPLACE VIEW public.partner_metrics AS
SELECT
  pt.id                                                             AS partner_id,
  pt.company_name,
  pt.status,
  pt.profile_views,
  -- Leads
  COUNT(DISTINCT l.id)                                              AS leads_total,
  COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'new')             AS leads_new,
  COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'in_progress')     AS leads_in_progress,
  COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'closed')          AS leads_closed,
  COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'lost')            AS leads_lost,
  -- Clicks por tipo
  COUNT(DISTINCT cl.id) FILTER (WHERE cl.event_type = 'quote_cta_click')   AS quote_cta_clicks,
  COUNT(DISTINCT cl.id) FILTER (WHERE cl.event_type = 'quote_form_submit')  AS quote_submits,
  COUNT(DISTINCT cl.id) FILTER (WHERE cl.event_type = 'favorite_add')       AS favorites_count,
  -- Posts ativos
  COUNT(DISTINCT p.id)                                              AS active_posts_count
FROM public.partners pt
LEFT JOIN public.leads    l  ON l.partner_id  = pt.id
LEFT JOIN public.clicks   cl ON cl.partner_id = pt.id
LEFT JOIN public.posts    p  ON p.partner_id  = pt.id
  AND p.published = TRUE AND p.expires_at > NOW()
GROUP BY pt.id, pt.company_name, pt.status, pt.profile_views;

COMMENT ON VIEW public.partner_metrics IS
  'Métricas agregadas por parceiro: leads, clicks, posts ativos';


-- ============================================================
-- SEÇÃO 7 — ÍNDICES
-- Cobrem: FKs, filtros frequentes, ordenações, buscas
-- ============================================================

-- profiles
CREATE INDEX idx_profiles_role         ON public.profiles(role);
CREATE INDEX idx_profiles_email        ON public.profiles(email);
CREATE INDEX idx_profiles_created_at   ON public.profiles(created_at DESC);

-- partners
CREATE INDEX idx_partners_user_id      ON public.partners(user_id);
CREATE INDEX idx_partners_category_id  ON public.partners(category_id);
CREATE INDEX idx_partners_status       ON public.partners(status);
CREATE INDEX idx_partners_slug         ON public.partners(slug);
CREATE INDEX idx_partners_created_at   ON public.partners(created_at DESC);
-- Índice parcial: apenas aprovados (consulta mais comum)
CREATE INDEX idx_partners_approved     ON public.partners(company_name)
  WHERE status = 'approved';
-- Índice para busca textual por nome
CREATE INDEX idx_partners_name_trgm    ON public.partners
  USING gin(to_tsvector('portuguese', company_name));

-- posts
CREATE INDEX idx_posts_partner_id      ON public.posts(partner_id);
CREATE INDEX idx_posts_published       ON public.posts(published);
CREATE INDEX idx_posts_expires_at      ON public.posts(expires_at);
CREATE INDEX idx_posts_created_at      ON public.posts(created_at DESC);
-- Índice parcial: apenas posts ativos e publicados
CREATE INDEX idx_posts_active          ON public.posts(partner_id, created_at DESC)
  WHERE published = TRUE AND expires_at > NOW();

-- leads
CREATE INDEX idx_leads_client_id       ON public.leads(client_id);
CREATE INDEX idx_leads_partner_id      ON public.leads(partner_id);
CREATE INDEX idx_leads_status          ON public.leads(status);
CREATE INDEX idx_leads_created_at      ON public.leads(created_at DESC);
-- Índice composto: leads por parceiro + status (filtro comum no dashboard)
CREATE INDEX idx_leads_partner_status  ON public.leads(partner_id, status);
-- Índice composto: leads por data (relatórios mensais)
CREATE INDEX idx_leads_date_trunc      ON public.leads(DATE_TRUNC('month', created_at));

-- favorites
CREATE INDEX idx_favorites_client_id   ON public.favorites(client_id);
CREATE INDEX idx_favorites_partner_id  ON public.favorites(partner_id);
-- O UNIQUE constraint (client_id, partner_id) já cria um índice implícito

-- clicks
CREATE INDEX idx_clicks_partner_id     ON public.clicks(partner_id);
CREATE INDEX idx_clicks_client_id      ON public.clicks(client_id);
CREATE INDEX idx_clicks_event_type     ON public.clicks(event_type);
CREATE INDEX idx_clicks_created_at     ON public.clicks(created_at DESC);
-- Índice composto: clicks por parceiro + tipo (dashboard do parceiro)
CREATE INDEX idx_clicks_partner_event  ON public.clicks(partner_id, event_type);
-- Índice parcial: apenas quote_form_submit (métrica principal do MVP)
CREATE INDEX idx_clicks_quote_submits  ON public.clicks(partner_id, created_at DESC)
  WHERE event_type = 'quote_form_submit';


-- ============================================================
-- SEÇÃO 8 — HABILITAR ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks     ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SEÇÃO 9 — POLICIES RLS
-- Nomenclatura: "tabela: ator — operação — condição"
-- ============================================================


-- ----------------------------------------------------------
-- 9.1 categories
-- Leitura liberada para todos os autenticados.
-- Escrita restrita ao admin via service_role (sem policy necessária).
-- ----------------------------------------------------------

CREATE POLICY "categories: autenticados — SELECT — tudo"
  ON public.categories FOR SELECT
  USING (auth.role() = 'authenticated');

-- Anon pode ler categorias (necessário para SSR da landing page)
CREATE POLICY "categories: anon — SELECT — tudo"
  ON public.categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "categories: admin — ALL — tudo"
  ON public.categories FOR ALL
  USING (public.get_my_role() = 'admin');


-- ----------------------------------------------------------
-- 9.2 profiles
-- ----------------------------------------------------------

-- Usuário vê o próprio perfil
CREATE POLICY "profiles: owner — SELECT — próprio"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Admin e colaborador veem todos os perfis
CREATE POLICY "profiles: admin/colab — SELECT — todos"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() IN ('admin', 'colaborador'));

-- Usuário pode atualizar apenas o próprio perfil
CREATE POLICY "profiles: owner — UPDATE — próprio"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Impede que o usuário troque seu próprio role
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Somente admin pode alterar roles e deletar perfis
CREATE POLICY "profiles: admin — ALL — todos"
  ON public.profiles FOR ALL
  USING (public.get_my_role() = 'admin');

-- Sistema pode inserir profiles (via trigger handle_new_user)
CREATE POLICY "profiles: service — INSERT — via trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (true);


-- ----------------------------------------------------------
-- 9.3 partners
-- ----------------------------------------------------------

-- Clientes autenticados veem apenas parceiros APROVADOS
CREATE POLICY "partners: cliente — SELECT — aprovados"
  ON public.partners FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND status = 'approved'
  );

-- Parceiro vê o próprio perfil independente do status
CREATE POLICY "partners: owner — SELECT — próprio"
  ON public.partners FOR SELECT
  USING (user_id = auth.uid());

-- Parceiro edita apenas o próprio perfil
-- Não pode alterar status, user_id ou profile_views
CREATE POLICY "partners: owner — UPDATE — próprio"
  ON public.partners FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND status = (SELECT status FROM public.partners WHERE id = partners.id)
    AND profile_views = (SELECT profile_views FROM public.partners WHERE id = partners.id)
  );

-- Usuário autenticado pode criar parceiro (cadastro de empresa)
CREATE POLICY "partners: autenticado — INSERT — próprio"
  ON public.partners FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

-- Admin e colaborador veem todos (incluindo pendentes/rejeitados)
CREATE POLICY "partners: admin/colab — SELECT — todos"
  ON public.partners FOR SELECT
  USING (public.get_my_role() IN ('admin', 'colaborador'));

-- Admin tem controle total (aprovar, rejeitar, editar, deletar)
CREATE POLICY "partners: admin — ALL — todos"
  ON public.partners FOR ALL
  USING (public.get_my_role() = 'admin');


-- ----------------------------------------------------------
-- 9.4 posts
-- ----------------------------------------------------------

-- Clientes autenticados veem posts ativos de parceiros aprovados
CREATE POLICY "posts: cliente — SELECT — ativos aprovados"
  ON public.posts FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND published = TRUE
    AND expires_at > NOW()
    AND EXISTS (
      SELECT 1 FROM public.partners pt
      WHERE pt.id = posts.partner_id
        AND pt.status = 'approved'
    )
  );

-- Parceiro faz CRUD nos próprios posts
CREATE POLICY "posts: owner — ALL — próprios"
  ON public.posts FOR ALL
  USING (
    partner_id = public.get_my_partner_id()
  )
  WITH CHECK (
    partner_id = public.get_my_partner_id()
  );

-- Admin e colaborador veem todos os posts
CREATE POLICY "posts: admin/colab — SELECT — todos"
  ON public.posts FOR SELECT
  USING (public.get_my_role() IN ('admin', 'colaborador'));

-- Admin pode deletar qualquer post
CREATE POLICY "posts: admin — DELETE — todos"
  ON public.posts FOR DELETE
  USING (public.get_my_role() = 'admin');


-- ----------------------------------------------------------
-- 9.5 leads
-- ----------------------------------------------------------

-- Cliente vê apenas os próprios leads que criou
CREATE POLICY "leads: cliente — SELECT — próprios"
  ON public.leads FOR SELECT
  USING (client_id = auth.uid());

-- Cliente pode criar lead (solicitar orçamento)
-- Valida que o client_id pertence ao usuário logado
CREATE POLICY "leads: cliente — INSERT — próprio"
  ON public.leads FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND client_id = auth.uid()
  );

-- Parceiro vê leads direcionados ao próprio perfil
CREATE POLICY "leads: owner — SELECT — recebidos"
  ON public.leads FOR SELECT
  USING (partner_id = public.get_my_partner_id());

-- Parceiro pode atualizar status e notes dos próprios leads
CREATE POLICY "leads: owner — UPDATE — recebidos"
  ON public.leads FOR UPDATE
  USING (partner_id = public.get_my_partner_id())
  WITH CHECK (
    partner_id = public.get_my_partner_id()
    -- Parceiro não pode alterar dados do cliente
    AND client_id     = (SELECT client_id     FROM public.leads WHERE id = leads.id)
    AND client_name   = (SELECT client_name   FROM public.leads WHERE id = leads.id)
    AND client_email  = (SELECT client_email  FROM public.leads WHERE id = leads.id)
    AND client_whatsapp = (SELECT client_whatsapp FROM public.leads WHERE id = leads.id)
  );

-- Admin e colaborador veem todos os leads
CREATE POLICY "leads: admin/colab — SELECT — todos"
  ON public.leads FOR SELECT
  USING (public.get_my_role() IN ('admin', 'colaborador'));

-- Admin e colaborador podem atualizar qualquer lead
CREATE POLICY "leads: admin/colab — UPDATE — todos"
  ON public.leads FOR UPDATE
  USING (public.get_my_role() IN ('admin', 'colaborador'));

-- Somente admin pode deletar leads
CREATE POLICY "leads: admin — DELETE — todos"
  ON public.leads FOR DELETE
  USING (public.get_my_role() = 'admin');


-- ----------------------------------------------------------
-- 9.6 favorites
-- ----------------------------------------------------------

-- Cliente vê apenas os próprios favoritos
CREATE POLICY "favorites: cliente — SELECT — próprios"
  ON public.favorites FOR SELECT
  USING (client_id = auth.uid());

-- Cliente pode adicionar favorito (apenas para si mesmo)
CREATE POLICY "favorites: cliente — INSERT — próprio"
  ON public.favorites FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND client_id = auth.uid()
  );

-- Cliente pode remover os próprios favoritos
CREATE POLICY "favorites: cliente — DELETE — próprio"
  ON public.favorites FOR DELETE
  USING (client_id = auth.uid());

-- Admin vê todos os favoritos (para análise)
CREATE POLICY "favorites: admin — SELECT — todos"
  ON public.favorites FOR SELECT
  USING (public.get_my_role() = 'admin');


-- ----------------------------------------------------------
-- 9.7 clicks
-- ----------------------------------------------------------

-- Qualquer usuário autenticado pode inserir eventos
-- (registro de rastreamento ao navegar pela plataforma)
CREATE POLICY "clicks: autenticado — INSERT — próprio"
  ON public.clicks FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (client_id = auth.uid() OR client_id IS NULL)
  );

-- Parceiro vê apenas clicks do próprio perfil
CREATE POLICY "clicks: owner — SELECT — próprios"
  ON public.clicks FOR SELECT
  USING (partner_id = public.get_my_partner_id());

-- Admin e colaborador veem todos os eventos
CREATE POLICY "clicks: admin/colab — SELECT — todos"
  ON public.clicks FOR SELECT
  USING (public.get_my_role() IN ('admin', 'colaborador'));

-- Clicks NÃO têm UPDATE nem DELETE — tabela imutável por design
-- (Nenhuma policy de UPDATE/DELETE = operações bloqueadas por padrão)


-- ============================================================
-- SEÇÃO 10 — GRANTS
-- ============================================================

-- service_role ignora RLS (acesso total via chave privada do servidor)
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- anon pode ler categorias (necessário para a landing page pré-login)
GRANT SELECT ON public.categories TO anon;


-- ============================================================
-- SEÇÃO 11 — CATEGORIAS INICIAIS
-- (dados estruturais — não são "seed de demonstração")
-- ============================================================

INSERT INTO public.categories (id, name, slug, icon, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Advocacia / Legalização',   'advocacia-legalizacao',   '⚖️',  1),
  ('c0000000-0000-0000-0000-000000000002', 'Contabilidade / Fiscal',    'contabilidade-fiscal',    '📊',  2),
  ('c0000000-0000-0000-0000-000000000003', 'Marketing / Vendas',        'marketing-vendas',        '📣',  3),
  ('c0000000-0000-0000-0000-000000000004', 'Imobiliário',               'imobiliario',             '🏢',  4),
  ('c0000000-0000-0000-0000-000000000005', 'Crédito / Financeiro',      'credito-financeiro',      '💰',  5),
  ('c0000000-0000-0000-0000-000000000006', 'RH / Recrutamento',         'rh-recrutamento',         '👥',  6),
  ('c0000000-0000-0000-0000-000000000007', 'Tecnologia / Automação',    'tecnologia-automacao',    '🤖',  7),
  ('c0000000-0000-0000-0000-000000000008', 'Consultoria Empresarial',   'consultoria-empresarial', '🎯',  8);


-- ============================================================
-- SEÇÃO 12 — SEED DE DEMONSTRAÇÃO
-- ============================================================
-- UUIDs fixos para consistência e referência cruzada:
--
--  USUÁRIOS (auth.users + profiles)
--  u1 = a0000000-0000-0000-0000-000000000001  admin
--  u2 = a0000000-0000-0000-0000-000000000002  colaborador
--  u3 = a0000000-0000-0000-0000-000000000003  parceiro 1 (Advocacia)
--  u4 = a0000000-0000-0000-0000-000000000004  parceiro 2 (Contabilidade)
--  u5 = a0000000-0000-0000-0000-000000000005  parceiro 3 (Marketing)
--  u6 = a0000000-0000-0000-0000-000000000006  parceiro 4 (Imobiliário)
--  u7 = a0000000-0000-0000-0000-000000000007  parceiro 5 (Crédito) — PENDENTE
--  u8 = a0000000-0000-0000-0000-000000000008  cliente 1
--  u9 = a0000000-0000-0000-0000-000000000009  cliente 2
-- u10 = a0000000-0000-0000-0000-000000000010  cliente 3
--
--  PARTNERS
--  p1 = b0000000-0000-0000-0000-000000000001  Legaliza Portugal (approved)
--  p2 = b0000000-0000-0000-0000-000000000002  ContaFácil PT (approved)
--  p3 = b0000000-0000-0000-0000-000000000003  Growth Luso Digital (approved)
--  p4 = b0000000-0000-0000-0000-000000000004  Move Portugal (approved)
--  p5 = b0000000-0000-0000-0000-000000000005  CredPort Capital (pending)
-- ============================================================


-- ----------------------------------------------------------
-- 12.1 Usuários no Supabase Auth
-- Senha: Demo@1234
-- ----------------------------------------------------------

INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin,
  created_at, updated_at,
  confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES

-- Admin
(
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@emprlendalegal.pt',
  crypt('Demo@1234', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Mariana Fonseca","role":"admin"}',
  FALSE, NOW(), NOW(),
  '', '', '', ''
),

-- Colaborador
(
  'a0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'colaborador@emprlendalegal.pt',
  crypt('Demo@1234', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Ricardo Pinto","role":"colaborador"}',
  FALSE, NOW(), NOW(),
  '', '', '', ''
),

-- Parceiro 1 — Advocacia
(
  'a0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'luis@legalizaportugal.pt',
  crypt('Demo@1234', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Luís Carvalho","role":"parceiro"}',
  FALSE, NOW(), NOW(),
  '', '', '', ''
),

-- Parceiro 2 — Contabilidade
(
  'a0000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'sofia@contafacilpt.pt',
  crypt('Demo@1234', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Sofia Mendes","role":"parceiro"}',
  FALSE, NOW(), NOW(),
  '', '', '', ''
),

-- Parceiro 3 — Marketing
(
  'a0000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'pedro@growthlusopt.pt',
  crypt('Demo@1234', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Pedro Almeida","role":"parceiro"}',
  FALSE, NOW(), NOW(),
  '', '', '', ''
),

-- Parceiro 4 — Imobiliário
(
  'a0000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'carlos@moveportugal.pt',
  crypt('Demo@1234', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Carlos Santos","role":"parceiro"}',
  FALSE, NOW(), NOW(),
  '', '', '', ''
),

-- Parceiro 5 — Crédito (PENDENTE — para demonstrar aprovação no admin)
(
  'a0000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'ana@credportcapital.pt',
  crypt('Demo@1234', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Ana Lima","role":"parceiro"}',
  FALSE, NOW(), NOW(),
  '', '', '', ''
),

-- Cliente 1
(
  'a0000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'joao.ferreira@gmail.com',
  crypt('Demo@1234', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"João Ferreira","role":"cliente"}',
  FALSE, NOW(), NOW(),
  '', '', '', ''
),

-- Cliente 2
(
  'a0000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'beatriz.costa@outlook.com',
  crypt('Demo@1234', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Beatriz Costa","role":"cliente"}',
  FALSE, NOW(), NOW(),
  '', '', '', ''
),

-- Cliente 3
(
  'a0000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'rafael.oliveira@hotmail.com',
  crypt('Demo@1234', gen_salt('bf', 10)),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Rafael Oliveira","role":"cliente"}',
  FALSE, NOW(), NOW(),
  '', '', '', ''
);


-- ----------------------------------------------------------
-- 12.2 Profiles
-- O trigger handle_new_user já cria profiles automaticamente.
-- Inserimos aqui apenas para garantir, com ON CONFLICT DO UPDATE
-- para atualizar se já existirem.
-- ----------------------------------------------------------

INSERT INTO public.profiles (id, email, full_name, whatsapp, role)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@emprlendalegal.pt',         'Mariana Fonseca',  '+351 912 000 001', 'admin'),
  ('a0000000-0000-0000-0000-000000000002', 'colaborador@emprlendalegal.pt',    'Ricardo Pinto',    '+351 912 000 002', 'colaborador'),
  ('a0000000-0000-0000-0000-000000000003', 'luis@legalizaportugal.pt',         'Luís Carvalho',    '+351 912 100 001', 'parceiro'),
  ('a0000000-0000-0000-0000-000000000004', 'sofia@contafacilpt.pt',            'Sofia Mendes',     '+351 912 100 002', 'parceiro'),
  ('a0000000-0000-0000-0000-000000000005', 'pedro@growthlusopt.pt',            'Pedro Almeida',    '+351 912 100 003', 'parceiro'),
  ('a0000000-0000-0000-0000-000000000006', 'carlos@moveportugal.pt',           'Carlos Santos',    '+351 912 100 004', 'parceiro'),
  ('a0000000-0000-0000-0000-000000000007', 'ana@credportcapital.pt',           'Ana Lima',         '+351 912 100 005', 'parceiro'),
  ('a0000000-0000-0000-0000-000000000008', 'joao.ferreira@gmail.com',          'João Ferreira',    '+55 11 98765 4321', 'cliente'),
  ('a0000000-0000-0000-0000-000000000009', 'beatriz.costa@outlook.com',        'Beatriz Costa',    '+55 21 99876 5432', 'cliente'),
  ('a0000000-0000-0000-0000-000000000010', 'rafael.oliveira@hotmail.com',      'Rafael Oliveira',  '+351 926 543 210', 'cliente')
ON CONFLICT (id) DO UPDATE SET
  full_name  = EXCLUDED.full_name,
  whatsapp   = EXCLUDED.whatsapp,
  role       = EXCLUDED.role,
  updated_at = NOW();


-- ----------------------------------------------------------
-- 12.3 Partners (empresas parceiras)
-- ----------------------------------------------------------

INSERT INTO public.partners (
  id, user_id, company_name, slug, description,
  category_id, countries, whatsapp, email, website,
  instagram, youtube_url, status, profile_views
) VALUES

-- P1 — Advocacia (aprovado)
(
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000003',
  'Legaliza Portugal',
  'legaliza-portugal',
  'Escritório especializado em legalização de empresas estrangeiras em Portugal. '
  'Mais de 12 anos de experiência na constituição de sociedades, processos de residência, '
  'golden visa e obtenção de NIF para não residentes. Atendemos empreendedores de toda a '
  'CPLP que desejam estabelecer ou expandir negócios em território português com segurança '
  'jurídica e agilidade. Nossa equipe é fluente em português brasileiro e europeu.',
  'c0000000-0000-0000-0000-000000000001',
  ARRAY['Portugal', 'Brasil', 'Angola', 'Moçambique', 'Cabo Verde'],
  '+351912100001',
  'geral@legalizaportugal.pt',
  'https://legalizaportugal.pt',
  'legalizaportugal',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'approved',
  247
),

-- P2 — Contabilidade (aprovado)
(
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000004',
  'ContaFácil Portugal',
  'contafacil-portugal',
  'Contabilidade certificada e assessoria fiscal para empresas internacionais radicadas em Portugal. '
  'Especializados no Regime Fiscal NHR (Residente Não Habitual), abertura de atividade para '
  'freelancers estrangeiros, gestão de recibos verdes e declarações de IRS/IRC. '
  'Mais de 300 clientes de origem estrangeira ativos. Atendimento 100% digital, em português '
  'e inglês, com relatórios mensais detalhados.',
  'c0000000-0000-0000-0000-000000000002',
  ARRAY['Portugal', 'Brasil', 'Espanha', 'França', 'Alemanha'],
  '+351923200001',
  'info@contafacilpt.pt',
  'https://contafacilpt.pt',
  'contafacilpt',
  NULL,
  'approved',
  189
),

-- P3 — Marketing (aprovado)
(
  'b0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000005',
  'Growth Luso Digital',
  'growth-luso-digital',
  'Agência full-service de marketing digital para empresas estrangeiras que chegam a Portugal '
  'e querem conquistar o mercado europeu. Especialistas em posicionamento de marca, '
  'tráfego pago (Google Ads, Meta Ads), SEO para o mercado lusófono e criação de conteúdo '
  'localizado. Clientes em Portugal, Brasil, Espanha e Reino Unido. Resultados mensuráveis '
  'e relatórios transparentes a cada 15 dias.',
  'c0000000-0000-0000-0000-000000000003',
  ARRAY['Portugal', 'Brasil', 'Espanha', 'Reino Unido', 'Irlanda'],
  '+351934300001',
  'hello@growthlusopt.pt',
  'https://growthlusopt.pt',
  'growthlusopt',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'approved',
  312
),

-- P4 — Imobiliário (aprovado)
(
  'b0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000006',
  'Move Portugal Imóveis',
  'move-portugal-imoveis',
  'Consultoria imobiliária dedicada a ajudar estrangeiros na compra, venda e arrendamento '
  'de imóveis em Portugal. Acompanhamos todo o processo: pesquisa, negociação, due diligence '
  'jurídica, obtenção de financiamento e escritura. Parceiros em Lisboa, Porto, Algarve e '
  'Alentejo. Mais de 150 transações realizadas com clientes internacionais nos últimos 3 anos.',
  'c0000000-0000-0000-0000-000000000004',
  ARRAY['Portugal', 'Brasil', 'Estados Unidos', 'Reino Unido', 'França', 'Luxemburgo'],
  '+351945400001',
  'info@moveportugal.pt',
  'https://moveportugal.pt',
  'moveportugalimoveis',
  NULL,
  'approved',
  421
),

-- P5 — Crédito (PENDENTE — aguardando aprovação do admin)
(
  'b0000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000007',
  'CredPort Capital',
  'credport-capital',
  'Consultoria financeira especializada em crédito para não residentes em Portugal. '
  'Auxiliamos na obtenção de crédito habitação, crédito empresarial e linhas de '
  'financiamento junto aos principais bancos portugueses e europeus. '
  'Negociamos as melhores condições para o seu perfil financeiro.',
  'c0000000-0000-0000-0000-000000000005',
  ARRAY['Portugal', 'Brasil', 'Angola'],
  '+351956500001',
  'contato@credportcapital.pt',
  'https://credportcapital.pt',
  NULL,
  NULL,
  'pending',
  0
);


-- ----------------------------------------------------------
-- 12.4 Posts
-- ----------------------------------------------------------

INSERT INTO public.posts (
  id, partner_id, title, summary, content, published, expires_at, created_at
) VALUES

-- Posts do P1 — Legaliza Portugal
(
  'd0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Como legalizar sua empresa em Portugal em 2025: guia completo passo a passo',
  'Tudo o que um empreendedor brasileiro precisa saber para constituir uma empresa em Portugal: '
  'documentos necessários, tipos de sociedade, prazos reais, custos e os 5 erros mais comuns.',
  'Portugal consolidou-se como um dos destinos mais atrativos para empreendedores internacionais. '
  'O processo de constituição de uma sociedade pode ser realizado em até 5 dias úteis pelo '
  '"Empresa na Hora". Neste guia cobrimos: escolha do tipo societário, capital mínimo, '
  'obtenção do NIPC, abertura de conta bancária, registo nas Finanças e Segurança Social.',
  TRUE,
  NOW() + INTERVAL '28 days',
  NOW() - INTERVAL '2 days'
),
(
  'd0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  'Vistos para empreendedores em Portugal 2025: D2, D8 e as novas regras',
  'Atualização completa sobre os vistos disponíveis para quem deseja empreender em Portugal: '
  'Visto D2 (Empreendedor), D8 (Nômade Digital) e o programa de Start-up Visa.',
  'As regras de entrada e permanência em Portugal passaram por revisões importantes. '
  'O Visto D2 exige plano de negócios detalhado e prova de meios de subsistência. '
  'O D8, voltado para trabalhadores remotos, requer renda mínima comprovada de €3.480/mês. '
  'Abordamos documentação, prazos do SEF, recursos em caso de negação e alternativas.',
  TRUE,
  NOW() + INTERVAL '25 days',
  NOW() - INTERVAL '5 days'
),
(
  'd0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000001',
  'NIF para não residentes: como obter sem sair do Brasil',
  'O Número de Identificação Fiscal (NIF) é o primeiro passo para qualquer negócio em Portugal. '
  'Saiba como obtê-lo à distância, sem precisar viajar, utilizando um representante fiscal.',
  'O NIF pode ser solicitado presencialmente ou através de um representante fiscal habilitado. '
  'Para cidadãos não europeus, a figura do representante fiscal é obrigatória até obter '
  'residência legal. O processo demora entre 3 a 10 dias úteis. Custos envolvidos: '
  'emolumentos das Finanças + honorários do representante. Documentos necessários: '
  'passaporte válido, comprovante de morada e formulário de procuração.',
  TRUE,
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '1 day'
),

-- Posts do P2 — ContaFácil PT
(
  'd0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000002',
  'Regime NHR em Portugal: como economizar até 40% de impostos legalmente',
  'O Regime Fiscal do Residente Não Habitual (NHR) é um dos grandes atrativos de Portugal. '
  'Descubra se você se qualifica e como estruturar sua situação fiscal para aproveitar ao máximo.',
  'O NHR garante, durante 10 anos consecutivos, tributação flat de 20% sobre rendimentos '
  'de trabalho dependente e independente de "alta qualificação", e isenção sobre rendimentos '
  'de fonte estrangeira (pensões, dividendos, royalties). Para se qualificar, é necessário '
  'não ter sido residente em Portugal nos 5 anos anteriores. Candidatura deve ser feita '
  'até 31 de março do ano seguinte ao da obtenção da residência.',
  TRUE,
  NOW() + INTERVAL '27 days',
  NOW() - INTERVAL '3 days'
),
(
  'd0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000002',
  'Recibos verdes em Portugal: guia para freelancers estrangeiros',
  'Trabalha como freelancer e pretende emitir faturas em Portugal? Entenda o que são '
  'recibos verdes, quando são obrigatórios, como calcular IRS e quando vale abrir empresa.',
  'Os "recibos verdes" são a modalidade de trabalho independente mais simples em Portugal. '
  'Abertura de atividade gratuita no Portal das Finanças. Taxa de IRS varia de 11,5% a 48% '
  'dependendo do rendimento anual. Para rendimentos acima de €25.000/ano, geralmente compensa '
  'constituir sociedade. Abordamos: ato isolado vs. atividade aberta, código CAE, '
  'contribuições para a Segurança Social (21,4%), e o regime simplificado.',
  TRUE,
  NOW() + INTERVAL '20 days',
  NOW() - INTERVAL '8 days'
),

-- Posts do P3 — Growth Luso Digital
(
  'd0000000-0000-0000-0000-000000000006',
  'b0000000-0000-0000-0000-000000000003',
  'Como construir uma marca forte no mercado europeu saindo do zero',
  'Estratégias práticas de branding para empresas brasileiras e de outros países que '
  'chegam a Portugal e querem conquistar clientes europeus sem parecer "estrangeiros".',
  'A adaptação cultural é o principal erro de empresas que chegam a Portugal esperando '
  'replicar exatamente o que fazem no Brasil. O mercado europeu valoriza sobriedade, '
  'credibilidade e presença digital consistente. Neste artigo: construção de identidade '
  'visual adaptada, tom de voz adequado ao mercado lusitano, canais prioritários (LinkedIn '
  'e Google vs. Instagram), e como construir prova social local rapidamente.',
  TRUE,
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '4 days'
),
(
  'd0000000-0000-0000-0000-000000000007',
  'b0000000-0000-0000-0000-000000000003',
  'Google Ads em Portugal: por que seu ROI está abaixo do esperado',
  'Os 7 erros mais comuns de empresas estrangeiras ao anunciar no Google em Portugal '
  'e como corrigi-los para multiplicar o retorno sobre investimento.',
  'Portugal tem características únicas de comportamento de pesquisa. O CPC médio é '
  'significativamente inferior ao Brasil, mas o volume de buscas também é menor. '
  'Erros frequentes: usar palavras-chave em português brasileiro sem adaptação, '
  'ignorar buscas em inglês de expats, segmentação geográfica imprecisa, landing pages '
  'sem adaptação cultural. Abordamos: estrutura de campanhas, extensões locais, '
  'remarketing para o mercado português e benchmarks de CPC por setor.',
  TRUE,
  NOW() + INTERVAL '22 days',
  NOW() - INTERVAL '7 days'
),

-- Posts do P4 — Move Portugal Imóveis
(
  'd0000000-0000-0000-0000-000000000008',
  'b0000000-0000-0000-0000-000000000004',
  'Mercado imobiliário em Portugal 2025: onde comprar e quanto custa',
  'Análise completa do mercado imobiliário português: preços por zona, tendências de '
  'valorização, bairros emergentes em Lisboa e Porto, e o que esperar para os próximos anos.',
  'Lisboa permanece a cidade mais cara, com preço médio de €4.800/m² em 2025. '
  'Porto apresentou valorização de 12% no último ano. Zonas emergentes: Loures, Odivelas '
  'e Almada em Lisboa; Matosinhos e Gondomar no Porto. Algarve mantém demanda aquecida '
  'de estrangeiros (60% das transações). Abordamos: custo de escritura, IMT, '
  'Imposto do Selo, financiamento para não residentes e documentação necessária.',
  TRUE,
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '1 day'
),
(
  'd0000000-0000-0000-0000-000000000009',
  'b0000000-0000-0000-0000-000000000004',
  'Crédito habitação para estrangeiros em Portugal: como conseguir aprovação',
  'Guia prático para não residentes e residentes recentes em Portugal que querem '
  'financiar a compra de um imóvel junto a bancos portugueses.',
  'Os bancos portugueses financiam até 80% do valor do imóvel para não residentes '
  '(vs. 90% para residentes). Taxa de esforço máxima: 35-40% do rendimento líquido. '
  'Documentos geralmente exigidos: últimas 3 declarações de IRS/IRPF, 6 extratos bancários, '
  'contrato de trabalho ou declaração de rendimentos, e comprovante de residência. '
  'Bancos mais receptivos a estrangeiros: Millennium BCP, Santander e Caixa Geral de Depósitos.',
  TRUE,
  NOW() + INTERVAL '18 days',
  NOW() - INTERVAL '12 days'
);


-- ----------------------------------------------------------
-- 12.5 Leads (solicitações de orçamento)
-- ----------------------------------------------------------

INSERT INTO public.leads (
  id, client_id, partner_id,
  client_name, client_email, client_whatsapp,
  needs, status, origin,
  created_at, updated_at
) VALUES

-- Lead 1: João → Legaliza Portugal (in_progress)
(
  'e0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000008',
  'b0000000-0000-0000-0000-000000000001',
  'João Ferreira',
  'joao.ferreira@gmail.com',
  '+55 11 98765 4321',
  'Tenho uma empresa de tecnologia no Brasil (LTDA) e quero expandir para Portugal. '
  'Preciso entender qual a melhor estrutura societária e os custos envolvidos para '
  'constituir uma filial ou criar uma nova empresa em Portugal.',
  'in_progress',
  'partner_profile',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 days'
),

-- Lead 2: Beatriz → ContaFácil PT (new)
(
  'e0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000009',
  'b0000000-0000-0000-0000-000000000002',
  'Beatriz Costa',
  'beatriz.costa@outlook.com',
  '+55 21 99876 5432',
  'Trabalhadora remota para empresa brasileira, residente em Lisboa há 8 meses. '
  'Preciso entender como regularizar minha situação fiscal em Portugal e se me '
  'enquadro no regime NHR. Tenho renda de R$ 12.000/mês.',
  'new',
  'partner_profile',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),

-- Lead 3: Rafael → Move Portugal (closed — negócio fechado)
(
  'e0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000010',
  'b0000000-0000-0000-0000-000000000004',
  'Rafael Oliveira',
  'rafael.oliveira@hotmail.com',
  '+351 926 543 210',
  'Quero comprar um apartamento T2 em Lisboa, zona de Alvalade ou Areeiro. '
  'Orçamento disponível: até 320.000€. Já tenho NIF e conta bancária em Portugal. '
  'Preciso de acompanhamento na busca, negociação e processo de escritura.',
  'closed',
  'partner_profile',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '3 days'
),

-- Lead 4: João → Growth Luso Digital (new)
(
  'e0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000008',
  'b0000000-0000-0000-0000-000000000003',
  'João Ferreira',
  'joao.ferreira@gmail.com',
  '+55 11 98765 4321',
  'Acabei de constituir minha empresa em Portugal e preciso construir presença digital '
  'do zero: site, redes sociais e campanha Google Ads para geração de leads B2B. '
  'Área: desenvolvimento de software. Budget mensal: €1.500.',
  'new',
  'partner_profile',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),

-- Lead 5: Beatriz → Legaliza Portugal (in_progress)
(
  'e0000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000009',
  'b0000000-0000-0000-0000-000000000001',
  'Beatriz Costa',
  'beatriz.costa@outlook.com',
  '+55 21 99876 5432',
  'Preciso obter autorização de residência em Portugal por motivo de trabalho remoto. '
  'Já tenho visto D8 aprovado mas preciso de apoio no processo de autorização de residência '
  'junto ao AIMA e no registo na junta de freguesia.',
  'in_progress',
  'partner_profile',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '6 days'
),

-- Lead 6: Rafael → ContaFácil PT (lost)
(
  'e0000000-0000-0000-0000-000000000006',
  'a0000000-0000-0000-0000-000000000010',
  'b0000000-0000-0000-0000-000000000002',
  'Rafael Oliveira',
  'rafael.oliveira@hotmail.com',
  '+351 926 543 210',
  'Preciso de ajuda para declarar o meu IRS pela primeira vez em Portugal. '
  'Tenho rendimentos de trabalho dependente e alguns investimentos em Portugal.',
  'lost',
  'partner_profile',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '20 days'
),

-- Lead 7: João → Move Portugal (new — recente)
(
  'e0000000-0000-0000-0000-000000000007',
  'a0000000-0000-0000-0000-000000000008',
  'b0000000-0000-0000-0000-000000000004',
  'João Ferreira',
  'joao.ferreira@gmail.com',
  '+55 11 98765 4321',
  'Estou a procura de um escritório ou espaço para coworking em Lisboa para minha empresa '
  'de tecnologia. Preferência por Príncipe Real, Chiado ou Santos. Orçamento: €800-1.200/mês.',
  'new',
  'partner_profile',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '6 hours'
),

-- Lead 8: Beatriz → Growth Luso Digital (in_progress)
(
  'e0000000-0000-0000-0000-000000000008',
  'a0000000-0000-0000-0000-000000000009',
  'b0000000-0000-0000-0000-000000000003',
  'Beatriz Costa',
  'beatriz.costa@outlook.com',
  '+55 21 99876 5432',
  'Sou consultora independente e preciso criar minha marca pessoal online em Portugal. '
  'Preciso de: logo, site one-page, perfil LinkedIn otimizado e estratégia de conteúdo. '
  'Área de atuação: recursos humanos e desenvolvimento de carreira.',
  'in_progress',
  'partner_profile',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '10 days'
);


-- ----------------------------------------------------------
-- 12.6 Favorites
-- ----------------------------------------------------------

INSERT INTO public.favorites (id, client_id, partner_id, created_at) VALUES

-- João favoritou Legaliza Portugal e Move Portugal
(
  'f0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000008',
  'b0000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '7 days'
),
(
  'f0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000008',
  'b0000000-0000-0000-0000-000000000004',
  NOW() - INTERVAL '3 days'
),

-- Beatriz favoritou ContaFácil PT e Legaliza Portugal
(
  'f0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000009',
  'b0000000-0000-0000-0000-000000000002',
  NOW() - INTERVAL '12 days'
),
(
  'f0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000009',
  'b0000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '4 days'
),

-- Rafael favoritou todos os 4 aprovados
(
  'f0000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000010',
  'b0000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '20 days'
),
(
  'f0000000-0000-0000-0000-000000000006',
  'a0000000-0000-0000-0000-000000000010',
  'b0000000-0000-0000-0000-000000000002',
  NOW() - INTERVAL '18 days'
),
(
  'f0000000-0000-0000-0000-000000000007',
  'a0000000-0000-0000-0000-000000000010',
  'b0000000-0000-0000-0000-000000000003',
  NOW() - INTERVAL '15 days'
),
(
  'f0000000-0000-0000-0000-000000000008',
  'a0000000-0000-0000-0000-000000000010',
  'b0000000-0000-0000-0000-000000000004',
  NOW() - INTERVAL '9 days'
);


-- ----------------------------------------------------------
-- 12.7 Clicks / Eventos de rastreamento
-- ----------------------------------------------------------

INSERT INTO public.clicks (
  id, client_id, partner_id, event_type, metadata, created_at
) VALUES

-- Visualizações de perfil
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'profile_view', '{}', NOW() - INTERVAL '7 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'profile_view', '{}', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', 'profile_view', '{}', NOW() - INTERVAL '3 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000002', 'profile_view', '{}', NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'profile_view', '{}', NOW() - INTERVAL '10 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000003', 'profile_view', '{}', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 'profile_view', '{}', NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 'profile_view', '{}', NOW() - INTERVAL '19 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000001', 'profile_view', '{}', NOW() - INTERVAL '18 days'),

-- Cliques no CTA de orçamento
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'quote_cta_click', '{"page":"/parceiros/legaliza-portugal"}', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'quote_cta_click', '{"page":"/parceiros/growth-luso-digital"}', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000002', 'quote_cta_click', '{"page":"/parceiros/contafacil-portugal"}', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'quote_cta_click', '{"page":"/parceiros/legaliza-portugal"}', NOW() - INTERVAL '10 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000003', 'quote_cta_click', '{"page":"/parceiros/growth-luso-digital"}', NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 'quote_cta_click', '{"page":"/parceiros/move-portugal-imoveis"}', NOW() - INTERVAL '18 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'quote_cta_click', '{"page":"/parceiros/contafacil-portugal"}', NOW() - INTERVAL '25 days'),

-- Envios de formulário de orçamento (quote_form_submit)
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'quote_form_submit', '{"lead_id":"e0000000-0000-0000-0000-000000000001"}', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'quote_form_submit', '{"lead_id":"e0000000-0000-0000-0000-000000000004"}', NOW() - INTERVAL '1 day'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000002', 'quote_form_submit', '{"lead_id":"e0000000-0000-0000-0000-000000000002"}', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'quote_form_submit', '{"lead_id":"e0000000-0000-0000-0000-000000000005"}', NOW() - INTERVAL '10 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000003', 'quote_form_submit', '{"lead_id":"e0000000-0000-0000-0000-000000000008"}', NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 'quote_form_submit', '{"lead_id":"e0000000-0000-0000-0000-000000000003"}', NOW() - INTERVAL '18 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'quote_form_submit', '{"lead_id":"e0000000-0000-0000-0000-000000000006"}', NOW() - INTERVAL '25 days'),

-- Eventos de favoritar
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'favorite_add', '{}', NOW() - INTERVAL '7 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', 'favorite_add', '{}', NOW() - INTERVAL '3 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000002', 'favorite_add', '{}', NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'favorite_add', '{}', NOW() - INTERVAL '4 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000001', 'favorite_add', '{}', NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'favorite_add', '{}', NOW() - INTERVAL '18 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000003', 'favorite_add', '{}', NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'a0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 'favorite_add', '{}', NOW() - INTERVAL '9 days');


-- ============================================================
-- SEÇÃO 13 — VERIFICAÇÃO FINAL
-- Execute para confirmar que tudo foi inserido corretamente
-- ============================================================

SELECT '=== RESUMO DO SCHEMA ===' AS info;

SELECT
  'categories' AS tabela, COUNT(*) AS total FROM public.categories
UNION ALL SELECT 'profiles',   COUNT(*) FROM public.profiles
UNION ALL SELECT 'partners',   COUNT(*) FROM public.partners
UNION ALL SELECT 'posts',      COUNT(*) FROM public.posts
UNION ALL SELECT 'leads',      COUNT(*) FROM public.leads
UNION ALL SELECT 'favorites',  COUNT(*) FROM public.favorites
UNION ALL SELECT 'clicks',     COUNT(*) FROM public.clicks
ORDER BY tabela;

SELECT '=== MÉTRICAS DEMO ===' AS info;
SELECT * FROM public.admin_metrics;

SELECT '=== POSTS ATIVOS NO FEED ===' AS info;
SELECT id, partner_name, title, category_name, expires_at
FROM public.active_posts
ORDER BY created_at DESC;

SELECT '=== PARCEIROS POR STATUS ===' AS info;
SELECT status, COUNT(*) FROM public.partners GROUP BY status;

SELECT '=== LEADS POR STATUS ===' AS info;
SELECT status, COUNT(*) FROM public.leads GROUP BY status;

SELECT '=== SCHEMA EMPREENDA LEGAL CRIADO COM SUCESSO ===' AS resultado;
