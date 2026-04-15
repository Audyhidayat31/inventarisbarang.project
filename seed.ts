import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@admin.com';
  const adminUsername = 'admin';
  const adminPassword = 'admin123';
  
  const hashedPassword = bcryptjs.hashSync(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Super Admin',
    },
    create: {
      username: adminUsername,
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created successfully:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
