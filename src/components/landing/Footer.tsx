import { DollarSign, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-brand-green/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Brasília<span className="text-brand-gold">Cred</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Crédito rápido e descomplicado para motoristas de aplicativo em
              Brasília DF.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#beneficios" className="text-gray-500 hover:text-brand-gold text-sm transition-colors">
                  Benefícios
                </a>
              </li>
              <li>
                <a href="#simulador" className="text-gray-500 hover:text-brand-gold text-sm transition-colors">
                  Simulador
                </a>
              </li>
              <li>
                <Link href="/solicitar" className="text-gray-500 hover:text-brand-gold text-sm transition-colors">
                  Solicitar Crédito
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-gray-500 hover:text-brand-gold text-sm transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-500 text-sm">
                <Phone className="w-4 h-4 text-brand-green" />
                (61) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin className="w-4 h-4 text-brand-green" />
                Brasília - DF
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} BrasíliaCred. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
}
