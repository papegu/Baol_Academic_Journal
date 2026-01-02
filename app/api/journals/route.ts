import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listJournals, createJournal, Journal } from '../../../lib/journals';
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
    return NextResponse.json({ journals: listJournals() });
  }
  const journals = await getPrisma().journal.findMany({ orderBy: { createdAt: 'desc' }, include: { domain: true } });
  return NextResponse.json({ journals });
}

export async function POST(request: Request) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { name, issn, url, domain } = body as Partial<Journal> & { domain?: string };
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  if (process.env.DEMO_AUTH === 'true') {
    const created = createJournal({ name, issn, url, domain });
    return NextResponse.json({ journal: created }, { status: 201 });
  }
  let domainConnect: { connect?: { id: number } } = {};
  if (domain && domain.trim().length > 0) {
    const d = await getPrisma().domain.upsert({ where: { name: domain }, update: {}, create: { name: domain } });
    domainConnect = { connect: { id: d.id } };
  }
  const journal = await getPrisma().journal.create({ data: { name, issn, url, domain: domainConnect as any } });
  return NextResponse.json({ journal }, { status: 201 });
}