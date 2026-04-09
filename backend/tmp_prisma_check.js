const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.users.findMany({
    where: {
      OR: [
        { email: 'admin@evaluasi.com' },
        { role: { in: ['ADMIN', 'MAHASISWA', 'admin', 'mahasiswa'] } }
      ]
    },
    select: { id: true, email: true, nim: true, role: true }
  });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e.message);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
