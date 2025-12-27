import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../lib/prisma';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return !!role; // any logged in user can view/create their submissions
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const subs = await prisma.submission.findMany();
  return NextResponse.json({ submissions: subs });
}

export async function POST(request: Request) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { title, authors, abstract, pdfUrl, userId } = body as any;
  if (!title || !authors || !abstract || !userId) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  const sub = await prisma.submission.create({ data: { title, authors, abstract, pdfUrl, userId } });
  return NextResponse.json({ submission: sub }, { status: 201 });
}