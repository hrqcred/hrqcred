"use client";

import { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Simulator() {
  const [valor, setValor] = useState(500);
  const [tipo, setTipo] = useState<"SEMANAL" | "QUINZENAL">("SEMANAL");

  const taxaJuros = tipo === "SEMANAL" ? 0.4 : 0.7;
  const valorJuros = valor * taxaJuros;
  const valorTotal = valor + valorJuros;
  const periodo = tipo === "SEMANAL" ? "1 semana" : "15 dias";

  return (
    <section
      id="simulador"
      className="py-20 bg-gradient-to-br from-brand-dark via-[#0a2818] to-brand-dark"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-1.5 mb-4">
            <Calculator className="w-4 h-4 text-brand-gold" />
            <span className="text-brand-gold text-sm font-medium">
              Simulador de Empréstimo
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simule seu <span className="text-brand-gold">empréstimo</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Veja quanto você vai pagar antes de solicitar
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-brand-green/20 rounded-3xl p-8">
          <div className="mb-8">
            <label className="text-gray-300 text-sm font-medium mb-3 block">
              Valor do empréstimo
            </label>
            <div className="text-4xl font-bold text-brand-gold mb-4">
              R$ {valor.toLocaleString("pt-BR")}
            </div>
            <input
              type="range"
              min={100}
              max={5000}
              step={50}
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              className="w-full h-2 bg-brand-green/20 rounded-full appearance-none cursor-pointer accent-brand-green"
            />
            <div className="flex justify-between text-gray-500 text-xs mt-2">
              <span>R$ 100</span>
              <span>R$ 5.000</span>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-gray-300 text-sm font-medium mb-3 block">
              Modalidade de pagamento
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTipo("SEMANAL")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  tipo === "SEMANAL"
                    ? "border-brand-green bg-brand-green/10 text-white"
                    : "border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                <div className="font-bold text-lg">Semanal</div>
                <div className="text-sm opacity-80">40% de juros - 7 dias</div>
              </button>
              <button
                onClick={() => setTipo("QUINZENAL")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  tipo === "QUINZENAL"
                    ? "border-brand-green bg-brand-green/10 text-white"
                    : "border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                <div className="font-bold text-lg">Quinzenal</div>
                <div className="text-sm opacity-80">70% de juros - 15 dias</div>
              </button>
            </div>
          </div>

          <div className="bg-brand-dark/50 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-xs mb-1">Emprestado</div>
                <div className="text-white font-bold text-xl">
                  R$ {valor.toLocaleString("pt-BR")}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Juros
                </div>
                <div className="text-brand-gold font-bold text-xl">
                  R$ {valorJuros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Total a pagar</div>
                <div className="text-brand-green-light font-bold text-xl">
                  R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div className="text-center mt-4 text-gray-500 text-sm">
              Pagamento em {periodo}
            </div>
          </div>

          <Link
            href="/solicitar"
            className="block w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-dark font-bold py-4 rounded-xl transition-all hover:scale-[1.02] text-center text-lg"
          >
            Solicitar esse empréstimo
          </Link>
        </div>
      </div>
    </section>
  );
}
