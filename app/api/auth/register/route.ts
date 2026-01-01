import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ message: 'Champs requis manquants' }, { status: 400 });
  try {
    const { user } = await signUp(name, email, password);
    return NextResponse.json({
      user,
      message: 'Inscription réussie. Vérifiez votre email pour confirmer votre compte.',
    }, { status: 201 });
  } catch (err: any) {
    const status = err?.status || 400;
    const code = err?.code || 'SIGNUP_ERROR';
    return NextResponse.json({ code, message: err?.message || 'Erreur lors de l\'inscription' }, { status });
  }
}
