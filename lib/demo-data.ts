// ============================================================
// EMPREENDA LEGAL — Dados mockados para demonstração
// ============================================================

export const DEMO_PARTNER = {
  id: 'b1',
  company_name: 'Legaliza Portugal',
  slug: 'legaliza-portugal',
  description:
    'Escritório especializado em legalização de empresas estrangeiras em Portugal. Mais de 12 anos de experiência na constituição de sociedades, processos de residência, golden visa e obtenção de NIF para não residentes. Atendemos empreendedores de toda a CPLP que desejam estabelecer ou expandir negócios em território português com segurança jurídica e agilidade.',
  category: 'Advocacia / Legalização',
  category_icon: '⚖️',
  countries: ['Portugal', 'Brasil', 'Angola', 'Moçambique', 'Cabo Verde'],
  youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  whatsapp: '+351 912 100 001',
  email: 'geral@legalizaportugal.pt',
  website: 'https://legalizaportugal.pt',
  instagram: 'legalizaportugal',
  status: 'approved',
  profile_views: 247,
  logo_url: null,
  owner_name: 'Luís Carvalho',
}

export const DEMO_PARTNERS = [
  {
    id: 'b1',
    company_name: 'Legaliza Portugal',
    category: 'Advocacia / Legalização',
    status: 'approved',
    leads: 34,
    views: 247,
    closings: 8,
    created_at: '2025-01-15',
    email: 'geral@legalizaportugal.pt',
  },
  {
    id: 'b2',
    company_name: 'ContaFácil Portugal',
    category: 'Contabilidade / Fiscal',
    status: 'approved',
    leads: 28,
    views: 189,
    closings: 6,
    created_at: '2025-01-22',
    email: 'info@contafacilpt.pt',
  },
  {
    id: 'b3',
    company_name: 'Growth Luso Digital',
    category: 'Marketing / Vendas',
    status: 'approved',
    leads: 19,
    views: 312,
    closings: 4,
    created_at: '2025-02-05',
    email: 'hello@growthlusopt.pt',
  },
  {
    id: 'b4',
    company_name: 'Move Portugal Imóveis',
    category: 'Imobiliário',
    status: 'approved',
    leads: 41,
    views: 421,
    closings: 11,
    created_at: '2025-02-10',
    email: 'info@moveportugal.pt',
  },
  {
    id: 'b5',
    company_name: 'CredPort Capital',
    category: 'Crédito / Financeiro',
    status: 'pending',
    leads: 0,
    views: 0,
    closings: 0,
    created_at: '2025-04-20',
    email: 'contato@credportcapital.pt',
  },
  {
    id: 'b6',
    company_name: 'TechFlow Consultoria',
    category: 'Tecnologia / Automação',
    status: 'pending',
    leads: 0,
    views: 0,
    closings: 0,
    created_at: '2025-04-21',
    email: 'ola@techflow.pt',
  },
]

export const DEMO_LEADS = [
  {
    id: 'L001',
    client_name: 'João Ferreira',
    client_email: 'joao.ferreira@gmail.com',
    client_whatsapp: '+55 11 98765-4321',
    needs: 'Tenho uma empresa de tecnologia no Brasil e quero expandir para Portugal. Preciso entender qual a melhor estrutura societária.',
    status: 'in_progress',
    partner: 'Legaliza Portugal',
    partner_id: 'b1',
    created_at: '2025-04-18T14:32:00Z',
  },
  {
    id: 'L002',
    client_name: 'Beatriz Costa',
    client_email: 'beatriz.costa@outlook.com',
    client_whatsapp: '+55 21 99876-5432',
    needs: 'Trabalhadora remota residente em Lisboa. Preciso entender como regularizar minha situação fiscal e se me enquadro no regime NHR.',
    status: 'new',
    partner: 'Legaliza Portugal',
    partner_id: 'b1',
    created_at: '2025-04-21T09:15:00Z',
  },
  {
    id: 'L003',
    client_name: 'Rafael Oliveira',
    client_email: 'rafael.oliveira@hotmail.com',
    client_whatsapp: '+351 926 543 210',
    needs: 'Quero obter autorização de residência em Portugal por motivo de trabalho remoto. Tenho visto D8 aprovado.',
    status: 'in_progress',
    partner: 'Legaliza Portugal',
    partner_id: 'b1',
    created_at: '2025-04-13T11:40:00Z',
  },
  {
    id: 'L004',
    client_name: 'Ana Souza',
    client_email: 'ana.souza@empresa.com.br',
    client_whatsapp: '+55 11 97654-3210',
    needs: 'Preciso legalizar uma filial da minha empresa brasileira em Portugal. Já tenho NIF e conta bancária.',
    status: 'closed',
    partner: 'Legaliza Portugal',
    partner_id: 'b1',
    created_at: '2025-03-28T16:00:00Z',
  },
  {
    id: 'L005',
    client_name: 'Carlos Menezes',
    client_email: 'cmenezes@gmail.com',
    client_whatsapp: '+351 934 567 890',
    needs: 'Golden Visa: preciso de assessoria para investimento em imóvel e processo de residência. Orçamento: 500k EUR.',
    status: 'closed',
    partner: 'Legaliza Portugal',
    partner_id: 'b1',
    created_at: '2025-03-10T10:20:00Z',
  },
  {
    id: 'L006',
    client_name: 'Fernanda Lima',
    client_email: 'fernanda.lima@startup.io',
    client_whatsapp: '+55 51 98887-7654',
    needs: 'Startup de SaaS, quero abrir empresa em Portugal para acessar o mercado europeu. Equipe de 4 pessoas.',
    status: 'lost',
    partner: 'Legaliza Portugal',
    partner_id: 'b1',
    created_at: '2025-02-15T08:30:00Z',
  },
  {
    id: 'L007',
    client_name: 'Pedro Alves',
    client_email: 'pedro@consultoria.pt',
    client_whatsapp: '+351 912 345 678',
    needs: 'Preciso regularizar situação de sócio estrangeiro em empresa portuguesa já existente.',
    status: 'new',
    partner: 'Legaliza Portugal',
    partner_id: 'b1',
    created_at: '2025-04-22T17:55:00Z',
  },
  {
    id: 'L008',
    client_name: 'Mariana Torres',
    client_email: 'mariana@designstudio.com',
    client_whatsapp: '+55 41 99765-4321',
    needs: 'Designer freelancer, quero abrir empresa em Portugal e sair do regime de recibos verdes.',
    status: 'in_progress',
    partner: 'Legaliza Portugal',
    partner_id: 'b1',
    created_at: '2025-04-19T13:10:00Z',
  },
]

export const DEMO_POSTS = [
  {
    id: 'P001',
    title: 'Como legalizar sua empresa em Portugal em 2025: guia completo',
    summary:
      'Tudo o que um empreendedor precisa saber para constituir uma empresa em Portugal: documentos, prazos reais, custos e os 5 erros mais comuns.',
    image_url: null,
    published: true,
    expires_at: '2025-05-21',
    created_at: '2025-04-21T10:00:00Z',
    views: 143,
  },
  {
    id: 'P002',
    title: 'Vistos para empreendedores em Portugal 2025: D2, D8 e as novas regras',
    summary:
      'Atualização completa sobre os vistos disponíveis para quem deseja empreender em Portugal: Visto D2 (Empreendedor), D8 (Nômade Digital).',
    image_url: null,
    published: true,
    expires_at: '2025-05-18',
    created_at: '2025-04-18T14:00:00Z',
    views: 98,
  },
  {
    id: 'P003',
    title: 'NIF para não residentes: como obter sem sair do Brasil',
    summary:
      'O NIF pode ser solicitado à distância através de um representante fiscal habilitado. Saiba como e quais documentos são necessários.',
    image_url: null,
    published: true,
    expires_at: '2025-05-22',
    created_at: '2025-04-22T09:00:00Z',
    views: 67,
  },
]

export const DEMO_ADMIN_METRICS = {
  total_clients: 1247,
  approved_partners: 34,
  pending_partners: 2,
  leads_today: 7,
  leads_month: 186,
  leads_total: 843,
  active_posts: 89,
  total_closings: 47,
  conversion_rate: 25.3,
}

export const DEMO_PARTNER_METRICS = {
  profile_views: 247,
  quote_clicks: 89,
  leads_received: 34,
  closings: 8,
}

export const DEMO_MONTHLY_LEADS = [
  { label: 'Nov', value: 42 },
  { label: 'Dez', value: 58 },
  { label: 'Jan', value: 71 },
  { label: 'Fev', value: 93 },
  { label: 'Mar', value: 118 },
  { label: 'Abr', value: 186 },
]

export const DEMO_WEEKLY_VIEWS = [
  { label: 'Seg', value: 28 },
  { label: 'Ter', value: 41 },
  { label: 'Qua', value: 35 },
  { label: 'Qui', value: 52 },
  { label: 'Sex', value: 67 },
  { label: 'Sáb', value: 19 },
  { label: 'Dom', value: 23 },
]

export const DEMO_LEAD_STATUS_SEGMENTS = [
  { label: 'Novos',        value: 52,  color: '#3B82F6' },
  { label: 'Em andamento', value: 78,  color: '#C9A84C' },
  { label: 'Fechados',     value: 47,  color: '#22C55E' },
  { label: 'Perdidos',     value: 9,   color: '#EF4444' },
]

export const DEMO_PARTNER_LEAD_SEGMENTS = [
  { label: 'Novos',        value: 9,   color: '#3B82F6' },
  { label: 'Em andamento', value: 14,  color: '#C9A84C' },
  { label: 'Fechados',     value: 8,   color: '#22C55E' },
  { label: 'Perdidos',     value: 3,   color: '#6B7280' },
]

export const DEMO_CATEGORIES = [
  'Advocacia / Legalização',
  'Contabilidade / Fiscal',
  'Marketing / Vendas',
  'Imobiliário',
  'Crédito / Financeiro',
  'RH / Recrutamento',
  'Tecnologia / Automação',
  'Consultoria Empresarial',
]

export const DEMO_COUNTRIES = [
  'Portugal', 'Brasil', 'Espanha', 'França', 'Itália',
  'Alemanha', 'Reino Unido', 'Holanda', 'Suíça', 'Bélgica',
  'Luxemburgo', 'Irlanda', 'Estados Unidos', 'Canadá', 'Angola',
]
