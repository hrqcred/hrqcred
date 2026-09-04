import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") || "emprestimos";

  if (tipo === "emprestimos") {
    const emprestimos = await prisma.emprestimo.findMany({
      include: {
        cliente: { select: { nome: true, cpf: true, telefone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const header = "Nome,CPF,Telefone,Valor,Juros(%),Total,Tipo,Parcelas,Status,Data\n";
    const rows = emprestimos
      .map(
        (e) =>
          `"${e.cliente.nome}","${e.cliente.cpf}","${e.cliente.telefone}",${e.valor},${e.juros},${e.valorTotal},${e.tipo},${e.parcelas},${e.status},${new Date(e.createdAt).toLocaleDateString("pt-BR")}`
      )
      .join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=emprestimos_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  }

  if (tipo === "clientes") {
    const clientes = await prisma.cliente.findMany({
      include: { emprestimos: { select: { status: true } } },
      orderBy: { createdAt: "desc" },
    });

    const header = "Nome,CPF,Telefone,Email,Plataforma,Classificação,Bloqueado,Empréstimos,Data Cadastro\n";
    const rows = clientes
      .map(
        (c) =>
          `"${c.nome}","${c.cpf}","${c.telefone}","${c.email || ""}","${c.plataforma || ""}","${c.classificacao}",${c.bloqueado ? "Sim" : "Não"},${c.emprestimos.length},${new Date(c.createdAt).toLocaleDateString("pt-BR")}`
      )
      .join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=clientes_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  }

  if (tipo === "pagamentos") {
    const pagamentos = await prisma.pagamento.findMany({
      include: {
        emprestimo: {
          include: { cliente: { select: { nome: true, cpf: true } } },
        },
      },
      orderBy: { dataVencimento: "asc" },
    });

    const header = "Cliente,CPF,Parcela,Valor,Vencimento,Pagamento,Status\n";
    const rows = pagamentos
      .map(
        (p) =>
          `"${p.emprestimo.cliente.nome}","${p.emprestimo.cliente.cpf}",${p.numeroParcela},${p.valor},${new Date(p.dataVencimento).toLocaleDateString("pt-BR")},${p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString("pt-BR") : ""},${p.status}`
      )
      .join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=pagamentos_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
}
