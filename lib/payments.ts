export type PaymentInit = {
  articleId?: number;
  bookId?: number;
  amount: number;
  currency?: string;
  description?: string;
  customerName?: string;
};

async function requestPayTechRedirect(ref: string, amount: number, currency: string, description: string) {
  const apiKey = process.env.PAYTECH_API_KEY || '';
  const secretKey = process.env.PAYTECH_SECRET_KEY || '';
  const initUrl = process.env.PAYTECH_INIT_URL || '';
  const callbackUrl = process.env.PAYTECH_CALLBACK_URL || '';
  const returnUrl = process.env.PAYTECH_RETURN_URL || '';
  if (!initUrl) throw new Error('PAYTECH_INIT_URL is not configured');
  const payload: any = {
    api_key: apiKey,
    secret_key: secretKey,
    ref,
    amount,
    currency,
    description,
  };
  if (callbackUrl) payload.callback_url = callbackUrl;
  if (returnUrl) payload.return_url = returnUrl;
  const res = await fetch(initUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  const redirect: string | undefined = data.redirect_url || data.payment_url || data.url;
  if (!redirect) throw new Error('PayTech did not return a redirect URL');
  return { url: redirect };
}

export function buildPaymentUrl(input: PaymentInit) {
  const { articleId, bookId, amount, currency = 'XOF', description = 'Frais de publication BAJP', customerName } = input;
  const apiKey = process.env.PAYTECH_API_KEY;
  const secretKey = process.env.PAYTECH_SECRET_KEY;
  const refBase = (typeof bookId === 'number' && !Number.isNaN(bookId))
    ? `BAJ-BOOK-${bookId}`
    : (typeof articleId === 'number' && !Number.isNaN(articleId))
      ? `BAJ-ART-${articleId}`
      : `BAJ-FEE-${Date.now()}`;

  // Treat placeholder keys as "missing" to avoid broken external redirects
  const looksPlaceholder = (val?: string) => !!val && /change-me/i.test(val);
  const missingOrPlaceholder = !apiKey || !secretKey || looksPlaceholder(apiKey) || looksPlaceholder(secretKey);

  if (missingOrPlaceholder) {
    // Use local callback to simulate a successful payment and proceed to reading
    const localCallback = `/api/paytech/callback?status=paid&ref=${encodeURIComponent(refBase)}&amount=${encodeURIComponent(amount)}&currency=${encodeURIComponent(currency)}&desc=${encodeURIComponent(description || '')}`;
    return { url: localCallback, ref: refBase, mode: 'mock', reason: 'Missing or placeholder API keys', customerName, description };
  }

  // With real keys, use configured PayTech initiation endpoint to obtain redirect URL
  const initUrl = process.env.PAYTECH_INIT_URL;
  if (initUrl) {
    return requestPayTechRedirect(refBase, amount, currency, description)
      .then(r => ({ url: r.url, ref: refBase, mode: 'live', customerName, description }))
      .catch(err => ({ url: '', ref: refBase, mode: 'error', reason: err?.message || 'PayTech initiation failed', customerName, description }));
  }
  // Fallback: no init URL configured, still attempt simulator for non-placeholder keys
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