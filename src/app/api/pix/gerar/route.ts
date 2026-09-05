import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { nome, cpf, telefone, valor } = body;

  if (!nome || !cpf || !telefone) {
    return Response.json({ error: "Dados obrigatórios faltando" }, { status: 400 });
  }

  const amount = valor || 19.9;
  const token = process.env.APIPIX_TOKEN;
  const baseUrl = process.env.APIPIX_BASE_URL || "https://api.apipix.com.br";

  if (!token) {
    const txId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return Response.json({
      txId,
      qrCode: `00020126580014br.gov.bcb.pix0136mock-key-${txId}520400005303986540${amount.toFixed(2)}5802BR5925BRASILIACRED6009BRASILIA62070503***6304MOCK`,
      status: "ATIVA",
      valor: amount,
    });
  }

  try {
    const res = await fetch(`${baseUrl}/v1/qrcode/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nome,
        cpf: cpf.replace(/\D/g, ""),
        valor: amount,
        descricao: "Taxa de Análise de Crédito - BrasíliaCred",
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("APIpix error:", errorData);
      return Response.json({ error: "Erro ao gerar PIX" }, { status: 500 });
    }

    const data = await res.json();
    return Response.json({
      txId: data.txId || data.id,
      qrCode: data.qrCode || data.pixCopiaECola,
      qrCodeBase64: data.qrCodeBase64 || data.imagemQrCode,
      status: "ATIVA",
      valor: amount,
    });
  } catch (err) {
    console.error("PIX generation error:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
