"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Loader2, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error);
      }

      router.push("/admin");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-[#0a2818] to-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-green rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Brasília<span className="text-brand-gold">Cred</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Painel Administrativo</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-sm border border-brand-green/20 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="text-gray-300 text-sm font-medium mb-1.5 block">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-brand-green focus:outline-none"
              placeholder="admin@brasiliacred.com.br"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm font-medium mb-1.5 block">
              Senha
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-brand-green focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {erro && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-brand-dark font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Acesso restrito a administradores
        </p>
      </div>
    </div>
  );
}
