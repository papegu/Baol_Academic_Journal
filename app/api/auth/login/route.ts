import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  try {
    const { user, role, access_token } = await signIn(email, password);
    const res = NextResponse.json({ user, role, access_token });
  // Set a role cookie for middleware guards
    res.cookies.set('role', role, { path: '/', httpOnly: false });
    return res;
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Identifiants invalides' }, { status: 401 });
  }
}
