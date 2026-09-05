import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const dias = parseInt(url.searchParams.get("dias") || "7");

  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  desde.setHours(0, 0, 0, 0);

  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: desde } },
    include: { eventos: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  // ── Funil ──
  const visitantes = leads.length;
  const comForm = leads.filter((l) => l.etapas.includes("formulario")).length;
  const comAnalise = leads.filter((l) => l.etapas.includes("analise")).length;
  const comAprovado = leads.filter((l) => l.etapas.includes("aprovado")).length;
  const comPagamento = leads.filter((l) => l.etapas.includes("pagamento")).length;
  const convertidos = leads.filter((l) => l.statusPagamento === "PAGO").length;
  const receita = leads
    .filter((l) => l.statusPagamento === "PAGO")
    .reduce((s, l) => s + (l.valorPago ?? 0), 0);

  // ── Tendência diária (últimos N dias) ──
  const tendencia: { dia: string; visitantes: number; leads: number; convertidos: number }[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dInicio = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    const dFim = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    const dodia = leads.filter(
      (l) => new Date(l.createdAt) >= dInicio && new Date(l.createdAt) <= dFim
    );
    tendencia.push({
      dia: `${d.getDate()}/${d.getMonth() + 1}`,
      visitantes: dodia.length,
      leads: dodia.filter((l) => l.etapas.includes("formulario")).length,
      convertidos: dodia.filter((l) => l.statusPagamento === "PAGO").length,
    });
  }

  // ── Campanhas ──
  const campMap: Record<
    string,
    { visitantes: number; leads: number; convertidos: number; receita: number; source: string; medium: string }
  > = {};
  for (const l of leads) {
    const key = l.utmCampaign || "(orgânico)";
    if (!campMap[key]) {
      campMap[key] = {
        visitantes: 0, leads: 0, convertidos: 0, receita: 0,
        source: l.utmSource || "-",
        medium: l.utmMedium || "-",
      };
    }
    campMap[key].visitantes++;
    if (l.etapas.includes("formulario")) campMap[key].leads++;
    if (l.statusPagamento === "PAGO") {
      campMap[key].convertidos++;
      campMap[key].receita += l.valorPago ?? 0;
    }
  }
  const campanhas = Object.entries(campMap)
    .map(([campanha, v]) => ({ campanha, ...v }))
    .sort((a, b) => b.visitantes - a.visitantes);

  // ── Abandono por etapa ──
  const ORDEM = ["landing", "formulario", "analise", "aprovado", "pagamento"];
  const abandono = ORDEM.map((etapa, i) => {
    const naEtapa = leads.filter((l) => l.etapaAtual === etapa && l.statusPagamento !== "PAGO");
    const proxima = i < ORDEM.length - 1 ? ORDEM[i + 1] : null;
    const naProxima = proxima ? leads.filter((l) => l.etapas.includes(proxima)).length : convertidos;
    const total = etapa === "landing" ? visitantes : leads.filter((l) => l.etapas.includes(etapa)).length;
    return {
      etapa,
      abandonaram: naEtapa.length,
      total,
      taxaAbandono: total > 0 ? Math.round((naEtapa.length / total) * 100) : 0,
    };
  });

  // ── Dispositivos ──
  const dispositivoMap: Record<string, number> = {};
  for (const l of leads) {
    const d = l.dispositivo || "desconhecido";
    dispositivoMap[d] = (dispositivoMap[d] || 0) + 1;
  }

  return NextResponse.json({
    periodo: { dias, desde: desde.toISOString() },
    kpis: {
      visitantes,
      leads: comForm,
      analise: comAnalise,
      aprovados: comAprovado,
      pagamento: comPagamento,
      convertidos,
      receita,
      taxaConversao: visitantes > 0 ? ((convertidos / visitantes) * 100).toFixed(1) : "0",
      ticketMedio: convertidos > 0 ? (receita / convertidos).toFixed(2) : "0",
    },
    funil: [
      { etapa: "Visitantes", label: "Chegaram na página", count: visitantes, pct: 100 },
      { etapa: "Leads", label: "Preencheram o formulário", count: comForm, pct: visitantes > 0 ? Math.round((comForm / visitantes) * 100) : 0 },
      { etapa: "Em análise", label: "Iniciaram análise", count: comAnalise, pct: visitantes > 0 ? Math.round((comAnalise / visitantes) * 100) : 0 },
      { etapa: "Aprovados", label: "Foram aprovados", count: comAprovado, pct: visitantes > 0 ? Math.round((comAprovado / visitantes) * 100) : 0 },
      { etapa: "No PIX", label: "Abriram a tela de pagamento", count: comPagamento, pct: visitantes > 0 ? Math.round((comPagamento / visitantes) * 100) : 0 },
      { etapa: "Convertidos", label: "Pagaram a taxa", count: convertidos, pct: visitantes > 0 ? Math.round((convertidos / visitantes) * 100) : 0 },
    ],
    tendencia,
    campanhas,
    abandono,
    dispositivos: dispositivoMap,
  });
}
