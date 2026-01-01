import crypto from 'node:crypto';

const URL = process.env.URL || 'https://baol-academic-journal.vercel.app';

async function registerAndLogin() {
  // Register author (idempotent behavior depends on server)
  await fetch(URL + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'E2E Author', email: 'e2e.author@bajp.org', password: 'author@123' }),
  }).catch(() => {});

  const res = await fetch(URL + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'e2e.author@bajp.org', password: 'author@123' }),
  });
  if (!res.ok) throw new Error('Author login failed: ' + res.status);
  const cookiesArr = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
  const cookieHeader = cookiesArr.map(c => (c || '').split(';')[0]).filter(Boolean).join('; ');
  return cookieHeader;
}

function makeMinimalPdfBytes() {
  const pdf = `%PDF-1.1\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 72 72 Td (Hello, BAJP Article!) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000061 00000 n \n0000000127 00000 n \n0000000221 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n316\n%%EOF`;
  const enc = new TextEncoder();
  return enc.encode(pdf);
}

async function main() {
  const cookieHeader = await registerAndLogin();

  // Submit article via multipart
  const form = new FormData();
  form.append('title', 'E2E Test Article');
  form.append('authors', 'E2E Author');
  form.append('abstract', 'Minimal PDF for submission e2e test');
  const pdf = makeMinimalPdfBytes();
  const blob = new Blob([pdf], { type: 'application/pdf' });
  form.append('file', blob, 'e2e-article.pdf');

  const postRes = await fetch(URL + '/api/articles', { method: 'POST', headers: { Cookie: cookieHeader }, body: form });
  const postData = await postRes.json().catch(() => ({}));
  console.log('articles POST:', postRes.status, postData);
  if (!postRes.ok) throw new Error('Article submit failed');
  const aid = postData?.article?.id;
  const key = postData?.article?.pdfUrl || '';

  // Admin publish (simulate by logging in as admin and patch)
  const adminLogin = await fetch(URL + '/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@senegal-livres.sn', password: 'admin@#$%' }),
  });
  const adminCookiesArr = typeof adminLogin.headers.getSetCookie === 'function'
    ? adminLogin.headers.getSetCookie()
    : (adminLogin.headers.get('set-cookie') ? [adminLogin.headers.get('set-cookie')] : []);
  const adminCookieHeader = adminCookiesArr.map(c => (c || '').split(';')[0]).filter(Boolean).join('; ');

  const patchRes = await fetch(URL + '/api/articles', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: adminCookieHeader },
    body: JSON.stringify({ id: aid, status: 'PUBLISHED' })
  });
  const patchData = await patchRes.json().catch(() => ({}));
  console.log('articles PATCH publish:', patchRes.status, patchData);

  // Stream PDF via server route (redirect or R2)
  if (key) {
    const streamRes = await fetch(URL + '/api/articles/pdf/' + key, { redirect: 'follow' });
    console.log('articles stream GET:', streamRes.status, streamRes.headers.get('content-type'));
    if (!(streamRes.status >= 200 && streamRes.status < 400)) throw new Error('Articles streaming failed');
  } else {
    console.warn('No pdfUrl key returned from article POST');
  }
}

main().catch(err => { console.error('E2E-articles error:', err?.message || err); process.exit(1); });
