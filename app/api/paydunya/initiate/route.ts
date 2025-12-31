import { NextRequest, NextResponse } from 'next/server';
import { buildPaymentUrl } from '../../../../lib/payments';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { articleId, amount = 0, currency = 'XOF', description = 'Frais de publication BAJP', customerName } = body;
  // Reuse the PayTech URL builder to keep local testing consistent
  const result = buildPaymentUrl({ articleId, amount, currency, description, customerName });
  return NextResponse.json(result, { status: 200 });
}
