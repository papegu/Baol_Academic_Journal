import { NextRequest, NextResponse } from 'next/server';
import { buildPaymentUrl } from '../../../../lib/payments';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { articleId, bookId, amount = 0, currency = 'USD', description = 'Frais de publication BAJP', customerName } = body;

  const result = await buildPaymentUrl({ articleId, bookId, amount, currency, description, customerName });
  const status = result.mode === 'error' ? 400 : 200;
  return NextResponse.json(result, { status });
}
