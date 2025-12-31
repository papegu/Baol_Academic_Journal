import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  // Critical: Client-side Supabase must use only NEXT_PUBLIC_* vars
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !anonKey) {
    // Critical: explicit error to surface missing envs on Vercel
    const missing = [
      !url ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
      !anonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
    ].filter(Boolean).join(', ');
    throw new Error(`Supabase client configuration missing: ${missing}. Set these environment variables in Vercel Project Settings.`);
  }
  return createClient(url, anonKey);
}
