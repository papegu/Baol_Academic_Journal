import { NextRequest, NextResponse } from 'next/server';
import { buildPaymentUrl } from '../../../../lib/payments';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { articleId, bookId, amount = 0, currency = 'XOF', description = 'Frais de publication BAJP', customerName } = body;

  const result = buildPaymentUrl({ articleId, bookId, amount, currency, description, customerName });
  return NextResponse.json(result, { status: 200 });
}
