import Link from 'next/link'
import { ArrowRight, Shield, Building2, TrendingUp, Globe, CheckCircle2, Star } from 'lucide-react'
import Logo from '@/components/layout/Logo'
import Button from '@/components/ui/Button'

const features = [
  {
    icon: Shield,
    title: 'Parceiros homologados',
    description: 'Todos os parceiros passam por um processo rigoroso de aprovação antes de aparecerem na plataforma.',
  },
  {
    icon: Building2,
    title: 'Empresas especializadas',
    description: 'Acesse especialistas em advocacia, contabilidade, imobiliário, finanças e muito mais.',
  },
  {
    icon: Globe,
    title: 'Foco em Portugal',
    description: 'Plataforma criada para empreendedores que chegam ou operam em Portugal.',
  },
  {
    icon: TrendingUp,
    title: 'Leads rastreáveis',
    description: 'Todo pedido de orçamento é registrado, garantindo transparência e acompanhamento.',
  },
]

const categories = [
  { icon: '⚖️', label: 'Advocacia / Legalização' },
  { icon: '📊', label: 'Contabilidade / Fiscal' },
  { icon: '📣', label: 'Marketing / Vendas' },
  { icon: '🏢', label: 'Imobiliário' },
  { icon: '💰', label: 'Crédito / Financeiro' },
  { icon: '👥', label: 'RH / Recrutamento' },
  { icon: '🤖', label: 'Tecnologia / Automação' },
  { icon: '🎯', label: 'Consultoria Empresarial' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-950/95 backdrop-blur-md border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm">Criar conta <ArrowRight size={14} /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-medium mb-8">
              <Star size={14} />
              Plataforma premium para empreendedores globais
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Conecte-se com os{' '}
              <span className="text-gold-gradient">melhores parceiros</span>{' '}
              em Portugal
            </h1>

            <p className="text-xl text-dark-300 leading-relaxed mb-10 max-w-xl">
              Acesse empresas homologadas especializadas em apoiar empreendedores que chegam ou crescem em Portugal. Peça orçamentos de forma rápida, rastreável e segura.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/cadastro">
                <Button size="lg">
                  Criar conta gratuita
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Já tenho conta
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 text-sm text-dark-400">
              {['Acesso gratuito', 'Parceiros verificados', 'Sem compromisso'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-gold-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Categorias disponíveis</h2>
            <p className="text-dark-400">Especialistas em cada área para apoiar o seu negócio</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map(({ icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-dark-900 border border-dark-700 hover:border-gold-500/40 transition-all duration-300 group"
              >
                <span className="text-3xl">{icon}</span>
                <span className="text-sm font-medium text-dark-300 group-hover:text-white text-center transition-colors">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Por que usar o Empreenda Legal?</h2>
            <p className="text-dark-400">Uma plataforma pensada para quem leva o negócio a sério</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 rounded-2xl bg-dark-900 border border-dark-700 hover:border-gold-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-gold-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-dark-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-dark-400 text-lg mb-8">
            Cadastre-se gratuitamente e acesse a rede de parceiros homologados da plataforma.
          </p>
          <Link href="/cadastro">
            <Button size="lg">
              Criar conta agora
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-dark-500 text-sm">
            © {new Date().getFullYear()} Seja Legal Global. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
