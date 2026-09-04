"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PagamentoCalendario {
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

interface CalendarProps {
  onDayClick?: (date: Date, pagamentos: PagamentoCalendario[]) => void;
  compact?: boolean;
}

export default function Calendar({ onDayClick, compact }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pagamentos, setPagamentos] = useState<PagamentoCalendario[]>([]);

  const ano = currentDate.getFullYear();
  const mes = currentDate.getMonth();

  useEffect(() => {
    fetch(`/api/pagamentos?mes=${mes + 1}&ano=${ano}`)
      .then((r) => r.json())
      .then(setPagamentos);
  }, [mes, ano]);

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const nomesMes = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const nomesMesCompacto = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];

  function getPagamentosDia(dia: number) {
    return pagamentos.filter((p) => {
      const d = new Date(p.dataVencimento);
      return d.getDate() === dia && d.getMonth() === mes && d.getFullYear() === ano;
    });
  }

  function getDotColor(pags: PagamentoCalendario[]) {
    if (pags.length === 0) return null;
    const temAtrasado = pags.some(
      (p) => p.status === "PENDENTE" && new Date(p.dataVencimento) < hoje
    );
    const temPago = pags.some((p) => p.status === "PAGO");
    const temPendente = pags.some(
      (p) => p.status === "PENDENTE" && new Date(p.dataVencimento) >= hoje
    );

    if (temAtrasado) return "red";
    if (temPago && !temPendente) return "green";
    if (temPendente) return "gold";
    return "green";
  }

  function prevMonth() {
    setCurrentDate(new Date(ano, mes - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(ano, mes + 1, 1));
  }

  const dias = [];
  for (let i = 0; i < primeiroDia; i++) {
    dias.push(<div key={`empty-${i}`} />);
  }

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const pags = getPagamentosDia(dia);
    const dotColor = getDotColor(pags);
    const isHoje =
      dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
    const totalValor = pags.reduce((s, p) => s + p.valor, 0);

    dias.push(
      <button
        key={dia}
        onClick={() => onDayClick?.(new Date(ano, mes, dia), pags)}
        className={`relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all hover:bg-gray-100 ${
          compact ? "text-xs" : "text-sm rounded-xl"
        } ${
          isHoje ? "bg-brand-green/10 font-bold text-brand-green ring-2 ring-brand-green/30" : "text-gray-700"
        } ${pags.length > 0 ? "cursor-pointer hover:scale-105" : ""}`}
      >
        <span>{dia}</span>
        {dotColor && (
          <div className="flex items-center gap-0.5 mt-0.5">
            <div
              className={`rounded-full ${compact ? "w-1.5 h-1.5" : "w-2 h-2"} ${
                dotColor === "green"
                  ? "bg-emerald-500"
                  : dotColor === "red"
                    ? "bg-red-500 animate-pulse"
                    : "bg-amber-400"
              }`}
            />
            {!compact && pags.length > 1 && (
              <span className="text-[9px] text-gray-400">{pags.length}</span>
            )}
          </div>
        )}
        {!compact && totalValor > 0 && (
          <span className="text-[8px] text-gray-400 leading-none mt-0.5">
            R${totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`bg-white border border-gray-100 rounded-2xl ${compact ? "p-4" : "p-6"}`}>
      <div className={`flex items-center justify-between ${compact ? "mb-3" : "mb-6"}`}>
        <button
          onClick={prevMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className={compact ? "w-4 h-4 text-gray-600" : "w-5 h-5 text-gray-600"} />
        </button>
        <h3 className={`font-bold text-gray-900 ${compact ? "text-sm" : "text-lg"}`}>
          {compact ? `${nomesMesCompacto[mes]} ${ano}` : `${nomesMes[mes]} ${ano}`}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className={compact ? "w-4 h-4 text-gray-600" : "w-5 h-5 text-gray-600"} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {(compact ? ["D", "S", "T", "Q", "Q", "S", "S"] : ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]).map((d, i) => (
          <div key={`${d}-${i}`} className={`text-center font-medium text-gray-400 py-0.5 ${compact ? "text-[10px]" : "text-xs"}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">{dias}</div>

      <div className={`flex items-center gap-3 border-t border-gray-100 text-gray-500 ${compact ? "mt-2 pt-2 text-[10px] gap-2" : "mt-4 pt-4 text-xs gap-4"}`}>
        <div className="flex items-center gap-1">
          <div className={`rounded-full bg-emerald-500 ${compact ? "w-1.5 h-1.5" : "w-2.5 h-2.5"}`} />
          Pago
        </div>
        <div className="flex items-center gap-1">
          <div className={`rounded-full bg-amber-400 ${compact ? "w-1.5 h-1.5" : "w-2.5 h-2.5"}`} />
          A vencer
        </div>
        <div className="flex items-center gap-1">
          <div className={`rounded-full bg-red-500 ${compact ? "w-1.5 h-1.5" : "w-2.5 h-2.5"}`} />
          Atrasado
        </div>
      </div>
    </div>
  );
}
