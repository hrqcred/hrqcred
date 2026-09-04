"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Eye, CheckCircle, XCircle, Clock } from "lucide-react";

interface Solicitacao {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  valor: number;
  tipo: string;
  mensagem: string | null;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  NOVA: "bg-blue-100 text-blue-700",
  EM_ANALISE: "bg-yellow-100 text-yellow-700",
  APROVADA: "bg-green-100 text-green-700",
  REJEITADA: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  NOVA: "Nova",
  EM_ANALISE: "Em Análise",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
};

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Solicitacao | null>(null);

  useEffect(() => {
    fetch("/api/solicitacoes")
      .then((r) => r.json())
      .then((data) => {
        setSolicitacoes(data);
        setLoading(false);
      });
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/solicitacoes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setSolicitacoes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    if (selected?.id === id) setSelected({ ...selected, status });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitações</h1>
          <p className="text-gray-500 mt-1">
            Gerencie as solicitações de empréstimo
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ClipboardList className="w-4 h-4" />
          {solicitacoes.length} solicitações
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : solicitacoes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Nenhuma solicitação encontrada
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Nome
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Telefone
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Valor
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Tipo
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
                {solicitacoes.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {s.nome}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{s.telefone}</td>
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      R$ {s.valor.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{s.tipo}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {statusLabels[s.status] || s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelected(s)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {s.status === "NOVA" && (
                          <>
                            <button
                              onClick={() => updateStatus(s.id, "EM_ANALISE")}
                              className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Analisar"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(s.id, "APROVADA")}
                              className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                              title="Aprovar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(s.id, "REJEITADA")}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Rejeitar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {s.status === "EM_ANALISE" && (
                          <>
                            <button
                              onClick={() => updateStatus(s.id, "APROVADA")}
                              className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                              title="Aprovar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(s.id, "REJEITADA")}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Rejeitar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Detalhes da Solicitação
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Nome:</dt>
                <dd className="font-medium">{selected.nome}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">CPF:</dt>
                <dd className="font-medium">{selected.cpf}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Telefone:</dt>
                <dd className="font-medium">{selected.telefone}</dd>
              </div>
              {selected.email && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email:</dt>
                  <dd className="font-medium">{selected.email}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Valor:</dt>
                <dd className="font-medium text-brand-green">
                  R$ {selected.valor.toLocaleString("pt-BR")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Tipo:</dt>
                <dd className="font-medium">{selected.tipo}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status:</dt>
                <dd>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selected.status]}`}
                  >
                    {statusLabels[selected.status]}
                  </span>
                </dd>
              </div>
              {selected.mensagem && (
                <div>
                  <dt className="text-gray-500 mb-1">Mensagem:</dt>
                  <dd className="bg-gray-50 p-3 rounded-lg text-gray-700">
                    {selected.mensagem}
                  </dd>
                </div>
              )}
            </dl>
            <button
              onClick={() => setSelected(null)}
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
