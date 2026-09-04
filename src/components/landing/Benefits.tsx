import { Zap, FileCheck, Clock, Wallet } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Aprovação Rápida",
    description:
      "Análise e aprovação do seu crédito em até 30 minutos. Sem enrolação.",
  },
  {
    icon: FileCheck,
    title: "Sem Burocracia",
    description:
      "Documentação simplificada. Basta apresentar seus documentos e comprovante do app.",
  },
  {
    icon: Clock,
    title: "Pagamento Flexível",
    description:
      "Escolha entre pagamento semanal ou quinzenal, de acordo com seus ganhos.",
  },
  {
    icon: Wallet,
    title: "Valores Acessíveis",
    description:
      "Empréstimos a partir de R$ 100 até R$ 5.000. Ideal para sua necessidade.",
  },
];

export default function Benefits() {
  return (
    <section id="beneficios" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Por que escolher a{" "}
            <span className="text-brand-green">BrasíliaCred</span>?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Somos especializados em crédito para motoristas de aplicativo em
            Brasília. Entendemos sua rotina e suas necessidades.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group"
            >
              <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-green/20 transition-colors">
                <benefit.icon className="w-6 h-6 text-brand-green" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
