"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users, TrendingUp, DollarSign, MousePointerClick,
  ArrowUpRight, Activity, BarChart3, RefreshCw,
} from "lucide-react";

interface FunilData {
  periodo: { dias: number; desde: string };
  kpis: {
    visitantes: number; leads: number; analise: number; aprovados: number;
    pagamento: number; convertidos: number; receita: number;
    taxaConversao: string; ticketMedio: string;
  };
  funil: { etapa: string; label: string; count: number; pct: number }[];
  tendencia: { dia: string; visitantes: number; leads: number; convertidos: number }[];
  campanhas: { campanha: string; source: string; medium: string; visitantes: number; leads: number; convertidos: number; receita: number }[];
  abandono: { etapa: string; abandonaram: number; total: number; taxaAbandono: number }[];
  dispositivos: Record<string, number>;
}

const ETAPA_LABELS: Record<string, string> = {
  landing: "Landing", formulario: "Formulário", analise: "Análise",
  aprovado: "Aprovado", pagamento: "Pagamento", liberado: "Liberado",
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(a: number, b: number) {
  if (!b) return "0%";
  return `${Math.round((a / b) * 100)}%`;
}

export default function FunilPage() {
  const [data, setData] = useState<FunilData | null>(null);
  const [dias, setDias] = useState(7);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/funil?dias=${dias}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dias]);

  useEffect(() => { load(); }, [load]);

  if (!data && loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Carregando...
      </div>
    );
  }

  const kpis = data?.kpis;
  const funil = data?.funil ?? [];
  const tendencia = data?.tendencia ?? [];
  const campanhas = data?.campanhas ?? [];
  const abandono = data?.abandono ?? [];
  const dispositivos = data?.dispositivos ?? {};
  const maxTend = Math.max(...tendencia.map((t) => t.visitantes), 1);
  const maxFunil = funil[0]?.count || 1;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funil de Conversão</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Tracking de leads, campanhas e performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={14}>Últimos 14 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={60}>Últimos 60 dias</option>
          </select>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <Link
            href="/admin/funil/leads"
            className="flex items-center gap-1.5 text-sm bg-brand-green text-white px-3 py-1.5 rounded-lg hover:opacity-90"
          >
            <Users className="w-3.5 h-3.5" /> Ver Leads
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Visitantes", value: kpis?.visitantes ?? 0, icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Leads", value: kpis?.leads ?? 0, icon: Users, color: "text-violet-500", bg: "bg-violet-50" },
          { label: "Convertidos", value: kpis?.convertidos ?? 0, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
          { label: "Receita", value: fmt(kpis?.receita ?? 0), icon: DollarSign, color: "text-amber-500", bg: "bg-amber-50", isText: true },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{k.label}</span>
              <div className={`w-8 h-8 ${k.bg} rounded-lg flex items-center justify-center`}>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {k.isText ? k.value : k.value.toLocaleString("pt-BR")}
            </div>
          </div>
        ))}
      </div>

      {/* KPIs secundários */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
          <MousePointerClick className="w-6 h-6 mb-2 opacity-80" />
          <div className="text-sm opacity-80">Taxa de Conversão</div>
          <div className="text-3xl font-bold mt-1">{kpis?.taxaConversao ?? 0}%</div>
          <div className="text-xs opacity-70 mt-1">visitantes → pagos</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
          <DollarSign className="w-6 h-6 mb-2 opacity-80" />
          <div className="text-sm opacity-80">Ticket Médio</div>
          <div className="text-3xl font-bold mt-1">R$ {kpis?.ticketMedio ?? "0"}</div>
          <div className="text-xs opacity-70 mt-1">por conversão</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <BarChart3 className="w-6 h-6 mb-2 opacity-80" />
          <div className="text-sm opacity-80">Conv. Lead→Pago</div>
          <div className="text-3xl font-bold mt-1">
            {pct(kpis?.convertidos ?? 0, kpis?.leads ?? 0)}
          </div>
          <div className="text-xs opacity-70 mt-1">de quem preencheu o form</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Funil visual */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Funil de Conversão</h3>
          <div className="space-y-2">
            {funil.map((step, i) => (
              <div key={step.etapa}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{step.etapa}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">{step.label}</span>
                    <span className="font-bold text-gray-900">{step.count.toLocaleString("pt-BR")}</span>
                    <span className="text-xs text-gray-400 w-10 text-right">{step.pct}%</span>
                  </div>
                </div>
                <div className="h-7 bg-gray-50 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{
                      width: `${(step.count / maxFunil) * 100}%`,
                      background: i === funil.length - 1
                        ? "linear-gradient(90deg,#16a34a,#22c55e)"
                        : i === 0 ? "linear-gradient(90deg,#3b82f6,#6366f1)"
                        : "linear-gradient(90deg,#8b5cf6,#a78bfa)",
                    }}
                  />
                  {i > 0 && funil[i - 1].count > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                      -{Math.round(((funil[i - 1].count - step.count) / funil[i - 1].count) * 100)}% do anterior
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tendência */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Tendência Diária</h3>
          <div className="flex items-end gap-1 h-36">
            {tendencia.map((t) => (
              <div key={t.dia} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: "120px" }}>
                  <div
                    className="w-full bg-blue-200 rounded-t-sm"
                    style={{ height: `${(t.visitantes / maxTend) * 100}%`, minHeight: t.visitantes > 0 ? 2 : 0 }}
                    title={`${t.visitantes} visitantes`}
                  />
                  <div
                    className="w-full bg-violet-400 rounded-t-sm"
                    style={{ height: `${(t.leads / maxTend) * 100}%`, minHeight: t.leads > 0 ? 2 : 0 }}
                    title={`${t.leads} leads`}
                  />
                  <div
                    className="w-full bg-green-400 rounded-t-sm"
                    style={{ height: `${(t.convertidos / maxTend) * 100}%`, minHeight: t.convertidos > 0 ? 2 : 0 }}
                    title={`${t.convertidos} convertidos`}
                  />
                </div>
                <div className="text-[10px] text-gray-400">{t.dia}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" />Visitantes</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-violet-400 inline-block" />Leads</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" />Pagos</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Abandono por etapa */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Abandono por Etapa</h3>
          <div className="space-y-3">
            {abandono.map((a) => (
              <div key={a.etapa}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{ETAPA_LABELS[a.etapa] ?? a.etapa}</span>
                  <span className={`font-bold ${a.taxaAbandono > 50 ? "text-red-500" : a.taxaAbandono > 25 ? "text-amber-500" : "text-green-600"}`}>
                    {a.taxaAbandono}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${a.taxaAbandono > 50 ? "bg-red-400" : a.taxaAbandono > 25 ? "bg-amber-400" : "bg-green-400"}`}
                    style={{ width: `${a.taxaAbandono}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{a.abandonaram} de {a.total}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispositivos */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Dispositivos</h3>
          {Object.keys(dispositivos).length === 0 ? (
            <p className="text-gray-400 text-sm">Sem dados ainda</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(dispositivos)
                .sort((a, b) => b[1] - a[1])
                .map(([disp, count]) => {
                  const total = Object.values(dispositivos).reduce((s, v) => s + v, 0);
                  return (
                    <div key={disp}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 capitalize">{disp}</span>
                        <span className="font-bold text-gray-900">{count} <span className="text-gray-400 font-normal text-xs">({Math.round((count / total) * 100)}%)</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Resumo rápido */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Resumo do Período</h3>
          <div className="space-y-3">
            {[
              { label: "Em análise (agora)", value: kpis?.analise ?? 0 },
              { label: "Aprovados (agora)", value: kpis?.aprovados ?? 0 },
              { label: "No PIX (agora)", value: kpis?.pagamento ?? 0 },
              { label: "Form → PIX", value: pct(kpis?.pagamento ?? 0, kpis?.leads ?? 0) },
              { label: "PIX → Pago", value: pct(kpis?.convertidos ?? 0, kpis?.pagamento ?? 0) },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{r.label}</span>
                <span className="font-bold text-gray-900 text-sm">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campanhas */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Performance por Campanha</h3>
          <Link href="/admin/funil/leads" className="text-sm text-brand-green flex items-center gap-1 hover:underline">
            Ver todos os leads <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {campanhas.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">
            Nenhuma campanha rastreada ainda. Acesse a landing page com parâmetros UTM para começar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Campanha</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-500">Fonte</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-500">Visitantes</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-500">Leads</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-500">Conv.</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-500">Tx. Conv.</th>
                  <th className="text-right py-2 font-medium text-gray-500">Receita</th>
                </tr>
              </thead>
              <tbody>
                {campanhas.map((c) => (
                  <tr key={c.campanha} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-gray-900 max-w-[160px] truncate">{c.campanha}</td>
                    <td className="py-2.5 pr-4 text-gray-500 text-xs">
                      {c.source}/{c.medium}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-gray-700">{c.visitantes}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-700">{c.leads}</td>
                    <td className="py-2.5 pr-4 text-right">
                      <span className={`font-bold ${c.convertidos > 0 ? "text-green-600" : "text-gray-400"}`}>
                        {c.convertidos}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        (c.visitantes > 0 && (c.convertidos / c.visitantes) > 0.05)
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {pct(c.convertidos, c.visitantes)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-gray-900">{fmt(c.receita)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
