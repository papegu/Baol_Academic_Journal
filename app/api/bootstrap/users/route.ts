import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const setupToken = process.env.SETUP_TOKEN || '';
  const headerToken = req.headers.get('x-setup-token') || '';
  if (!setupToken || headerToken !== setupToken) {
    return NextResponse.json({ message: 'Unauthorized setup' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const body = await req.json().catch(() => ({
    users: [
      { email: 'admin@bajp.org', password: 'admin@#$%', role: 'ADMIN' },
      { email: 'editeur@bajp.org', password: 'editeur@#$%', role: 'EDITOR' },
    ],
  }));

  const results: Array<{ email: string; ok: boolean; error?: string }> = [];
  for (const u of body.users || []) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      user_metadata: { role: u.role },
    });
    if (error) {
      results.push({ email: u.email, ok: false, error: error.message });
    } else {
      results.push({ email: u.email, ok: true });
    }
  }

  return NextResponse.json({ results }, { status: 201 });
}
