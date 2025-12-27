import { getSupabaseClient } from './supabaseClient';

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(error?.message || 'Identifiants invalides');
  }
  const role = (data.user?.user_metadata as any)?.role || (email === 'admin@bajp.org' ? 'ADMIN' : 'AUTHOR');
  return { user: data.user, role, access_token: data.session.access_token };
}

export async function signUp(name: string, email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw new Error(error.message);
  return { user: data.user };
}