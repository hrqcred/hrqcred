import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.admin.upsert({
    where: { email: "admin@brasiliacred.com.br" },
    update: {},
    create: {
      email: "admin@brasiliacred.com.br",
      password: hashedPassword,
      nome: "Administrador",
    },
  });

  console.log("Seed concluído!");
  console.log("Login: admin@brasiliacred.com.br");
  console.log("Senha: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
