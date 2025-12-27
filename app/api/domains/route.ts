import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listDomains, createDomain, Domain } from '../../../lib/domains';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ domains: listDomains() });
}

export async function POST(request: Request) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { name } = body as Partial<Domain>;
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  const created = createDomain({ name });
  return NextResponse.json({ domain: created }, { status: 201 });
}