import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const setupToken = process.env.SETUP_TOKEN || '';
  const headerToken = req.headers.get('x-setup-token') || '';
  if (!setupToken || headerToken !== setupToken) {
    return NextResponse.json({ message: 'Unauthorized setup' }, { status: 401 });
  }

  const { email, password } = await req.json().catch(() => ({ email: 'admin@bajp.org', password: 'admin@#$%' }));
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.createUser({ email, password, user_metadata: { role: 'ADMIN' } });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  return NextResponse.json({ user: data.user }, { status: 201 });
}
