import { NextRequest, NextResponse } from 'next/server';
import { parseCallback } from '../../../../lib/payments';
import { updateArticleStatus } from '../../../../lib/articles';
import { sendAdminAlert } from '../../../../lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple GET callback for local tests: ?status=success&ref=...&articleId=123
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = parseCallback(req.url);
  const rawId = url.searchParams.get('articleId');
  const articleId = rawId ? Number(rawId) : NaN;

  const ok = parsed.status.toLowerCase() === 'success' || parsed.status.toLowerCase() === 'paid';
  if (ok && !Number.isNaN(articleId)) {
    updateArticleStatus(articleId, 'PUBLISHED');
    await sendAdminAlert(`Paiement reçu: ${parsed.ref}`, `Article ${articleId} publié (ref=${parsed.ref}).`).catch(() => {});
  }
  return NextResponse.json({ received: true, ...parsed, articleId, updated: ok && !Number.isNaN(articleId) });
}

// Minimal POST callback for providers sending JSON
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const status = String(body?.response_code || body?.status || '').toLowerCase();
  const ref = String(body?.order_id || body?.invoice?.reference || body?.invoice_token || 'NA');
  const articleId = Number(body?.articleId ?? NaN);

  const ok = status === '00' || status.includes('paid') || status.includes('success');
  if (ok && !Number.isNaN(articleId)) {
    updateArticleStatus(articleId, 'PUBLISHED');
    await sendAdminAlert(`Paiement reçu: ${ref}`, `Article ${articleId} publié (ref=${ref}).`).catch(() => {});
  }
  return NextResponse.json({ received: true, status, ref, articleId, updated: ok && !Number.isNaN(articleId) });
}

export async function OPTIONS() {
  return new NextResponse('ok', { status: 200 });
}
