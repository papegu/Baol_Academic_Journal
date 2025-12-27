import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { articleId, amount = 0, currency = 'XOF', description = 'Frais de publication BAJP', customerName } = body;

  const apiKey = process.env.PAYTECH_API_KEY;
  const secretKey = process.env.PAYTECH_SECRET_KEY;

  const refBase = articleId ? `BAJ-ART-${articleId}` : `BAJ-FEE-${Date.now()}`;

  // Placeholder integration: validate env, return mock URL with ref/amount
  if (!apiKey || !secretKey) {
    const mockUrl = `https://paytech.sn/mock/payment?ref=${encodeURIComponent(refBase)}&amount=${encodeURIComponent(amount)}&currency=${encodeURIComponent(currency)}`;
    return NextResponse.json({ url: mockUrl, ref: refBase, mode: 'mock', reason: 'Missing API keys' }, { status: 200 });
  }

  // TODO: Implement real PayTech API call here using apiKey/secretKey
  // For now, return a simulated URL to proceed with UI wiring
  const simulatedUrl = `https://paytech.sn/simulate/redirect?ref=${encodeURIComponent(refBase)}&amount=${encodeURIComponent(amount)}&currency=${encodeURIComponent(currency)}&desc=${encodeURIComponent(description)}`;
  return NextResponse.json({ url: simulatedUrl, ref: refBase, mode: 'simulated', customerName });
}
