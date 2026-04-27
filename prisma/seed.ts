import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db",
    },
  },
});

async function main() {
  const users = [
    { email: "manager@example.com", name: "Иван Руководитель", role: "MANAGER" },
    { email: "manager2@example.com", name: "Петр Директор", role: "MANAGER" },
    { email: "manager3@example.com", name: "Елена Финансист", role: "MANAGER" },
    { email: "manager4@example.com", name: "Дмитрий Юрист", role: "MANAGER" },
    { email: "employee@example.com", name: "Алексей Сотрудник", role: "EMPLOYEE" },
    { email: "employee2@example.com", name: "Мария Менеджер", role: "EMPLOYEE" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password: "password123",
        role: user.role as any,
      },
    });
  }

  console.log("Seed complete");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
