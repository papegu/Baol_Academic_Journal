import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateUser, deleteUser } from '../../../../lib/users';

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
  const updated = updateUser(id, patch);
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ user: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const ok = deleteUser(id);
  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}