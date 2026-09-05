"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

const EVENTO_LABELS: Record<string, { label: string; color: string }> = {
  page_view:      { label: "Acessou a página",           color: "bg-blue-100 text-blue-700" },
  simulator_use:  { label: "Usou o simulador",           color: "bg-indigo-100 text-indigo-700" },
  form_start:     { label: "Abriu o formulário",         color: "bg-violet-100 text-violet-700" },
  form_submit:    { label: "Enviou o formulário",        color: "bg-purple-100 text-purple-700" },
  analise_view:   { label: "Tela de análise",            color: "bg-amber-100 text-amber-700" },
  aprovado_view:  { label: "Tela de aprovado",           color: "bg-green-100 text-green-700" },
  pagamento_view: { label: "Abriu tela de pagamento",    color: "bg-orange-100 text-orange-700" },
  pix_gerado:     { label: "PIX gerado",                 color: "bg-yellow-100 text-yellow-700" },
  pix_copiado:    { label: "Copiou o código PIX",        color: "bg-lime-100 text-lime-700" },
  pago:           { label: "Pagamento confirmado",        color: "bg-emerald-100 text-emerald-700" },
  whatsapp_aberto:{ label: "Abriu WhatsApp",             color: "bg-teal-100 text-teal-700" },
  abandono:       { label: "Abandonou",                  color: "bg-red-100 text-red-700" },
};

const STATUS_TABS = [
  { key: "todos", label: "Todos" },
  { key: "leads", label: "Leads" },
  { key: "convertidos", label: "Convertidos" },
  { key: "abandonados", label: "Abandonados" },
  { key: "visitantes", label: "Só visitantes" },
];

const ETAPA_BADGES: Record<string, string> = {
  landing:    "bg-gray-100 text-gray-600",
  formulario: "bg-violet-100 text-violet-700",
  analise:    "bg-amber-100 text-amber-700",
  aprovado:   "bg-green-100 text-green-700",
  pagamento:  "bg-orange-100 text-orange-700",
  liberado:   "bg-emerald-100 text-emerald-700",
};

interface LeadEvento {
  id: string;
  evento: string;
  dados: Record<string, unknown> | null;
  createdAt: string;
}

interface Lead {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  dispositivo: string | null;
  etapaAtual: string;
  etapas: string[];
  statusPagamento: string | null;
  valorPago: number | null;
  pagoEm: string | null;
  ip: string | null;
  createdAt: string;
  updatedAt: string;
  eventos: LeadEvento[];
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dtFmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function timeDiff(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}min`;
  return `${Math.round(ms / 3600000)}h`;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [dias, setDias] = useState(30);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ busca, status, dias: String(dias), page: String(page) });
    fetch(`/api/admin/leads-funil?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setLeads(d.leads ?? []);
        setTotal(d.total ?? 0);
        setPages(d.pages ?? 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [busca, status, dias, page]);

  useEffect(() => { load(); }, [load]);

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/funil" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads do Funil</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total.toLocaleString("pt-BR")} registros</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Nome, CPF ou telefone..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
        <select
          value={dias}
          onChange={(e) => { setDias(Number(e.target.value)); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value={7}>7 dias</option>
          <option value={30}>30 dias</option>
          <option value={60}>60 dias</option>
          <option value={90}>90 dias</option>
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setStatus(t.key); setPage(1); }}
            className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
              status === t.key
                ? "bg-white text-gray-900 font-medium shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading && (
          <div className="text-center py-8 text-gray-400 text-sm">Carregando...</div>
        )}
        {!loading && leads.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="font-medium">Nenhum lead encontrado</p>
            <p className="text-sm mt-1">Tente outros filtros ou acesse a landing page para gerar dados</p>
          </div>
        )}
        {!loading && leads.length > 0 && (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Lead</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">Campanha</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Dispositivo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Etapa</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Pagamento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">Data</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <>
                  <tr
                    key={lead.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(lead.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{lead.nome}</div>
                      <div className="text-xs text-gray-400">{lead.telefone ?? lead.cpf ?? "—"}</div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="text-gray-700 text-xs">{lead.utmCampaign ?? "(orgânico)"}</div>
                      <div className="text-gray-400 text-xs">{[lead.utmSource, lead.utmMedium].filter(Boolean).join("/") || "—"}</div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-xs text-gray-500 capitalize">{lead.dispositivo ?? "—"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${ETAPA_BADGES[lead.etapaAtual] ?? "bg-gray-100 text-gray-500"}`}>
                        {lead.etapaAtual}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {lead.statusPagamento === "PAGO" ? (
                        <div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">PAGO</span>
                          {lead.valorPago && <div className="text-xs text-gray-400 mt-0.5">{fmt(lead.valorPago)}</div>}
                        </div>
                      ) : lead.statusPagamento === "PENDENTE" ? (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">PIX gerado</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="text-xs text-gray-500">{dtFmt(lead.createdAt)}</div>
                      <div className="text-xs text-gray-400">{lead.eventos.length} eventos</div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {expanded === lead.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </td>
                  </tr>

                  {/* Timeline expandida */}
                  {expanded === lead.id && (
                    <tr key={`${lead.id}-detail`} className="bg-gray-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid lg:grid-cols-2 gap-6">
                          {/* Dados do lead */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Dados do Lead</h4>
                            <div className="space-y-1.5 text-xs">
                              {[
                                { label: "Nome", value: lead.nome },
                                { label: "CPF", value: lead.cpf },
                                { label: "Telefone", value: lead.telefone },
                                { label: "Dispositivo", value: lead.dispositivo },
                                { label: "IP", value: lead.ip },
                                { label: "UTM Source", value: lead.utmSource },
                                { label: "UTM Medium", value: lead.utmMedium },
                                { label: "UTM Campaign", value: lead.utmCampaign },
                                { label: "UTM Content", value: lead.utmContent },
                                { label: "Etapas concluídas", value: lead.etapas.join(" → ") },
                                { label: "Pago em", value: lead.pagoEm ? dtFmt(lead.pagoEm) : null },
                              ].filter((r) => r.value).map((r) => (
                                <div key={r.label} className="flex gap-2">
                                  <span className="text-gray-400 w-32 shrink-0">{r.label}</span>
                                  <span className="text-gray-700 font-medium">{r.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Timeline */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Timeline da Jornada</h4>
                            {lead.eventos.length === 0 ? (
                              <p className="text-xs text-gray-400">Nenhum evento registrado</p>
                            ) : (
                              <div className="space-y-2">
                                {lead.eventos.map((ev, i) => {
                                  const meta = EVENTO_LABELS[ev.evento] ?? { label: ev.evento, color: "bg-gray-100 text-gray-600" };
                                  const prev = i > 0 ? lead.eventos[i - 1] : null;
                                  return (
                                    <div key={ev.id} className="flex items-start gap-3">
                                      <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                                        {i < lead.eventos.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" style={{ minHeight: 16 }} />}
                                      </div>
                                      <div className="flex-1 pb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                                          {prev && <span className="text-xs text-gray-400">+{timeDiff(prev.createdAt, ev.createdAt)}</span>}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">{dtFmt(ev.createdAt)}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
