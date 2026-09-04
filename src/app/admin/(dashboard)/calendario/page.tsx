"use client";

import { useState } from "react";
import { CalendarDays, X, MessageCircle, CheckCircle } from "lucide-react";
import Calendar from "@/components/admin/Calendar";

interface PagamentoDetalhe {
  id: string;
  valor: number;
  numeroParcela: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: string;
  emprestimo: {
    cliente: { nome: string; telefone: string };
  };
}

export default function CalendarioPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPagamentos, setSelectedPagamentos] = useState<PagamentoDetalhe[]>([]);

  function handleDayClick(date: Date, pagamentos: PagamentoDetalhe[]) {
    setSelectedDate(date);
    setSelectedPagamentos(pagamentos);
  }

  async function marcarPago(id: string) {
    await fetch("/api/pagamentos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "PAGO" }),
    });
    setSelectedPagamentos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "PAGO", dataPagamento: new Date().toISOString() } : p
      )
    );
  }

  function abrirWhatsApp(telefone: string, nome: string, valor: number, data: string) {
    const phone = telefone.replace(/\D/g, "");
    const dataFormatada = new Date(data).toLocaleDateString("pt-BR");
    const msg = encodeURIComponent(
      `Olá ${nome}! Aqui é da BrasíliaCred. Passando para lembrar da parcela de R$ ${valor.toFixed(2)} com vencimento em ${dataFormatada}. Podemos contar com o pagamento? Obrigado!`
    );
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <CalendarDays className="w-6 h-6 text-brand-green" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-500 mt-1">Visualize os pagamentos por data</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar onDayClick={handleDayClick} />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          {selectedDate ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  {selectedDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedPagamentos.length === 0 ? (
                <p className="text-gray-400 text-sm py-8 text-center">
                  Nenhum pagamento neste dia
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedPagamentos.map((p) => {
                    const atrasado =
                      p.status === "PENDENTE" && new Date(p.dataVencimento) < new Date();
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border ${
                          p.status === "PAGO"
                            ? "bg-emerald-50 border-emerald-200"
                            : atrasado
                              ? "bg-red-50 border-red-200"
                              : "bg-amber-50 border-amber-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {p.emprestimo.cliente.nome}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              p.status === "PAGO"
                                ? "bg-emerald-100 text-emerald-700"
                                : atrasado
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {p.status === "PAGO" ? "Pago" : atrasado ? "Atrasado" : "Pendente"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Parcela {p.numeroParcela} — R$ {p.valor.toFixed(2)}
                        </div>
                        {p.status !== "PAGO" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => marcarPago(p.id)}
                              className="flex-1 flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Pago
                            </button>
                            <button
                              onClick={() =>
                                abrirWhatsApp(
                                  p.emprestimo.cliente.telefone,
                                  p.emprestimo.cliente.nome,
                                  p.valor,
                                  p.dataVencimento
                                )
                              }
                              className="flex-1 flex items-center justify-center gap-1 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              Cobrar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Clique em um dia para ver os pagamentos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
