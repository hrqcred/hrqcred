"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  X,
  ShieldBan,
  ShieldCheck,
  Eye,
  Download,
} from "lucide-react";
import Link from "next/link";

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  plataforma: string | null;
  classificacao: string;
  bloqueado: boolean;
  createdAt: string;
  emprestimos: { id: string; valor: number; status: string }[];
}

const classColors: Record<string, string> = {
  NOVO: "bg-blue-100 text-blue-700",
  BOM: "bg-emerald-100 text-emerald-700",
  REGULAR: "bg-amber-100 text-amber-700",
  RUIM: "bg-red-100 text-red-700",
  VIP: "bg-purple-100 text-purple-700",
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filtroClass, setFiltroClass] = useState("TODOS");
  const [filtroBloqueado, setFiltroBloqueado] = useState("TODOS");
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/clientes")
      .then((r) => r.json())
      .then((data) => {
        setClientes(data);
        setLoading(false);
      });
  }, []);

  const filtered = clientes.filter((c) => {
    if (
      search &&
      !c.nome.toLowerCase().includes(search.toLowerCase()) &&
      !c.cpf.includes(search) &&
      !c.telefone.includes(search)
    )
      return false;
    if (filtroClass !== "TODOS" && c.classificacao !== filtroClass) return false;
    if (filtroBloqueado === "SIM" && !c.bloqueado) return false;
    if (filtroBloqueado === "NAO" && c.bloqueado) return false;
    return true;
  });

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
      setClientes((prev) => [
        { ...cliente, emprestimos: [], classificacao: "NOVO", bloqueado: false },
        ...prev,
      ]);
      setShowForm(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar cliente");
    }
  }

  async function toggleBloqueio(id: string, bloqueado: boolean) {
    await fetch(`/api/clientes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bloqueado: !bloqueado }),
    });
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, bloqueado: !bloqueado } : c))
    );
  }

  async function updateClassificacao(id: string, classificacao: string) {
    await fetch(`/api/clientes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classificacao }),
    });
    setClientes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, classificacao } : c))
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie seus clientes</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/relatorios?tipo=clientes"
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
            Novo Cliente
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-brand-green focus:outline-none"
          />
        </div>
        <select
          value={filtroClass}
          onChange={(e) => setFiltroClass(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none"
        >
          <option value="TODOS">Todas classificações</option>
          <option value="NOVO">Novo</option>
          <option value="BOM">Bom</option>
          <option value="REGULAR">Regular</option>
          <option value="RUIM">Ruim</option>
          <option value="VIP">VIP</option>
        </select>
        <select
          value={filtroBloqueado}
          onChange={(e) => setFiltroBloqueado(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-brand-green focus:outline-none"
        >
          <option value="TODOS">Todos</option>
          <option value="NAO">Ativos</option>
          <option value="SIM">Bloqueados</option>
        </select>
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
                    Classificação
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Empréstimos
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 ${c.bloqueado ? "opacity-60" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{c.nome}</div>
                      <div className="text-gray-500 text-xs">
                        {c.plataforma || "—"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{c.cpf}</td>
                    <td className="py-3 px-4 text-gray-600">{c.telefone}</td>
                    <td className="py-3 px-4">
                      <select
                        value={c.classificacao}
                        onChange={(e) =>
                          updateClassificacao(c.id, e.target.value)
                        }
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${classColors[c.classificacao] || "bg-gray-100 text-gray-600"}`}
                      >
                        <option value="NOVO">Novo</option>
                        <option value="BOM">Bom</option>
                        <option value="REGULAR">Regular</option>
                        <option value="RUIM">Ruim</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full text-xs font-medium">
                        {c.emprestimos.length}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.bloqueado ? (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          Bloqueado
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          Ativo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/clientes/${c.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Ver perfil"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleBloqueio(c.id, c.bloqueado)}
                          className={`transition-colors ${c.bloqueado ? "text-emerald-600 hover:text-emerald-800" : "text-red-500 hover:text-red-700"}`}
                          title={c.bloqueado ? "Desbloquear" : "Bloquear"}
                        >
                          {c.bloqueado ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <ShieldBan className="w-4 h-4" />
                          )}
                        </button>
                      </div>
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
