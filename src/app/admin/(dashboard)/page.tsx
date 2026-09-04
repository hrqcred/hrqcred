"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Banknote,
  TrendingUp,
  ClipboardList,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import Link from "next/link";

interface DashboardData {
  totalClientes: number;
  totalEmprestimos: number;
  emprestimosAtivos: number;
  solicitacoesNovas: number;
  totalEmprestado: number;
  totalAReceber: number;
  lucroEstimado: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do BrasíliaCred</p>
      </div>

      {data ? (
        <>
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
              title="Lucro Estimado"
              value={formatCurrency(data.lucroEstimado)}
              icon={TrendingUp}
              color="green"
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-brand-green to-brand-green-dark rounded-2xl p-6 text-white">
              <DollarSign className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-sm opacity-80">Total Emprestado</div>
              <div className="text-3xl font-bold mt-1">
                {formatCurrency(data.totalEmprestado)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-gold-dark to-brand-gold rounded-2xl p-6 text-white">
              <ArrowUpRight className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-sm opacity-80">Total a Receber</div>
              <div className="text-3xl font-bold mt-1">
                {formatCurrency(data.totalAReceber)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
              <Banknote className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-sm opacity-80">Total de Empréstimos</div>
              <div className="text-3xl font-bold mt-1">
                {data.totalEmprestimos}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/admin/solicitacoes"
              className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Solicitações Pendentes
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {data.solicitacoesNovas} nova(s) aguardando análise
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
                  <h3 className="font-semibold text-gray-900">
                    Gerenciar Empréstimos
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {data.emprestimosAtivos} empréstimo(s) ativo(s)
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-brand-green transition-colors" />
              </div>
            </Link>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-400">
          Carregando dados...
        </div>
      )}
    </div>
  );
}
