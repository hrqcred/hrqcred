import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      emprestimos: {
        orderBy: { createdAt: "desc" },
        include: { pagamentos: { orderBy: { numeroParcela: "asc" } } },
      },
    },
  });

  if (!cliente) {
    return NextResponse.json(
      { error: "Cliente não encontrado" },
      { status: 404 }
    );
  }

  const totalEmprestimos = cliente.emprestimos.length;
  const emprestimosQuitados = cliente.emprestimos.filter(
    (e) => e.status === "QUITADO"
  ).length;
  const totalPagamentos = cliente.emprestimos.reduce(
    (acc, e) => acc + e.pagamentos.length,
    0
  );
  const pagamentosEmDia = cliente.emprestimos.reduce(
    (acc, e) =>
      acc + e.pagamentos.filter((p) => p.status === "PAGO").length,
    0
  );

  return NextResponse.json({
    ...cliente,
    stats: {
      totalEmprestimos,
      emprestimosQuitados,
      totalPagamentos,
      pagamentosEmDia,
      taxaPontualidade:
        totalPagamentos > 0
          ? Math.round((pagamentosEmDia / totalPagamentos) * 100)
          : 0,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();

  const updateData: Record<string, unknown> = {};
  if (data.classificacao !== undefined) updateData.classificacao = data.classificacao;
  if (data.bloqueado !== undefined) updateData.bloqueado = data.bloqueado;
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.telefone !== undefined) updateData.telefone = data.telefone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.plataforma !== undefined) updateData.plataforma = data.plataforma;

  const cliente = await prisma.cliente.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(cliente);
}
