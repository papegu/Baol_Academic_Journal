import { getEditorPassword } from './demoAuthState';
import { prisma } from './prisma';
import { getSupabaseClient } from './supabaseClient';
import crypto from 'crypto';

function hashPassword(pw: string) {
  return crypto.createHash('sha256').update(pw, 'utf8').digest('hex');
}

export async function signIn(email: string, password: string) {
  // Demo fallback: allow env-based credentials when Supabase is not configured
  if (process.env.DEMO_AUTH === 'true') {
    const adminEmail = process.env.ADMIN_EMAIL || '';
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const authorEmail = process.env.AUTHOR_EMAIL || '';
    const authorPassword = process.env.AUTHOR_PASSWORD || '';
    // Dedicated editor credentials as requested
    const editorEmail = process.env.EDITOR_EMAIL || 'editeur@senegal-livres.sn';
    const editorPasswordEnv = process.env.EDITOR_PASSWORD || 'admin@#$%';
    const editorPassword = getEditorPassword() || editorPasswordEnv;

    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
      return {
        user: { email: adminEmail, user_metadata: { name: 'Admin', role: 'ADMIN' } } as any,
        role: 'ADMIN',
        access_token: 'demo-admin-token'
      };
    }
    if (authorEmail && authorPassword && email === authorEmail && password === authorPassword) {
      return {
        user: { email: authorEmail, user_metadata: { name: 'Author', role: 'AUTHOR' } } as any,
        role: 'AUTHOR',
        access_token: 'demo-author-token'
      };
    }
    if (email === editorEmail && password === editorPassword) {
      return {
        user: { email: editorEmail, user_metadata: { name: 'Editeur', role: 'EDITOR' } } as any,
        role: 'EDITOR',
        access_token: 'demo-editor-token'
      };
    }
    throw new Error('Identifiants invalides');
  }
  // Production path: authenticate via Supabase Auth, then verify/create user in Prisma `User` table
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.session) {
    throw new Error(error?.message || 'Identifiants invalides');
  }
  // Ensure user exists in Prisma `User` table (Supabase Postgres)
  let dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser) {
    const displayName = data.user?.user_metadata?.name || email.split('@')[0];
    // Set initial role from Supabase user metadata if provided; default to AUTHOR
    const metaRole = (data.user?.user_metadata as any)?.role;
    const initialRole = metaRole === 'ADMIN' || metaRole === 'EDITOR' || metaRole === 'AUTHOR' ? metaRole : 'AUTHOR';
    // Critical: store placeholder password when using Supabase Auth; we no longer check DB password
    dbUser = await prisma.user.create({ data: { email, name: displayName, role: initialRole as any, password: '' } });
  }
  const role = dbUser.role as any;
  return {
    user: { email: dbUser.email, user_metadata: { name: dbUser.name, role } } as any,
    role,
    access_token: data.session.access_token,
  };
}

export async function signUp(name: string, email: string, password: string) {
  // Demo fallback: simulate a successful signup
  if (process.env.DEMO_AUTH === 'true') {
    return { user: { email, user_metadata: { name } } as any };
  }
  // Production path: trigger Supabase Auth email confirmation on sign-up.
  // We do NOT create a Prisma `User` yet; user record will be ensured on first confirmed login.
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Optional: Supabase will send a confirmation email; redirect is configured in Supabase settings.
  });
  if (error) throw new Error(error.message || "Erreur lors de l'inscription");
  return { user: { email, user_metadata: { name } } as any };
}