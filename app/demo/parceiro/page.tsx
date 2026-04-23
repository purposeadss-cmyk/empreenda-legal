export default function DemoPartnerPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              Empreenda <span className="text-yellow-400">Legal</span>
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">
              by Seja Legal Global
            </p>
          </div>

          <a
            href="/demo"
            className="rounded-full border border-yellow-400/30 px-4 py-2 text-sm text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
          >
            Voltar para parceiros
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-400 text-2xl font-bold text-black">
                SC
              </div>
              <div>
                <h2 className="text-4xl font-bold">Scalvo</h2>
                <p className="mt-1 text-lg text-yellow-300">
                  Marketing / Vendas
                </p>
              </div>
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-300">
                Parceiro verificado
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                Portugal
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                Espanha
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                França
              </span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-3 text-2xl font-semibold">Sobre a empresa</h3>
              <p className="leading-8 text-white/75">
                A Scalvo é uma agência especializada em posicionamento,
                aquisição de clientes, tráfego pago e funis de vendas para
                empresas que querem crescer em Portugal com estrutura, clareza
                comercial e previsibilidade de geração de oportunidades.
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-3 text-2xl font-semibold">O que faz</h3>
              <ul className="space-y-3 text-white/75">
                <li>• Gestão de tráfego pago</li>
                <li>• Funis de vendas e captação de leads</li>
                <li>• Estratégia comercial para empresas em expansão</li>
                <li>• Posicionamento digital e branding</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Vídeo demonstrativo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-xl font-semibold">Solicitar orçamento</h3>
              <p className="mb-6 text-white/70">
                Peça um orçamento rápido e fale com este parceiro de forma
                segura e organizada dentro do ecossistema.
              </p>

              <button className="w-full rounded-2xl bg-yellow-400 px-5 py-4 text-lg font-semibold text-black transition hover:opacity-90">
                Solicitar orçamento
              </button>

              <button className="mt-3 w-full rounded-2xl border border-white/10 px-5 py-4 font-semibold text-white/80 transition hover:bg-white/5">
                Falar com especialista
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
