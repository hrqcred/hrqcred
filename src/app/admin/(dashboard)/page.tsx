"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Banknote,
  TrendingUp,
  ClipboardList,
  DollarSign,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  ShieldBan,
  MessageCircle,
  Download,
} from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import Calendar from "@/components/admin/Calendar";
import Link from "next/link";

interface Alerta {
  id: string;
  valor: number;
  numeroParcela: number;
  dataVencimento: string;
  emprestimo: {
    cliente: { nome: string; telefone: string };
  };
}

interface DashboardData {
  totalClientes: number;
  totalEmprestimos: number;
  emprestimosAtivos: number;
  solicitacoesNovas: number;
  totalEmprestado: number;
  totalAReceber: number;
  lucroEstimado: number;
  clientesBloqueados: number;
  vencimentosHoje: Alerta[];
  pagamentosAtrasados: Alerta[];
  mesesGrafico: { mes: string; valor: number; lucro: number }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchData = useCallback(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    fetchData();

    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") fetchData();
    });

    const interval = setInterval(fetchData, 30000);

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [fetchData]);

  function fmt(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function cobrarWhatsApp(
    telefone: string,
    nome: string,
    valor: number,
    data: string
  ) {
    const phone = telefone.replace(/\D/g, "");
    const dataFmt = new Date(data).toLocaleDateString("pt-BR");
    const msg = encodeURIComponent(
      `Olá ${nome}! Aqui é da BrasíliaCred. Passando para lembrar da parcela de R$ ${valor.toFixed(2)} com vencimento em ${dataFmt}. Podemos contar com o pagamento? Obrigado!`
    );
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Carregando...
      </div>
    );
  }

  const maxGrafico = Math.max(...data.mesesGrafico.map((m) => m.valor), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral do BrasíliaCred</p>
        </div>
        <a
          href="/api/relatorios?tipo=emprestimos"
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-green bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar
        </a>
      </div>

      {(data.pagamentosAtrasados.length > 0 ||
        data.vencimentosHoje.length > 0) && (
        <div className="space-y-3 mb-6">
          {data.pagamentosAtrasados.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-red-700">
                  {data.pagamentosAtrasados.length} pagamento(s) atrasado(s)
                </h3>
              </div>
              <div className="space-y-2">
                {data.pagamentosAtrasados.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2"
                  >
                    <div>
                      <span className="font-medium text-sm text-gray-900">
                        {p.emprestimo.cliente.nome}
                      </span>
                      <span className="text-gray-500 text-xs ml-2">
                        Parcela {p.numeroParcela} — R$ {p.valor.toFixed(2)} —
                        venceu{" "}
                        {new Date(p.dataVencimento).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        cobrarWhatsApp(
                          p.emprestimo.cliente.telefone,
                          p.emprestimo.cliente.nome,
                          p.valor,
                          p.dataVencimento
                        )
                      }
                      className="flex items-center gap-1 bg-[#25D366] text-white text-xs font-medium px-3 py-1 rounded-lg hover:bg-[#20BD5A] transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Cobrar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.vencimentosHoje.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-amber-700">
                  {data.vencimentosHoje.length} pagamento(s) vencem hoje
                </h3>
              </div>
              <div className="space-y-2">
                {data.vencimentosHoje.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2"
                  >
                    <div>
                      <span className="font-medium text-sm text-gray-900">
                        {p.emprestimo.cliente.nome}
                      </span>
                      <span className="text-gray-500 text-xs ml-2">
                        Parcela {p.numeroParcela} — R$ {p.valor.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        cobrarWhatsApp(
                          p.emprestimo.cliente.telefone,
                          p.emprestimo.cliente.nome,
                          p.valor,
                          p.dataVencimento
                        )
                      }
                      className="flex items-center gap-1 bg-[#25D366] text-white text-xs font-medium px-3 py-1 rounded-lg hover:bg-[#20BD5A] transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Lembrar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Clientes"
          value={String(data.totalClientes)}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Empréstimos Ativos"
          value={String(data.emprestimosAtivos)}
          icon={Banknote}
          color="green"
        />
        <StatsCard
          title="Solicitações Novas"
          value={String(data.solicitacoesNovas)}
          icon={ClipboardList}
          color="gold"
        />
        <StatsCard
          title="Blacklist"
          value={String(data.clientesBloqueados)}
          icon={ShieldBan}
          color="red"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-brand-green to-brand-green-dark rounded-2xl p-6 text-white">
          <DollarSign className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-sm opacity-80">Total Emprestado</div>
          <div className="text-3xl font-bold mt-1">
            {fmt(data.totalEmprestado)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-brand-gold-dark to-brand-gold rounded-2xl p-6 text-white">
          <ArrowUpRight className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-sm opacity-80">Total a Receber</div>
          <div className="text-3xl font-bold mt-1">
            {fmt(data.totalAReceber)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-sm opacity-80">Lucro Estimado</div>
          <div className="text-3xl font-bold mt-1">
            {fmt(data.lucroEstimado)}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            Empréstimos por Mês
          </h3>
          <div className="flex items-end gap-3 h-40">
            {data.mesesGrafico.map((m) => (
              <div key={m.mes} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] text-gray-500 font-medium">
                  {m.valor > 0
                    ? `R$${(m.valor / 1000).toFixed(1)}k`
                    : ""}
                </div>
                <div
                  className="w-full flex flex-col gap-0.5"
                  style={{ height: "120px" }}
                >
                  <div className="flex-1" />
                  <div
                    className="bg-brand-green/20 rounded-t-lg w-full transition-all"
                    style={{
                      height: `${(m.valor / maxGrafico) * 100}%`,
                      minHeight: m.valor > 0 ? "4px" : "0",
                    }}
                  />
                  <div
                    className="bg-brand-gold/40 rounded-b-lg w-full"
                    style={{
                      height: `${(m.lucro / maxGrafico) * 100}%`,
                      minHeight: m.lucro > 0 ? "4px" : "0",
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500">{m.mes}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-brand-green/20 rounded" />
              Emprestado
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-brand-gold/40 rounded" />
              Lucro
            </div>
          </div>
        </div>

        <Calendar compact />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/admin/solicitacoes"
          className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Solicitações</h3>
              <p className="text-gray-500 text-sm mt-1">
                {data.solicitacoesNovas} nova(s)
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-brand-green transition-colors" />
          </div>
        </Link>
        <Link
          href="/admin/emprestimos"
          className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Empréstimos</h3>
              <p className="text-gray-500 text-sm mt-1">
                {data.emprestimosAtivos} ativo(s)
              </p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-brand-green transition-colors" />
          </div>
        </Link>
        <Link
          href="/admin/calendario"
          className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Calendário</h3>
              <p className="text-gray-500 text-sm mt-1">Ver recebimentos</p>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-brand-green transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
