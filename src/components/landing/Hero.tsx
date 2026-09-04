import Link from "next/link";
import { ArrowRight, Shield, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-brand-dark via-[#0a2818] to-brand-dark overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-green/10 border border-brand-green/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-4 h-4 text-brand-gold" />
              <span className="text-brand-green-light text-sm font-medium">
                Aprovação em até 30 minutos
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Crédito rápido para{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green-light to-brand-gold">
                motoristas de app
              </span>{" "}
              em Brasília
            </h1>

            <p className="text-gray-400 text-lg mb-8 max-w-xl">
              Empréstimos descomplicados para motoristas de Uber, 99 e outros
              aplicativos. Sem burocracia, sem fiador, dinheiro rápido na sua
              mão.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/solicitar"
                className="inline-flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-dark font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 text-lg"
              >
                Solicitar Empréstimo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#simulador"
                className="inline-flex items-center justify-center gap-2 border-2 border-brand-green/40 text-brand-green-light hover:bg-brand-green/10 font-semibold px-8 py-4 rounded-xl transition-all text-lg"
              >
                Simular Parcelas
              </a>
            </div>

            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-green" />
                <span className="text-sm">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-green rounded-full" />
                <span className="text-sm">+500 motoristas atendidos</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-brand-green/20 to-brand-gold/20 rounded-3xl rotate-6 animate-float" />
              <div className="absolute inset-0 w-80 h-80 bg-gradient-to-br from-brand-dark to-[#0a2818] rounded-3xl border border-brand-green/30 flex flex-col items-center justify-center p-8">
                <div className="text-6xl mb-4">🚗</div>
                <div className="text-brand-gold font-bold text-2xl mb-2">
                  R$ 5.000
                </div>
                <div className="text-gray-400 text-sm mb-4">
                  Valor disponível
                </div>
                <div className="w-full bg-brand-green/20 rounded-full h-2">
                  <div className="bg-brand-green rounded-full h-2 w-3/4" />
                </div>
                <div className="text-brand-green-light text-xs mt-2">
                  Aprovação rápida
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
