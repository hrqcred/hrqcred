import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const [
    totalClientes,
    totalEmprestimos,
    emprestimosAtivos,
    solicitacoesNovas,
    emprestimos,
    vencimentosHoje,
    pagamentosAtrasados,
    clientesBloqueados,
  ] = await Promise.all([
    prisma.cliente.count({ where: { bloqueado: false } }),
    prisma.emprestimo.count(),
    prisma.emprestimo.count({ where: { status: "ATIVO" } }),
    prisma.solicitacao.count({ where: { status: "NOVA" } }),
    prisma.emprestimo.findMany({
      select: { valor: true, valorTotal: true, status: true, createdAt: true },
    }),
    prisma.pagamento.findMany({
      where: {
        status: "PENDENTE",
        dataVencimento: { gte: hoje, lt: amanha },
      },
      include: {
        emprestimo: {
          include: { cliente: { select: { nome: true, telefone: true } } },
        },
      },
    }),
    prisma.pagamento.findMany({
      where: {
        status: "PENDENTE",
        dataVencimento: { lt: hoje },
      },
      include: {
        emprestimo: {
          include: { cliente: { select: { nome: true, telefone: true } } },
        },
      },
    }),
    prisma.cliente.count({ where: { bloqueado: true } }),
  ]);

  const totalEmprestado = emprestimos.reduce((sum, e) => sum + e.valor, 0);
  const totalAReceber = emprestimos
    .filter((e) => e.status === "ATIVO")
    .reduce((sum, e) => sum + e.valorTotal, 0);
  const lucroEstimado = emprestimos.reduce(
    (sum, e) => sum + (e.valorTotal - e.valor),
    0
  );

  const mesesGrafico: { mes: string; valor: number; lucro: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mesInicio = new Date(d.getFullYear(), d.getMonth(), 1);
    const mesFim = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const doMes = emprestimos.filter(
      (e) => new Date(e.createdAt) >= mesInicio && new Date(e.createdAt) <= mesFim
    );
    const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    mesesGrafico.push({
      mes: nomes[d.getMonth()],
      valor: doMes.reduce((s, e) => s + e.valor, 0),
      lucro: doMes.reduce((s, e) => s + (e.valorTotal - e.valor), 0),
    });
  }

  return NextResponse.json({
    totalClientes,
    totalEmprestimos,
    emprestimosAtivos,
    solicitacoesNovas,
    totalEmprestado,
    totalAReceber,
    lucroEstimado,
    clientesBloqueados,
    vencimentosHoje,
    pagamentosAtrasados,
    mesesGrafico,
  });
}
