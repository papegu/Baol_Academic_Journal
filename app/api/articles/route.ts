import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPrisma } from '../../../lib/prisma';
import { r2PutPdf, makeArticleKey } from '../../../lib/r2';
import { uploadPdf } from '../../../lib/storage';
import crypto from 'crypto';

// Ensure this route is never statically evaluated during build
export const dynamic = 'force-dynamic';
// Use Node.js runtime (needed for Buffer/crypto and Prisma)
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status');
  const where = statusParam ? { status: statusParam as any } : { status: 'PUBLISHED' as any };
  const articles = await getPrisma().article.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ articles });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const articleId = Number(id);
  if (!articleId || !status) return NextResponse.json({ message: 'Paramètres invalides' }, { status: 400 });

  // If reject: delete DB record (PDF cleanup is handled separately or via R2 lifecycle)
  if (status === 'REJECTED') {
    const existing = await getPrisma().article.findUnique({ where: { id: articleId } });
    if (!existing) return NextResponse.json({ message: 'Article introuvable' }, { status: 404 });
    await getPrisma().article.delete({ where: { id: articleId } });
    return NextResponse.json({ message: 'Soumission rejetée et supprimée' });
  }

  const updated = await getPrisma().article.update({ where: { id: articleId }, data: { status } });
  return NextResponse.json({ message: 'Statut mis à jour', article: updated });
}

export async function POST(req: NextRequest) {
  // Accept either multipart upload or JSON with `pdfKey`
  const contentType = req.headers.get('content-type') || '';
  let title = '';
  let authors = '';
  let abstract = '';
  let pdfKey = '';
  let file: File | null = null;
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    title = String(form.get('title') || '');
    authors = String(form.get('authors') || '');
    abstract = String(form.get('abstract') || '');
    file = form.get('file') as File | null;
    if (!title || !authors || !abstract || !file) {
      return NextResponse.json({ message: 'Champs requis manquants' }, { status: 400 });
    }
  } else {
    const body = await req.json();
    title = String(body?.title || '');
    authors = String(body?.authors || '');
    abstract = String(body?.abstract || '');
    pdfKey = String(body?.pdfKey || '');
    if (!title || !authors || !abstract || !pdfKey) {
      return NextResponse.json({ message: 'Champs requis manquants' }, { status: 400 });
    }
  }

  // Resolve user from cookie
  const email = cookies().get('user_email')?.value || '';
  const user = email ? await getPrisma().user.findUnique({ where: { email } }) : null;
  if (!user) return NextResponse.json({ message: "Utilisateur non authentifié" }, { status: 401 });

  let key = pdfKey;
  if (!key && file) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const hasR2 = !!(process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
      if (hasR2) {
        const bucket = process.env.R2_BUCKET_NAME || 'ebooks-bajp';
        const uuid = crypto.randomUUID();
        const k = makeArticleKey(title, uuid);
        await r2PutPdf(bucket, k, new Uint8Array(buffer));
        key = k;
      } else {
        const filename = `${Date.now()}-${crypto.randomUUID()}.pdf`;
        key = await uploadPdf(buffer, user.id, filename);
      }
    } catch (err: any) {
      const msg = err?.message || 'Erreur lors du dépôt du PDF';
      return NextResponse.json({ message: msg }, { status: 500 });
    }
  }

  // Create Article with status SUBMITTED
  const created = await getPrisma().article.create({
    data: { title, authors, abstract, pdfUrl: key, status: 'SUBMITTED' as any, userId: user.id }
  });
  return NextResponse.json({ message: 'Soumission reçue', article: created }, { status: 201 });
}
