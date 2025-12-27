import { NextRequest, NextResponse } from 'next/server';
import { parseCallback } from '../../../../lib/payments';
import { sendAdminAlert } from '../../../../lib/mailer';

export async function GET(req: NextRequest) {
  // TODO: Update article/payment status using parsed data
  const parsed = parseCallback(req.url);
  if (parsed.status.toLowerCase() === 'success' || parsed.status.toLowerCase() === 'paid') {
    const subject = `Paiement reçu: ${parsed.ref}`;
    const text = `Un paiement a été confirmé pour la référence ${parsed.ref}.`;
    await sendAdminAlert(subject, text).catch(() => {});
  }
  return NextResponse.json({ received: true, ...parsed });
}
