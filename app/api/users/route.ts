import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listUsers, createUser, User } from '../../../lib/users';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET(request: Request) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(request.url);
  const role = url.searchParams.get('role');
  let data = listUsers();
  if (role) {
    data = data.filter(u => u.role === role);
  }
  return NextResponse.json({ users: data });
}

export async function POST(request: Request) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { email, name, role } = body as Partial<User>;
  if (!email || !name || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const created = createUser({ email, name, role });
  return NextResponse.json({ user: created }, { status: 201 });
}