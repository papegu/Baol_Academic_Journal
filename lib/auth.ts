import { getSupabaseClient } from './supabaseClient';

export async function signIn(email: string, password: string) {
  // Demo fallback: allow env-based credentials when Supabase is not configured
  if (process.env.DEMO_AUTH === 'true') {
    const adminEmail = process.env.ADMIN_EMAIL || '';
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const authorEmail = process.env.AUTHOR_EMAIL || '';
    const authorPassword = process.env.AUTHOR_PASSWORD || '';
    // Dedicated editor credentials as requested
    const editorEmail = process.env.EDITOR_EMAIL || 'editeur@senegal-livres.sn';
    const editorPassword = process.env.EDITOR_PASSWORD || 'admin@#$%';

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

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(error?.message || 'Identifiants invalides');
  }
  const role = (data.user?.user_metadata as any)?.role || (email === 'admin@bajp.org' ? 'ADMIN' : 'AUTHOR');
  return { user: data.user, role, access_token: data.session.access_token };
}

export async function signUp(name: string, email: string, password: string) {
  // Demo fallback: simulate a successful signup
  if (process.env.DEMO_AUTH === 'true') {
    return { user: { email, user_metadata: { name } } as any };
  }
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw new Error(error.message);
  return { user: data.user };
}