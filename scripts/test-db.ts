import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst({ where: { username: 'admin' } });
    if (user) {
      console.log('Admin user found:', user.username, user.email);
      console.log('Password hash:', user.password);
      
      const isValid = await bcryptjs.compare('admin123', user.password);
      console.log('Password "admin123" valid:', isValid);
    } else {
      console.log('Admin user NOT found');
    }
  } catch (e: any) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
