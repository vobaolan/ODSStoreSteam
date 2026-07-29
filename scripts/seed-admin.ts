import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  const email = 'admin@odsstore.vn';
  const rawPassword = '01699224729';
  const hashedPassword = bcrypt.hashSync(rawPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      password: hashedPassword,
    },
    create: {
      name: 'ODS Admin Master',
      email,
      password: hashedPassword,
      role: 'ADMIN',
      balance: 1000000.0,
    },
  });

  console.log('Tài khoản Admin đã được khởi tạo/cập nhật thành công:');
  console.log('Email:', adminUser.email);
  console.log('Role:', adminUser.role);
  console.log('ID:', adminUser.id);
}

seedAdmin()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
