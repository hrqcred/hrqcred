import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrasíliaCred - Crédito Rápido para Motoristas de App",
  description:
    "Empréstimos e microcrédito para motoristas de Uber e aplicativos em Brasília DF. Aprovação rápida, sem burocracia.",
  keywords: "empréstimo, microcrédito, motorista, uber, brasília, crédito rápido",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
