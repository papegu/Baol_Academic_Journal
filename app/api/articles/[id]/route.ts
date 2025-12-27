import { NextRequest, NextResponse } from 'next/server';
import { getArticleById } from '../../../../backend/articles';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const article = getArticleById(id);
  if (!article) return NextResponse.json({ message: 'Article introuvable' }, { status: 404 });
  return NextResponse.json({ article });
}
