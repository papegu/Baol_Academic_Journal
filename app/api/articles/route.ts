import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../lib/prisma';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';
import crypto from 'crypto';

// Ensure this route is never statically evaluated during build
export const dynamic = 'force-dynamic';
// Use Node.js runtime (needed for Buffer/crypto and Prisma)
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status');
  const where = statusParam ? { status: statusParam as any } : { status: 'PUBLISHED' as any };
  const articles = await prisma.article.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ articles });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const articleId = Number(id);
  if (!articleId || !status) return NextResponse.json({ message: 'Paramètres invalides' }, { status: 400 });

  // If reject: remove storage object then delete DB record
  if (status === 'REJECTED') {
    const existing = await prisma.article.findUnique({ where: { id: articleId } });
    if (!existing) return NextResponse.json({ message: 'Article introuvable' }, { status: 404 });
    try {
      const client = getSupabaseAdmin();
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const prefix = `${url}/storage/v1/object/public/articles/`;
      const path = existing.pdfUrl?.startsWith(prefix) ? existing.pdfUrl.slice(prefix.length) : '';
      if (path) {
        await client.storage.from('articles').remove([path]);
      }
    } catch {}
    await prisma.article.delete({ where: { id: articleId } });
    return NextResponse.json({ message: 'Soumission rejetée et supprimée' });
  }

  const updated = await prisma.article.update({ where: { id: articleId }, data: { status } });
  return NextResponse.json({ message: 'Statut mis à jour', article: updated });
}

export async function POST(req: NextRequest) {
  // Soumission d'un article via multipart/form-data (upload Storage + enregistrement DB)
  const form = await req.formData();
  const title = String(form.get('title') || '');
  const authors = String(form.get('authors') || '');
  const abstract = String(form.get('abstract') || '');
  const file = form.get('file') as File | null;
  if (!title || !authors || !abstract || !file) {
    return NextResponse.json({ message: 'Champs requis manquants' }, { status: 400 });
  }

  // Resolve user from cookie
  const email = cookies().get('user_email')?.value || '';
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
  if (!user) return NextResponse.json({ message: "Utilisateur non authentifié" }, { status: 401 });

  // Upload PDF to Supabase Storage
  const client = getSupabaseAdmin();
  const bucket = 'articles';
  const ext = '.pdf';
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const path = `${user.id}/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadRes = await client.storage.from(bucket).upload(path, buffer, { contentType: 'application/pdf', upsert: false });
  if (uploadRes.error) {
    return NextResponse.json({ message: uploadRes.error.message }, { status: 500 });
  }
  const publicUrlResult = client.storage.from(bucket).getPublicUrl(path);
  const pdfUrl = publicUrlResult?.data?.publicUrl || '';

  // Create Article with status SUBMITTED
  const created = await prisma.article.create({
    data: { title, authors, abstract, pdfUrl, status: 'SUBMITTED' as any, userId: user.id }
  });
  return NextResponse.json({ message: 'Soumission reçue', article: created }, { status: 201 });
}
