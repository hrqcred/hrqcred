"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Quem pode solicitar um empréstimo?",
    answer:
      "Qualquer motorista de aplicativo (Uber, 99, InDriver, etc.) que atue na região de Brasília DF. Basta ter o aplicativo ativo e documentos pessoais em dia.",
  },
  {
    question: "Quais documentos são necessários?",
    answer:
      "Você precisa apresentar RG ou CNH, CPF, comprovante de residência e print do aplicativo mostrando que está ativo como motorista.",
  },
  {
    question: "Quanto tempo leva para receber o dinheiro?",
    answer:
      "Após a análise e aprovação, o dinheiro pode ser liberado em até 30 minutos via PIX ou em mãos, conforme combinado.",
  },
  {
    question: "Qual o valor mínimo e máximo do empréstimo?",
    answer:
      "O valor mínimo é de R$ 100 e o máximo é de R$ 5.000, dependendo da análise de crédito e do seu histórico conosco.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "Você escolhe entre pagamento semanal (7 dias, juros de 40%) ou quinzenal (15 dias, juros de 70%). O pagamento pode ser feito via PIX ou em mãos.",
  },
  {
    question: "Preciso de fiador ou garantia?",
    answer:
      "Não! Nossos empréstimos são baseados na confiança e no seu histórico como motorista. Sem fiador e sem garantias complicadas.",
  },
  {
    question: "O que acontece se eu atrasar o pagamento?",
    answer:
      "Entre em contato conosco pelo WhatsApp o quanto antes para negociarmos. Trabalhamos com flexibilidade para encontrar a melhor solução para ambos.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Perguntas <span className="text-brand-green">frequentes</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Tire suas dúvidas sobre nosso serviço
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-brand-green shrink-0 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
