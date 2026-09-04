"use client";

import { useState } from "react";
import Link from "next/link";
import { DollarSign, ArrowLeft, Send, CheckCircle, Loader2 } from "lucide-react";

export default function SolicitarPage() {
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const form = new FormData(e.currentTarget);
    const data = {
      nome: form.get("nome") as string,
      cpf: form.get("cpf") as string,
      telefone: form.get("telefone") as string,
      email: form.get("email") as string,
      valor: Number(form.get("valor")),
      tipo: form.get("tipo") as string,
      parcelas: Number(form.get("parcelas") || 1),
      mensagem: form.get("mensagem") as string,
    };

    try {
      const res = await fetch("/api/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Erro ao enviar solicitação");
      }

      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-dark via-[#0a2818] to-brand-dark flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-sm border border-brand-green/20 rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-brand-green" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Solicitação Enviada!
          </h2>
          <p className="text-gray-400 mb-8">
            Recebemos sua solicitação e entraremos em contato pelo WhatsApp em
            breve. Fique atento ao seu celular!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-gold-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-[#0a2818] to-brand-dark py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Solicitar <span className="text-brand-gold">Empréstimo</span>
            </h1>
          </div>
          <p className="text-gray-400">
            Preencha o formulário abaixo e entraremos em contato rapidamente.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-sm border border-brand-green/20 rounded-3xl p-6 sm:p-8 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                Nome completo *
              </label>
              <input
                name="nome"
                required
                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-brand-green focus:outline-none transition-colors"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                CPF *
              </label>
              <input
                name="cpf"
                required
                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-brand-green focus:outline-none transition-colors"
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                WhatsApp *
              </label>
              <input
                name="telefone"
                required
                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-brand-green focus:outline-none transition-colors"
                placeholder="(61) 99999-9999"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-brand-green focus:outline-none transition-colors"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                Valor desejado (R$) *
              </label>
              <input
                name="valor"
                type="number"
                required
                min={100}
                max={5000}
                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-brand-green focus:outline-none transition-colors"
                placeholder="500"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1.5 block">
                Modalidade *
              </label>
              <select
                name="tipo"
                required
                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-green focus:outline-none transition-colors"
              >
                <option value="SEMANAL" className="bg-gray-900">
                  Semanal (40% juros)
                </option>
                <option value="QUINZENAL" className="bg-gray-900">
                  Quinzenal (70% juros)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-1.5 block">
              Mensagem (opcional)
            </label>
            <textarea
              name="mensagem"
              rows={3}
              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-brand-green focus:outline-none transition-colors resize-none"
              placeholder="Alguma observação ou informação adicional..."
            />
          </div>

          {erro && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-brand-dark font-bold py-4 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {loading ? "Enviando..." : "Enviar Solicitação"}
          </button>
        </form>
      </div>
    </div>
  );
}
