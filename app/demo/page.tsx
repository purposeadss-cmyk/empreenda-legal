export default function DemoPage() {
  const partners = [
    {
      name: "Scalvo",
      category: "Marketing",
      description: "Especialistas em aquisição de clientes e vendas.",
    },
    {
      name: "Alma",
      category: "Consultoria",
      description: "Estratégia empresarial para crescer em Portugal.",
    },
    {
      name: "Torus",
      category: "Imobiliário",
      description: "Apoio para residência e investimento.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-4">
        Parceiros <span className="text-yellow-400">Empreenda Legal</span>
      </h1>

      <p className="text-white/70 mb-10">
        Empresas homologadas para apoiar empreendedores em Portugal.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {partners.map((item) => (
          <div
            key={item.name}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-2xl font-bold">{item.name}</h2>

            <p className="text-yellow-300 mt-1">{item.category}</p>

            <p className="text-white/70 mt-4">{item.description}</p>

            <div className="mt-6 flex gap-3">
              <a
                href="/demo/parceiro"
                className="rounded-xl border border-white/10 px-4 py-3"
              >
                Ver perfil completo
              </a>

              <button className="rounded-xl bg-yellow-400 px-4 py-3 text-black font-semibold">
                Solicitar orçamento
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}