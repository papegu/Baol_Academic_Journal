import fs from 'node:fs';

const URL = process.env.URL || 'http://localhost:3000';

async function jsonFetch(path, opts = {}) {
  const res = await fetch(URL + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, headers: res.headers, data };
}

async function main() {
  // 1) Register author
  const reg = await jsonFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Author', email: 'test.author@bajp.org', password: 'author@123' }),
  });
  console.log('register:', reg.status, reg.data);

  // 2) Login and capture cookies
  const loginRes = await fetch(URL + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test.author@bajp.org', password: 'author@123' }),
  });
  const cookiesArr = typeof loginRes.headers.getSetCookie === 'function'
    ? loginRes.headers.getSetCookie()
    : (loginRes.headers.get('set-cookie') ? [loginRes.headers.get('set-cookie')] : []);
  const cookieHeader = cookiesArr.map(c => (c || '').split(';')[0]).filter(Boolean).join('; ');
  console.log('login:', loginRes.status);

  if (!loginRes.ok) throw new Error('Login failed');

  // 3) Submit article via multipart/form-data
  const form = new FormData();
  form.append('title', 'Test Article');
  form.append('authors', 'Test Author');
  form.append('abstract', 'Short abstract for E2E test');
  const pdf = fs.readFileSync('public/test.pdf');
  const blob = new Blob([pdf], { type: 'application/pdf' });
  form.append('file', blob, 'test.pdf');

  const subRes = await fetch(URL + '/api/articles', {
    method: 'POST',
    headers: { Cookie: cookieHeader },
    body: form,
  });
  const subData = await subRes.json().catch(() => ({}));
  console.log('submit:', subRes.status, subData);
  if (!subRes.ok) throw new Error('Submit failed');

  // 4) List submitted and grab id
  const list = await fetch(URL + '/api/articles?status=SUBMITTED', { headers: { Cookie: cookieHeader } });
  const listData = await list.json().catch(() => ({}));
  const aid = listData?.articles?.[0]?.id;
  console.log('submitted id:', aid);

  // 5) Publish the article
  const patchPub = await jsonFetch('/api/articles', {
    method: 'PATCH',
    headers: { Cookie: cookieHeader },
    body: JSON.stringify({ id: aid, status: 'PUBLISHED' }),
  });
  console.log('publish:', patchPub.status, patchPub.data);

  // 6) Create another submission and reject it
  form.set('title', 'Reject Me');
  const sub2Res = await fetch(URL + '/api/articles', {
    method: 'POST',
    headers: { Cookie: cookieHeader },
    body: form,
  });
  const sub2Data = await sub2Res.json().catch(() => ({}));
  const aid2 = sub2Data?.article?.id;
  const patchRej = await jsonFetch('/api/articles', {
    method: 'PATCH',
    headers: { Cookie: cookieHeader },
    body: JSON.stringify({ id: aid2, status: 'REJECTED' }),
  });
  console.log('reject:', patchRej.status, patchRej.data);
}

main().catch(err => { console.error('E2E error:', err?.message || err); process.exit(1); });
