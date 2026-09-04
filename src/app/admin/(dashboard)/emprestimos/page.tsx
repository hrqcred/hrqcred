"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  Plus,
  X,
  CheckCircle,
  MessageCircle,
  Filter,
  Download,
} from "lucide-react";

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
  cliente: { nome: string; cpf: string; telefone: string };
  pagamentos: Pagamento[];
}

interface ClienteOption {
  id: string;
  nome: string;
  cpf: string;
}

const statusColors: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-700",
  ATIVO: "bg-green-100 text-green-700",
  QUITADO: "bg-blue-100 text-blue-700",
  ATRASADO: "bg-red-100 text-red-700",
  PAGO: "bg-emerald-100 text-emerald-700",
};

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<Emprestimo | null>(null);
  const [erro, setErro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  useEffect(() => {
    Promise.all([
      fetch("/api/emprestimos").then((r) => r.json()),
      fetch("/api/clientes").then((r) => r.json()),
    ]).then(([emp, cli]) => {
      setEmprestimos(emp);
      setClientes(cli);
      setLoading(false);
    });
  }, []);

  const filtered = emprestimos.filter((e) => {
    if (filtroStatus !== "TODOS" && e.status !== filtroStatus) return false;
    if (filtroTipo !== "TODOS" && e.tipo !== filtroTipo) return false;
    return true;
  });

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/emprestimos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: form.get("clienteId"),
          valor: Number(form.get("valor")),
          tipo: form.get("tipo"),
          parcelas: Number(form.get("parcelas")),
          observacoes: form.get("observacoes") || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error);
      }

      const res2 = await fetch("/api/emprestimos");
      setEmprestimos(await res2.json());
      setShowForm(false);
    } catch (err) {
      setErro(
        err instanceof Error ? err.message : "Erro ao criar empréstimo"
      );
    }
  }

  async function marcarPago(pagamentoId: string, emprestimoId: string) {
    await fetch("/api/pagamentos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pagamentoId, status: "PAGO" }),
    });
    const res = await fetch("/api/emprestimos");
    const updated = await res.json();
    setEmprestimos(updated);
    if (showDetail) {
      const det = updated.find((e: Emprestimo) => e.id === showDetail.id);
      if (det) setShowDetail(det);
    }
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

  function getParcelaStatus(p: Pagamento) {
    if (p.status === "PAGO") return "PAGO";
    if (new Date(p.dataVencimento) < new Date()) return "ATRASADO";
    return "PENDENTE";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empréstimos</h1>
          <p className="text-gray-500 mt-1">
            Gerencie os empréstimos ativos e histórico
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/relatorios?tipo=emprestimos"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-green bg-white border border-gray-200 px-3 py-2 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </a>
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-green hover:bg-brand-green-dark text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Empréstimo
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-green focus:outline-none"
        >
          <option value="TODOS">Todos os status</option>
          <option value="ATIVO">Ativo</option>
          <option value="QUITADO">Quitado</option>
          <option value="PENDENTE">Pendente</option>
        </select>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-green focus:outline-none"
        >
          <option value="TODOS">Todos os tipos</option>
          <option value="SEMANAL">Semanal</option>
          <option value="QUINZENAL">Quinzenal</option>
        </select>
        <span className="text-xs text-gray-400 ml-2">
          {filtered.length} resultado(s)
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Banknote className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Nenhum empréstimo encontrado
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Valor
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Parcelas
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Data
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const parcelasAtrasadas = e.pagamentos.filter(
                    (p) =>
                      p.status === "PENDENTE" &&
                      new Date(p.dataVencimento) < new Date()
                  ).length;
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {e.cliente.nome}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {e.cliente.telefone}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        R$ {e.valor.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-brand-green font-medium">
                        R${" "}
                        {e.valorTotal.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{e.tipo}</td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">{e.parcelas}x</span>
                        {parcelasAtrasadas > 0 && (
                          <span className="ml-1.5 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {parcelasAtrasadas} atraso
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[e.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(e.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowDetail(e)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Ver
                          </button>
                          {e.status === "ATIVO" && (
                            <button
                              onClick={() =>
                                cobrarWhatsApp(
                                  e.cliente.telefone,
                                  e.cliente.nome,
                                  e.valorParcela,
                                  e.pagamentos.find(
                                    (p) => p.status === "PENDENTE"
                                  )?.dataVencimento || ""
                                )
                              }
                              className="flex items-center gap-1 bg-[#25D366] text-white text-[10px] font-medium px-2 py-0.5 rounded-lg hover:bg-[#20BD5A] transition-colors"
                            >
                              <MessageCircle className="w-2.5 h-2.5" />
                              Cobrar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Novo Empréstimo
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1 block">
                  Cliente *
                </label>
                <select
                  name="clienteId"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"
                >
                  <option value="">Selecione</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} - {c.cpf}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1 block">
                    Valor (R$) *
                  </label>
                  <input
                    name="valor"
                    type="number"
                    required
                    min={100}
                    max={5000}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1 block">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"
                  >
                    <option value="SEMANAL">Semanal (40%)</option>
                    <option value="QUINZENAL">Quinzenal (70%)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1 block">
                  Parcelas
                </label>
                <input
                  name="parcelas"
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1 block">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none resize-none"
                />
              </div>
              {erro && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm">
                  {erro}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                Registrar Empréstimo
              </button>
            </form>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Detalhes do Empréstimo
              </h3>
              <button
                onClick={() => setShowDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <dl className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <dt className="text-gray-500">Cliente:</dt>
                <dd className="font-medium">{showDetail.cliente.nome}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Valor emprestado:</dt>
                <dd className="font-medium">
                  R$ {showDetail.valor.toLocaleString("pt-BR")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Juros:</dt>
                <dd className="font-medium">{showDetail.juros}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Total a pagar:</dt>
                <dd className="font-medium text-brand-green">
                  R${" "}
                  {showDetail.valorTotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status:</dt>
                <dd>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[showDetail.status] || "bg-gray-100 text-gray-600"}`}
                  >
                    {showDetail.status}
                  </span>
                </dd>
              </div>
            </dl>

            {showDetail.pagamentos.length > 0 && (
              <>
                <h4 className="font-semibold text-gray-900 mb-3">Parcelas</h4>
                <div className="space-y-2">
                  {showDetail.pagamentos.map((p) => {
                    const st = getParcelaStatus(p);
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          st === "PAGO"
                            ? "bg-emerald-50 border-emerald-200"
                            : st === "ATRASADO"
                              ? "bg-red-50 border-red-200"
                              : "bg-amber-50 border-amber-200"
                        }`}
                      >
                        <div>
                          <span className="font-medium text-sm">
                            Parcela {p.numeroParcela}
                          </span>
                          <span className="text-gray-500 text-xs ml-2">
                            {new Date(p.dataVencimento).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            R${" "}
                            {p.valor.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          {st === "PAGO" ? (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              Pago
                            </span>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                onClick={() => marcarPago(p.id, showDetail.id)}
                                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Pago
                              </button>
                              <button
                                onClick={() =>
                                  cobrarWhatsApp(
                                    showDetail.cliente.telefone,
                                    showDetail.cliente.nome,
                                    p.valor,
                                    p.dataVencimento
                                  )
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
              </>
            )}

            <button
              onClick={() => setShowDetail(null)}
              className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
