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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const diagnose = searchParams.get('diagnose');
  if (diagnose === 'true' || diagnose === '1') {
    const diag = diagnosePayTechConfig();
    return NextResponse.json({ mode: 'diagnose', ...diag }, { status: diag.ok ? 200 : 400 });
  }
  return NextResponse.json({
    ok: false,
    message: 'Use POST with JSON body. For diagnose, send POST {"diagnose": true} or GET ?diagnose=true'
  }, { status: 405 });
}
