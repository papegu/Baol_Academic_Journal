import { NextRequest, NextResponse } from 'next/server';
import { listArticlesByStatus, submitArticle, updateArticleStatus } from '@/lib/articles';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as any | null;
  const articles = listArticlesByStatus(status ?? undefined);
  return NextResponse.json({ articles });
}
export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const updated = updateArticleStatus(Number(id), status);
  if (!updated) return NextResponse.json({ message: 'Article introuvable' }, { status: 404 });
  return NextResponse.json({ message: 'Statut mis à jour', article: updated });
}

export async function POST(req: NextRequest) {
  // Soumission d'un article via multipart/form-data
  const form = await req.formData();
  const title = String(form.get('title') || '');
  const authors = String(form.get('authors') || '');
  const abstract = String(form.get('abstract') || '');
  // Fichier PDF non stocké réellement pour ce mock
  if (!title || !authors || !abstract) {
    return NextResponse.json({ message: 'Champs requis manquants' }, { status: 400 });
  }
  const created = submitArticle({ title, authors, abstract, pdfUrl: '/dummy.pdf' });
  return NextResponse.json({ message: 'Soumission reçue', article: created }, { status: 201 });
}
