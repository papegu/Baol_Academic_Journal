import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnvFile(filename) {
  try {
    const p = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(p)) return;
    const content = fs.readFileSync(p, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);
      if (!match) continue;
      const key = match[1];
      let val = match[2];
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {}
}

async function main() {
  // Load env vars from local files if not present
  loadEnvFile('.env');
  loadEnvFile('.env.local');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('List buckets error:', listErr.message);
    process.exit(1);
  }
  const exists = (buckets || []).some(b => b.name === 'articles');
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket('articles', { public: true });
    if (createErr) {
      console.error('Create bucket error:', createErr.message);
      process.exit(1);
    }
    console.log(JSON.stringify({ created: true, bucket: 'articles' }));
    return;
  }
  console.log(JSON.stringify({ created: false, bucket: 'articles' }));
}

main().catch(err => { console.error('Unexpected:', err?.message || err); process.exit(1); });
