import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ message: 'Champs requis manquants' }, { status: 400 });
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ user: data.user }, { status: 201 });
}
