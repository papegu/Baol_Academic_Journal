import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listConferences, createConference, Conference } from '../../../lib/conferences';
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
    return NextResponse.json({ conferences: listConferences() });
  }
  const conferences = await getPrisma().conference.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ conferences });
}

export async function POST(request: Request) {
  if (!isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { name, location, date, description } = body as Partial<Conference> & { date?: string };
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  if (process.env.DEMO_AUTH === 'true') {
    const created = createConference({ name, location, date, description });
    return NextResponse.json({ conference: created }, { status: 201 });
  }
  const isoDate = date ? new Date(date) : undefined;
  const conference = await getPrisma().conference.create({ data: { name, location, date: isoDate, description } });
  return NextResponse.json({ conference }, { status: 201 });
}