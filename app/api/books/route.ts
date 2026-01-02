import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listBooks, createBook, Book } from '../../../lib/books';
import { getPrisma } from '../../../lib/prisma';
import { r2PutPdf, makeBookKey } from '../../../lib/r2';
import { uploadPdf } from '../../../lib/storage';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET() {
  // Public listing of books
  if (process.env.DEMO_AUTH === 'true') return NextResponse.json({ books: listBooks() });
  const books = await getPrisma().book.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ books });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const contentType = request.headers.get('content-type') || '';
  let title = '';
  let authors = '';
  let description = '';
  let file: File | null = null;
  let pdfKey = '';
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    title = String(form.get('title') || '');
    authors = String(form.get('authors') || '');
    description = String(form.get('description') || '');
    file = form.get('file') as File | null;
    if (!title || !authors || !description || !file) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }
  } else {
    const body = await request.json();
    title = String(body?.title || '');
    authors = String(body?.authors || '');
    description = String(body?.description || '');
    pdfKey = String(body?.pdfKey || '');
    if (!title || !authors || !description || !pdfKey) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }
  }

  if (process.env.DEMO_AUTH === 'true') {
    const created = createBook({ title, authors, description, pdfUrl: file ? (file as any).name : pdfKey });
    return NextResponse.json({ book: created }, { status: 201 });
  }

  let key = pdfKey;
  if (!key && file) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const hasR2 = !!(process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
      if (hasR2) {
        const bucket = process.env.R2_BUCKET_NAME || 'ebooks-bajp';
        const uuid = crypto.randomUUID();
        const k = makeBookKey(title, uuid);
        await r2PutPdf(bucket, k, new Uint8Array(buffer));
        key = k;
      } else {
        // Fallback: use existing upload helper (Cloudflare endpoint or Supabase)
        const filename = `${Date.now()}-${crypto.randomUUID()}.pdf`;
        key = await uploadPdf(buffer, 0, filename);
      }
    } catch (err: any) {
      const msg = err?.message || 'Erreur de dépôt du PDF';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  const book = await getPrisma().book.create({ data: { title, authors, description, pdfUrl: key, published: false } });
  return NextResponse.json({ book }, { status: 201 });
}