import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listJournals, createJournal, Journal } from '../../../lib/journals';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ journals: listJournals() });
}

export async function POST(request: Request) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { name, issn, url, domain } = body as Partial<Journal>;
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  const created = createJournal({ name, issn, url, domain });
  return NextResponse.json({ journal: created }, { status: 201 });
}