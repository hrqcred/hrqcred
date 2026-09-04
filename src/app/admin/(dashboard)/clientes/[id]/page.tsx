"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Car,
  ShieldBan,
  ShieldCheck,
  MessageCircle,
  CheckCircle,
  TrendingUp,
  Banknote,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface Pagamento {
  id: string;
  valor: number;
  numeroParcela: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: string;
}

interface Emprestimo {
  id: string;
  valor: number;
  juros: number;
  tipo: string;
  valorTotal: number;
  parcelas: number;
  valorParcela: number;
  status: string;
  createdAt: string;
  pagamentos: Pagamento[];
}

interface ClienteDetalhado {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  plataforma: string | null;
  classificacao: string;
  bloqueado: boolean;
  createdAt: string;
  emprestimos: Emprestimo[];
  stats: {
    totalEmprestimos: number;
    emprestimosQuitados: number;
    totalPagamentos: number;
    pagamentosEmDia: number;
    taxaPontualidade: number;
  };
}

const classColors: Record<string, string> = {
  NOVO: "bg-blue-100 text-blue-700",
  BOM: "bg-emerald-100 text-emerald-700",
  REGULAR: "bg-amber-100 text-amber-700",
  RUIM: "bg-red-100 text-red-700",
  VIP: "bg-purple-100 text-purple-700",
};

const statusColors: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-700",
  QUITADO: "bg-blue-100 text-blue-700",
  PENDENTE: "bg-yellow-100 text-yellow-700",
  PAGO: "bg-emerald-100 text-emerald-700",
};

export default function ClientePerfilPage() {
  const params = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<ClienteDetalhado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clientes/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setCliente(data);
        setLoading(false);
      });
  }, [params.id]);

  async function toggleBloqueio() {
    if (!cliente) return;
    await fetch(`/api/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bloqueado: !cliente.bloqueado }),
    });
    setCliente({ ...cliente, bloqueado: !cliente.bloqueado });
  }

  async function updateClassificacao(classificacao: string) {
    if (!cliente) return;
    await fetch(`/api/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classificacao }),
    });
    setCliente({ ...cliente, classificacao });
  }

  async function marcarPago(pagamentoId: string) {
    await fetch("/api/pagamentos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pagamentoId, status: "PAGO" }),
    });
    const res = await fetch(`/api/clientes/${params.id}`);
    setCliente(await res.json());
  }

  function cobrarWhatsApp(valor: number, data: string) {
    if (!cliente) return;
    const phone = cliente.telefone.replace(/\D/g, "");
    const dataFmt = new Date(data).toLocaleDateString("pt-BR");
    const msg = encodeURIComponent(
      `Olá ${cliente.nome}! Aqui é da BrasíliaCred. Passando para lembrar da parcela de R$ ${valor.toFixed(2)} com vencimento em ${dataFmt}. Podemos contar com o pagamento? Obrigado!`
    );
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Carregando...
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12 text-gray-400">
        Cliente não encontrado
      </div>
    );
  }

  const totalEmprestado = cliente.emprestimos.reduce(
    (s, e) => s + e.valor,
    0
  );
  const totalComJuros = cliente.emprestimos.reduce(
    (s, e) => s + e.valorTotal,
    0
  );

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center">
                <User className="w-7 h-7 text-brand-green" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {cliente.nome}
                </h1>
                <p className="text-gray-500 text-sm">{cliente.cpf}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {cliente.telefone}
              </div>
              {cliente.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {cliente.email}
                </div>
              )}
              {cliente.plataforma && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Car className="w-4 h-4 text-gray-400" />
                  {cliente.plataforma}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                Cliente desde{" "}
                {new Date(cliente.createdAt).toLocaleDateString("pt-BR")}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <select
                value={cliente.classificacao}
                onChange={(e) => updateClassificacao(e.target.value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer ${classColors[cliente.classificacao] || "bg-gray-100 text-gray-600"}`}
              >
                <option value="NOVO">Novo</option>
                <option value="BOM">Bom</option>
                <option value="REGULAR">Regular</option>
                <option value="RUIM">Ruim</option>
                <option value="VIP">VIP</option>
              </select>

              <button
                onClick={toggleBloqueio}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  cliente.bloqueado
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {cliente.bloqueado ? (
                  <>
                    <ShieldCheck className="w-3 h-3" /> Desbloquear
                  </>
                ) : (
                  <>
                    <ShieldBan className="w-3 h-3" /> Bloquear
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
              <Banknote className="w-5 h-5 text-brand-green mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900">
                {cliente.stats.totalEmprestimos}
              </div>
              <div className="text-xs text-gray-500">Empréstimos</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
              <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900">
                {cliente.stats.emprestimosQuitados}
              </div>
              <div className="text-xs text-gray-500">Quitados</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900">
                {cliente.stats.taxaPontualidade}%
              </div>
              <div className="text-xs text-gray-500">Pontualidade</div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
              <Banknote className="w-5 h-5 text-brand-gold mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">
                R${" "}
                {totalEmprestado.toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                })}
              </div>
              <div className="text-xs text-gray-500">Total emprestado</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            Histórico de Empréstimos
          </h2>

          {cliente.emprestimos.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400">
              Nenhum empréstimo registrado
            </div>
          ) : (
            cliente.emprestimos.map((emp) => (
              <div
                key={emp.id}
                className="bg-white border border-gray-100 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">
                        R$ {emp.valor.toLocaleString("pt-BR")}
                      </h3>
                      <span className="text-gray-500 text-sm">
                        → R${" "}
                        {emp.valorTotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {emp.tipo} • {emp.juros}% juros • {emp.parcelas}x de R${" "}
                      {emp.valorParcela.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      •{" "}
                      {new Date(emp.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[emp.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {emp.pagamentos.map((p) => {
                    const atrasado =
                      p.status === "PENDENTE" &&
                      new Date(p.dataVencimento) < new Date();
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm ${
                          p.status === "PAGO"
                            ? "bg-emerald-50 border-emerald-200"
                            : atrasado
                              ? "bg-red-50 border-red-200"
                              : "bg-amber-50 border-amber-200"
                        }`}
                      >
                        <div>
                          <span className="font-medium">
                            Parcela {p.numeroParcela}
                          </span>
                          <span className="text-gray-500 ml-2">
                            {new Date(p.dataVencimento).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            R${" "}
                            {p.valor.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          {p.status === "PAGO" ? (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              Pago
                              {p.dataPagamento &&
                                ` ${new Date(p.dataPagamento).toLocaleDateString("pt-BR")}`}
                            </span>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                onClick={() => marcarPago(p.id)}
                                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Pago
                              </button>
                              <button
                                onClick={() =>
                                  cobrarWhatsApp(p.valor, p.dataVencimento)
                                }
                                className="flex items-center gap-1 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
