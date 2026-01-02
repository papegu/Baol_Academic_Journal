import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listDomains, createDomain, Domain } from '../../../lib/domains';
import { getPrisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (process.env.DEMO_AUTH === 'true') {
    return NextResponse.json({ domains: listDomains() });
  }
  const domains = await getPrisma().domain.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ domains });
}

export async function POST(request: Request) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { name } = body as Partial<Domain>;
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  if (process.env.DEMO_AUTH === 'true') {
    const created = createDomain({ name });
    return NextResponse.json({ domain: created }, { status: 201 });
  }
  const domain = await getPrisma().domain.create({ data: { name } });
  return NextResponse.json({ domain }, { status: 201 });
}