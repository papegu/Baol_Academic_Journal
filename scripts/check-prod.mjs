// Minimal production endpoint checker
// Usage: node scripts/check-prod.mjs https://your-deployment-url
// Or set BASE_URL env var.

const base = (process.argv[2] || process.env.BASE_URL || '').replace(/\/$/, '');
const basicAuth = process.argv[3] || process.env.BASIC_AUTH || '';
if (!base) {
  console.error('Usage: node scripts/check-prod.mjs <baseUrl>');
  process.exit(1);
}

const endpoints = [
  { path: '/', expect: 200, method: 'GET' },
  { path: '/api/health/supabase/users', expect: 200, method: 'GET' },
  { path: '/api/articles', expect: 200, method: 'GET' },
  { path: '/api/articles/1', expect: 200, method: 'GET' },
  { path: '/api/reviews/1', expect: 200, method: 'GET' },
  // /api/bootstrap/admin is protected; we just verify it returns 401 without token
  { path: '/api/bootstrap/admin', expect: 401, method: 'POST' },
];

async function check({ path, expect, method }) {
  const url = base + path;
  const init = { method, headers: {} };
  if (basicAuth) {
    const token = Buffer.from(basicAuth).toString('base64');
    init.headers['Authorization'] = `Basic ${token}`;
  }
  try {
    const res = await fetch(url, init);
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
    console.log(`${ok ? '✓' : '✗'} ${method} ${path} -> ${res.status} (expected ${expect})${info}`);
    return ok;
  } catch (e) {
    console.log(`✗ ${method} ${path} -> ERROR ${e.message}`);
    return false;
  }
}

(async () => {
  console.log(`Checking ${base} ...`);
  let pass = true;
  for (const ep of endpoints) {
    const ok = await check(ep);
    pass = pass && ok;
  }
  process.exit(pass ? 0 : 1);
})();
