import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Critical: make missing envs explicit to help diagnose Vercel config
  const missing = [!url ? 'NEXT_PUBLIC_SUPABASE_URL' : null, !anon ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null]
    .filter(Boolean) as string[];
  if (missing.length) {
    return NextResponse.json({ ok: false, reason: 'Missing env', missing }, { status: 500 });
  }
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return NextResponse.json({ ok: res.ok, status: res.status, url, anonPresent: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Fetch error', url }, { status: 500 });
  }
}
