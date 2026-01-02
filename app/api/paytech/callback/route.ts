import { NextRequest, NextResponse } from 'next/server';
import { parseCallback } from '../../../../lib/payments';
import { sendAdminAlert } from '../../../../lib/mailer';
import { getPrisma } from '../../../../lib/prisma';

export async function GET(req: NextRequest) {
  // TODO: Update article/payment status using parsed data
  const parsed = parseCallback(req.url);
  if (parsed.status.toLowerCase() === 'success' || parsed.status.toLowerCase() === 'paid') {
    const subject = `Paiement reçu: ${parsed.ref}`;
    const text = `Un paiement a été confirmé pour la référence ${parsed.ref}.`;
    await sendAdminAlert(subject, text).catch(() => {});
    // Persist transaction/payment status
    try {
      const prisma = getPrisma();
      const existing = await prisma.transaction.findFirst({ where: { reference: parsed.ref } });
      if (existing) {
        await prisma.transaction.update({ where: { id: existing.id }, data: { status: 'PAID' as any, currency: parsed.currency || existing.currency } });
      } else {
        await prisma.transaction.create({ data: { reference: parsed.ref, amount: parsed.amount || 0, currency: parsed.currency || 'USD', status: 'PAID' as any } });
      }
      await prisma.payment.create({ data: { txId: (await prisma.transaction.findFirst({ where: { reference: parsed.ref } }))!.id, amount: parsed.amount || 0, currency: parsed.currency || 'USD' } }).catch(() => {});
    } catch {}
    // If ref encodes a book id, redirect user to read the book immediately
    if (parsed.ref.startsWith('BAJ-BOOK-')) {
      const idStr = parsed.ref.replace('BAJ-BOOK-', '');
      const bookId = Number(idStr);
      if (!Number.isNaN(bookId)) {
        try {
          const prisma = getPrisma();
          const book = await prisma.book.findUnique({ where: { id: bookId } });
          if (book?.pdfUrl) {
            // Redirect to guarded streaming route
            const target = `/api/books/pdf?key=${encodeURIComponent(book.pdfUrl)}&ref=${encodeURIComponent(parsed.ref)}`;
            return NextResponse.redirect(target, 302);
          }
        } catch {}
      }
    }
  }
  return NextResponse.json({ received: true, ...parsed });
}
