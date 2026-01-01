export type PaymentInit = {
  articleId?: number;
  amount: number;
  currency?: string;
  description?: string;
  customerName?: string;
};

export function buildPaymentUrl(input: PaymentInit) {
  const { articleId, amount, currency = 'XOF', description = 'Frais de publication BAJP', customerName } = input;
  const apiKey = process.env.PAYTECH_API_KEY;
  const secretKey = process.env.PAYTECH_SECRET_KEY;
  const refBase = articleId ? `BAJ-ART-${articleId}` : `BAJ-FEE-${Date.now()}`;

  if (!apiKey || !secretKey) {
    const mockUrl = `https://paytech.sn/mock/payment?ref=${encodeURIComponent(refBase)}&amount=${encodeURIComponent(amount)}&currency=${encodeURIComponent(currency)}`;
    return { url: mockUrl, ref: refBase, mode: 'mock', reason: 'Missing API keys', customerName, description };
  }
  const simulatedUrl = `https://paytech.sn/simulate/redirect?ref=${encodeURIComponent(refBase)}&amount=${encodeURIComponent(amount)}&currency=${encodeURIComponent(currency)}&desc=${encodeURIComponent(description || '')}`;
  return { url: simulatedUrl, ref: refBase, mode: 'simulated', customerName, description };
}

export function parseCallback(url: string) {
  const { searchParams } = new URL(url);
  const status = searchParams.get('status') || 'unknown';
  const ref = searchParams.get('ref') || 'NA';
  const amountStr = searchParams.get('amount') || '';
  const currency = searchParams.get('currency') || 'XOF';
  const amount = amountStr ? Number(amountStr) : undefined;
  return { status, ref, amount, currency };
}