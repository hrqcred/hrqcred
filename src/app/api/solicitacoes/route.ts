import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const solicitacoes = await prisma.solicitacao.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(solicitacoes);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.nome || !data.cpf || !data.telefone || !data.valor || !data.tipo) {
    return NextResponse.json(
      { error: "Preencha todos os campos obrigatórios" },
      { status: 400 }
    );
  }

  if (data.valor < 100 || data.valor > 5000) {
    return NextResponse.json(
      { error: "Valor deve ser entre R$ 100 e R$ 5.000" },
      { status: 400 }
    );
  }

  const solicitacao = await prisma.solicitacao.create({
    data: {
      nome: data.nome,
      cpf: data.cpf,
      telefone: data.telefone,
      email: data.email || null,
      valor: data.valor,
      tipo: data.tipo,
      parcelas: data.parcelas || 1,
      mensagem: data.mensagem || null,
    },
  });

  return NextResponse.json(solicitacao, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();

  const solicitacao = await prisma.solicitacao.update({
    where: { id },
    data: { status },
  });

  if (status === "APROVADA") {
    let cliente = await prisma.cliente.findUnique({
      where: { cpf: solicitacao.cpf },
    });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nome: solicitacao.nome,
          cpf: solicitacao.cpf,
          telefone: solicitacao.telefone,
          email: solicitacao.email,
        },
      });
    }

    const juros = solicitacao.tipo === "SEMANAL" ? 40 : 70;
    const valorTotal = solicitacao.valor * (1 + juros / 100);
    const valorParcela = valorTotal / solicitacao.parcelas;

    const emprestimo = await prisma.emprestimo.create({
      data: {
        clienteId: cliente.id,
        valor: solicitacao.valor,
        juros,
        tipo: solicitacao.tipo,
        valorTotal,
        parcelas: solicitacao.parcelas,
        valorParcela,
        status: "ATIVO",
        dataInicio: new Date(),
      },
    });

    const diasIntervalo = solicitacao.tipo === "SEMANAL" ? 7 : 15;
    const pagamentosData = [];
    for (let i = 0; i < solicitacao.parcelas; i++) {
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + diasIntervalo * (i + 1));
      pagamentosData.push({
        emprestimoId: emprestimo.id,
        valor: valorParcela,
        numeroParcela: i + 1,
        dataVencimento,
      });
    }

    await prisma.pagamento.createMany({ data: pagamentosData });
  }

  return NextResponse.json(solicitacao);
}
