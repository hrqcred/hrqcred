import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

async function marcarLeadPago(txId: string) {
  try {
    await prisma.lead.updateMany({
      where: { txId, NOT: { statusPagamento: "PAGO" } },
      data: { statusPagamento: "PAGO", pagoEm: new Date(), etapaAtual: "liberado" },
    });
  } catch { /* silently ignore */ }
}

export async function GET(request: NextRequest) {
  const txId = request.nextUrl.searchParams.get("txId");

  if (!txId) {
    return Response.json({ error: "txId obrigatório" }, { status: 400 });
  }

  const token = process.env.APIPIX_TOKEN;
  const baseUrl = process.env.APIPIX_BASE_URL || "https://api.apipix.com.br";

  if (!token) {
    const status = txId.startsWith("mock_") ? "ATIVA" : "CONCLUIDA";
    if (status === "CONCLUIDA") await marcarLeadPago(txId);
    return Response.json({ txId, status, valor: 19.9 });
  }

  try {
    const res = await fetch(`${baseUrl}/v1/qrcode/status/${txId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return Response.json({ error: "Erro ao consultar status" }, { status: 500 });
    }

    const data = await res.json();
    if (data.status === "CONCLUIDA" || data.status === "PAGO") {
      await marcarLeadPago(txId);
    }

    return Response.json({ txId, status: data.status, valor: data.valor });
  } catch (err) {
    console.error("PIX status error:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
