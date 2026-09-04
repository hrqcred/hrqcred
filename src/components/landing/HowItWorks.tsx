import { ClipboardList, Search, Banknote, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Preencha o formulário",
    description: "Informe seus dados básicos e o valor desejado em nosso formulário online.",
  },
  {
    icon: Search,
    step: "02",
    title: "Análise rápida",
    description: "Nossa equipe analisa sua solicitação em até 30 minutos.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Aprovação",
    description: "Após aprovado, entramos em contato via WhatsApp para combinar os detalhes.",
  },
  {
    icon: Banknote,
    step: "04",
    title: "Dinheiro na mão",
    description: "Receba o valor via PIX ou em mãos. Simples, rápido e sem complicação.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Como <span className="text-brand-gold">funciona</span>?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Em 4 passos simples você consegue seu crédito
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.step} className="relative text-center group">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-brand-green/30 to-brand-gold/30" />
              )}
              <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-brand-green to-brand-green-dark rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <span className="text-brand-gold font-bold text-sm">
                Passo {step.step}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
