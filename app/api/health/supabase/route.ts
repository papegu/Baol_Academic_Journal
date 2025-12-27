import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!url) {
    return NextResponse.json({ ok: false, reason: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
  }
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return NextResponse.json({ ok: res.ok, status: res.status, url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Fetch error', url }, { status: 500 });
  }
}
