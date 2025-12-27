import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateUser, deleteUser } from '../../../../lib/users';
import { prisma } from '../../../../lib/prisma';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const patch = await request.json();
  if (process.env.DEMO_AUTH === 'true') {
    const updated = updateUser(id, patch);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ user: updated });
  }
  const user = await prisma.user.update({ where: { id }, data: patch });
  return NextResponse.json({ user });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  if (process.env.DEMO_AUTH === 'true') {
    const ok = deleteUser(id);
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}