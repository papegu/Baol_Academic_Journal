export type PaymentInit = {
  articleId?: number;
  bookId?: number;
  amount: number;
  currency?: string;
  description?: string;
  customerName?: string;
};

export function diagnosePayTechConfig() {
  const apiKey = process.env.PAYTECH_API_KEY || '';
  const secretKey = process.env.PAYTECH_SECRET_KEY || '';
  const initUrl = process.env.PAYTECH_INIT_URL || '';
  const callbackUrl = (process.env.PAYTECH_CALLBACK_URL || '').trim();
  const returnUrl = (process.env.PAYTECH_RETURN_URL || '').trim();
  const siteId = process.env.PAYTECH_SITE_ID || '';
  const providerCurrency = process.env.PAYTECH_PROVIDER_CURRENCY || 'XOF';
  const mask = (s: string) => {
    if (!s) return '';
    if (s.length <= 6) return '***';
    return `${s.slice(0, 3)}…${s.slice(-2)}`;
  };
  const looksPlaceholder = (val?: string) => !!val && /change-me|placeholder|demo/i.test(val);
  const isValidUrl = (u?: string) => {
    try { if (!u) return false; new URL(u); return true; } catch { return false; }
  };
  const result = {
    ok: !!apiKey && !!secretKey && !!initUrl,
    reason: (!apiKey || !secretKey) ? 'Missing API credentials' : (!initUrl ? 'Missing PAYTECH_INIT_URL' : ''),
    providerCurrency,
    initUrlPresent: !!initUrl,
    callbackUrlValid: isValidUrl(callbackUrl),
    successUrlValid: isValidUrl(returnUrl || callbackUrl),
    cancelUrlValid: isValidUrl(returnUrl || callbackUrl),
    siteIdPresent: !!siteId,
    keysLookPlaceholder: looksPlaceholder(apiKey) || looksPlaceholder(secretKey),
    masked: {
      apiKey: mask(apiKey),
      secretKey: mask(secretKey),
      initUrl: initUrl ? '[configured]' : '',
      callbackUrl,
      returnUrl,
      siteId,
    },
  };
  return result;
}

async function requestPayTechRedirect(ref: string, amount: number, currency: string, description: string) {
  const apiKey = process.env.PAYTECH_API_KEY || '';
  const secretKey = process.env.PAYTECH_SECRET_KEY || '';
  const initUrl = process.env.PAYTECH_INIT_URL || '';
  const callbackUrl = process.env.PAYTECH_CALLBACK_URL || '';
  const returnUrl = process.env.PAYTECH_RETURN_URL || '';
  const siteId = process.env.PAYTECH_SITE_ID || '';
  const providerCurrency = process.env.PAYTECH_PROVIDER_CURRENCY || 'XOF';
  // Convert amount to provider currency if needed (USD -> XOF vice versa)
  let sendAmount = amount;
  let sendCurrency = currency || 'USD';
  const xofPerUsd = Number(process.env.NEXT_PUBLIC_XOF_PER_USD || '600');
  if (providerCurrency !== sendCurrency) {
    if (providerCurrency === 'XOF' && sendCurrency === 'USD') {
      sendAmount = Math.round((amount * (xofPerUsd > 0 ? xofPerUsd : 600)));
      sendCurrency = 'XOF';
    } else if (providerCurrency === 'USD' && sendCurrency === 'XOF') {
      sendAmount = Math.round((amount / (xofPerUsd > 0 ? xofPerUsd : 600)) * 100) / 100;
      sendCurrency = 'USD';
    } else {
      sendCurrency = providerCurrency;
    }
  }
  if (!initUrl) throw new Error('PAYTECH_INIT_URL is not configured');
  const isCredentialError = (status: number, text: string) => {
    const t = (text || '').toLowerCase();
    return status === 401 || status === 403 ||
      t.includes('invalid api key') || t.includes('invalid key') || t.includes('clé invalide') ||
      t.includes('invalid secret') || t.includes('secret key') || t.includes('unauthorized') ||
      t.includes('authent') || t.includes('access denied') || t.includes('not allowed');
  };
  const attempts: Array<{ variantIndex: number; encoding: 'json' | 'form'; status: number; body: string; sentAmount?: string; sentCurrency?: string }> = [];
  const ipn = (callbackUrl || '').trim();
  const success = ((returnUrl || callbackUrl) || '').trim();
  const cancel = ((returnUrl || callbackUrl) || '').trim();
  // Base payload used to derive multiple variants to satisfy differing provider expectations
  const base: Record<string, string> = {
    api_key: apiKey,
    secret_key: secretKey,
    ref: ref,
    ref_command: ref,
    item_name: description,
    item_price: String(sendAmount),
    amount: String(sendAmount),
    currency: sendCurrency,
    description,
    channel: 'card, mobile',
    callback_url: ipn,
    ipn_url: ipn,
    success_url: success,
    cancel_url: cancel,
    site_id: siteId,
  };
  const variants: Array<Record<string, string>> = [
    // Variant 1: explicit item fields expected by PayTech
    {
      api_key: base.api_key,
      secret_key: base.secret_key,
      ref_command: base.ref_command,
      item_name: base.item_name,
      item_price: base.item_price,
      currency: base.currency,
      ipn_url: base.ipn_url,
      success_url: base.success_url,
      cancel_url: base.cancel_url,
      site_id: base.site_id,
    },
    // Variant 2: legacy keys (ref/amount) alongside item fields
    {
      api_key: base.api_key,
      secret_key: base.secret_key,
      ref: base.ref,
      amount: base.amount,
      currency: base.currency,
      item_name: base.item_name,
      item_price: base.item_price,
      ipn_url: base.ipn_url,
      success_url: base.success_url,
      cancel_url: base.cancel_url,
      site_id: base.site_id,
    },
    // Variant 3: minimal strictly required fields
    {
      api_key: base.api_key,
      secret_key: base.secret_key,
      ref_command: base.ref_command,
      item_name: base.item_name,
      item_price: base.item_price,
      ipn_url: base.ipn_url,
    },
  ];
  let lastError = 'PayTech did not return a redirect URL';
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    // Try JSON first
    let res = await fetch(initUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(variant),
    });
    let dataText = await res.text().catch(() => '');
    let data: any = {};
    try { data = JSON.parse(dataText); } catch {}
    let redirect: string | undefined = data.redirect_url || data.payment_url || data.url || data.checkout_url;
    attempts.push({ variantIndex: i, encoding: 'json', status: res.status, body: dataText, sentAmount: variant.amount, sentCurrency: variant.currency });
    if (redirect) return { url: redirect };
    lastError = data.message || data.error || dataText || lastError;
    // Try form-encoded variant
    const form = new URLSearchParams();
    Object.entries(variant).forEach(([k, v]) => { if (v != null) form.append(k, String(v)); });
    res = await fetch(initUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: form.toString(),
    });
    dataText = await res.text().catch(() => '');
    data = {};
    try { data = JSON.parse(dataText); } catch {}
    redirect = data.redirect_url || data.payment_url || data.url || data.checkout_url;
    attempts.push({ variantIndex: i, encoding: 'form', status: res.status, body: dataText, sentAmount: variant.amount, sentCurrency: variant.currency });
    if (redirect) return { url: redirect };
    lastError = data.message || data.error || dataText || lastError;
  }
  const last = attempts[attempts.length - 1];
  const reason = last && isCredentialError(last.status, last.body)
    ? 'Invalid or rejected PayTech API credentials'
    : undefined;
  const err = new Error(reason || lastError);
  Object.assign(err, { attempts, reason });
  throw err;
}

export async function buildPaymentUrl(input: PaymentInit) {
  const { articleId, bookId, amount, currency = 'USD', description = 'Frais de publication BAJP', customerName } = input;
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
      return { url: '', ref: refBase, mode: 'error', reason: err?.reason || err?.message || 'PayTech initiation failed', debug: err?.attempts ? { attempts: err.attempts } : undefined, customerName, description };
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
  const currency = searchParams.get('currency') || 'USD';
  const amount = amountStr ? Number(amountStr) : undefined;
  return { status, ref, amount, currency };
}