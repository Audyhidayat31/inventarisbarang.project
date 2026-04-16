const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users);

  const updated = await prisma.user.updateMany({
    data: { role: 'ADMIN' },
  });
  console.log("Updated", updated.count, "users to ADMIN");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
