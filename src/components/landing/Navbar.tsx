"use client";

import { useState } from "react";
import { Menu, X, DollarSign } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#beneficios", label: "Benefícios" },
    { href: "#como-funciona", label: "Como Funciona" },
    { href: "#simulador", label: "Simulador" },
    { href: "#depoimentos", label: "Depoimentos" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/95 backdrop-blur-sm border-b border-brand-green/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-green rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Brasília<span className="text-brand-gold">Cred</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-brand-gold transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/solicitar"
              className="bg-brand-gold hover:bg-brand-gold-dark text-brand-dark font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
            >
              Solicitar Crédito
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block text-gray-300 hover:text-brand-gold transition-colors py-2 text-sm"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/solicitar"
              className="block bg-brand-gold hover:bg-brand-gold-dark text-brand-dark font-semibold px-5 py-2 rounded-lg transition-colors text-sm text-center mt-2"
            >
              Solicitar Crédito
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
