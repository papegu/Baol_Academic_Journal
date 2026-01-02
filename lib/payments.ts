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
  const siteId = process.env.PAYTECH_SITE_ID || '';
  if (!initUrl) throw new Error('PAYTECH_INIT_URL is not configured');
  // Build several payload variants to satisfy differing PayTech specs
  const base = {
    api_key: apiKey,
    secret_key: secretKey,
    amount: String(amount),
    currency,
    channel: 'ALL',
    description,
    ref,
  } as Record<string, string>;
  if (callbackUrl) base.callback_url = callbackUrl;
  if (returnUrl) {
    base.return_url = returnUrl;
    base.success_url = returnUrl;
    base.cancel_url = returnUrl;
  }
  if (siteId) base.site_id = siteId;

  const variants: Array<Record<string, string>> = [
    // v1: current field names
    { ...base },
    // v2: alternate naming used by some docs
    {
      apikey: apiKey,
      secret: secretKey,
      ref_command: ref,
      item_name: description,
      command_name: description,
      amount: String(amount),
      currency,
      ipn_url: callbackUrl || '',
      success_url: returnUrl || '',
      cancel_url: returnUrl || '',
      site_id: siteId || '',
      channel: 'ALL',
    },
    // v3: minimal mandatory fields
    {
      api_key: apiKey,
      secret_key: secretKey,
      ref,
      amount: String(amount),
      currency,
    },
  ].map(v => Object.fromEntries(Object.entries(v).filter(([, val]) => val !== '')));

  // Try each variant with JSON then x-www-form-urlencoded
  for (const payload of variants) {
    // JSON attempt
    let res = await fetch(initUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });
    let text = await res.text().catch(() => '');
    let data: any = {};
    try { data = JSON.parse(text); } catch {}
    let redirect: string | undefined = data.redirect_url || data.payment_url || data.url;
    if (redirect) return { url: redirect };

    // Form-encoded attempt
    const form = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => { if (v != null) form.append(k, String(v)); });
    res = await fetch(initUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: form.toString(),
    });
    text = await res.text().catch(() => '');
    data = {};
    try { data = JSON.parse(text); } catch {}
    redirect = data.redirect_url || data.payment_url || data.url;
    if (redirect) return { url: redirect };
  }

  throw new Error('PayTech did not return a redirect URL (invalid request format)');
}

export async function buildPaymentUrl(input: PaymentInit) {
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
    try {
      const r = await requestPayTechRedirect(refBase, amount, currency, description);
      return { url: r.url, ref: refBase, mode: 'live', customerName, description };
    } catch (err: any) {
      return { url: '', ref: refBase, mode: 'error', reason: err?.message || 'PayTech initiation failed', customerName, description };
    }
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