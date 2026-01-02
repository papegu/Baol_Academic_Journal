import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPrisma } from '../../../lib/prisma';
import { uploadPdf } from '../../../lib/storage';
import { r2PutPdf, makeSubmissionKey } from '../../../lib/r2';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return !!role; // any logged in user can view/create their submissions
}

export async function GET(req: NextRequest) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.max(1, Math.min(100, Number(searchParams.get('pageSize') || 10)));
  const where = status ? { status: status as any } : undefined;
  const total = await getPrisma().submission.count({ where });
  const subs = await getPrisma().submission.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize });
  return NextResponse.json({ submissions: subs, page, pageSize, total });
}
export async function POST(req: NextRequest) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await req.formData();
  const title = String(form.get('title') || '');
  const authors = String(form.get('authors') || '');
  const abstract = String(form.get('abstract') || '');
  const file = form.get('file') as File | null;
  if (!title || !authors || !abstract || !file) {
    return NextResponse.json({ message: 'Champs requis manquants' }, { status: 400 });
  }

  const email = cookies().get('user_email')?.value || '';
  const user = email ? await getPrisma().user.findUnique({ where: { email } }) : null;
  if (!user) return NextResponse.json({ message: 'Utilisateur non authentifié' }, { status: 401 });

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    let pdfKey = '';
    const hasR2 = !!(process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
    if (hasR2) {
      const bucket = process.env.R2_BUCKET_NAME || 'ebooks-bajp';
      const uuid = crypto.randomUUID();
      const key = makeSubmissionKey(title, user.id, uuid);
      await r2PutPdf(bucket, key, new Uint8Array(buffer));
      pdfKey = key;
    } else {
      const ext = '.pdf';
      const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
      pdfKey = await uploadPdf(buffer, user.id, filename);
    }
    const sub = await getPrisma().submission.create({ data: { title, authors, abstract, pdfUrl: pdfKey, userId: user.id } });
    return NextResponse.json({ submission: sub, message: 'Soumission reçue' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Erreur lors du dépôt du PDF' }, { status: 500 });
  }
}