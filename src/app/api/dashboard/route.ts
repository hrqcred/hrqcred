import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [
    totalClientes,
    totalEmprestimos,
    emprestimosAtivos,
    solicitacoesNovas,
    emprestimos,
  ] = await Promise.all([
    prisma.cliente.count(),
    prisma.emprestimo.count(),
    prisma.emprestimo.count({ where: { status: "ATIVO" } }),
    prisma.solicitacao.count({ where: { status: "NOVA" } }),
    prisma.emprestimo.findMany({
      select: { valor: true, valorTotal: true, status: true },
    }),
  ]);

  const totalEmprestado = emprestimos.reduce((sum, e) => sum + e.valor, 0);
  const totalAReceber = emprestimos
    .filter((e) => e.status === "ATIVO")
    .reduce((sum, e) => sum + e.valorTotal, 0);
  const lucroEstimado = emprestimos.reduce(
    (sum, e) => sum + (e.valorTotal - e.valor),
    0
  );

  return NextResponse.json({
    totalClientes,
    totalEmprestimos,
    emprestimosAtivos,
    solicitacoesNovas,
    totalEmprestado,
    totalAReceber,
    lucroEstimado,
  });
}
