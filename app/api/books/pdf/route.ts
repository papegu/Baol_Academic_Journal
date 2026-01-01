import { NextRequest, NextResponse } from 'next/server';
import { r2GetPdf } from '../../../../lib/r2';
import { cookies } from 'next/headers';
import { getPrisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get('key') || url.searchParams.get('url') || '';
  const ref = url.searchParams.get('ref') || '';
  if (!key) return new Response('Missing key', { status: 400 });
  try {
    // Access control: allow admins, otherwise require a paid transaction ref
    const role = cookies().get('role')?.value;
    const isAdmin = role === 'ADMIN' || role === 'EDITOR';
    if (!isAdmin) {
      if (!ref) return new Response('Payment required', { status: 403 });
      const tx = await getPrisma().transaction.findFirst({ where: { reference: ref, status: 'PAID' as any } });
      if (!tx) return new Response('Payment not verified', { status: 403 });
    }
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return NextResponse.redirect(key, 302);
    }
    const bucket = process.env.R2_BUCKET_NAME || 'ebooks-bajp';
    const obj = await r2GetPdf(bucket, key);
    const body = obj.Body as ReadableStream<any> | undefined;
    if (!body) return new Response('Not found', { status: 404 });
    return new Response(body as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `inline; filename="${key.split('/').pop() || 'book.pdf'}"`
      }
    });
  } catch (err: any) {
    return new Response(err?.message || 'Error fetching PDF', { status: 500 });
  }
}
