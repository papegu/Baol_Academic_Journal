import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { r2PutPdf, makeArticleKey } from '../../../../lib/r2';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const title = String(form.get('title') || '');
  const file = form.get('file') as File | null;
  if (!title || !file) return NextResponse.json({ message: 'Champs requis manquants' }, { status: 400 });
  if (file.type !== 'application/pdf') return NextResponse.json({ message: 'Type de fichier non supporté' }, { status: 400 });
  const maxBytes = 20 * 1024 * 1024; // 20 MB
  if (file.size > maxBytes) return NextResponse.json({ message: 'Fichier trop volumineux (max 20 Mo)' }, { status: 400 });

  // Optional auth check (require any role cookie)
  const role = cookies().get('role')?.value || '';
  if (!role) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const bucket = process.env.R2_BUCKET_NAME || 'ebooks-bajp';
  const uuid = crypto.randomUUID();
  const key = makeArticleKey(title, uuid);
  const buf = Buffer.from(await file.arrayBuffer());
  const body = new Uint8Array(buf);
  try {
    await r2PutPdf(bucket, key, body);
    return NextResponse.json({ pdfKey: key }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Erreur upload R2' }, { status: 500 });
  }
}
