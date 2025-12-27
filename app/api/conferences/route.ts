import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listConferences, createConference, Conference } from '../../../lib/conferences';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ conferences: listConferences() });
}

export async function POST(request: Request) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { name, location, date, description } = body as Partial<Conference>;
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  const created = createConference({ name, location, date, description });
  return NextResponse.json({ conference: created }, { status: 201 });
}