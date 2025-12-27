import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // TODO: Validate PayTech callback parameters, update article/payment status
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'unknown';
  const ref = searchParams.get('ref') || 'NA';
  return NextResponse.json({ received: true, status, ref });
}
