import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getEditorPassword, setEditorPassword } from '../../../../lib/demoAuthState';

function isAuthorized() {
  const role = cookies().get('role')?.value;
  return role === 'ADMIN' || role === 'EDITOR';
}

export async function POST(request: Request) {
  if (process.env.DEMO_AUTH !== 'true') {
    return NextResponse.json({ error: 'Non disponible hors mode démo' }, { status: 400 });
  }
  if (!isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { currentPassword, newPassword } = body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }
  const current = getEditorPassword();
  if (current !== currentPassword) {
    return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
  }
  setEditorPassword(newPassword);
  return NextResponse.json({ success: true });
}