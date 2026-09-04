import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      emprestimos: {
        select: { id: true, valor: true, status: true },
      },
    },
  });

  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = await req.json();

  if (!data.nome || !data.cpf || !data.telefone) {
    return NextResponse.json(
      { error: "Nome, CPF e telefone são obrigatórios" },
      { status: 400 }
    );
  }

  const existing = await prisma.cliente.findUnique({
    where: { cpf: data.cpf },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe um cliente com este CPF" },
      { status: 409 }
    );
  }

  const cliente = await prisma.cliente.create({
    data: {
      nome: data.nome,
      cpf: data.cpf,
      telefone: data.telefone,
      email: data.email || null,
      endereco: data.endereco || null,
      plataforma: data.plataforma || null,
    },
  });

  return NextResponse.json(cliente, { status: 201 });
}
