"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5561999999999";
  const message = encodeURIComponent(
    "Olá! Gostaria de saber mais sobre os empréstimos da BrasíliaCred."
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all animate-pulse-glow"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
