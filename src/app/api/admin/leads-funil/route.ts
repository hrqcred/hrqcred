import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const busca = url.searchParams.get("busca") || "";
  const status = url.searchParams.get("status") || "todos";
  const dias = parseInt(url.searchParams.get("dias") || "30");
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = 25;

  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  desde.setHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { createdAt: { gte: desde } };

  if (busca) {
    where.OR = [
      { nome: { contains: busca } },
      { cpf: { contains: busca } },
      { telefone: { contains: busca } },
    ];
  }

  if (status === "convertidos") {
    where.statusPagamento = "PAGO";
  } else if (status === "leads") {
    where.etapas = { contains: "formulario" };
    where.statusPagamento = null;
  } else if (status === "abandonados") {
    where.NOT = [{ statusPagamento: "PAGO" }];
    where.etapas = { contains: "formulario" };
  } else if (status === "visitantes") {
    where.NOT = [{ etapas: { contains: "formulario" } }];
  }

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: { eventos: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    leads: leads.map((l) => ({
      id: l.id,
      nome: l.nome || "—",
      cpf: l.cpf,
      telefone: l.telefone,
      utmSource: l.utmSource,
      utmMedium: l.utmMedium,
      utmCampaign: l.utmCampaign,
      utmContent: l.utmContent,
      dispositivo: l.dispositivo,
      etapaAtual: l.etapaAtual,
      etapas: l.etapas.split(",").filter(Boolean),
      statusPagamento: l.statusPagamento,
      valorPago: l.valorPago,
      pagoEm: l.pagoEm,
      ip: l.ip,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      eventos: l.eventos.map((e) => ({
        id: e.id,
        evento: e.evento,
        dados: e.dados ? JSON.parse(e.dados) : null,
        createdAt: e.createdAt,
      })),
    })),
    total,
    page,
    pages: Math.ceil(total / pageSize),
  });
}
