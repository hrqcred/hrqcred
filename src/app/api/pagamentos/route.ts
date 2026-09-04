import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes");
  const ano = searchParams.get("ano");
  const tipo = searchParams.get("tipo");

  const where: Record<string, unknown> = {};

  if (mes && ano) {
    const inicio = new Date(Number(ano), Number(mes) - 1, 1);
    const fim = new Date(Number(ano), Number(mes), 0, 23, 59, 59);
    where.dataVencimento = { gte: inicio, lte: fim };
  }

  if (tipo === "vencidos") {
    where.status = "PENDENTE";
    where.dataVencimento = { lt: new Date() };
  } else if (tipo === "hoje") {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    where.dataVencimento = { gte: hoje, lt: amanha };
    where.status = "PENDENTE";
  }

  const pagamentos = await prisma.pagamento.findMany({
    where,
    orderBy: { dataVencimento: "asc" },
    include: {
      emprestimo: {
        include: {
          cliente: { select: { nome: true, telefone: true, cpf: true } },
        },
      },
    },
  });

  return NextResponse.json(pagamentos);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id, status } = await req.json();

  const pagamento = await prisma.pagamento.update({
    where: { id },
    data: {
      status,
      dataPagamento: status === "PAGO" ? new Date() : null,
    },
  });

  const emprestimo = await prisma.emprestimo.findUnique({
    where: { id: pagamento.emprestimoId },
    include: { pagamentos: true },
  });

  if (emprestimo) {
    const todasPagas = emprestimo.pagamentos.every((p) => p.status === "PAGO");
    if (todasPagas) {
      await prisma.emprestimo.update({
        where: { id: emprestimo.id },
        data: { status: "QUITADO" },
      });
    }
  }

  return NextResponse.json(pagamento);
}
