import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const emprestimos = await prisma.emprestimo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cliente: { select: { nome: true, cpf: true, telefone: true } },
      pagamentos: true,
    },
  });

  return NextResponse.json(emprestimos);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = await req.json();
  const taxa = data.tipo === "SEMANAL" ? 0.4 : 0.7;
  const valorTotal = data.valor * (1 + taxa);
  const parcelas = data.parcelas || 1;
  const valorParcela = valorTotal / parcelas;

  const emprestimo = await prisma.emprestimo.create({
    data: {
      clienteId: data.clienteId,
      valor: data.valor,
      juros: taxa * 100,
      tipo: data.tipo,
      valorTotal,
      parcelas,
      valorParcela,
      status: "ATIVO",
      dataInicio: new Date(),
      observacoes: data.observacoes || null,
    },
  });

  const diasPorParcela = data.tipo === "SEMANAL" ? 7 : 15;
  for (let i = 1; i <= parcelas; i++) {
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + diasPorParcela * i);

    await prisma.pagamento.create({
      data: {
        emprestimoId: emprestimo.id,
        valor: valorParcela,
        numeroParcela: i,
        dataVencimento,
      },
    });
  }

  return NextResponse.json(emprestimo, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id, status } = await req.json();

  const emprestimo = await prisma.emprestimo.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(emprestimo);
}
