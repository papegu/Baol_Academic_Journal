import 'server-only'; // Critical: ensure this module never runs client-side
import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  // Critical: SERVICE_ROLE_KEY must only be used server-side
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !serviceKey) {
    // Surface clear server-side error in prod if envs are not configured
    const missing = [
      !url ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
      !serviceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
    ].filter(Boolean).join(', ');
    throw new Error(`Supabase admin configuration missing: ${missing}. Add them to your Vercel Project Environment (never expose SERVICE_ROLE_KEY client-side).`);
  }
  return createClient(url, serviceKey);
}
