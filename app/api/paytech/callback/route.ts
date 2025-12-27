import { NextRequest, NextResponse } from 'next/server';
import { parseCallback } from '@/lib/payments';

export async function GET(req: NextRequest) {
  // TODO: Update article/payment status using parsed data
  const parsed = parseCallback(req.url);
  return NextResponse.json({ received: true, ...parsed });
}
