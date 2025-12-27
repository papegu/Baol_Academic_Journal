import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/prisma';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR' || role === 'AUTHOR';
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const patch = await request.json();
  const sub = await prisma.submission.update({ where: { id }, data: patch });
  return NextResponse.json({ submission: sub });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  await prisma.submission.delete({ where: { id } });
  return NextResponse.json({ success: true });
}