"use client";

import { useMemo, useState } from "react";

type LeadStatus = "Novo" | "Em análise" | "Contato feito" | "Fechado";
type PartnerStatus = "Aprovado" | "Pendente";

type Lead = {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  partner: string;
  need: string;
  status: LeadStatus;
  createdAt: string;
};

type Partner = {
  id: number;
  company: string;
  category: string;
  country: string;
  status: PartnerStatus;
  approvedAt?: string;
};

const initialLeads: Lead[] = [
  {
    id: 1,
    name: "João Martins",
    email: "joao@email.com",
    whatsapp: "+351 912 345 678",
    partner: "Scalvo",
    need: "Preciso de marketing para restaurante em Lisboa",
    status: "Novo",
    createdAt: "Hoje, 09:12",
  },
  {
    id: 2,
    name: "Mariana Costa",
    email: "mariana@email.com",
    whatsapp: "+351 933 210 455",
    partner: "Torus",
    need: "Quero apoio para investimento imobiliário",
    status: "Em análise",
    createdAt: "Hoje, 10:40",
  },
  {
    id: 3,
    name: "Pedro Rocha",
    email: "pedro@email.com",
    whatsapp: "+351 963 889 220",
    partner: "77 Services",
    need: "Preciso abrir empresa e legalizar operação",
    status: "Contato feito",
    createdAt: "Hoje, 11:08",
  },
  {
    id: 4,
    name: "Ana Ferreira",
    email: "ana@email.com",
    whatsapp: "+351 917 554 002",
    partner: "Alma",
    need: "Preciso estruturar meu negócio em Portugal",
    status: "Fechado",
    createdAt: "Ontem, 17:20",
  },
];

const initialPartners: Partner[] = [
  {
    id: 1,
    company: "Scalvo",
    category: "Marketing / Vendas",
    country: "Portugal, Espanha, França",
    status: "Aprovado",
    approvedAt: "12/04/2026",
  },
  {
    id: 2,
    company: "Alma",
    category: "Consultoria Empresarial",
    country: "Portugal, Brasil",
    status: "Aprovado",
    approvedAt: "14/04/2026",
  },
  {
    id: 3,
    company: "Torus",
    category: "Imobiliário",
    country: "Portugal",
    status: "Aprovado",
    approvedAt: "16/04/2026",
  },
  {
    id: 4,
    company: "77 Services",
    category: "Advocacia / Legalização",
    country: "Portugal",
    status: "Pendente",
  },
  {
    id: 5,
    company: "Nova Fiscal",
    category: "Contabilidade / Fiscal",
    country: "Portugal",
    status: "Pendente",
  },
];

type TabKey = "overview" | "partners" | "leads" | "clients";

export default function DemoAdminPage() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [message, setMessage] = useState<string>("");

  const approvedPartners = useMemo(
    () => partners.filter((p) => p.status === "Aprovado").length,
    [partners]
  );

  const pendingPartners = useMemo(
    () => partners.filter((p) => p.status === "Pendente").length,
    [partners]
  );

  const openLeads = useMemo(
    () => leads.filter((l) => l.status !== "Fechado").length,
    [leads]
  );

  const closedLeads = useMemo(
    () => leads.filter((l) => l.status === "Fechado").length,
    [leads]
  );

  function approvePartner(id: number) {
    setPartners((prev) =>
      prev.map((partner) =>
        partner.id === id
          ? {
              ...partner,
              status: "Aprovado",
              approvedAt: "Hoje",
            }
          : partner
      )
    );
    setMessage("Parceiro aprovado com sucesso.");
  }

  function changeLeadStatus(id: number, status: LeadStatus) {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status } : lead))
    );
    setMessage('Lead atualizado para "' + status + '".');
  }

  function clearMessage() {
    setTimeout(() => setMessage(""), 2500);
  }

  if (message) {
    clearMessage();
  }

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

          <div className="flex flex-wrap gap-3">
            <a
              href="/demo"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5"
            >
              Visão do cliente
            </a>
            <a
              href="/demo/parceiro"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5"
            >
              Perfil parceiro
            </a>
            <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-300">
              Admin Carla
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <span className="inline-block rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-300">
            Painel de controle da Carla
          </span>

          <h2 className="mt-5 text-5xl font-bold leading-tight">
            Controle do <span className="text-yellow-400">ecossistema</span> em
            um só lugar
          </h2>

          <p className="mt-4 max-w-3xl text-lg text-white/70">
            Acompanhe parceiros cadastrados, aprovações, leads gerados e o
            andamento comercial da plataforma.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {message}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Parceiros aprovados" value={approvedPartners} />
          <MetricCard label="Parceiros pendentes" value={pendingPartners} />
          <MetricCard label="Leads em aberto" value={openLeads} />
          <MetricCard label="Leads fechados" value={closedLeads} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <TabButton
            active={tab === "overview"}
            onClick={() => setTab("overview")}
            label="Visão geral"
          />
          <TabButton
            active={tab === "partners"}
            onClick={() => setTab("partners")}
            label="Parceiros"
          />
          <TabButton
            active={tab === "leads"}
            onClick={() => setTab("leads")}
            label="Leads"
          />
          <TabButton
            active={tab === "clients"}
            onClick={() => setTab("clients")}
            label="Clientes cadastrados"
          />
        </div>

        {tab === "overview" && (
          <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Parceiros cadastrados</h3>
                <span className="text-sm text-white/50">
                  Última atualização: hoje
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-sm text-white/60">
                    <tr>
                      <th className="px-4 py-3">Empresa</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Países</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.slice(0, 4).map((partner) => (
                      <tr
                        key={partner.id}
                        className="border-t border-white/10 text-sm text-white/80"
                      >
                        <td className="px-4 py-4 font-medium">
                          {partner.company}
                        </td>
                        <td className="px-4 py-4">{partner.category}</td>
                        <td className="px-4 py-4">{partner.country}</td>
                        <td className="px-4 py-4">
                          <StatusBadge status={partner.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Leads recentes</h3>
                <span className="text-sm text-white/50">Hoje</span>
              </div>

              <div className="space-y-4">
                {leads.slice(0, 3).map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold">{lead.name}</h4>
                        <p className="text-sm text-yellow-300">{lead.partner}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        {lead.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-white/70">
                      {lead.need}
                    </p>

                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5"
                    >
                      Ver detalhes
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "partners" && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Gestão de parceiros</h3>
              <span className="text-sm text-white/50">
                Simulação clicável
              </span>
            </div>

            <div className="grid gap-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h4 className="text-xl font-semibold">{partner.company}</h4>
                      <p className="mt-1 text-sm text-yellow-300">
                        {partner.category}
                      </p>
                      <p className="mt-2 text-sm text-white/60">
                        Países: {partner.country}
                      </p>
                      <div className="mt-3">
                        <StatusBadge status={partner.status} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <a
                        href="/demo/parceiro"
                        className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/80 transition hover:bg-white/5"
                      >
                        Ver perfil
                      </a>

                      {partner.status === "Pendente" ? (
                        <button
                          onClick={() => approvePartner(partner.id)}
                          className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                        >
                          Aprovar parceiro
                        </button>
                      ) : (
                        <button className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                          Aprovado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "leads" && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Gestão de leads</h3>
              <span className="text-sm text-white/50">
                Atualização visual
              </span>
            </div>

            <div className="grid gap-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                      <h4 className="text-xl font-semibold">{lead.name}</h4>
                      <p className="mt-1 text-sm text-yellow-300">
                        Parceiro: {lead.partner}
                      </p>
                      <p className="mt-2 text-sm text-white/60">
                        {lead.email} • {lead.whatsapp}
                      </p>
                      <p className="mt-3 leading-7 text-white/75">
                        {lead.need}
                      </p>
                    </div>

                    <div className="min-w-[280px] space-y-3">
                      <div>
                        <span className="mb-2 block text-sm text-white/50">
                          Status atual
                        </span>
                        <StatusBadge status={lead.status} />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <SmallAction
                          onClick={() => changeLeadStatus(lead.id, "Novo")}
                          label="Novo"
                        />
                        <SmallAction
                          onClick={() => changeLeadStatus(lead.id, "Em análise")}
                          label="Em análise"
                        />
                        <SmallAction
                          onClick={() => changeLeadStatus(lead.id, "Contato feito")}
                          label="Contato feito"
                        />
                        <SmallAction
                          onClick={() => changeLeadStatus(lead.id, "Fechado")}
                          label="Fechado"
                        />
                      </div>

                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-white/80 transition hover:bg-white/5"
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "clients" && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Clientes cadastrados</h3>
              <span className="text-sm text-white/50">Base simulada</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-sm text-white/60">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">WhatsApp</th>
                    <th className="px-4 py-3">Último interesse</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={client-${lead.id}}
                      className="border-t border-white/10 text-sm text-white/80"
                    >
                      <td className="px-4 py-4 font-medium">{lead.name}</td>
                      <td className="px-4 py-4">{lead.email}</td>
                      <td className="px-4 py-4">{lead.whatsapp}</td>
                      <td className="px-4 py-4">{lead.partner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">{selectedLead.name}</h3>
                <p className="mt-1 text-sm text-yellow-300">
                  Lead para {selectedLead.partner}
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 transition hover:bg-white/5"
              >
                Fechar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard label="Email" value={selectedLead.email} />
              <InfoCard label="WhatsApp" value={selectedLead.whatsapp} />
              <InfoCard label="Status" value={selectedLead.status} />
              <InfoCard label="Entrada" value={selectedLead.createdAt} />
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/50">Necessidade informada</p>
              <p className="mt-2 leading-7 text-white/80">
                {selectedLead.need}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  changeLeadStatus(selectedLead.id, "Contato feito");
                  setSelectedLead(null);
                }}
                className="rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:opacity-90"
              >
                Marcar contato feito
              </button>

              <button
                onClick={() => {
                  changeLeadStatus(selectedLead.id, "Fechado");
                  setSelectedLead(null);
                }}
                className="rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-3 font-semibold text-green-300"
              >
                Marcar como fechado
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-3 text-4xl font-bold text-yellow-400">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition ${
        active
          ? "bg-yellow-400 text-black"
          : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isApproved = status === "Aprovado";
  const isClosed = status === "Fechado";
  const isPending = status === "Pendente";

  let classes =
    "rounded-full px-3 py-1 text-xs border inline-flex items-center ";

  if (isApproved || isClosed) {
    classes += "border-green-500/20 bg-green-500/10 text-green-300";
  } else if (isPending) {
    classes += "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";
  } else {
    classes += "border-white/10 bg-white/5 text-white/70";
  }

  return <span className={classes}>{status}</span>;
}

function SmallAction({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/75 transition hover:bg-white/5"
    >
      {label}
    </button>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-2 text-white/85">{value}</p>
    </div>
  );
}
