import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ETAPA_ORDER = ["landing", "formulario", "analise", "aprovado", "pagamento", "liberado"];

const ETAPA_MAP: Record<string, string> = {
  page_view: "landing",
  form_submit: "formulario",
  analise_view: "analise",
  aprovado_view: "aprovado",
  pagamento_view: "pagamento",
  pago: "liberado",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, evento, dados = {} } = body;

    if (!sessionId || !evento) return NextResponse.json({ ok: false });

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    let lead = await prisma.lead.findUnique({ where: { sessionId } });

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          sessionId,
          utmSource: dados.utmSource ?? null,
          utmMedium: dados.utmMedium ?? null,
          utmCampaign: dados.utmCampaign ?? null,
          utmContent: dados.utmContent ?? null,
          utmTerm: dados.utmTerm ?? null,
          dispositivo: dados.dispositivo ?? null,
          referrer: dados.referrer ?? null,
          ip,
        },
      });
    }

    // Build update object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};

    if (evento === "form_submit") {
      if (dados.nome) updateData.nome = dados.nome;
      if (dados.cpf) updateData.cpf = dados.cpf;
      if (dados.telefone) updateData.telefone = dados.telefone;
    }

    if (evento === "pago") {
      updateData.statusPagamento = "PAGO";
      updateData.valorPago = dados.valor ?? 19.9;
      updateData.pagoEm = new Date();
      if (dados.txId) updateData.txId = dados.txId;
    }

    if (evento === "pix_gerado" && dados.txId && !lead.txId) {
      updateData.txId = dados.txId;
      updateData.statusPagamento = "PENDENTE";
    }

    // Update funnel stage
    const novaEtapa = ETAPA_MAP[evento];
    if (novaEtapa) {
      const etapasArr = lead.etapas.split(",").filter(Boolean);
      if (!etapasArr.includes(novaEtapa)) etapasArr.push(novaEtapa);
      updateData.etapas = etapasArr.join(",");

      const currentIdx = ETAPA_ORDER.indexOf(lead.etapaAtual);
      const newIdx = ETAPA_ORDER.indexOf(novaEtapa);
      if (newIdx > currentIdx) updateData.etapaAtual = novaEtapa;
    }

    if (Object.keys(updateData).length > 0) {
      lead = await prisma.lead.update({ where: { id: lead.id }, data: updateData });
    }

    await prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        evento,
        dados: Object.keys(dados).length ? JSON.stringify(dados) : null,
      },
    });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
