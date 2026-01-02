import { NextRequest, NextResponse } from 'next/server';
import { buildPaymentUrl, diagnosePayTechConfig } from '../../../../lib/payments';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { articleId, bookId, amount = 0, currency = 'USD', description = 'Frais de publication BAJP', customerName, diagnose = false } = body as any;

  if (diagnose) {
    const diag = diagnosePayTechConfig();
    return NextResponse.json({ mode: 'diagnose', ...diag }, { status: diag.ok ? 200 : 400 });
  }
  const result = await buildPaymentUrl({ articleId, bookId, amount, currency, description, customerName });
  const status = result.mode === 'error' ? 400 : 200;
  return NextResponse.json(result, { status });
}
