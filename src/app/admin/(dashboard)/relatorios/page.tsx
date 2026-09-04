"use client";

import { BarChart3, Download, FileSpreadsheet } from "lucide-react";

const relatorios = [
  {
    titulo: "Empréstimos",
    descricao: "Lista completa de todos os empréstimos com dados do cliente, valores, juros, parcelas e status.",
    tipo: "emprestimos",
    cor: "bg-brand-green/10 text-brand-green",
  },
  {
    titulo: "Clientes",
    descricao: "Lista de todos os clientes cadastrados com classificação, status de bloqueio e quantidade de empréstimos.",
    tipo: "clientes",
    cor: "bg-blue-500/10 text-blue-500",
  },
  {
    titulo: "Pagamentos",
    descricao: "Relatório detalhado de todas as parcelas, com datas de vencimento, pagamento e status.",
    tipo: "pagamentos",
    cor: "bg-brand-gold/10 text-brand-gold-dark",
  },
];

export default function RelatoriosPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-6 h-6 text-brand-green" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500 mt-1">
            Exporte seus dados em CSV para Excel
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatorios.map((r) => (
          <div
            key={r.tipo}
            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${r.cor}`}
            >
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{r.titulo}</h3>
            <p className="text-gray-500 text-sm mb-4">{r.descricao}</p>
            <a
              href={`/api/relatorios?tipo=${r.tipo}`}
              className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Baixar CSV
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
