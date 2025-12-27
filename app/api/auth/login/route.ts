import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return NextResponse.json({ message: error?.message || 'Identifiants invalides' }, { status: 401 });
  }
  const role = email === 'admin@bajp.org' ? 'ADMIN' : 'AUTHOR';
  const res = NextResponse.json({ user: data.user, role, access_token: data.session.access_token });
  // Set a role cookie for middleware guards
  res.cookies.set('role', role, { path: '/', httpOnly: false });
  return res;
}
