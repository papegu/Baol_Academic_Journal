import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPrisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isAdmin() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const prisma = getPrisma();
  const sub = await prisma.submission.findUnique({ where: { id } });
  if (!sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

  // Create article as PUBLISHED to be publicly visible immediately
  const article = await prisma.article.create({
    data: {
      title: sub.title,
      authors: sub.authors,
      abstract: sub.abstract,
      pdfUrl: sub.pdfUrl,
      status: 'PUBLISHED' as any,
      userId: sub.userId,
    }
  });

  // Update submission status to ACCEPTED
  await prisma.submission.update({ where: { id }, data: { status: 'ACCEPTED' as any } });

  return NextResponse.json({ success: true, article });
}
