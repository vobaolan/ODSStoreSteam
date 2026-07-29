import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    where: {
      OR: [
        { name: { contains: 'Palworld' } },
        { name: { contains: 'Resident Evil' } }
      ]
    },
    data: {
      category: []
    }
  });
  console.log('Cleared categories for Palworld and Resident Evil');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
