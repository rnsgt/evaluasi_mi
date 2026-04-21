const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old evaluations...');
  await prisma.evaluasi_detail.deleteMany({});
  await prisma.evaluasi_dosen.deleteMany({});
  await prisma.evaluasi_fasilitas.deleteMany({});
  console.log('Done clearing old evaluations!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
