// Minimal production endpoint checker (enhanced)
// Usage:
//  node scripts/check-prod.mjs https://your-deployment-url [basicAuth]
//  BASE_URL=https://your-deployment-url BASIC_AUTH=user:pass node scripts/check-prod.mjs
// Options via env vars:
//  TIMEOUT_MS (default 8000) – per-request timeout
//  RETRIES (default 1)       – number of retry attempts per endpoint
//  CONCURRENCY (default 4)   – how many checks to run in parallel
//  JSON (set to 1)           – output JSON summary instead of logs
import fs from 'node:fs';
import path from 'node:path';

// Minimal args parsing: first two non-flag args are base and basicAuth
const rawArgs = process.argv.slice(2);
let baseArg = '';
let authArg = '';
let endpointsFile = '';
for (let i = 0; i < rawArgs.length; i++) {
  const a = rawArgs[i];
  if (a.startsWith('--')) {
    if (a === '--json') process.env.JSON = '1';
    else if (a === '--endpoints') endpointsFile = rawArgs[++i] || '';
    else if (a.startsWith('--endpoints=')) endpointsFile = a.split('=')[1];
    else if (a.startsWith('--timeout=')) process.env.TIMEOUT_MS = a.split('=')[1];
    else if (a.startsWith('--retries=')) process.env.RETRIES = a.split('=')[1];
    else if (a.startsWith('--concurrency=')) process.env.CONCURRENCY = a.split('=')[1];
    continue;
  }
  if (!baseArg) baseArg = a; else if (!authArg) authArg = a;
}

const base = (baseArg || process.env.BASE_URL || '').replace(/\/$/, '');
const basicAuth = (authArg || process.env.BASIC_AUTH || '');
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 8000);
const RETRIES = Math.max(1, Number(process.env.RETRIES || 1));
const CONCURRENCY = Math.max(1, Number(process.env.CONCURRENCY || 4));
const OUTPUT_JSON = process.env.JSON === '1';
if (!base) {
  console.error('Usage: node scripts/check-prod.mjs <baseUrl> [basicAuth] [--endpoints path]');
  process.exit(1);
}

// Endpoint set – prefer general, non-protected routes
let endpoints = [
  // Pages
  { path: '/', expect: 200, method: 'GET' },
  { path: '/articles', expect: 200, method: 'GET' },
  { path: '/books', expect: 200, method: 'GET' },
  { path: '/conferences', expect: 200, method: 'GET' },
  { path: '/journals', expect: 200, method: 'GET' },
  { path: '/domains', expect: 200, method: 'GET' },
  { path: '/search', expect: 200, method: 'GET' },
  { path: '/guidelines', expect: 200, method: 'GET' },
  { path: '/policies', expect: 200, method: 'GET' },
  { path: '/services', expect: 200, method: 'GET' },

  // Health checks
  { path: '/api/health/supabase', expect: 200, method: 'GET' },
  { path: '/api/health/db', expect: 200, method: 'GET' },
  // Specific sub-route if present
  { path: '/api/health/supabase/users', expect: 200, method: 'GET' },

  // Public data APIs
  { path: '/api/articles', expect: 200, method: 'GET' },
  { path: '/api/books', expect: 200, method: 'GET' },
  { path: '/api/conferences', expect: 200, method: 'GET' },
  { path: '/api/domains', expect: 200, method: 'GET' },

  // Protected route sanity: should 401 without token
  { path: '/api/bootstrap/admin', expect: 401, method: 'POST' },
];

// Load custom endpoints from JSON if provided
if (endpointsFile) {
  try {
    const filePath = path.isAbsolute(endpointsFile) ? endpointsFile : path.join(process.cwd(), endpointsFile);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(data)) endpoints = data;
  } catch (e) {
    console.error(`Failed to load endpoints from ${endpointsFile}: ${e.message}`);
  }
}

// Soft timeout: do not abort fetch; treat as failure on timeout
function softTimeout(ms) {
  return new Promise(resolve => {
    const t = setTimeout(() => resolve({ timedOut: true }), ms);
    // attach a cancel method for cleanliness
    resolve.cancel = () => clearTimeout(t);
  });
}

async function checkOnce({ path, expect, method }) {
  const url = base + path;
  const init = { method, headers: {} };
  if (basicAuth) {
    const token = Buffer.from(basicAuth).toString('base64');
    init.headers['Authorization'] = `Basic ${token}`;
  }
  try {
    const winner = await Promise.race([
      (async () => ({ res: await fetch(url, init), timedOut: false }))(),
      softTimeout(TIMEOUT_MS),
    ]);
    if (winner.timedOut) {
      return { ok: false, status: 0, info: ' TIMEOUT' };
    }
    const res = winner.res;
    const ok = res.status === expect;
    let info = '';
    try {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const json = await res.json();
        info = ' ' + JSON.stringify(json).slice(0, 200);
      } else {
        const text = await res.text();
        info = ' ' + text.slice(0, 200);
      }
    } catch {}
    return { ok, status: res.status, info };
  } catch (e) {
    return { ok: false, status: 0, info: ` ERROR ${e.message}` };
  }
}

(async () => {
  // Simple worker pool for concurrency
  console.log(`Checking ${base} ...`);
  const queue = endpoints.slice();
  const results = [];

  async function worker() {
    while (queue.length) {
      const ep = queue.shift();
      let attempt = 0;
      let last = { ok: false, status: 0, info: '' };
      while (attempt < RETRIES) {
        last = await checkOnce(ep);
        if (last.ok) break;
        attempt++;
      }
      const entry = {
        path: ep.path,
        method: ep.method,
        expected: ep.expect,
        status: last.status,
        ok: last.ok,
        info: last.info.trim(),
        attempts: attempt + 1,
      };
      results.push(entry);
      if (!OUTPUT_JSON) {
        const mark = entry.ok ? '✓' : '✗';
        console.log(`${mark} ${entry.method} ${entry.path} -> ${entry.status} (expected ${entry.expected})${entry.info ? ' ' + entry.info.slice(0, 200) : ''}`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const pass = results.every(r => r.ok);
  if (OUTPUT_JSON) {
    console.log(JSON.stringify({ base, pass, timeoutMs: TIMEOUT_MS, retries: RETRIES, concurrency: CONCURRENCY, results }, null, 2));
  }
  // Set exit code without forcing immediate termination to avoid Windows assertion
  process.exitCode = pass ? 0 : 1;
})();
// End
