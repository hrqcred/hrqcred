"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, X } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  plataforma: string | null;
  createdAt: string;
  emprestimos: { id: string; valor: number; status: string }[];
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/clientes")
      .then((r) => r.json())
      .then((data) => {
        setClientes(data);
        setLoading(false);
      });
  }, []);

  const filtered = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cpf.includes(search) ||
      c.telefone.includes(search)
  );

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.get("nome"),
          cpf: form.get("cpf"),
          telefone: form.get("telefone"),
          email: form.get("email") || null,
          plataforma: form.get("plataforma") || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error);
      }

      const cliente = await res.json();
      setClientes((prev) => [{ ...cliente, emprestimos: [] }, ...prev]);
      setShowForm(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar cliente");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie seus clientes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-green hover:bg-brand-green-dark text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, CPF ou telefone..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Nenhum cliente encontrado
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
                    CPF
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Telefone
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Plataforma
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Empréstimos
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Cadastro
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {c.nome}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{c.cpf}</td>
                    <td className="py-3 px-4 text-gray-600">{c.telefone}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {c.plataforma || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full text-xs font-medium">
                        {c.emprestimos.length}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Novo Cliente</h3>
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
                  Nome *
                </label>
                <input
                  name="nome"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1 block">
                    CPF *
                  </label>
                  <input
                    name="cpf"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-1 block">
                    Telefone *
                  </label>
                  <input
                    name="telefone"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1 block">
                  E-mail
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1 block">
                  Plataforma
                </label>
                <select
                  name="plataforma"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="Uber">Uber</option>
                  <option value="99">99</option>
                  <option value="InDriver">InDriver</option>
                  <option value="Outro">Outro</option>
                </select>
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
                Cadastrar Cliente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
