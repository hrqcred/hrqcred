import type { Metadata } from "next";
import OfertaLanding from "./OfertaLanding";

export const metadata: Metadata = {
  title: "Empréstimo Pré-Aprovado para Motoristas | BrasíliaCred",
  description:
    "Crédito de R$200 a R$5.000 liberado em até 30 minutos para motoristas de app em Brasília. Sem fiador, sem burocracia.",
};

export default function OfertaPage() {
  return <OfertaLanding />;
}
