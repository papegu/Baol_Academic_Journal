const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();
(async () => {
  try {
    const ref = 'TEST-REF-' + Date.now();
    const tx = await prisma.transaction.create({ data: { reference: ref, amount: 1000, status: 'PAID' } });
    const pay = await prisma.payment.create({ data: { txId: tx.id, amount: 1000 } });
    console.log(JSON.stringify({ ok: true, ref, txId: tx.id, paymentId: pay.id }));
  } catch (e) {
    console.error('Error:', e?.message || e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();