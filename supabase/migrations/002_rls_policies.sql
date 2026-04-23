-- ============================================================
-- EMPREENDA LEGAL — Row Level Security Policies
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNÇÃO AUXILIAR — role do usuário logado
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- FUNÇÃO AUXILIAR — partner_id do usuário logado
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_partner_id()
RETURNS UUID AS $$
  SELECT id FROM public.partners WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- POLICIES: profiles
-- ============================================================

-- Qualquer usuário autenticado pode ver o próprio perfil
CREATE POLICY "profiles: ver próprio" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin e colaborador veem todos
CREATE POLICY "profiles: admin/colaborador veem todos" ON public.profiles
  FOR SELECT USING (get_my_role() IN ('admin', 'colaborador'));

-- Usuário edita próprio perfil
CREATE POLICY "profiles: editar próprio" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin gerencia tudo
CREATE POLICY "profiles: admin full" ON public.profiles
  FOR ALL USING (get_my_role() = 'admin');

-- ============================================================
-- POLICIES: categories (público — leitura livre para autenticados)
-- ============================================================

CREATE POLICY "categories: leitura autenticados" ON public.categories
  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: partners
-- ============================================================

-- Clientes autenticados veem parceiros APROVADOS
CREATE POLICY "partners: clientes veem aprovados" ON public.partners
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND status = 'approved'
  );

-- Parceiro vê o próprio perfil (independente do status)
CREATE POLICY "partners: parceiro vê próprio" ON public.partners
  FOR SELECT USING (user_id = auth.uid());

-- Parceiro edita próprio perfil
CREATE POLICY "partners: parceiro edita próprio" ON public.partners
  FOR UPDATE USING (user_id = auth.uid());

-- Admin e colaborador veem todos
CREATE POLICY "partners: admin/colaborador veem todos" ON public.partners
  FOR SELECT USING (get_my_role() IN ('admin', 'colaborador'));

-- Admin full control
CREATE POLICY "partners: admin full" ON public.partners
  FOR ALL USING (get_my_role() = 'admin');

-- Inserção: usuário autenticado pode criar parceiro (cadastro de empresa)
CREATE POLICY "partners: inserir autenticado" ON public.partners
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- ============================================================
-- POLICIES: posts
-- ============================================================

-- Clientes autenticados veem posts de parceiros aprovados (não expirados)
CREATE POLICY "posts: clientes veem ativos" ON public.posts
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND published = TRUE
    AND expires_at > NOW()
    AND EXISTS (
      SELECT 1 FROM public.partners
      WHERE id = posts.partner_id AND status = 'approved'
    )
  );

-- Parceiro vê e gerencia próprios posts
CREATE POLICY "posts: parceiro gerencia próprios" ON public.posts
  FOR ALL USING (
    partner_id = get_my_partner_id()
  );

-- Admin vê tudo
CREATE POLICY "posts: admin vê tudo" ON public.posts
  FOR SELECT USING (get_my_role() IN ('admin', 'colaborador'));

-- Admin pode deletar
CREATE POLICY "posts: admin deleta" ON public.posts
  FOR DELETE USING (get_my_role() = 'admin');

-- ============================================================
-- POLICIES: leads
-- ============================================================

-- Cliente vê próprios leads
CREATE POLICY "leads: cliente vê próprios" ON public.leads
  FOR SELECT USING (client_id = auth.uid());

-- Cliente cria lead
CREATE POLICY "leads: cliente cria" ON public.leads
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND client_id = auth.uid()
  );

-- Parceiro vê leads recebidos
CREATE POLICY "leads: parceiro vê recebidos" ON public.leads
  FOR SELECT USING (partner_id = get_my_partner_id());

-- Parceiro atualiza status de leads recebidos
CREATE POLICY "leads: parceiro atualiza status" ON public.leads
  FOR UPDATE USING (partner_id = get_my_partner_id());

-- Admin e colaborador veem todos
CREATE POLICY "leads: admin/colaborador veem todos" ON public.leads
  FOR SELECT USING (get_my_role() IN ('admin', 'colaborador'));

-- Colaborador atualiza status
CREATE POLICY "leads: colaborador atualiza" ON public.leads
  FOR UPDATE USING (get_my_role() IN ('admin', 'colaborador'));

-- ============================================================
-- POLICIES: favorites
-- ============================================================

-- Cliente vê próprios favoritos
CREATE POLICY "favorites: ver próprios" ON public.favorites
  FOR SELECT USING (client_id = auth.uid());

-- Cliente adiciona favorito
CREATE POLICY "favorites: adicionar" ON public.favorites
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND client_id = auth.uid()
  );

-- Cliente remove favorito
CREATE POLICY "favorites: remover" ON public.favorites
  FOR DELETE USING (client_id = auth.uid());

-- ============================================================
-- POLICIES: clicks
-- ============================================================

-- Qualquer autenticado pode inserir evento
CREATE POLICY "clicks: inserir autenticado" ON public.clicks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Parceiro vê clicks do próprio perfil
CREATE POLICY "clicks: parceiro vê próprios" ON public.clicks
  FOR SELECT USING (partner_id = get_my_partner_id());

-- Admin e colaborador veem todos
CREATE POLICY "clicks: admin/colaborador veem todos" ON public.clicks
  FOR SELECT USING (get_my_role() IN ('admin', 'colaborador'));

-- ============================================================
-- GRANTS para service_role (usado no server-side)
-- ============================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Anon pode acessar categorias (necessário para SSR pré-login)
GRANT SELECT ON public.categories TO anon;
