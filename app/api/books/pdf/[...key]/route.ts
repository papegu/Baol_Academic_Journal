import { NextRequest } from 'next/server';
import { r2GetPdf } from '../../../../../lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { key: string[] } }) {
  const bucket = process.env.R2_BUCKET_NAME || 'ebooks-bajp';
  const key = (params?.key || []).join('/');
  if (!key) return new Response('Missing key', { status: 400 });
  try {
    if (key.startsWith('http://') || key.startsWith('https://')) {
      const proxied = await fetch(key);
      if (!proxied.ok) return new Response('Proxy fetch failed', { status: proxied.status });
      const contentType = proxied.headers.get('content-type') || 'application/pdf';
      return new Response(proxied.body as any, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
          'Content-Disposition': `inline; filename="${key.split('/').pop() || 'book.pdf'}"`
        }
      });
    } else {
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
    }
  } catch (err: any) {
    return new Response(err?.message || 'Error fetching PDF', { status: 500 });
  }
}
