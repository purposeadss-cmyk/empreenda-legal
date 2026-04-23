-- ============================================================
-- EMPREENDA LEGAL — Seed Data (Demo)
-- ============================================================
-- ATENÇÃO: Execute APÓS as migrations 001 e 002.
-- Cria usuários via Supabase Auth manualmente no dashboard
-- e depois insere os profiles/partners/posts/leads abaixo.
-- Senhas para todos os usuários demo: Demo@1234
-- ============================================================

-- ============================================================
-- 1. PROFILES (IDs fictícios — substituir pelos UUIDs reais
--    criados ao cadastrar via Supabase Auth)
-- ============================================================

-- Para demonstração local, insira os profiles após criar
-- os usuários no Supabase Authentication dashboard:
--
-- admin@emprlendalegal.pt      → role: admin
-- colab@emprlendalegal.pt      → role: colaborador
-- parceiro1@advocacialegal.pt  → role: parceiro
-- parceiro2@contabilidadept.pt → role: parceiro
-- parceiro3@marketingdigital.pt → role: parceiro
-- parceiro4@imoveisportugal.pt → role: parceiro
-- cliente1@gmail.com           → role: cliente
-- cliente2@gmail.com           → role: cliente
-- cliente3@gmail.com           → role: cliente

-- ============================================================
-- 2. PARTNERS (após criar os profiles com role='parceiro')
-- ============================================================

-- Substitua os UUIDs pelos reais após criar os usuários.
-- Exemplo de inserção de parceiros:

/*

INSERT INTO public.partners (user_id, company_name, slug, description, category_id, countries, whatsapp, email, website, status)
SELECT
  p.id,
  'Advocacia Legal Portugal',
  'advocacia-legal-portugal',
  'Escritório especializado em legalização de empresas estrangeiras em Portugal. Atendemos empreendedores brasileiros, angolanos e de toda a CPLP que buscam estabelecer negócios em território português de forma segura e eficiente.',
  c.id,
  ARRAY['Portugal', 'Brasil', 'Angola'],
  '+351912345678',
  'contato@advocacialegal.pt',
  'https://advocacialegal.pt',
  'approved'
FROM public.profiles p, public.categories c
WHERE p.email = 'parceiro1@advocacialegal.pt'
  AND c.slug = 'advocacia-legalizacao'
LIMIT 1;

INSERT INTO public.partners (user_id, company_name, slug, description, category_id, countries, whatsapp, email, website, instagram, status)
SELECT
  p.id,
  'ContaPlus Portugal',
  'contaplus-portugal',
  'Contabilidade e assessoria fiscal especializada para empresas internacionais. Mais de 10 anos de experiência no mercado português, com foco em startups e PMEs de origem estrangeira.',
  c.id,
  ARRAY['Portugal', 'Brasil', 'Espanha', 'França'],
  '+351923456789',
  'info@contaplus.pt',
  'https://contaplus.pt',
  '@contaplus_portugal',
  'approved'
FROM public.profiles p, public.categories c
WHERE p.email = 'parceiro2@contabilidadept.pt'
  AND c.slug = 'contabilidade-fiscal'
LIMIT 1;

INSERT INTO public.partners (user_id, company_name, slug, description, category_id, countries, whatsapp, email, website, instagram, status)
SELECT
  p.id,
  'Growth Lusitano',
  'growth-lusitano',
  'Agência de marketing digital focada em ajudar empresas estrangeiras a construir presença digital forte no mercado europeu. Especialistas em SEO, mídia paga e branding para o mercado lusófono.',
  c.id,
  ARRAY['Portugal', 'Brasil', 'Espanha', 'Reino Unido'],
  '+351934567890',
  'hello@growthlusitano.pt',
  'https://growthlusitano.pt',
  '@growthlusitano',
  'approved'
FROM public.profiles p, public.categories c
WHERE p.email = 'parceiro3@marketingdigital.pt'
  AND c.slug = 'marketing-vendas'
LIMIT 1;

INSERT INTO public.partners (user_id, company_name, slug, description, category_id, countries, whatsapp, email, website, status)
SELECT
  p.id,
  'IMove Portugal',
  'imove-portugal',
  'Consultoria imobiliária especializada em apoiar estrangeiros na aquisição e arrendamento de imóveis em Portugal. Da pesquisa ao contrato, acompanhamos todo o processo.',
  c.id,
  ARRAY['Portugal', 'Brasil', 'Estados Unidos', 'Reino Unido', 'França'],
  '+351945678901',
  'info@imoveportugal.pt',
  'https://imoveportugal.pt',
  'approved'
FROM public.profiles p, public.categories c
WHERE p.email = 'parceiro4@imoveisportugal.pt'
  AND c.slug = 'imobiliario'
LIMIT 1;

-- Parceiro PENDENTE (para demonstrar aprovação no admin)
INSERT INTO public.partners (company_name, slug, description, category_id, countries, whatsapp, email, status)
SELECT
  'TechFlow Consultoria',
  'techflow-consultoria',
  'Consultoria em tecnologia e automação de processos para empresas que chegam a Portugal e precisam digitalizar operações rapidamente.',
  c.id,
  ARRAY['Portugal', 'Brasil'],
  '+351956789012',
  'contato@techflow.pt',
  'pending'
FROM public.categories c
WHERE c.slug = 'tecnologia-automacao'
LIMIT 1;

-- ============================================================
-- 3. POSTS
-- ============================================================

INSERT INTO public.posts (partner_id, title, summary, content, published, expires_at)
SELECT
  p.id,
  'Guia completo: Como legalizar sua empresa em Portugal em 2025',
  'Tudo o que você precisa saber sobre o processo de constituição de uma empresa em Portugal: documentos, prazos, custos e os principais erros a evitar.',
  'Portugal oferece um dos melhores ambientes para empresas estrangeiras na Europa. Neste guia, cobrimos o processo completo de constituição...',
  TRUE,
  NOW() + INTERVAL '30 days'
FROM public.partners p WHERE p.slug = 'advocacia-legal-portugal';

INSERT INTO public.posts (partner_id, title, summary, content, published, expires_at)
SELECT
  p.id,
  'Vistos e autorizações: o que mudou em 2025',
  'Atualização completa sobre os tipos de visto disponíveis para empreendedores que desejam residir e trabalhar em Portugal.',
  'As regras de visto em Portugal passaram por importantes atualizações em 2025...',
  TRUE,
  NOW() + INTERVAL '25 days'
FROM public.partners p WHERE p.slug = 'advocacia-legal-portugal';

INSERT INTO public.posts (partner_id, title, summary, content, published, expires_at)
SELECT
  p.id,
  'Regime Fiscal para não-residentes em Portugal: o que você precisa saber',
  'Entenda como funciona a tributação para empresas estrangeiras que operam em Portugal e como reduzir a carga fiscal de forma legal.',
  'O sistema fiscal português oferece vantagens significativas para empresas internacionais...',
  TRUE,
  NOW() + INTERVAL '28 days'
FROM public.partners p WHERE p.slug = 'contaplus-portugal';

INSERT INTO public.posts (partner_id, title, summary, content, published, expires_at)
SELECT
  p.id,
  'NHR (Residente Não Habitual): benefícios fiscais para empreendedores',
  'O regime NHR pode significar economia de até 40% em impostos para quem se instala em Portugal. Saiba se você se qualifica.',
  'O regime de Residente Não Habitual é um dos grandes atrativos de Portugal para estrangeiros...',
  TRUE,
  NOW() + INTERVAL '20 days'
FROM public.partners p WHERE p.slug = 'contaplus-portugal';

INSERT INTO public.posts (partner_id, title, summary, content, published, expires_at)
SELECT
  p.id,
  'Como construir uma marca forte no mercado europeu',
  'Estratégias de branding e posicionamento para empresas brasileiras e de outros países que chegam a Portugal querendo conquistar a Europa.',
  'Entrar no mercado europeu exige mais do que traduzir seu site para o português europeu...',
  TRUE,
  NOW() + INTERVAL '30 days'
FROM public.partners p WHERE p.slug = 'growth-lusitano';

INSERT INTO public.posts (partner_id, title, summary, content, published, expires_at)
SELECT
  p.id,
  'Mercado imobiliário português 2025: tendências e oportunidades',
  'Análise completa do mercado imobiliário em Portugal: onde comprar, melhores áreas para investimento e projeções de preços.',
  'O mercado imobiliário português continua sendo um dos mais atrativos da Europa para investidores estrangeiros...',
  TRUE,
  NOW() + INTERVAL '30 days'
FROM public.partners p WHERE p.slug = 'imove-portugal';

-- ============================================================
-- 4. LEADS DEMO
-- ============================================================

-- Para inserir leads demo, você precisa do client_id real.
-- Exemplo (substituir UUIDs):

/*
INSERT INTO public.leads (client_id, partner_id, client_name, client_email, client_whatsapp, needs, status, origin)
SELECT
  cl.id,
  pt.id,
  'Ana Rodrigues',
  'ana.rodrigues@gmail.com',
  '+55 11 98765-4321',
  'Preciso legalizar minha empresa de tecnologia em Portugal. Tenho uma LTD no Brasil e quero expandir para o mercado europeu.',
  'in_progress',
  'partner_profile'
FROM public.profiles cl, public.partners pt
WHERE cl.email = 'cliente1@gmail.com'
  AND pt.slug = 'advocacia-legal-portugal'
LIMIT 1;

INSERT INTO public.leads (client_id, partner_id, client_name, client_email, client_whatsapp, needs, status, origin)
SELECT
  cl.id,
  pt.id,
  'Carlos Mendes',
  'carlos.mendes@hotmail.com',
  '+351 913 456 789',
  'Gostaria de entender como funciona a contabilidade para freelancers estrangeiros em Portugal. Trabalho com design e quero recibos verdes.',
  'new',
  'partner_profile'
FROM public.profiles cl, public.partners pt
WHERE cl.email = 'cliente2@gmail.com'
  AND pt.slug = 'contaplus-portugal'
LIMIT 1;

INSERT INTO public.leads (client_id, partner_id, client_name, client_email, client_whatsapp, needs, status, origin)
SELECT
  cl.id,
  pt.id,
  'Fernanda Costa',
  'fernanda.costa@gmail.com',
  '+55 21 99876-5432',
  'Quero comprar um apartamento em Lisboa. Tenho orçamento de 300k euros e busco zonas emergentes com boa valorização.',
  'closed',
  'partner_profile'
FROM public.profiles cl, public.partners pt
WHERE cl.email = 'cliente3@gmail.com'
  AND pt.slug = 'imove-portugal'
LIMIT 1;

INSERT INTO public.leads (client_id, partner_id, client_name, client_email, client_whatsapp, needs, status, origin)
SELECT
  cl.id,
  pt.id,
  'Ana Rodrigues',
  'ana.rodrigues@gmail.com',
  '+55 11 98765-4321',
  'Preciso de estratégia de marketing digital para lançar minha marca no mercado português. Tenho e-commerce e quero aumentar vendas na Europa.',
  'new',
  'partner_profile'
FROM public.profiles cl, public.partners pt
WHERE cl.email = 'cliente1@gmail.com'
  AND pt.slug = 'growth-lusitano'
LIMIT 1;
*/

*/

-- ============================================================
-- NOTA PARA O DESENVOLVEDOR
-- ============================================================
-- Os blocos comentados acima precisam ser executados APÓS
-- criar os usuários via Supabase Authentication.
--
-- Fluxo recomendado:
-- 1. Execute 001_initial_schema.sql
-- 2. Execute 002_rls_policies.sql
-- 3. Crie os usuários no Supabase Auth Dashboard
-- 4. Execute este arquivo com os comentários removidos
--    (ajustando os emails se necessário)
-- ============================================================
