import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPrisma } from '../../../lib/prisma';
import { uploadPdf } from '../../../lib/storage';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return !!role; // any logged in user can view/create their submissions
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const subs = await getPrisma().submission.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ submissions: subs });
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

  const ext = '.pdf';
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const pdfUrl = await uploadPdf(buffer, user.id, filename);
    const sub = await getPrisma().submission.create({ data: { title, authors, abstract, pdfUrl, userId: user.id } });
    return NextResponse.json({ submission: sub, message: 'Soumission reçue' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Erreur lors du dépôt du PDF' }, { status: 500 });
  }
}