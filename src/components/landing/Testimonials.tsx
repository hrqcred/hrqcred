import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Carlos S.",
    role: "Motorista Uber - Asa Sul",
    text: "Precisei de um dinheiro rápido para consertar meu carro e a BrasíliaCred me salvou. Em menos de 1 hora tava com o dinheiro na mão!",
    rating: 5,
  },
  {
    name: "Ana Paula R.",
    role: "Motorista 99 - Taguatinga",
    text: "Já peguei empréstimo 3 vezes. Sempre tudo certinho, sem surpresa. Recomendo para todo motorista de app de Brasília.",
    rating: 5,
  },
  {
    name: "Roberto M.",
    role: "Motorista Uber - Ceilândia",
    text: "O atendimento pelo WhatsApp é excelente. Me explicaram tudo direitinho, sem letra miúda. Hoje já quitei tudo e tô livre.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            O que nossos{" "}
            <span className="text-brand-green">clientes dizem</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Centenas de motoristas já confiaram na BrasíliaCred
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-brand-gold text-brand-gold"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-green/10 rounded-full flex items-center justify-center">
                  <span className="text-brand-green font-bold text-sm">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {t.name}
                  </div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
