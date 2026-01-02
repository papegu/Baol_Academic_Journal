import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateJournal, deleteJournal } from '../../../../lib/journals';
import { getPrisma } from '../../../../lib/prisma';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const patch = await request.json();
  if (process.env.DEMO_AUTH === 'true') {
    const updated = updateJournal(id, patch);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ journal: updated });
  }
  const journal = await getPrisma().journal.update({ where: { id }, data: patch });
  return NextResponse.json({ journal });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = Number(params.id);
  if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  if (process.env.DEMO_AUTH === 'true') {
    const ok = deleteJournal(id);
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  }
  await getPrisma().journal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}