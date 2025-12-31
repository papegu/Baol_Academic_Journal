import { NextResponse } from 'next/server';
import { getPrisma } from '../../../../../lib/prisma';

export async function GET() {
  try {
    const count = await getPrisma().user.count();
    return NextResponse.json({ ok: true, count });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'DB error' }, { status: 500 });
  }
}
